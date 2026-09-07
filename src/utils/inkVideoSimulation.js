/**
 * Drives the "ink reveal" from a real filmed luma-matte clip (black =
 * not yet diffused, white = fully diffused) instead of a procedural
 * simulation. Each frame, the video is drawn to a canvas, its
 * luminance is converted into that canvas's alpha channel, and the
 * true-color image is then composited through it via `source-in` —
 * so the color photo is revealed only where the ink has "arrived".
 *
 * Runs on the video's own real playback clock (sped up via
 * `playbackRate` to fit a target duration) rather than being scrubbed
 * by scroll. When the clip ends, rendering simply stops — whatever
 * partial reveal the footage left behind is the final, permanent
 * state (no crossfade to a plain full-color image).
 *
 * `start()` is async and uses a cancellation token rather than only
 * relying on removing event listeners: if `cancel()` is called while
 * a `loadeddata`/`seeked` wait is still in flight, any callback that
 * fires afterward checks the token and becomes a no-op instead of
 * mutating the (now-irrelevant) shared <video> element's playback
 * position — this is what caused the old version's flicker/stuck/
 * flash-of-stale-frame bugs when a project was scrolled past quickly.
 */

/** Computes an `object-fit: cover`-equivalent source rect so a drawn
 * image/video fills the destination box without stretching. */
function coverSourceRect(srcW, srcH, dstW, dstH) {
  const srcRatio = srcW / srcH;
  const dstRatio = dstW / dstH;
  if (srcRatio > dstRatio) {
    const sh = srcH;
    const sw = srcH * dstRatio;
    return { sx: (srcW - sw) / 2, sy: 0, sw, sh };
  }
  const sw = srcW;
  const sh = srcW / dstRatio;
  return { sx: 0, sy: (srcH - sh) / 2, sw, sh };
}

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

export class VideoInkDiffusion {
  constructor({ canvas, video, colorImage, targetDuration = 2600 }) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d", { willReadFrequently: true });
    this.video = video;
    this.colorImage = colorImage;
    this.targetDuration = targetDuration;
    this.raf = null;
    this.onComplete = null;
    this._ended = false;
    this._lastRenderedTime = -1;
    this._token = null;
  }

  resize(w, h, dpr = 1) {
    this.width = w;
    this.height = h;
    // This canvas is now the *permanent* final visual (no crossfade to a
    // plain <img> afterward), so it's worth a sharper backing store than
    // when it was only a transient overlay — the per-pixel cost is bounded
    // to the ~2.5s the animation actually runs.
    const scale = Math.min(dpr, 2);
    this.canvas.width = Math.round(w * scale);
    this.canvas.height = Math.round(h * scale);
    this.canvas.style.width = `${w}px`;
    this.canvas.style.height = `${h}px`;
  }

  _waitForReady() {
    const video = this.video;
    if (video.readyState >= 2) return Promise.resolve();
    return new Promise((resolve) => {
      video.addEventListener("loadeddata", () => resolve(), { once: true });
      video.load();
    });
  }

  _seekToStart() {
    const video = this.video;
    return new Promise((resolve) => {
      // If it's already effectively at 0 (e.g. never played), no real
      // seek will happen and 'seeked' won't fire — don't wait forever.
      if (video.currentTime === 0) {
        resolve();
        return;
      }
      const onSeeked = () => {
        clearTimeout(fallback);
        resolve();
      };
      // Some browsers are inconsistent about firing 'seeked' for a
      // seek-to-current-position edge case, so this is a safety net,
      // not the primary path.
      const fallback = setTimeout(() => {
        video.removeEventListener("seeked", onSeeked);
        resolve();
      }, 200);
      video.addEventListener("seeked", onSeeked, { once: true });
      video.currentTime = 0;
    });
  }

  /** `onFirstFrame` fires only once the video is genuinely sitting at
   * frame 0 and the canvas has been cleared of any previous run's
   * pixels — the caller should reveal the canvas here, not before,
   * or a stale final frame from a prior play-through can flash. */
  async start(onFirstFrame) {
    this._ended = false;
    this._lastRenderedTime = -1;
    const token = {};
    this._token = token;
    const video = this.video;

    await this._waitForReady();
    if (this._token !== token) return; // cancelled while waiting

    video.pause();
    await this._seekToStart();
    if (this._token !== token) return; // cancelled while waiting

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    onFirstFrame?.();

    const rate = video.duration ? clamp(video.duration / (this.targetDuration / 1000), 1, 8) : 1;
    video.playbackRate = rate;

    try {
      await video.play();
    } catch {
      // Autoplay of a muted, user-triggered video should succeed almost
      // everywhere; if it's blocked, just stop so the grayscale image
      // is at least left in a clean, static state.
      if (this._token === token) this._finish();
      return;
    }
    if (this._token !== token) return; // cancelled during play() await

    this._loop(token);
  }

  _loop = (token) => {
    if (this._ended || this._token !== token) return;
    const video = this.video;

    if (video.ended || video.currentTime >= video.duration - 0.05) {
      this._renderFrame(); // paint the final frame, then freeze right there
      this._finish();
      return;
    }

    this._renderFrame();
    this.raf = requestAnimationFrame(() => this._loop(token));
  };

  _renderFrame() {
    // The source video only actually advances ~30 times a second; skip
    // the (relatively costly) pixel pass on rAF ticks where it hasn't.
    if (this.video.currentTime === this._lastRenderedTime) return;
    this._lastRenderedTime = this.video.currentTime;

    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const video = this.video;
    if (!w || !h) return;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, w, h);

    if (video.videoWidth && video.videoHeight) {
      const v = coverSourceRect(video.videoWidth, video.videoHeight, w, h);
      ctx.drawImage(video, v.sx, v.sy, v.sw, v.sh, 0, 0, w, h);
    } else {
      ctx.drawImage(video, 0, 0, w, h);
    }

    const frame = ctx.getImageData(0, 0, w, h);
    const data = frame.data;
    for (let i = 0; i < data.length; i += 4) {
      // Source is a near-grayscale luma matte, so the red channel is a
      // fine stand-in for luminance. A light S-curve tightens the edge
      // between "diffused" and "not yet" so mild compression fringing
      // doesn't read as a soft gray halo.
      const lum = data[i];
      const alpha = lum < 60 ? 0 : lum > 200 ? 255 : Math.round(((lum - 60) / 140) ** 1.3 * 255);
      data[i + 3] = alpha;
    }
    ctx.putImageData(frame, 0, 0);

    ctx.globalCompositeOperation = "source-in";
    const img = this.colorImage;
    if (img.naturalWidth && img.naturalHeight) {
      const c = coverSourceRect(img.naturalWidth, img.naturalHeight, w, h);
      ctx.drawImage(img, c.sx, c.sy, c.sw, c.sh, 0, 0, w, h);
    } else {
      ctx.drawImage(img, 0, 0, w, h);
    }
    ctx.globalCompositeOperation = "source-over";
  }

  /** Re-composites at the video's current (possibly paused/frozen) frame
   * — used after a resize so a frozen reveal doesn't go blank. */
  renderCurrentFrame() {
    this._lastRenderedTime = -1;
    this._renderFrame();
  }

  _finish() {
    if (this._ended) return;
    this._ended = true;
    cancelAnimationFrame(this.raf);
    this.video.pause();
    this.onComplete?.();
  }

  /** Invalidates any in-flight async waits (loadeddata/seeked/play)
   * immediately, so a callback that resolves after this point can
   * never touch the shared <video> element on this instance's behalf. */
  cancel() {
    this._ended = true;
    this._token = null;
    cancelAnimationFrame(this.raf);
    this.video.pause();
  }
}

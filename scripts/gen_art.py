"""
Generates 5 abstract editorial 'cover art' images to stand in for real project
screenshots. These are procedurally generated (gradients + geometric line work
+ grain) so the portfolio has real, non-placeholder-looking imagery to drive
the grayscale -> color diffusion effect until the user swaps in real project
photography via src/data/projects.js.
"""
import math
import random
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

W, H = 1600, 2000

def lerp(a, b, t):
    return a + (b - a) * t

def hex_to_rgb(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))

def make_gradient(size, c1, c2, angle=90):
    w, h = size
    base = Image.new('RGB', (w, h))
    arr = np.zeros((h, w, 3), dtype=np.float32)
    a = math.radians(angle)
    dx, dy = math.cos(a), math.sin(a)
    xs, ys = np.meshgrid(np.linspace(0, 1, w), np.linspace(0, 1, h))
    t = xs * dx + ys * dy
    t = (t - t.min()) / (t.max() - t.min())
    for i in range(3):
        arr[:, :, i] = lerp(c1[i], c2[i], t)
    base = Image.fromarray(arr.astype(np.uint8))
    return base

def add_grain(img, amount=10):
    arr = np.array(img).astype(np.int16)
    noise = np.random.randint(-amount, amount, arr.shape[:2])[:, :, None]
    arr = np.clip(arr + noise, 0, 255).astype(np.uint8)
    return Image.fromarray(arr)

def vignette(img, strength=0.55):
    w, h = img.size
    yy, xx = np.mgrid[0:h, 0:w]
    cx, cy = w / 2, h / 2
    d = np.sqrt(((xx - cx) / (w / 2)) ** 2 + ((yy - cy) / (h / 2)) ** 2)
    mask = np.clip(1 - strength * (d ** 2), 0, 1)
    arr = np.array(img).astype(np.float32)
    arr *= mask[:, :, None]
    return Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8))

def draw_arcs(draw, cx, cy, color, n=14, r0=80, r1=1500, width=2, span=(0, 360), jitter=0):
    rnd = random.Random(42)
    for i in range(n):
        r = lerp(r0, r1, i / max(n - 1, 1))
        a0, a1 = span
        a0j = a0 + rnd.uniform(-jitter, jitter)
        a1j = a1 + rnd.uniform(-jitter, jitter)
        bbox = [cx - r, cy - r, cx + r, cy + r]
        draw.arc(bbox, a0j, a1j, fill=color, width=width)

def draw_grid_lines(draw, w, h, color, step, width=1, vertical=True, horizontal=True):
    if vertical:
        for x in range(0, w, step):
            draw.line([(x, 0), (x, h)], fill=color, width=width)
    if horizontal:
        for y in range(0, h, step):
            draw.line([(0, y), (w, y)], fill=color, width=width)

def draw_contours(draw, w, h, color, rows=18, amp=40, seed=1):
    rnd = random.Random(seed)
    for r in range(rows):
        y0 = h * r / rows
        pts = []
        phase = rnd.uniform(0, 6.28)
        freq = rnd.uniform(1.5, 3.0)
        for x in range(0, w + 20, 20):
            y = y0 + amp * math.sin((x / w) * freq * math.pi + phase + r * 0.3)
            pts.append((x, y))
        draw.line(pts, fill=color, width=2)

def finalize(img, path, grain=8, vig=0.5):
    img = img.filter(ImageFilter.GaussianBlur(0.4))
    img = add_grain(img, grain)
    img = vignette(img, vig)
    img = img.convert('RGB')
    img.save(path, quality=87)
    print('saved', path)

random.seed(7)

# 1. NOIR — deep red/black moody architecture, sweeping arcs
def art_noir(path):
    img = make_gradient((W, H), hex_to_rgb('#0b0704'), hex_to_rgb('#3a0f0a'), angle=115)
    d = ImageDraw.Draw(img, 'RGB')
    draw_arcs(d, W * 0.15, H * 1.05, hex_to_rgb('#c23b1f'), n=22, r0=60, r1=2000, width=2, span=(200, 340), jitter=4)
    draw_arcs(d, W * 0.85, H * -0.1, hex_to_rgb('#7a1f12'), n=16, r0=40, r1=1600, width=1, span=(90, 200), jitter=3)
    for i in range(6):
        y = int(H * (0.2 + i * 0.11))
        d.line([(0, y), (W, y + 30)], fill=hex_to_rgb('#e2622f'), width=1)
    finalize(img, path, grain=14, vig=0.6)

# 2. AERIAL — teal/cyan aerial mapping grid
def art_aerial(path):
    img = make_gradient((W, H), hex_to_rgb('#04191b'), hex_to_rgb('#0d4a4f'), angle=70)
    d = ImageDraw.Draw(img, 'RGB')
    draw_grid_lines(d, W, H, hex_to_rgb('#1c8f92'), step=90, width=1)
    for i in range(10):
        cx, cy = random.uniform(0, W), random.uniform(0, H)
        r = random.uniform(30, 220)
        d.ellipse([cx - r, cy - r, cx + r, cy + r], outline=hex_to_rgb('#7fe6d8'), width=2)
    draw_arcs(d, W * 0.5, H * 0.5, hex_to_rgb('#bff3ea'), n=6, r0=200, r1=1400, width=1, span=(0, 360))
    finalize(img, path, grain=10, vig=0.5)

# 3. GLASSHOUSE — warm amber geometric panes
def art_glasshouse(path):
    img = make_gradient((W, H), hex_to_rgb('#241405'), hex_to_rgb('#7a4a13'), angle=100)
    d = ImageDraw.Draw(img, 'RGB')
    cols, rows = 7, 9
    for cxi in range(cols + 1):
        x = int(W * cxi / cols) + random.randint(-15, 15)
        d.line([(x, 0), (x + random.randint(-60, 60), H)], fill=hex_to_rgb('#f2b25c'), width=2)
    for ryi in range(rows + 1):
        y = int(H * ryi / rows) + random.randint(-15, 15)
        d.line([(0, y), (W, y + random.randint(-60, 60))], fill=hex_to_rgb('#c9852f'), width=1)
    finalize(img, path, grain=10, vig=0.55)

# 4. FATHOM — deep blue depth / contour lines
def art_fathom(path):
    img = make_gradient((W, H), hex_to_rgb('#01050f'), hex_to_rgb('#0b2b57'), angle=90)
    d = ImageDraw.Draw(img, 'RGB')
    draw_contours(d, W, H, hex_to_rgb('#2c6fb0'), rows=26, amp=55, seed=3)
    draw_contours(d, W, H, hex_to_rgb('#78b7e6'), rows=10, amp=90, seed=9)
    finalize(img, path, grain=12, vig=0.6)

# 5. ORBIT — violet/magenta orbital arcs
def art_orbit(path):
    img = make_gradient((W, H), hex_to_rgb('#0c0512'), hex_to_rgb('#3a1050'), angle=135)
    d = ImageDraw.Draw(img, 'RGB')
    draw_arcs(d, W * 0.5, H * 0.35, hex_to_rgb('#b45cf0'), n=18, r0=60, r1=1700, width=2, span=(0, 360))
    draw_arcs(d, W * 0.5, H * 0.35, hex_to_rgb('#5f2f8a'), n=8, r0=100, r1=1200, width=1, span=(0, 360), jitter=8)
    finalize(img, path, grain=14, vig=0.6)

import os
outdir = '/home/claude/port/public/images/projects'
os.makedirs(outdir, exist_ok=True)

_generators = {
    'noir': art_noir,
    'aerial': art_aerial,
    'glasshouse': art_glasshouse,
    'fathom': art_fathom,
    'orbit': art_orbit,
}

for name, generator in _generators.items():
    jpg_path = f'{outdir}/{name}.jpg'
    generator(jpg_path)
    Image.open(jpg_path).convert('RGB').save(f'{outdir}/{name}.webp', 'WEBP', quality=82, method=6)
    os.remove(jpg_path)


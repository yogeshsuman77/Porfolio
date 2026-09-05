"""
Turns three of the provided reference photos into cinematic portrait
treatments matching the portfolio's dark/warm palette: crop, crush
shadows, lift a warm split-tone into the highlights, add a vignette and
fine grain. These are edits of real photographs, not generated images —
deliberately, since AI-generated portraits of a real person tend to
look uncanny and the brief explicitly asked to avoid that.
"""
import numpy as np
from PIL import Image, ImageEnhance, ImageFilter, ImageOps

SRC = "/mnt/user-data/uploads"
OUT = "/home/claude/port/src/assets/images/portrait"

INK = np.array([241, 114, 12], dtype=np.float32)  # --color-1 / --ink


def load(name):
    return Image.open(f"{SRC}/{name}").convert("RGB")


def crop_box(im, box_ratio):
    """box_ratio: (left, top, right, bottom) as fractions of the image."""
    w, h = im.size
    l, t, r, b = box_ratio
    return im.crop((int(w * l), int(h * t), int(w * r), int(h * b)))


def cinematic_grade(im, warmth=0.16, lift=0.0, contrast=1.18, darken=0.86, grain=6, vignette_strength=0.55, desat=0.62):
    # Slight desaturation -> more editorial, less "phone camera"
    im = ImageEnhance.Color(im).enhance(desat)
    im = ImageEnhance.Contrast(im).enhance(contrast)
    im = ImageEnhance.Brightness(im).enhance(darken)

    arr = np.array(im).astype(np.float32)

    # Split-tone: push shadows toward near-black/blue, highlights toward
    # the portfolio's warm ink color, tastefully (not a full color wash).
    luma = arr.mean(axis=2, keepdims=True) / 255.0
    shadow_mask = np.clip(1 - luma * 1.6, 0, 1)
    highlight_mask = np.clip((luma - 0.55) / 0.45, 0, 1)

    cool_shadow = np.array([6, 8, 14], dtype=np.float32)
    arr = arr * (1 - shadow_mask * 0.35) + cool_shadow * (shadow_mask * 0.35)
    arr = arr * (1 - highlight_mask * warmth) + INK * (highlight_mask * warmth)

    if lift:
        arr = arr + lift

    im = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8))

    # Vignette
    w, h = im.size
    yy, xx = np.mgrid[0:h, 0:w]
    cx, cy = w / 2, h * 0.46
    d = np.sqrt(((xx - cx) / (w / 1.5)) ** 2 + ((yy - cy) / (h / 1.5)) ** 2)
    vmask = np.clip(1 - vignette_strength * (d ** 2), 0.18, 1)
    arr2 = np.array(im).astype(np.float32) * vmask[:, :, None]
    im = Image.fromarray(np.clip(arr2, 0, 255).astype(np.uint8))

    # Fine grain
    arr3 = np.array(im).astype(np.int16)
    noise = np.random.randint(-grain, grain, arr3.shape[:2])[:, :, None]
    arr3 = np.clip(arr3 + noise, 0, 255).astype(np.uint8)
    im = Image.fromarray(arr3)

    im = im.filter(ImageFilter.GaussianBlur(0.3))
    return im


def save(im, name, max_w=1200):
    if im.width > max_w:
        h = int(im.height * (max_w / im.width))
        im = im.resize((max_w, h), Image.LANCZOS)
    im.save(f"{OUT}/{name}.webp", "WEBP", quality=90, method=6)
    print("saved", name, im.size)


import os
os.makedirs(OUT, exist_ok=True)

# 1. "Cinematic portrait" — brick wall, already warm-lit, quiet 3/4 gaze.
im4 = load("WhatsApp_Image_2025-06-19_at_13_13_25_75ddbf61.jpg")
im4 = crop_box(im4, (0.12, 0.28, 0.92, 0.98))
im4 = cinematic_grade(im4, warmth=0.14, contrast=1.14, darken=0.82, vignette_strength=0.6)
save(im4, "portrait-cinematic")

# 2. "Side profile" — mall corridor lights become rim-light streaks.
im2 = load("WhatsApp_Image_2026-03-09_at_12_32_53.jpeg")
im2 = crop_box(im2, (0.0, 0.08, 1.0, 0.86))
im2 = cinematic_grade(im2, warmth=0.1, contrast=1.22, darken=0.68, vignette_strength=0.7)
save(im2, "portrait-profile")

# 3. "Seated / quiet" — park bench at night, already a near-perfect match.
im3 = load("WhatsApp_Image_2025-06-19_at_13_13_24_890ad7f8.jpg")
im3 = crop_box(im3, (0.0, 0.32, 1.0, 1.0))
im3 = cinematic_grade(im3, warmth=0.12, contrast=1.12, darken=0.72, vignette_strength=0.62, desat=0.32)
save(im3, "portrait-seated")

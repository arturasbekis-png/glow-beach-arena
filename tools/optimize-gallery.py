#!/usr/bin/env python3
"""Build the optimized WebP gallery files.

Masters live in photo-originals/gallery/ (not published). For every master this writes
  public/photos/gallery/<name>.webp       large  (long edge <= 1600 px, never upscaled)
  public/photos/gallery/<name>-720.webp   small  (width 720 px, only when the master is wider)
Aspect ratio is kept exactly (resize only, no crop). An embedded ICC profile (the event
photos are Display P3) is carried over so colours render as in the original JPG.
Keep the width rules in sync with galleryVariants() in src/config.ts.

Usage: python3 tools/optimize-gallery.py
"""
import glob, os
from PIL import Image

SRC = os.path.join('photo-originals', 'gallery')
OUT = os.path.join('public', 'photos', 'gallery')
QUALITY = 85
LONG_EDGE = 1600
SMALL_W = 720


def resize(im, w):
    h = int(im.height * w / im.width + 0.5)
    return im.resize((w, h), Image.LANCZOS)


def save(im, path, icc):
    kw = dict(quality=QUALITY, method=6)
    if icc:
        kw['icc_profile'] = icc
    im.save(path, 'WEBP', **kw)


total = 0
for f in sorted(glob.glob(os.path.join(SRC, '*.jpg'))):
    name = os.path.splitext(os.path.basename(f))[0]
    im = Image.open(f)
    icc = im.info.get('icc_profile')
    im = im.convert('RGB')
    scale = min(1, LONG_EDGE / max(im.size))
    large_w = int(im.width * scale + 0.5)
    large = im if large_w == im.width else resize(im, large_w)
    save(large, os.path.join(OUT, name + '.webp'), icc)
    out = [(name + '.webp', large.size)]
    if im.width > SMALL_W:
        small = resize(im, SMALL_W)
        save(small, os.path.join(OUT, f'{name}-{SMALL_W}.webp'), icc)
        out.append((f'{name}-{SMALL_W}.webp', small.size))
    for n, s in out:
        sz = os.path.getsize(os.path.join(OUT, n)); total += sz
        print(f'{n:28s} {s[0]}x{s[1]}  {sz // 1024} KB')
print('total', round(total / 1024), 'KB')

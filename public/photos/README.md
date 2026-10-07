# Real arena photography

- `gallery/glow_gallery_01.jpg` … `glow_gallery_10.jpg` — the Gallery photos, used exactly as supplied (never edited or re-encoded).
  Their file names, pixel sizes and Lithuanian alt texts are listed in `galleryPhotos` in `src/config.ts`.
- `hero.jpg` — optional full-bleed background for the first screen.
- Optional hero video: `public/media/hero.mp4`.

Gallery files are optimized WebP (`<name>.webp` large, `<name>-720.webp` small). To add or replace a gallery photo: put the
original JPG into `photo-originals/gallery/`, run `python3 tools/optimize-gallery.py`, add/edit its entry in `galleryPhotos`
(`file: '<name>.webp'`, the original's real width/height, alt text that describes only what is visible), then run `npm run build`.

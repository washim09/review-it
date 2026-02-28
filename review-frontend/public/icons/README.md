# App Icons Setup

## Icon Requirements

Your logo (1024x1024) needs to be converted to multiple sizes for PWA compatibility.

### Required Icon Sizes:
- 72x72px → `icon-72x72.png`
- 96x96px → `icon-96x96.png`
- 128x128px → `icon-128x128.png`
- 144x144px → `icon-144x144.png`
- 152x152px → `icon-152x152.png`
- 192x192px → `icon-192x192.png`
- 384x384px → `icon-384x384.png`
- 512x512px → `icon-512x512.png`
- 192x192px → `icon-maskable-192x192.png` (with safe zone)
- 512x512px → `icon-maskable-512x512.png` (with safe zone)

### How to Generate Icons:

**Option 1: Use Online Tool (Recommended)**
1. Go to https://realfavicongenerator.net/ or https://www.pwabuilder.com/imageGenerator
2. Upload your 1024x1024 logo
3. Download generated icons
4. Place them in this `/public/icons/` folder

**Option 2: Use ImageMagick (Command Line)**
```bash
# Install ImageMagick first
# Then run these commands in the folder with your logo.png

magick logo.png -resize 72x72 icon-72x72.png
magick logo.png -resize 96x96 icon-96x96.png
magick logo.png -resize 128x128 icon-128x128.png
magick logo.png -resize 144x144 icon-144x144.png
magick logo.png -resize 152x152 icon-152x152.png
magick logo.png -resize 192x192 icon-192x192.png
magick logo.png -resize 384x384 icon-384x384.png
magick logo.png -resize 512x512 icon-512x512.png
magick logo.png -resize 192x192 icon-maskable-192x192.png
magick logo.png -resize 512x512 icon-maskable-512x512.png
```

**Option 3: Manual Photoshop/GIMP**
- Open your logo in image editor
- Resize to each dimension
- Export as PNG with transparency
- Save with corresponding filename

### Maskable Icons
Maskable icons need a safe zone (20% padding) so the icon isn't cut off on different device shapes.
Add padding around your logo for the maskable versions.

### Shortcuts Icons
Also create these for app shortcuts:
- `shortcut-browse.png` (96x96)
- `shortcut-write.png` (96x96)
- `shortcut-messages.png` (96x96)

These can be simple icons representing each function.

---

**After generating icons, place all files in this folder and the PWA will automatically use them.**

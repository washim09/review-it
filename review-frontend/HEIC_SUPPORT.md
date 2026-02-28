# HEIC Image Support Documentation

## Overview
HEIC (High Efficiency Image Container) is Apple's default image format for photos taken on iOS devices. This format is not natively supported by web browsers and requires conversion to JPEG/PNG/WebP for display.

## Current Implementation

### Frontend Automatic Conversion
The application now automatically handles HEIC images:

1. **Automatic Detection**: When serving images, the `getMediaUrl()` function detects HEIC files by extension
2. **Backend Conversion Request**: HEIC images automatically include `?convert=jpeg` parameter in the URL
3. **Transparent to User**: Existing HEIC images in the database work without manual intervention

### Files Modified
- `src/utils/mediaUtils.ts`: Updated to detect HEIC files and request conversion
- `src/utils/heicConverter.ts`: Client-side conversion utilities (optional, requires heic2any package)

## Backend Requirements

The backend API endpoint `/api/staticfile/:filename` should handle the `convert=jpeg` query parameter:

```javascript
// Example backend implementation
if (req.query.convert === 'jpeg' && isHeicFile(filename)) {
  // Convert HEIC to JPEG and serve
  const jpegBuffer = await convertHeicToJpeg(fileBuffer);
  res.set('Content-Type', 'image/jpeg');
  res.send(jpegBuffer);
}
```

### Recommended Backend Libraries
- **Node.js**: `heic-convert` or `sharp` with HEIC support
- **Python**: `pillow-heif`
- **Go**: `github.com/strukturag/libheif`

## Alternative: Client-Side Conversion (Optional)

If backend conversion is not available, you can enable client-side conversion:

### Installation
```bash
npm install heic2any
```

### Usage in Upload Components
The `heicConverter.ts` utility provides functions for client-side conversion before upload:

```typescript
import { processImageFile } from '../../utils/heicConverter';

// In your file upload handler:
const handleImageUpload = async (file: File) => {
  // Automatically converts HEIC to JPEG if needed
  const processedFile = await processImageFile(file);
  // Upload processedFile instead of original
};
```

## File Upload Accept Attributes

All file upload inputs now accept HEIC files:

```html
<input type="file" accept="image/*" />
<!-- This accepts all image types including HEIC -->
```

## Supported Formats

### Images
- JPG/JPEG ✅
- PNG ✅
- GIF ✅
- WEBP ✅
- BMP ✅
- SVG ✅
- HEIC/HEIF ✅ (with conversion)

### Videos
- MP4 ✅
- WEBM ✅
- MOV ✅
- OGG ✅
- AVI ✅
- MKV ✅

## Testing

### Test HEIC Display
1. Upload a review with HEIC images
2. Verify image appears in Featured Reviews
3. Check browser console for conversion requests
4. Verify URL includes `?convert=jpeg` for HEIC files

### Database Query
```sql
-- Find all reviews with HEIC images
SELECT id, title, "imageUrl" 
FROM "Review" 
WHERE "imageUrl" LIKE '%heic%' OR "imageUrl" LIKE '%heif%';
```

## Troubleshooting

### HEIC Images Not Displaying

1. **Check browser console** for errors
2. **Verify backend** supports conversion endpoint
3. **Check file path** in database matches actual file location
4. **Test URL directly**: `https://api.riviewit.com/api/staticfile/uploads/filename.heic?convert=jpeg`

### File Upload Issues

1. **Check file size**: Max 5MB per image
2. **Verify permissions**: Ensure upload directory is writable
3. **Check MIME type**: Some systems report HEIC as `image/heic`, others as `application/octet-stream`

## Migration Strategy

### For Existing HEIC Files in Database

No migration required! The frontend automatically requests conversion for HEIC files when they're served.

### For New Uploads

**Option A (Recommended)**: Convert on backend during upload
- User uploads HEIC → Backend converts to JPEG → Store as JPEG
- Database stores `.jpg` filename
- No runtime conversion needed

**Option B**: Convert on frontend before upload
- User selects HEIC → Frontend converts to JPEG → Upload JPEG
- Requires `heic2any` package
- Better user experience (faster initial load)

**Option C**: Store original, convert on serve
- User uploads HEIC → Store as HEIC
- Backend converts on-demand when served
- Caching recommended to avoid repeated conversions

## Performance Considerations

- **File Size**: HEIC files are typically 50% smaller than JPEG
- **Conversion Time**: 100-500ms per image depending on resolution
- **Caching**: Implement CDN or caching for converted images
- **Progressive Loading**: Show placeholders while images load

## Browser Compatibility

| Browser | Native HEIC | With Conversion |
|---------|-------------|-----------------|
| Chrome  | ❌          | ✅              |
| Firefox | ❌          | ✅              |
| Safari  | ⚠️ (iOS 11+)| ✅              |
| Edge    | ❌          | ✅              |

## Security Notes

- Validate file extensions on backend
- Scan uploaded files for malware
- Limit file sizes to prevent DoS
- Use secure file storage locations
- Implement rate limiting on conversion endpoint

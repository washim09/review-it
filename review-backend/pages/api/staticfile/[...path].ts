import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow GET
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { path: filePath } = req.query;
    const filePathArray = Array.isArray(filePath) ? filePath : [filePath];
    const filePathString = filePathArray.join('/');
    const decodedPath = decodeURIComponent(filePathString);

    // Sanitize path (prevent directory traversal)
    const sanitizedPath = decodedPath.replace(/\.\.\//g, '').replace(/\\/g, '/');

    // Strip optional leading "uploads/" or "/uploads/" so we point to actual filename
    const cleanPath = sanitizedPath.replace(/^\/?uploads\//, '');

    // Upload directory where files are saved
    // Use backend/public/uploads as primary, with env var override
    const uploadDir = process.env.UPLOADS_PATH || path.join(process.cwd(), 'public', 'uploads');
    
    // Try multiple filename variations to handle inconsistencies
    // between what's stored in DB and what's on disk
    const possiblePaths = [];
    
    // 1. Try exact path as requested
    possiblePaths.push(path.join(uploadDir, cleanPath));
    
    // 2. Try with spaces replaced by underscores
    const underscorePath = cleanPath.replace(/\s+/g, '_');
    possiblePaths.push(path.join(uploadDir, underscorePath));
    
    // 3. Try with underscores replaced by spaces  
    const spacePath = cleanPath.replace(/_/g, ' ');
    possiblePaths.push(path.join(uploadDir, spacePath));
    
    // 4. Try removing parentheses and brackets (for files uploaded before fix)
    const noParensPath = cleanPath
      .replace(/[\(\)\[\]\{\}]/g, '')  // remove all brackets/parentheses
      .replace(/\s+/g, '_')             // spaces to underscores
      .replace(/_{2,}/g, '_');          // collapse multiple underscores
    possiblePaths.push(path.join(uploadDir, noParensPath));
    
    // 5. Same as above but keep spaces
    const noParensWithSpaces = cleanPath.replace(/[\(\)\[\]\{\}]/g, '').trim();
    possiblePaths.push(path.join(uploadDir, noParensWithSpaces));
    
    // 6. For files with timestamps, try various formats
    // Handle "filename_timestamp.ext" format
    const timestampAtEndMatch = cleanPath.match(/^(.+?)[-_](\d{10,13})(\.\w+)$/);
    if (timestampAtEndMatch) {
      const [, filename, timestamp, ext] = timestampAtEndMatch;
      // Try with parentheses removed from filename
      const cleanFilename = filename.replace(/[\(\)\[\]\{\}]/g, '').replace(/\s+/g, '_');
      possiblePaths.push(path.join(uploadDir, `${cleanFilename}_${timestamp}${ext}`));
      // Try without removing parentheses but with underscores
      possiblePaths.push(path.join(uploadDir, `${filename.replace(/\s+/g, '_')}_${timestamp}${ext}`));
      // Try timestamp at beginning
      possiblePaths.push(path.join(uploadDir, `${timestamp}_${cleanFilename}${ext}`));
    }
    
    // 7. Handle special case like "2151074302 (2)_timestamp.jpg"
    // This regex captures: number + space + (number) + underscore + timestamp + extension
    const specialMatch = cleanPath.match(/^(\d+)\s*\((\d+)\)[-_](\d{10,13})(\.\w+)$/);
    if (specialMatch) {
      const [, mainNum, subNum, timestamp, ext] = specialMatch;
      // Try various cleaned versions
      possiblePaths.push(path.join(uploadDir, `${mainNum}${subNum}_${timestamp}${ext}`));
      possiblePaths.push(path.join(uploadDir, `${mainNum}_${subNum}_${timestamp}${ext}`));
      possiblePaths.push(path.join(uploadDir, `${mainNum}_${timestamp}${ext}`));
    }

    // Find the first existing file
    let actualPath = '';
    for (const testPath of possiblePaths) {
      if (fs.existsSync(testPath)) {
        actualPath = testPath;
        break;
      }
    }

    console.log('🔍 File request:', {
      requestedPath: cleanPath,
      testedPaths: possiblePaths,
      foundPath: actualPath || 'none',
      exists: !!actualPath
    });

    if (!actualPath) {
      console.error('❌ File not found. Tried paths:', possiblePaths);
      return res.status(404).json({ 
        message: 'File not found', 
        requestedPath: cleanPath,
        triedPaths: possiblePaths 
      });
    }

    const stats = fs.statSync(actualPath);
    if (!stats.isFile()) {
      return res.status(400).json({ message: 'Not a file' });
    }

    const ext = path.extname(actualPath).toLowerCase();
    const contentTypeMap: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.mp4': 'video/mp4',
      '.webm': 'video/webm',
      '.ogg': 'video/ogg',
      '.mov': 'video/quicktime',
      '.heic': 'image/heic',
      '.heif': 'image/heif'
    };
    const contentType = contentTypeMap[ext] || 'application/octet-stream';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', stats.size);
    res.setHeader('Cache-Control', 'public, max-age=86400');

    const fileStream = fs.createReadStream(actualPath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Error serving file:', error);
    res.status(500).json({ message: 'Error serving file' });
  }
}

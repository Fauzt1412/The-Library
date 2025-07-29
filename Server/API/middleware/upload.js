const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const ensureDirectoryExists = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`📁 Created directory: ${dirPath}`);
    }
};

// Get the correct uploads path based on environment
const getUploadsPath = (subDir) => {
    const basePath = process.env.NODE_ENV === 'production' 
        ? '/opt/render/project/src/uploads' 
        : path.join(__dirname, '../../uploads');
    return path.join(basePath, subDir);
};

// Storage configuration for books
const bookStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = getUploadsPath('books');
        ensureDirectoryExists(uploadPath);
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        cb(null, 'book-' + uniqueSuffix + extension);
    }
});

// Storage configuration for games
const gameStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = getUploadsPath('games');
        ensureDirectoryExists(uploadPath);
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        cb(null, 'game-' + uniqueSuffix + extension);
    }
});

// Storage configuration for submissions
const submissionStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const type = req.body.type || 'books';
        const uploadPath = getUploadsPath(`${type}s`);
        ensureDirectoryExists(uploadPath);
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const type = req.body.type || 'book';
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        cb(null, `${type}-submission-` + uniqueSuffix + extension);
    }
});

// File filter
const imageFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only JPEG, JPG, PNG, GIF, and WebP images are allowed!'), false);
        }
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

// Create multer instances
const uploadBookCover = multer({
    storage: bookStorage,
    fileFilter: imageFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    }
}).single('coverImage');

const uploadGameCover = multer({
    storage: gameStorage,
    fileFilter: imageFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    }
}).single('coverImage');

const uploadSubmissionCover = multer({
    storage: submissionStorage,
    fileFilter: imageFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    }
}).single('coverImage');

// Error handling middleware
const handleUploadError = (error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
        }
        console.error('Multer error:', error);
        return res.status(400).json({ error: 'File upload error: ' + error.message });
    } else if (error) {
        console.error('Upload error:', error);
        return res.status(400).json({ error: error.message });
    }
    next();
};

module.exports = {
    uploadBookCover,
    uploadGameCover,
    uploadSubmissionCover,
    handleUploadError
};
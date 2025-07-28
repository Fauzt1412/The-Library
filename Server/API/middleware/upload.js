const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const ensureDirectoryExists = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
};

// Storage configuration for books
const bookStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../../uploads/books');
        ensureDirectoryExists(uploadPath);
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        // Generate unique filename: timestamp + random number + original extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        cb(null, 'book-' + uniqueSuffix + extension);
    }
});

// Storage configuration for games
const gameStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../../uploads/games');
        ensureDirectoryExists(uploadPath);
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        // Generate unique filename: timestamp + random number + original extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        cb(null, 'game-' + uniqueSuffix + extension);
    }
});

// Storage configuration for submissions (dynamic based on type)
const submissionStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const type = req.body.type || 'books'; // Default to books if type not specified
        const uploadPath = path.join(__dirname, `../../uploads/${type}s`);
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

// File filter to only allow image files
const imageFilter = (req, file, cb) => {
    // Check if file is an image
    if (file.mimetype.startsWith('image/')) {
        // Check for specific image types
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

// Multer configuration for books
const uploadBookCover = multer({
    storage: bookStorage,
    fileFilter: imageFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    }
}).single('coverImage'); // Field name for book cover

// Multer configuration for games
const uploadGameCover = multer({
    storage: gameStorage,
    fileFilter: imageFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    }
}).single('coverImage'); // Field name for game cover

// Multer configuration for submissions
const uploadSubmissionCover = multer({
    storage: submissionStorage,
    fileFilter: imageFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    }
}).single('coverImage'); // Field name for submission cover

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
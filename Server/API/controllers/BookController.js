const express = require('express');
const mongoose = require('mongoose');
const book = require('../models/books');
const { deleteImage } = require('../../utils/cloudinaryUtils');

const GetAllBooks = async (req, res) => {
    try {
        const books = await book.find().populate('publishedBy', 'username email');
        res.status(200).json({ data: books });
    } catch (error) {
        console.error('Error fetching books:', error);
        res.status(500).json({ error: 'Error fetching books' });
    }
}

const GetBookById = async (req, res) => {
    const { id } = req.params;
    try {
        const bookData = await book.findById(id).populate('publishedBy', 'username email');
        if (!bookData) {
            return res.status(404).json({ error: 'Book not found' });
        }
        res.status(200).json({ data: bookData });
    } catch (error) {
        console.error('Error fetching book:', error);
        res.status(500).json({ error: 'Error fetching book' });
    }
}

const CreateBook = async (req, res) => {
    const { title, author, categories, publishedDate, description, readingLinks, coverImageUrl, cloudinaryData } = req.body;
    
    try {
        console.log('📝 CreateBook - Request data:', {
            body: req.body,
            file: req.file ? {
                filename: req.file.filename,
                originalname: req.file.originalname,
                mimetype: req.file.mimetype,
                size: req.file.size,
                path: req.file.path,
                destination: req.file.destination
            } : null,
            user: req.user ? req.user._id : null,
            hasCloudinaryData: !!cloudinaryData,
            coverImageUrl
        });
        
        let finalCoverImageUrl = null;
        
        // Check if we have Cloudinary data (JSON request)
        if (cloudinaryData && coverImageUrl) {
            console.log('📷 CreateBook - Using Cloudinary image:', coverImageUrl);
            finalCoverImageUrl = coverImageUrl;
        }
        // Check if file was uploaded (FormData request)
        else if (req.file) {
            finalCoverImageUrl = `/uploads/books/${req.file.filename}`;
            console.log('📷 CreateBook - Using uploaded file:', finalCoverImageUrl);
        }
        else {
            console.log('❌ CreateBook - No cover image provided');
            return res.status(400).json({ error: 'Cover image is required' });
        }
        
        // Parse reading links if they exist
        let parsedReadingLinks = [];
        if (readingLinks) {
            try {
                parsedReadingLinks = typeof readingLinks === 'string' ? JSON.parse(readingLinks) : readingLinks;
                // Filter out empty links
                parsedReadingLinks = parsedReadingLinks.filter(link => link.name && link.url);
            } catch (e) {
                console.error('Error parsing reading links:', e);
            }
        }
        
        const bookData = { 
            title, 
            author, 
            categories, 
            publishedDate, 
            description, 
            Coverpage: finalCoverImageUrl,
            readingLinks: parsedReadingLinks,
            publishedBy: req.user._id
        };
        
        // Add Cloudinary metadata if available
        if (cloudinaryData) {
            bookData.cloudinaryData = cloudinaryData;
        }
        
        console.log('💾 CreateBook - Book data to save:', bookData);
        
        const newBook = new book(bookData);
        await newBook.save();
        
        console.log('✅ CreateBook - Book saved successfully:', newBook._id);
        
        const populatedBook = await book.findById(newBook._id).populate('publishedBy', 'username email');
        res.status(201).json({ message: 'Book published successfully', book: populatedBook });
    } catch (error) {
        console.error('❌ CreateBook - Error:', error);
        res.status(500).json({ error: 'Error publishing book' });
    }
}

const UpdateBook = async (req, res) => {
    const { id } = req.params;
    const { title, author, categories, publishedDate, description, readingLinks, coverImageUrl, cloudinaryData } = req.body;
    
    try {
        console.log('🔄 UpdateBook - Request data:', {
            id,
            body: req.body,
            file: req.file ? {
                filename: req.file.filename,
                originalname: req.file.originalname,
                mimetype: req.file.mimetype,
                size: req.file.size,
                path: req.file.path,
                destination: req.file.destination
            } : null,
            user: req.user ? req.user._id : null,
            hasCloudinaryData: !!cloudinaryData,
            coverImageUrl
        });
        
        const existingBook = await book.findById(id);
        if (!existingBook) {
            return res.status(404).json({ error: 'Book not found' });
        }
        
        // Check if user is admin or the publisher of the book
        if (req.user.role !== 'admin' && existingBook.publishedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'You can only update your own books' });
        }
        
        // Parse reading links if they exist
        let parsedReadingLinks = [];
        if (readingLinks) {
            try {
                parsedReadingLinks = typeof readingLinks === 'string' ? JSON.parse(readingLinks) : readingLinks;
                // Filter out empty links
                parsedReadingLinks = parsedReadingLinks.filter(link => link.name && link.url);
            } catch (e) {
                console.error('Error parsing reading links:', e);
            }
        }
        
        // Prepare update data
        const updateData = {
            title,
            author,
            categories,
            publishedDate,
            description,
            readingLinks: parsedReadingLinks,
            updatedAt: new Date()
        };
        
        // Handle cover image update
        if (cloudinaryData && coverImageUrl) {
            // New Cloudinary upload
            updateData.Coverpage = coverImageUrl;
            updateData.cloudinaryData = cloudinaryData;
            console.log('📷 UpdateBook - New Cloudinary image URL:', coverImageUrl);
        } else if (req.file) {
            // New traditional file upload
            updateData.Coverpage = `/uploads/books/${req.file.filename}`;
            // Clear cloudinary data if switching to local upload
            updateData.cloudinaryData = null;
            console.log('📷 UpdateBook - New uploaded image URL:', updateData.Coverpage);
        } else if (coverImageUrl && !cloudinaryData) {
            // Existing image URL provided (no new upload)
            updateData.Coverpage = coverImageUrl;
            console.log('📷 UpdateBook - Keeping existing image URL:', coverImageUrl);
        } else {
            console.log('📷 UpdateBook - No image changes, keeping existing');
        }
        
        console.log('💾 UpdateBook - Update data:', updateData);
        
        const updatedBook = await book.findByIdAndUpdate(id, updateData, { new: true }).populate('publishedBy', 'username email');
        
        console.log('✅ UpdateBook - Book updated successfully:', updatedBook._id);
        
        res.status(200).json({ message: 'Book updated successfully', book: updatedBook });
    } catch (error) {
        console.error('❌ UpdateBook - Error:', error);
        res.status(500).json({ error: 'Error updating book' });
    }
}

const DeleteBook = async (req, res) => {
    const { id } = req.params;
    try {
        const bookToDelete = await book.findById(id);
        if (!bookToDelete) {
            return res.status(404).json({ error: 'Book not found' });
        }
        
        // Check if user is admin or the publisher of the book
        if (req.user.role !== 'admin' && bookToDelete.publishedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'You can only delete your own books' });
        }
        
        // Delete cover image from Cloudinary if it exists
        if (bookToDelete.Coverpage) {
            console.log('🗑️ Attempting to delete book cover image:', bookToDelete.Coverpage);
            const deleteResult = await deleteImage(bookToDelete.Coverpage);
            if (deleteResult.success) {
                console.log('✅ Successfully deleted book cover image');
            } else {
                console.log('⚠️ Failed to delete book cover image:', deleteResult.error);
                // Don't fail the deletion if image deletion fails
            }
        }
        
        await book.findByIdAndDelete(id);
        res.status(200).json({ message: 'Book deleted successfully and image cleaned up' });
    } catch (error) {
        console.error('Error deleting book:', error);
        res.status(500).json({ error: 'Error deleting book' });
    }
}

// Get books published by a specific user
const GetBooksByUser = async (req, res) => {
    const { userId } = req.params;
    try {
        const books = await book.find({ publishedBy: userId }).populate('publishedBy', 'username email');
        res.status(200).json({ data: books });
    } catch (error) {
        console.error('Error fetching user books:', error);
        res.status(500).json({ error: 'Error fetching user books' });
    }
}

// Get books published by the current user
const GetMyBooks = async (req, res) => {
    try {
        const books = await book.find({ publishedBy: req.user._id }).populate('publishedBy', 'username email');
        res.status(200).json({ data: books });
    } catch (error) {
        console.error('Error fetching your books:', error);
        res.status(500).json({ error: 'Error fetching your books' });
    }
}

module.exports = {
    GetAllBooks,
    GetBookById,
    CreateBook,
    UpdateBook,
    DeleteBook,
    GetBooksByUser,
    GetMyBooks
};

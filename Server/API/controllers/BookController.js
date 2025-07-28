const express = require('express');
const mongoose = require('mongoose');
const book = require('../models/books');

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
    const { title, author, categories, publishedDate, description, readingLinks } = req.body;
    
    try {
        // Check if file was uploaded
        if (!req.file) {
            return res.status(400).json({ error: 'Cover image is required' });
        }
        
        // Generate the URL for the uploaded image
        const coverImageUrl = `/uploads/books/${req.file.filename}`;
        
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
        
        const newBook = new book({ 
            title, 
            author, 
            categories, 
            publishedDate, 
            description, 
            Coverpage: coverImageUrl, // Use the uploaded file path
            readingLinks: parsedReadingLinks,
            publishedBy: req.user._id
        });
        
        await newBook.save();
        const populatedBook = await book.findById(newBook._id).populate('publishedBy', 'username email');
        res.status(201).json({ message: 'Book published successfully', book: populatedBook });
    } catch (error) {
        console.error('Error publishing book:', error);
        res.status(500).json({ error: 'Error publishing book' });
    }
}

const UpdateBook = async (req, res) => {
    const { id } = req.params;
    const { title, author, categories, publishedDate, description, readingLinks } = req.body;
    
    try {
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
        
        // If a new file was uploaded, update the cover image
        if (req.file) {
            updateData.Coverpage = `/uploads/books/${req.file.filename}`;
            
            // TODO: Delete old image file (optional)
            // You might want to implement file cleanup here
        }
        
        const updatedBook = await book.findByIdAndUpdate(id, updateData, { new: true }).populate('publishedBy', 'username email');
        res.status(200).json({ message: 'Book updated successfully', book: updatedBook });
    } catch (error) {
        console.error('Error updating book:', error);
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
        
        await book.findByIdAndDelete(id);
        res.status(200).json({ message: 'Book deleted successfully' });
    } catch (error) {
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

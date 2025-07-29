const express = require('express');
const mongoose = require('mongoose');
const game = require('../models/games');
const { deleteImage } = require('../../utils/cloudinaryUtils');

const GetAllGames = async (req, res) => {
    try {
        const games = await game.find().populate('publishedBy', 'username email');
        res.status(200).json({ data: games });
    } catch (error) {
        console.error('Error fetching games:', error);
        res.status(500).json({ error: 'Error fetching games' });
    }
}

const GetGameById = async (req, res) => {
    const { id } = req.params;
    try {
        const gameData = await game.findById(id).populate('publishedBy', 'username email');
        if (!gameData) {
            return res.status(404).json({ error: 'Game not found' });
        }
        res.status(200).json({ data: gameData });
    } catch (error) {
        console.error('Error fetching game:', error);
        res.status(500).json({ error: 'Error fetching game' });
    }
}

const CreateGame = async (req, res) => {
    const { title, genre, developer, platform, releaseDate, description, platformLinks } = req.body;
    
    try {
        // Check if file was uploaded
        if (!req.file) {
            return res.status(400).json({ error: 'Cover image is required' });
        }
        
        // Generate the URL for the uploaded image
        const coverImageUrl = `/uploads/games/${req.file.filename}`;
        
        // Parse platform links if they exist
        let parsedPlatformLinks = [];
        if (platformLinks) {
            try {
                parsedPlatformLinks = typeof platformLinks === 'string' ? JSON.parse(platformLinks) : platformLinks;
                // Filter out empty links
                parsedPlatformLinks = parsedPlatformLinks.filter(link => link.name && link.url);
            } catch (e) {
                console.error('Error parsing platform links:', e);
            }
        }
        
        const newGame = new game({ 
            title, 
            genre, 
            developer, 
            platform, 
            releaseDate, 
            description, 
            coverImage: coverImageUrl, // Use the uploaded file path
            platformLinks: parsedPlatformLinks,
            publishedBy: req.user._id
        });
        
        await newGame.save();
        const populatedGame = await game.findById(newGame._id).populate('publishedBy', 'username email');
        res.status(201).json({ message: 'Game published successfully', game: populatedGame });
    } catch (error) {
        console.error('Error publishing game:', error);
        res.status(500).json({ error: 'Error publishing game' });
    }
}

const UpdateGame = async (req, res) => {
    const { id } = req.params;
    const { title, genre, developer, platform, releaseDate, description, platformLinks } = req.body;
    
    try {
        const existingGame = await game.findById(id);
        if (!existingGame) {
            return res.status(404).json({ error: 'Game not found' });
        }
        
        // Check if user is admin or the publisher of the game
        if (req.user.role !== 'admin' && existingGame.publishedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'You can only update your own games' });
        }
        
        // Parse platform links if they exist
        let parsedPlatformLinks = [];
        if (platformLinks) {
            try {
                parsedPlatformLinks = typeof platformLinks === 'string' ? JSON.parse(platformLinks) : platformLinks;
                // Filter out empty links
                parsedPlatformLinks = parsedPlatformLinks.filter(link => link.name && link.url);
            } catch (e) {
                console.error('Error parsing platform links:', e);
            }
        }
        
        // Prepare update data
        const updateData = {
            title,
            genre,
            developer,
            platform,
            releaseDate,
            description,
            platformLinks: parsedPlatformLinks,
            updatedAt: new Date()
        };
        
        // If a new file was uploaded, update the cover image
        if (req.file) {
            updateData.coverImage = `/uploads/games/${req.file.filename}`;
            
            // TODO: Delete old image file (optional)
            // You might want to implement file cleanup here
        }
        
        const updatedGame = await game.findByIdAndUpdate(id, updateData, { new: true }).populate('publishedBy', 'username email');
        res.status(200).json({ message: 'Game updated successfully', game: updatedGame });
    } catch (error) {
        console.error('Error updating game:', error);
        res.status(500).json({ error: 'Error updating game' });
    }
}

const DeleteGame = async (req, res) => {
    const { id } = req.params;
    try {
        const gameToDelete = await game.findById(id);
        if (!gameToDelete) {
            return res.status(404).json({ error: 'Game not found' });
        }
        
        // Check if user is admin or the publisher of the game
        if (req.user.role !== 'admin' && gameToDelete.publishedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'You can only delete your own games' });
        }
        
        // Delete cover image from Cloudinary if it exists
        if (gameToDelete.coverImage) {
            console.log('🗑️ Attempting to delete game cover image:', gameToDelete.coverImage);
            const deleteResult = await deleteImage(gameToDelete.coverImage);
            if (deleteResult.success) {
                console.log('✅ Successfully deleted game cover image');
            } else {
                console.log('⚠️ Failed to delete game cover image:', deleteResult.error);
                // Don't fail the deletion if image deletion fails
            }
        }
        
        await game.findByIdAndDelete(id);
        res.status(200).json({ message: 'Game deleted successfully and image cleaned up' });
    } catch (error) {
        console.error('Error deleting game:', error);
        res.status(500).json({ error: 'Error deleting game' });
    }
}

// Get games published by a specific user
const GetGamesByUser = async (req, res) => {
    const { userId } = req.params;
    try {
        const games = await game.find({ publishedBy: userId }).populate('publishedBy', 'username email');
        res.status(200).json({ data: games });
    } catch (error) {
        console.error('Error fetching user games:', error);
        res.status(500).json({ error: 'Error fetching user games' });
    }
}

// Get games published by the current user
const GetMyGames = async (req, res) => {
    try {
        const games = await game.find({ publishedBy: req.user._id }).populate('publishedBy', 'username email');
        res.status(200).json({ data: games });
    } catch (error) {
        console.error('Error fetching your games:', error);
        res.status(500).json({ error: 'Error fetching your games' });
    }
}

module.exports = {
    GetAllGames,
    GetGameById,
    CreateGame,
    UpdateGame,
    DeleteGame,
    GetGamesByUser,
    GetMyGames
};
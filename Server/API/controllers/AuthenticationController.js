const express = require('express');
const mongoose = require('mongoose');
express.Router = require('express').Router;

const SignUp = async (req, res) => {
    const { username, password, email } = req.body;
    try {
        const User = require('../models/users');
        const newUser = new User({ username, password, email });
        await newUser.save();
        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error creating user' });
    }
};

const Login = async (req, res) => {
    const { username, password } = req.body;
    try {
        const User = require('../models/users');
        const user = await User.findOne({ username, password });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        res.status(200).json({ message: 'Login successful', user });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Error logging in' });
    }
};

const Logout = (req, res) => {
    res.status(200).json({ message: 'Logout successful' });
};

module.exports = { SignUp, Login, Logout };
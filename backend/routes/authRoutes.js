const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
router.post('/register', async (req, res) => {
    const { name, mobile, password, role } = req.body;

    const userExists = await User.findOne({ mobile });
    if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
        name,
        mobile,
        password,
        role: role || 'student'
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            mobile: user.mobile,
            role: user.role,
            token: generateToken(user._id)
        });
    } else {
        res.status(400).json({ message: 'Invalid user data' });
    }
});

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
router.post('/login', async (req, res) => {
    const { mobile, password } = req.body;
    const user = await User.findOne({ mobile });

    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user._id,
            name: user.name,
            mobile: user.mobile,
            role: user.role,
            token: generateToken(user._id)
        });
    } else {
        res.status(401).json({ message: 'Invalid mobile or password' });
    }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../models/db');

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const result = await db.query('SELECT * FROM users WHERE username = $1', [username]);
        const user = result.rows[0];

        if (user && await bcrypt.compare(password, user.password)) {
            // Assuming you have session setup
            req.session.userId = user.id;
            res.redirect('/');
        } else {
            res.status(401).send('Invalid username or password');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

// Render the registration page
router.get('/login', (req, res) => {
    res.render('login');
});

// Handle registration form submission
router.post('/login', async (req, res) => {
    const { username, password, email } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.query(
            'INSERT INTO users (username, password, email) VALUES ($1, $2, $3)',
            [username, hashedPassword, email]
        );
        res.redirect('/login');
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;

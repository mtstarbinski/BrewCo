const express = require('express');
const router = express.Router();


// Index Message
router.get('', (req, res) => {
    res.render('index', { title: 'Brew.co', message: 'Hello' });
});

module.exports = router;
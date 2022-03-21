const validateObjectId = require('../middleware/validateObjectId');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const express = require('express');
const router = express.Router();
const { Roast, validate } = require('../models/roast');
const mongoose = require('mongoose');


// CRUD
// Get all
router.get('/', async (req, res) => {
    const roasts = await Roast.find()
    res.send(roasts);
});

// Get id
router.get('/:id', validateObjectId, async (req, res) => {
    const roast = await Roast.findById(req.params.id);

    if (!roast) return res.status(404).send('The roast with the given ID was not found.');

    res.send(roast);
});

// PUT
router.put('/:id', [auth, admin, validateObjectId], async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.message);

    const roast = await Roast.findByIdAndUpdate(req.params.id, { name: req.body.name }, {
        new: true
    })

    if (!roast) res.status(404).send('The roast with the given ID was not found.');

    res.send(roast);
});

// POST
router.post('/', [auth], async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.message);

    let roast = await Roast.findOne({ name: req.body.name });
    if (roast) return res.status(400).send('Roast already registered.');

    roast = new Roast({ name: req.body.name });

    await roast.save();
    res.send(roast);
});

// Delete
router.delete('/:id', [auth, admin, validateObjectId], async (req, res) => {
    const roast = await Roast.findByIdAndRemove(req.params.id);

    if (!roast) res.status(404).send('The roast with the given ID was not found.');

    res.send(roast);
});

module.exports = router;
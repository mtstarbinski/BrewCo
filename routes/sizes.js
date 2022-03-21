const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const express = require('express');
const router = express.Router();
const { Size, validate } = require('../models/size');

// CRUD
// GET ALL
router.get('/', async (req, res) => {
    const sizes = await Size.find().sort('name')
    res.send(sizes);
});

// GET ID
router.get('/:id', async (req, res) => {
    const size = await Size.findById(req.params.id);

    if (!size) return res.status(404).send('The size with the given ID was not found.');

    res.send(size);
});

// PUT
router.put('/:id', [auth, admin], async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.message);

    let size = await Size.findOne({ name: req.body.name });
    if (size) return res.status(400).send('Size already registered.');

    size = await Size.findByIdAndUpdate(req.params.id, { name: req.body.name }, {
        new: true
    })

    if (!size) res.status(404).send('The size with the given ID was not found.');

    res.send(size);
});

// POST
router.post('/', [auth, admin], async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.message);

    let size = await Size.findOne({ name: req.body.name });
    if (size) return res.status(400).send('Size already registered.');

    size = new Size({ name: req.body.name });

    await size.save();
    res.send(size);
});

// Delete
router.delete('/:id', [auth, admin], async (req, res) => {
    const size = await Size.findByIdAndRemove(req.params.id);

    if (!size) res.status(404).send('The size with the given ID was not found.');

    res.send(size);
});

module.exports = router;
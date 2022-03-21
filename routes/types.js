const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const express = require('express');
const router = express.Router();
const { Type, validate } = require('../models/type');

// CRUD
// GET ALL
router.get('/', async (req, res) => {
    const types = await Type.find()
    res.send(types);
});

// GET ID
router.get('/:id', async (req, res) => {
    const type = await Type.findById(req.params.id);

    if (!type) return res.status(404).send('The type with the given ID was not found.');

    res.send(type);
});

// PUT
router.put('/:id', [auth, admin], async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.message);

    let type = await Type.findOne({ name: req.body.name });
    if (type) return res.status(400).send('Type already registered.');

    type = await Type.findByIdAndUpdate(req.params.id, { name: req.body.name }, {
        new: true
    })

    if (!type) res.status(404).send('The type with the given ID was not found.');

    res.send(type);
});

// POST
router.post('/', [auth, admin], async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.message);

    let type = await Type.findOne({ name: req.body.name });
    if (type) return res.status(400).send('Type already registered.');

    type = new Type({ name: req.body.name });

    await type.save();
    res.send(type);
});

// Delete
router.delete('/:id', [auth, admin], async (req, res) => {
    const type = await Type.findByIdAndRemove(req.params.id);

    if (!type) res.status(404).send('The type with the given ID was not found.');

    res.send(type);
});

module.exports = router;
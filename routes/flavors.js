const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const express = require('express');
const router = express.Router();
const { Flavor, validate } = require('../models/flavor');

// CRUD
// Get all
router.get('/', async (req, res) => {
    const flavors = await Flavor.find()
    res.send(flavors);
});

// Get id
router.get('/:id', async (req, res) => {
    const flavor = await Flavor.findById(req.params.id);

    if (!flavor) return res.status(404).send('The flavor with the given ID was not found.');

    res.send(flavor);
});

// PUT
router.put('/:id', [auth, admin], async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.message);

    const flavor = await Flavor.findByIdAndUpdate(req.params.id, { name: req.body.name }, {
        new: true
    })

    if (!flavor) res.status(404).send('The flavor with the given ID was not found.');

    res.send(flavor);
});

// POST
router.post('/', [auth, admin], async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.message);

    let flavor = await Flavor.findOne({ name: req.body.name });
    if (flavor) return res.status(400).send('Flavor already registered.');

    flavor = new Flavor({ name: req.body.name });

    await flavor.save();
    res.send(flavor);
});

// Delete
router.delete('/:id', [auth, admin], async (req, res) => {
    const flavor = await Flavor.findByIdAndRemove(req.params.id);

    if (!flavor) res.status(404).send('The flavor with the given ID was not found.');

    res.send(flavor);
});

module.exports = router;
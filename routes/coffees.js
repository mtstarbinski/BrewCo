const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const express = require('express');
const router = express.Router();
const { Coffee, validate } = require('../models/coffee');
const { Roast } = require('../models/roast');
const { Flavor } = require('../models/flavor');
const Fawn = require('fawn');


// GET ALL
router.get('/', async (req, res, next) => {
    const coffees = await Coffee.find().sort('name');
    res.send(coffees);
});

// Get by id
router.get('/:id', async (req, res) => {
    const coffee = await Coffee.findById(req.params.id);

    if (!coffee) return res.status(404).send('The coffee with the given ID was not found.');

    res.send(coffee);
});

// PUT (UPDATE)
router.put('/:id', [auth, admin], async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.message);

    const roast = await Roast.findById(req.body.roastId);
    if (!roast) return res.status(400).send('Invalid Roast.');

    const flavor = await Flavor.findById(req.body.flavorId);
    if (!flavor) return res.status(400).send('Invalid Flavor.');

    const coffee = await Coffee.findByIdAndUpdate(req.params.id, {
        name: req.body.name,
        roast: {
            _id: roast._id,
            name: roast.name
        },
        flavor: {
            _id: flavor._id,
            name: flavor.name
        },
        caffeine: req.body.caffeine,
        availability: req.body.availability
    }, { new: true });

    if (!coffee) return res.status(404).send('The coffee with the given ID was not found.');

    res.send(coffee);
});

// POST (CREATE)
router.post('/', [auth, admin], async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.message);

    const roast = await Roast.findById(req.body.roastId);
    if (!roast) return res.status(400).send('Invalid Roast.');

    const flavor = await Flavor.findById(req.body.flavorId);
    if (!flavor) return res.status(400).send('Invalid Flavor.');

    const coffee = new Coffee({
        name: req.body.name,
        roast: {
            _id: roast._id,
            name: roast.name
        },
        flavor: {
            _id: flavor._id,
            name: flavor.name
        },
        caffeine: req.body.caffeine,
        availability: req.body.availability
    });

    await coffee.save();
    res.send(coffee);
});

// DELETE
router.delete('/:id', [auth, admin], async (req, res) => {
    const coffee = await Coffee.findByIdAndRemove(req.params.id);

    if (!coffee) return res.status(404).send('The coffee with the given ID was not found.');

    res.send(coffee);
});

module.exports = router;
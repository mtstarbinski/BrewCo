const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const express = require('express');
const router = express.Router();
const { Customer, validate } = require('../models/customer');

// CRUD
// Get all
router.get('/', [auth, admin], async (req, res) => {
    const customers = await Customer.find().sort('name');
    res.send(customers);
});

// Get by id
router.get('/:id', [auth, admin], async (req, res) => {
    const customer = await Customer.findById(req.params.id);

    if (!customer) return res.status(404).send('The customer with the given ID was not found.');

    res.send(customer);
});

// PUT (UPDATE)
router.put('/:id', [auth, admin], async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.message);

    const customer = await Customer.findByIdAndUpdate(req.params.id, {
        name: req.body.name,
        isGold: req.body.isGold,
        email: req.body.email,
        phone: req.body.phone,
    }, { new: true });

    if (!customer) return res.status(404).send('The customer with the given ID was not found.');

    res.send(customer);
});

// POST (CREATE)
router.post('/', [auth, admin], async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.message);

    const customer = new Customer({
        name: req.body.name,
        isGold: req.body.isGold,
        email: req.body.email,
        phone: req.body.phone
    });

    await customer.save();
    res.send(customer);
});

// DELETE
router.delete('/:id', [auth, admin], async (req, res) => {
    const customer = await Customer.findByIdAndRemove(req.params.id);

    if (!customer) return res.status(404).send('The customer with the given ID was not found.');

    res.send(customer);
});

module.exports = router;
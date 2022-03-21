const auth = require('../middleware/auth');
const express = require('express');
const router = express.Router();
const { User, validate } = require('../models/user');
const mongoose = require('mongoose');
const _ = require('lodash');
const bcrypt = require('bcrypt');


// CRUD
// Get all
router.get('/', async (req, res) => {
    const users = await User.find().sort('name');
    res.send(users);
});

// Get by me
router.get('/me', auth, async (req, res) => {
    const user = await User.findById(req.user._id).select('-password');
    res.send(user);
});

// Get by id
router.get('/:id', async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) return res.status(404).send('The customer with the given ID was not found.');

    res.send(user);
});

// PUT (UPDATE)
router.put('/:id', async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.message);

    const user = await User.findByIdAndUpdate(req.params.id, {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
    }, { new: true });

    if (!user) return res.status(404).send('The user with the given ID was not found.');

    res.send(user);
});

// POST (CREATE)
router.post('/', async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.message);

    let user = await User.findOne({ email: req.body.email });
    if (user) return res.status(400).send('User already registered.');

    user = new User(_.pick(req.body, ['name', 'email', 'password']));
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);

    await user.save();

    const token = user.generateAuthToken();

    res.header('x-auth-token', token).send(_.pick(user, ['_id', 'name', 'email']));
});

// DELETE
router.delete('/:id', async (req, res) => {
    const user = await User.findByIdAndRemove(req.params.id);

    if (!user) return res.status(404).send('The user with the given ID was not found.');

    res.send(user);
});

module.exports = router;
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const express = require('express');
const router = express.Router();
const { User } = require('../models/user');
const mongoose = require('mongoose');
const _ = require('lodash');
const bcrypt = require('bcrypt');
const config = require('config');


// crud
// get all
router.get('/', async (req, res) => {
    const users = await register.find().sort('name');
    res.send(users);
});

// post (login)
router.post('/', async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.message);

    let user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).send('Invalid Email or password.');

    const validPassword = await bcrypt.compare(req.body.password, user.password)
    if (!validPassword) return res.status(400).send('Invalid Email or password.');

    const token = user.generateAuthToken();
    res.send(token);
});

// delete (log out)
router.delete('/:id', async (req, res) => {
    const account = await register.findbyidandremove(req.params.id);

    if (!account) return res.status(404).send('the account with the given id was not found.');

    res.send(account);
});

// validate user input
function validate(req) {
    const schema = Joi.object({
        email: Joi.string().min(5).required().email(),
        password: Joi.string().min(8).max(255).required()
    });

    return schema.validate(req);
}

module.exports = router;
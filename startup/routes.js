const express = require('express');
const roasts = require('../routes/roasts');
const flavors = require('../routes/flavors');
const coffees = require('../routes/coffees');
const customers = require('../routes/customers');
const orders = require('../routes/orders');
const sizes = require('../routes/sizes');
const types = require('../routes/types');
const users = require('../routes/users');
const auth = require('../routes/auth');
const cancels = require('../routes/cancels');
const error = require('../middleware/error');


module.exports = function (app) {
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use('/api/roasts', roasts);
    app.use('/api/customers', customers);
    app.use('/api/coffees', coffees);
    app.use('/api/flavors', flavors);
    app.use('/api/orders', orders);
    app.use('/api/sizes', sizes);
    app.use('/api/types', types);
    app.use('/api/users', users);
    app.use('/api/auth', auth);
    app.use('/api/cancels', cancels);
    app.use(error);
}
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const express = require('express');
const router = express.Router();
const { Order, validate } = require('../models/order');
const { Customer } = require('../models/customer');
const { Coffee } = require('../models/coffee');
const { Size } = require('../models/size');
const { Type } = require('../models/type');
const Fawn = require('fawn');
const mongoose = require('mongoose');
Fawn.init(mongoose);


router.get('/', [auth, admin], async (req, res) => {
    const orders = await Order.find().sort('-dateOrdered');
    res.send(orders);
});

// Get by id
router.get('/:id', [auth, admin], async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).send('The order with the given ID was not found.');

    res.send(order);
});

// POST (CREATE)
router.post('/', [auth, admin], async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.message);

    const customer = await Customer.findById(req.body.customerId);
    if (!customer) return res.status(400).send('Invalid Customer.');

    const coffee = await Coffee.findById(req.body.coffeeId);
    if (!coffee) return res.status(400).send('Invalid Coffee.');

    const size = await Size.findById(req.body.sizeId);
    if (!size) return res.status(400).send('Invalid Size.');

    const type = await Type.findById(req.body.typeId);
    if (!type) return res.status(400).send('Invalid Type.');

    if (coffee.availability == 0) return res.status(400).send('Coffee is not available');

    let order = new Order({
        customer: {
            _id: customer._id,
            name: customer.name,
            isGold: customer.isGold,
            phone: customer.phone
        },
        coffee: {
            _id: coffee._id,
            name: coffee.name
        },
        size: {
            _id: size._id,
            name: size.name
        },
        type: {
            _id: type._id,
            name: type.name
        }
    });

    try {
        new Fawn.Task()
            .save('orders', order)
            .update('coffees', { _id: coffee._id }, {
                $inc: { availability: -1 }
            })
            .run();
        res.send(order);
    }
    catch (ex) {
        res.status(500).send('Something went wrong.');
    }
});

// DELETE
router.delete('/:id', auth, async (req, res) => {
    const order = await Order.findByIdAndRemove(req.params.id);

    if (!order) return res.status(404).send('The order with the given ID was not found.');

    const coffee = await Coffee.findById(req.body.coffeeId);
    coffee.availability++;
    coffee.save();

    res.send(order);
});

module.exports = router;
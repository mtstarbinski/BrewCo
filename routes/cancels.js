const { Order } = require('../models/order');
const { Coffee } = require('../models/coffee');
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const moment = require('moment');
const Joi = require('joi');
const validate = require('../middleware/validate');


router.post('/', [auth, validate(validateCancel)], async (req, res) => {
    const order = await Order.lookup(req.body.customerId, req.body.coffeeId, req.body.sizeId, req.body.typeId);

    if (!order) return res.status(404).send('Order not found.');

    if(order.dateCancelled) return res.status(400).send('Order already cancelled');

    order.return();
    await order.save();

    await Coffee.update({ _id: order.coffee._id }, {
        $inc: { availability: 1 }
    });

    return res.send(order);

});

function validateCancel(req) {
    const schema = Joi.object({
        customerId: Joi.objectId().required(),
        coffeeId: Joi.objectId().required(),
        sizeId: Joi.objectId().required(),
        typeId: Joi.objectId().required()
    });

    return schema.validate(req);
}

module.exports = router;
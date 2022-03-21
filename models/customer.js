const mongoose = require('mongoose');
const Joi = require('joi');

// Customer Mongoose Model
const Customer = mongoose.model('Customers', new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 20
    },
    isGold: {
        type: Boolean,
        default: false,
        required: true
    },
    email: {
        type: String,
        minlength: 5,
        required: true
    },
    phone: {
        type: String,
        required: true,
        minlength: 10,
        maxlength: 13
    }
}));

// Validate roast input
function validateCustomers(customer) {
    const schema = Joi.object({
        name: Joi.string().min(5).max(20).required(),
        isGold: Joi.boolean(),
        email: Joi.string().min(5).required().email(),
        phone: Joi.string().min(10).max(13).required()
    });

    return schema.validate(customer);
}

exports.Customer = Customer;
exports.validate = validateCustomers;
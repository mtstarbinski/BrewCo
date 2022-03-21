const mongoose = require('mongoose');
const Joi = require('joi');
const { roastSchema } = require('./roast');
const { flavorSchema } = require('./flavor');

// Coffee Mongoose Model
const Coffee = mongoose.model('Coffees', new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 30
    },
    roast: {
        type: roastSchema,
        required: true
    },
    flavor: {
        type: flavorSchema,
        required: true
    },
    caffeine: {
        type: Boolean,
        required: true,
        default: true
    },
    availability: {
        type: Number,
        min: 0,
        required: true
    }
}));

// Validate coffee input
function validateCoffee(coffee) {
    const schema = Joi.object({
        name: Joi.string().min(3).max(30).required(),
        roastId: Joi.objectId().required(),
        flavorId: Joi.objectId().required(),
        caffeine: Joi.boolean(),
        availability: Joi.number().required()
    });

    return schema.validate(coffee);
}

exports.Coffee = Coffee;
exports.validate = validateCoffee;
const mongoose = require('mongoose');
const Joi = require('joi');

// Flavor Mongoose Model
const flavorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 20
    }
});

const Flavor = mongoose.model('Flavor', flavorSchema);

// Validate flavor input
function validateFlavors(flavor) {
    const schema = Joi.object({
        name: Joi.string().min(3).max(20).required()
    });

    return schema.validate(flavor);
}

exports.Flavor = Flavor;
exports.validate = validateFlavors;
exports.flavorSchema = flavorSchema;
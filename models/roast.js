const mongoose = require('mongoose');
const Joi = require('joi');

// Roast Mongoose Model
const roastSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 20
    }
});

const Roast = mongoose.model('Roast', roastSchema);

// Validate roast input
function validateRoasts(roast) {
    const schema = Joi.object({
        name: Joi.string().min(3).max(20).required()
    });

    return schema.validate(roast);
}

exports.Roast = Roast;
exports.validate = validateRoasts;
exports.roastSchema = roastSchema;
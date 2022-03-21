const mongoose = require('mongoose');
const Joi = require('joi');

// Size Mongoose Model
const sizeSchema = new mongoose.Schema({
    name: {
        type: String,
        minlength: 3,
        maxlength: 10,
        required: true
    }
});

const Size = mongoose.model('Size', sizeSchema);

// Validate size input
function validateSizes(size) {
    const schema = Joi.object({
        name: Joi.string().min(3).max(10).required()
    });

    return schema.validate(size);
}

exports.Size = Size;
exports.validate = validateSizes;
exports.sizeSchema = sizeSchema;
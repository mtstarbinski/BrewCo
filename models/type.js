const mongoose = require('mongoose');
const Joi = require('joi');

// Type Mongoose Model
const typeSchema = new mongoose.Schema({
    name: {
        type: String,
        minlength: 3,
        maxlength: 10,
        required: true
    }
});

const Type = mongoose.model('Type', typeSchema);

// Validate type input
function validateTypes(type) {
    const schema = Joi.object({
        name: Joi.string().min(3).max(10).required()
    });

    return schema.validate(type);
}

exports.Type = Type;
exports.validate = validateTypes;
exports.typeSchema = typeSchema;
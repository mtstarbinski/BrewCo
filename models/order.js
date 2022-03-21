const mongoose = require('mongoose');
const Joi = require('joi');
const { sizeSchema } = require('./size');
const { typeSchema } = require('./type');


const orderSchema = new mongoose.Schema({
    customer: {
        type: new mongoose.Schema({
            name: {
                type: String,
                required: true,
                minlength: 5,
                maxlength: 20
            },
            isGold: {
                type: Boolean,
                default: false,
            },
            phone: {
                type: String,
                required: true,
                minlength: 10,
                maxlength: 13
            }
        }),
        required: true
    },
    coffee: {
        type: new mongoose.Schema({
            name: {
                type: String,
                required: true,
                minlength: 3,
                maxlength: 20
            },
            availability: {
                type: Number,
                min: 0,
                required: true
            }
        }),
        required: true
    },
    size: {
        type: sizeSchema,
        required: true
    },
    type: {
        type: typeSchema,
        required: true
    },
    dateOrdered: {
        type: Date,
        default: Date.now,
        required: true
    },
    dateCancelled: {
        type: Date
    },
    orderTotal: {
        type: Number,
        min: 0
    },
    refund: {
        type: Number
    }
});

orderSchema.statics.lookup = function (customerId, coffeeId, sizeId, typeId) {
    return this.findOne({
        'customer._id': customerId,
        'coffee._id': coffeeId,
        'type._id': typeId,
        'size._id': sizeId
    });
}

orderSchema.methods.return = function () {
    this.dateCancelled = new Date();
    this.refund = this.orderTotal;
}

const Order = mongoose.model('Orders', orderSchema);

// Validate order input
function validateOrder(order) {
    const schema = Joi.object({
        customerId: Joi.objectId().required(),
        coffeeId: Joi.objectId().required(),
        sizeId: Joi.objectId().required(),
        typeId: Joi.objectId().required()
    });

    return schema.validate(order);
}

exports.Order = Order;
exports.orderSchema = orderSchema;
exports.validate = validateOrder;
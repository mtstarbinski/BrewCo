const { Order } = require('../../models/order');
const mongoose = require('mongoose');
const request = require('supertest');
const { Coffee } = require('../../models/coffee');
const { User } = require('../../models/user');
const moment = require('moment');


describe('/api/cancels', () => {
    let server;
    let customerId;
    let coffeeId;
    let typeId;
    let sizeId;
    let order;
    let coffee;

    const exec = () => {
        return request(server)
            .post('/api/cancels')
            .set('x-auth-token', token)
            .send({ customerId, coffeeId, typeId, sizeId });
    };

    beforeEach(async () => {
        server = require('../../index');

        customerId = mongoose.Types.ObjectId();
        coffeeId = mongoose.Types.ObjectId();
        typeId = mongoose.Types.ObjectId();
        sizeId = mongoose.Types.ObjectId();
        token = new User({ isAdmin: true }).generateAuthToken();

        coffee = new Coffee({
            _id: coffeeId,
            name: "Mark's Coffee",
            flavor: { name: 'Hazelnut' },
            roast: { name: 'Light'},
            availability: 5
        });
        await coffee.save();

        order = new Order({
            customer: {
                _id: customerId,
                name: '12345',
                phone: '1234567891'
            },
            coffee: {
                _id: coffeeId,
                name: "Mark's Coffee",
                availability: 5
            },
            type: {
                _id: typeId,
                name: 'Ground'
            },
            size: {
                _id: sizeId,
                name: '1lb'
            },
            orderTotal: 28
        });
        await order.save();
    })
    afterEach(async () => {
        await server.close();
        await Order.remove({});
        await Coffee.remove({});

    });

    it('should return 401 if client is not logged in', async () => {
        token = '';

        const res = await exec();

        expect(res.status).toBe(401);
    });

    it('should return 400 if customer id is not provided', async () => {
        customerId = '';

        const res = await exec();

        expect(res.status).toBe(400);
    });

    it('should return 400 if coffee id is not provided', async () => {
        coffeeId = '';

        const res = await exec();

        expect(res.status).toBe(400);
    });

    it('should return 400 if type id is not provided', async () => {
        typeId = '';

        const res = await exec();

        expect(res.status).toBe(400);
    });

    it('should return 400 if size id is not provided', async () => {
        sizeId = '';

        const res = await exec();

        expect(res.status).toBe(400);
    });

    it('should return 404 if no rental is found for this customer/coffee combination', async () => {
        await Order.remove({});

        const res = await exec();

        expect(res.status).toBe(404);
    });

    it('should return 400 if order is already cancelled', async () => {
        order.dateCancelled = new Date();
        await order.save();

        const res = await exec();

        expect(res.status).toBe(400);
    });

    it('should return 200 for a valid request', async () => {
       const res = await exec();

       expect(res.status).toBe(200);
    });

    it('should set dateCancelled if input is valid', async () => {
        const res = await exec();

        const orderInDb = await Order.findById(order._id);
        const diff = new Date() - orderInDb.dateCancelled;
        expect(diff).toBeLessThan(10 * 1000);
    });

    it('should set refund amount if input is valid', async () => {
        const res = await exec();

        const orderInDb = await Order.findById(order._id);
        expect(orderInDb.refund).toBe(28);
    });

    it('should increase coffee stock when an order is cancelled', async () => {
        const res = await exec();

        const coffeeInDb = await Coffee.findById(coffeeId);
        expect(coffeeInDb.availability).toBe(coffee.availability + 1);
    });

    it('should return the order if it is valid', async () => {
        const res = await exec();

        const orderInDb = await Order.findById(order._id);

        expect(Object.keys(res.body)).toEqual(expect.arrayContaining([
            'dateOrdered',
            'dateCancelled',
            'refund',
            'customer',
            'coffee'
        ]));
    });
});
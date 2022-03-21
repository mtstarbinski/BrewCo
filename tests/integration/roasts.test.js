const request = require('supertest');
const { User } = require('../../models/user');
const {Roast} = require('../../models/roast');
const mongoose = require('mongoose');

let server;

describe('/api/roasts', () => {
    beforeEach(() => { server = require('../../index'); })
    afterEach(async () => {
        await server.close();
        await Roast.remove({});
    });

    describe('GET /', () => {
        it('should return all roasts', async () => {
            await Roast.collection.insertMany([
                { name: 'Light' },
                { name: 'Medium' },
                { name: 'Dark' },
                { name: 'Espresso' }
            ]);

            const res = await request(server).get('/api/roasts');
            expect(res.status).toBe(200);
            expect(res.body.length).toBe(4);
            expect(res.body.some(r => r.name == 'Light')).toBeTruthy();
            expect(res.body.some(r => r.name == 'Medium')).toBeTruthy();
            expect(res.body.some(r => r.name == 'Dark')).toBeTruthy();
            expect(res.body.some(r => r.name == 'Espresso')).toBeTruthy();
        });
    });

    describe('GET /:id', () => {
        it('should return a roast if valid id is passed', async () => {
            const roast = new Roast({ name: 'Light' });
            await roast.save();

            const res = await request(server).get('/api/roasts/' + roast._id);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('name', roast.name);

        });

        it('should return a 404 if invalid id is passed', async () => {
            const res = await request(server).get('/api/roasts/1');

            expect(res.status).toBe(404);
        });

        it('should return a 404 if no roast with the given id exists', async () => {
            const id = mongoose.Types.ObjectId();
            const res = await request(server).get('/api/roasts/' + id);

            expect(res.status).toBe(404);
        });

    });

    describe('POST /', () => {

        let token;
        let name;

        const exec = async () => {
            return await request(server)
                .post('/api/roasts')
                .set('x-auth-token', token)
                .send({ name });
        }

        beforeEach(() => {
            token = new User().generateAuthToken();
            name = 'roast1'
        });

        it('should return 401 if client is not logged in', async () => {
            token = '';

            const res = await exec();

            expect(res.status).toBe(401);
        });

        it('should return 400 if roast is less than 3 characters', async () => {
            name = 'Li'

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return 400 if roast is more than 20 characters', async () => {
            name = new Array(22).join('a');

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('sould return 400 if the roast is already registered', async () => {
            roast = new Roast({ name: 'roast1' });
            await roast.save();

            const res = await exec();

            expect(res.status).toBe(400);
        })

        it('should save the roast if it is valid', async () => {
            await exec();

            const roast = await Roast.find({ name: 'Medium-Dark' });

            expect(roast).not.toBeNull();
        });

        it('should return the roast if it is valid', async () => {
            const res = await exec();

            expect(res.body).toHaveProperty('_id');
            expect(res.body).toHaveProperty('name', 'roast1');
        });
    });

    describe('PUT /:id', () => {
        let token;
        let newName;
        let roast;
        let id;

        const exec = async () => {
            return await request(server)
            .put('/api/roasts/' + id)
            .set('x-auth-token', token)
            .send({ name: newName });
        }

        beforeEach(async () => {
            roast = new Roast({ name: 'Light' });
            await roast.save();

            token = new User({ isAdmin: true }).generateAuthToken();
            id = roast._id;
            newName = 'updatedRoast';
        })

        it('should return 401 if client is not logged in', async () => {
            token = '';

            const res = await exec();

            expect(res.status).toBe(401);
        });

        it('should return 400 if roast is less than 3 characters', async () => {
            newName = 'Li'

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return 400 if roast is more than 20 characters', async () => {
            newName = new Array(22).join('a');

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return 404 if id is invalid', async () => {
            id = 1;

            const res = await exec();

            expect(res.status).toBe(404);
        });

        it('should return 404 if roast with the given id was not found', async () => {
            id = mongoose.Types.ObjectId();

            const res = await exec();

            expect(res.status).toBe(404);
        });

        it('should update the roast if input is valid', async () => {
            await exec();

            const updatedRoast = await Roast.findById(roast._id);

            expect(updatedRoast.name).toBe(newName);
        });

        it('should return the updated roast if it is valid', async () => {
            const res = await exec();

            expect(res.body).toHaveProperty('_id');
            expect(res.body).toHaveProperty('name', newName);
        });
    });

    describe('DELETE /:id', () => {
        let token;
        let roast;
        let id;

        const exec = async () => {
            return await request(server)
                .delete('/api/roasts/' + id)
                .set('x-auth-token', token)
                .send();
        }

        beforeEach(async () => {
            // Before each test we need to create a roast and 
            // put it in the database.      
            roast = new Roast({ name: 'roast1' });
            await roast.save();

            id = roast._id;
            token = new User({ isAdmin: true }).generateAuthToken();
        })

        it('should return 401 if client is not logged in', async () => {
            token = '';

            const res = await exec();

            expect(res.status).toBe(401);
        });

        it('should return 403 if the user is not an admin', async () => {
            token = new User({ isAdmin: false }).generateAuthToken();

            const res = await exec();

            expect(res.status).toBe(403);
        });

        it('should return 404 if id is invalid', async () => {
            id = 1;

            const res = await exec();

            expect(res.status).toBe(404);
        });

        it('should return 404 if no roast with the given id was found', async () => {
            id = mongoose.Types.ObjectId();

            const res = await exec();

            expect(res.status).toBe(404);
        });

        it('should delete the roast if input is valid', async () => {
            await exec();

            const roastInDb = await Roast.findById(id);

            expect(roastInDb).toBeNull();
        });

        it('should return the removed roast', async () => {
            const res = await exec();

            expect(res.body).toHaveProperty('_id', roast._id.toHexString());
            expect(res.body).toHaveProperty('name', roast.name);
        });
    });
});
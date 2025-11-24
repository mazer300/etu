const request = require('supertest');
const express = require('express');
const apiRoutes = require('../routes/api');

const app = express();
app.use(express.json());
app.use('/api', apiRoutes);

describe('API Tests', () => {
    test('GET /api/users should return users', async () => {
        const response = await request(app).get('/api/users');
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });

    test('POST /api/auth/register should create user', async () => {
        const userData = {
            name: 'Test User',
            email: 'test@example.com',
            password: 'password123',
            birthDate: '1990-01-01'
        };

        const response = await request(app)
            .post('/api/auth/register')
            .send(userData);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('id');
        expect(response.body.email).toBe(userData.email);
    });

    test('POST /api/posts should create post', async () => {
        const postData = {
            content: 'Test post content'
        };

        const response = await request(app)
            .post('/api/posts')
            .send(postData);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('id');
        expect(response.body.content).toBe(postData.content);
    });
});
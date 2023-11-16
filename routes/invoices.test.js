process.env.NODE_ENV = 'test';

const request = require('supertest');

const app = require('../app');
const db = require('../db');

let testComp;
let testInv;
beforeEach(async ()=>{
    let compResult = await db.query(`
    INSERT INTO
    companies (code, name, description) VALUES ('test','Test Company','This is a test company')
    RETURNING code, name, description`);
    testComp = compResult.rows[0];

    let invResult = await db.query(`
    INSERT INTO
    invoices (comp_code, amt) VALUES ('test', 100)
    RETURNING *;`);
    testInv = invResult.rows[0];
    testInv.add_date = testInv.add_date.toISOString();
});

afterEach(async ()=>{
    await db.query('DELETE FROM companies');
    await db.query('DELETE FROM invoices');
});

afterAll(async ()=>{
    await db.end();
});

describe('GET tests', ()=>{
    test('Test GET / ', async ()=>{
        let res = await request(app).get('/invoices');
        expect(res.statusCode).toEqual(200);
        expect(res.body).not.toBeNull();
        expect(res.body).toEqual({invoices : [testInv]});
    });
    test('Test Get /[id]',async ()=>{
        let res = await request(app).get(`/invoices/${testInv.id}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).not.toBeNull();
        expect(res.body).toEqual({invoice : testInv});
    });
    test('Test invalid GET /[code]', async ()=>{
        let res = await request(app).get('/invoices/99999999');
        expect(res.statusCode).toEqual(404);
        expect(res.body.message).toEqual('Invoice Not Found: 99999999');
    });
});

describe('POST tests', ()=>{
    test('Test valid POST', async ()=>{
        const testInvTwo = {
            comp_code : 'test',
            amt : 200
        };
        let res = await request(app).post('/invoices').send(testInvTwo);
        expect(res.statusCode).toEqual(201);
        expect(res.body).not.toBeNull();
        expect(res.body.invoice.comp_code).toEqual('test');
        expect(res.body.invoice.amt).toEqual(200);
    });
    test('Test invalid POST no code', async ()=>{
        let res = await request(app).post('/invoices').send({
            comp_code : undefined,
            amt : 200
        });
        expect(res.statusCode).toEqual(500);
        expect(res.body.message).toEqual('Missing Property');
    });
    test('Test invalid POST no amt', async ()=>{
        let res = await request(app).post('/invoices').send({
            comp_code : 'test',
            amt : undefined
        });
        expect(res.statusCode).toEqual(500);
        expect(res.body.message).toEqual('Missing Property');
    });
});

describe('PUT Tests', ()=>{
    test('Test valid PUT', async ()=>{
        let res = await request(app).put(`/invoices/${testInv.id}`).send({amt : 300});
        expect(res.statusCode).toEqual(200);
        expect(res.body).not.toBeNull();
        expect(res.body.invoice.amt).toEqual(300);
    });
    test('Test invalid PUT missing id', async ()=>{
        let res = await request(app).put('/invoices/999999').send({amt : 300});
        expect(res.statusCode).toEqual(404);
        expect(res.body.message).toEqual('Invoice Not Found: 999999');
    });
    test('Test invalid PUT no amt', async ()=>{
        let res = await request(app).put(`/invoices/${testInv.id}`).send({amt : undefined});
        expect(res.statusCode).toEqual(500);
        expect(res.body.message).toEqual('Missing Property');
    });

});

describe('DELETE Tests', ()=>{
    test('Test valid DELETE', async ()=>{
        let res = await request(app).delete(`/invoices/${testInv.id}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).not.toBeNull();
        expect(res.body).toEqual({status : 'deleted'});
    });
    test('Test invalid DELETE', async ()=>{
        let res = await request(app).delete('/invoices/999999');
        expect(res.statusCode).toEqual(404);
        expect(res.body.message).toEqual('Invoice Not Found: 999999');
    });
});
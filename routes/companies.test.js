process.env.NODE_ENV = 'test';

const request = require('supertest');

const app = require('../app');
const db = require('../db');

let testComp;
let testInv;
beforeEach(async ()=>{
    let compResult = await db.query(`
    INSERT INTO
    companies (code, name, description) VALUES ('test-company','Test Company','This is a test company')
    RETURNING code, name, description`);
    testComp = compResult.rows[0];

    let invResult = await db.query(`
    INSERT INTO
    invoices (comp_code, amt) VALUES ('test-company', 100)
    RETURNING *;`);
    testInv = invResult.rows[0];

    let indResult = await db.query(`
    INSERT INTO
    industries (code, field) VALUES ('test-ind','Test Industry')
    RETURNING *;`);
    testInd = indResult.rows[0];

    let indCompResult = await db.query(`
    INSERT INTO
    ind_comp (ind_code, comp_code) VALUES ('test-ind', 'test-company')
    RETURNING *;`);
    testIndComp = indCompResult.rows[0];
});

afterEach(async ()=>{
    await db.query('DELETE FROM companies');
    await db.query('DELETE FROM invoices');
    await db.query('DELETE FROM industries');
});

afterAll(async ()=>{
    await db.end();
});

describe('GET tests', ()=>{
    test('Test GET / ', async ()=>{
        let res = await request(app).get('/companies');
        expect(res.statusCode).toEqual(200);
        expect(res.body).not.toBeNull();
        expect(res.body).toEqual({companies : [testComp]});
    });
    test('Test Get /[code]',async ()=>{
        let res = await request(app).get('/companies/test-company');
        expect(res.statusCode).toEqual(200);
        expect(res.body).not.toBeNull();
        expect(res.body).toEqual({
            company : {
                code : 'test-company',
                name : 'Test Company',
                description : 'This is a test company',
                invoices : [testInv.id],
                industries : [testInd.field]
            }
        });
    });
    test('Test invalid GET /[code]', async ()=>{
        let res = await request(app).get('/companies/asdf');
        expect(res.statusCode).toEqual(404);
        expect(res.body.message).toEqual('Company Not Found: asdf');
    });
});

describe('POST tests', ()=>{
    test('Test valid POST', async ()=>{
        const testCompTwo = {
            code : 'test-company-2',
            name : 'Test Company *+~.()"!:@ 2',
            description : 'This is another test company'
        };
        let res = await request(app).post('/companies').send({
            name : 'Test Company *+~.()"!:@ 2',
            description : 'This is another test company'
        });
        expect(res.statusCode).toEqual(201);
        expect(res.body).not.toBeNull();
        expect(res.body).toEqual({
            company : testCompTwo
        });
    });
    test('Test invalid POST no name', async ()=>{
        let res = await request(app).post('/companies').send({
            name : undefined,
            description : 'asdfasdfasdfasdf'
        });
        expect(res.statusCode).toEqual(500);
        expect(res.body.message).toEqual('Missing Property');
    });
    test('Test invalid POST no desc', async ()=>{
        let res = await request(app).post('/companies').send({
            name : 'ASDF',
            description : undefined
        });
        expect(res.statusCode).toEqual(500);
        expect(res.body.message).toEqual('Missing Property');
    });
});

describe('PUT Tests', ()=>{
    test('Test valid PUT', async ()=>{
        const updatedComp = {
            code : 'test-company',
            name : 'New Test Company',
            description : 'This is an updated test company'
        };
        let res = await request(app).put('/companies/test-company').send({
            name : 'New Test Company',
            description : 'This is an updated test company'
        });
        expect(res.statusCode).toEqual(200);
        expect(res.body).not.toBeNull();
        expect(res.body).toEqual({company : updatedComp});
    });
    test('Test invalid PUT missing code', async ()=>{
        const updatedComp = {
            name : 'New Test Company',
            description : 'This is an updated test company'
        };
        let res = await request(app).put('/companies/asdf').send(updatedComp);
        expect(res.statusCode).toEqual(404);
        expect(res.body.message).toEqual('Company Not Found: asdf');
    });
    test('Test invalid PUT no name', async ()=>{
        let res = await request(app).put('/companies/test-company').send({
            name : undefined,
            description : 'asdfasdfasdfasdf'
        });
        expect(res.statusCode).toEqual(500);
        expect(res.body.message).toEqual('Missing Property');
    });
    test('Test invalid PUT no desc', async ()=>{
        let res = await request(app).put('/companies/test-company').send({
            name : 'Test Company Updated',
            description : undefined
        });
        expect(res.statusCode).toEqual(500);
        expect(res.body.message).toEqual('Missing Property');
    });
});

describe('DELETE Tests', ()=>{
    test('Test valid DELETE', async ()=>{
        let res = await request(app).delete('/companies/test-company');
        expect(res.statusCode).toEqual(200);
        expect(res.body).not.toBeNull();
        expect(res.body).toEqual({status : 'deleted'});
    });
    test('Test invalid DELETE', async ()=>{
        let res = await request(app).delete('/companies/asdf');
        expect(res.statusCode).toEqual(404);
        expect(res.body.message).toEqual('Company Not Found: asdf');
    });
});
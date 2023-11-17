// process.env.NODE_ENV = 'test';

// const request = require('supertest');

// const app = require('../app');
// const db = require('../db');

// let testComp;
// let testInv;
// beforeEach(async ()=>{
//     let compResult = await db.query(`
//     INSERT INTO
//     companies (code, name, description) VALUES ('test-company','Test Company','This is a test company')
//     RETURNING code, name, description`);
//     testComp = compResult.rows[0];

//     let invResult = await db.query(`
//     INSERT INTO
//     invoices (comp_code, amt) VALUES ('test-company', 100)
//     RETURNING *;`);
//     testInv = invResult.rows[0];

//     let indResult = await db.query(`
//     INSERT INTO
//     industries (code, field) VALUES ('test-ind','Test Industry')
//     RETURNING *;`);
//     testInd = indResult.rows[0];

//     let indResultTwo = await db.query(`
//     INSERT INTO
//     industries (code, field) VALUES ('test-ind-2','Test Industry 2')
//     RETURNING *;`);
//     testIndTwo = indResultTwo.rows[0];

//     let indCompResult = await db.query(`
//     INSERT INTO
//     ind_comp (ind_code, comp_code) VALUES ('test-ind', 'test-company')
//     RETURNING *;`);
//     testIndComp = indCompResult.rows[0];
// });

// afterEach(async ()=>{
//     await db.query('DELETE FROM companies');
//     await db.query('DELETE FROM invoices');
//     await db.query('DELETE FROM industries');
// });

// afterAll(async ()=>{
//     await db.end();
// });

// describe('GET Tests', ()=>{
//     test('GET All Test', async ()=>{
//         let res = await request(app).get('/industries');
//         expect(res.body).not.toBeNull();
//         expect(res.statusCode).toEqual(200);
//         expect(res.body.industries[0].code).toEqual(testInd.code);
//         expect(res.body.industries[0].companies[0]).toEqual('test-company')
//         expect(res.body.industries[1].code).toEqual(testIndTwo.code);
//     });
//     test('GET /[code] test', async () =>{
//         let res = await request(app).get(`/industries/${testInd.code}`);
//         expect(res.body).not.toBeNull();
//         expect(res.statusCode).toEqual(200);
//         expect(res.body.industry.code).toEqual(testInd.code);
//         expect(res.body.industry.companies[0]).toEqual('test-company');
//     });
//     test('GET invalid /[code] test', async ()=>{
//         let res = await request(app).get('/industries/asdf');
//         expect(res.statusCode).toEqual(404);
//         expect(res.body.message).toEqual('Industry Not Found: asdf');
//     });
// });

// describe('POST Tests', ()=>{
//     test('POST test', async ()=>{
//         let res = request(app).post('/industries').send({
//             code : 'test-three',
//             field : 'Test Industry 3'
//         });
//         console.log(res.body);
//         expect(res.body).not.toBeNull();
//         expect(res.statusCode).toEqual(201);
//         expect(res.body.industry.code).toEqual('test-three');
//         expect(res.body.industry.field).toEqual('Test Industry 3');
//     })
// });
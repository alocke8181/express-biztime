const express = require('express');
const slugify = require('slugify');
const router = new express.Router();
let db = require('../db');
let ExpErr = require('../expressError');
const { route } = require('../app');

router.get('/', async (req,res,next) =>{
    try{
        let results = await db.query('SELECT code, name, description FROM companies ORDER BY name');
        return res.json({'companies' : results.rows});
    }catch(e){
        return next(e);
    };
});

router.get('/:code', async (req,res,next) => {
    try{
        let code = req.params.code;
        let compResults = await db.query(`
        SELECT code, name, description
        FROM companies
        WHERE code = $1`,
        [code]);
        let invResults = await db.query(`
        SELECT id FROM invoices
        WHERE comp_code = $1`,
        [code]);
        let indResults = await db.query(`
        SELECT ind.field
        FROM industries AS ind
        JOIN ind_comp AS ic
        ON ind.code = ic.ind_code
        WHERE ic.comp_code = $1
        `,[code]);
        if(compResults.rows[0] == undefined){
            throw new ExpErr(`Company Not Found: ${code}`, 404);
        }else{
            let company = compResults.rows[0];
            let invoices = invResults.rows;
            let industries = indResults.rows;
            company.invoices = invoices.map(inv => inv.id);
            company.industries = industries.map(ind => ind.field);
            return res.json({'company': company});
        };
    }catch(e){
        return next(e);
    };
});

router.post('/', async (req,res,next) =>{
    try{
        let name = req.body.name;
        let description = req.body.description;
        if(name == undefined || description == undefined){
            throw new ExpErr('Missing Property', 500);
        }else{
            let code = slugify(name,{replacement : '-', lower : true, remove : /[*+~.()'"!:@]/g});
            let results = await db.query(`
            INSERT INTO companies
            (code, name, description)
            VALUES ($1, $2, $3)
            RETURNING code, name, description`,
            [code, name, description]);
            res.status(201);
            return res.json({'company' : results.rows[0]});
        };
    }catch(e){
        return next(e);
    };
});

router.put('/:code', async (req,res,next) => {
    try{
        let code = req.params.code;
        let name = req.body.name;
        let description = req.body.description;
        if(name == undefined || description == undefined){
            throw new ExpErr('Missing Property', 500);
        }else{
            let results = await db.query(`
            UPDATE companies
            SET name = $1, description = $2
            WHERE code = $3
            RETURNING code, name, description`,
            [name, description, code]);
            if(results.rows[0] == undefined){
                throw new ExpErr(`Company Not Found: ${code}`, 404);
            }else{
                return res.json({'company' : results.rows[0]});
            };
        };
    }catch(e){
        return next(e);
    };

});

router.delete('/:code', async (req,res,next) =>{
    try{
        let code = req.params.code;
        let results = await db.query(`
        DELETE FROM companies
        WHERE code = $1
        RETURNING code`,
        [code]);
        if(results.rows[0] == undefined){
            throw new ExpErr(`Company Not Found: ${code}`, 404);
        }else{
            return res.json({'status' : 'deleted'});
        };
    }catch(e){
        return next(e);
    };
});
module.exports = router;
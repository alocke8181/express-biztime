const express = require('express');
const router = new express.Router();
let db = require('../db');
let ExpErr = require('../expressError');
const { route } = require('../app');

router.get('/', async (req,res,next) =>{
    try{
        let results = await db.query('SELECT code, name, description FROM companies ORDER BY name');
        return res.json({companies : results.rows});
    }catch(e){
        return next(e);
    };
});

router.get('/:code', async (req,res,next) => {
    try{
        let code = req.params.code;
        let results = await db.query(`
        SELECT code, name, description
        FROM companies
        WHERE code = $1`,
        [code]);
        if(results.rows[0] == undefined){
            throw new ExpErr(`Company Not Found: ${code}`, 404);
        }else{
            return res.json({company: results.rows[0]});
        };
    }catch(e){
        return next(e);
    };
});

router.post('/', async (req,res,next) =>{
    try{
        let code = req.body.code;
        let name = req.body.name;
        let description = req.body.description;
        if(code == undefined || name == undefined || description == undefined){
            throw new ExpErr('Missing Property', 500);
        }else{
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
            RETURNING code, name, description`
            [name, description, code],);
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
            return res.json({status : 'deleted'});
        };
    }catch(e){
        return next(e);
    };
});
module.exports = router;
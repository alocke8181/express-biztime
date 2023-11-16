const express = require('express');
const router = new express.Router();
let db = require('../db');
let ExpErr = require('../expressError');
const { route } = require('../app');

router.get('/', async (req,res,next) =>{
    try{
        let results = await db.query('SELECT * FROM invoices');
        return res.json({'invoices' : results.rows});
    }catch(e){
        return next(e);
    };
});

router.get('/:id', async (req,res,next) => {
    try{
        let id = req.params.id;
        let results = await db.query(`
        SELECT * FROM invoices
        WHERE id = $1`,
        [id]);
        if(results.rows[0] == undefined){
            throw new ExpErr(`Invoice Not Found: ${id}`, 404);
        }else{
            return res.json({'invoice': results.rows[0]});
        };
    }catch(e){
        return next(e);
    };
});

router.post('/', async (req,res,next) =>{
    try{
        let comp_code = req.body.comp_code;
        let amt = req.body.amt;
        if(comp_code == undefined || amt == undefined){
            throw new ExpErr('Missing Property', 500);
        }else{
            let results = await db.query(`
            INSERT INTO invoices
            (comp_code, amt)
            VALUES ($1, $2)
            RETURNING *`,
            [comp_code, amt]);
            res.status(201);
            return res.json({'invoice' : results.rows[0]});
        };
    }catch(e){
        return next(e);
    };
});

router.put('/:id', async (req,res,next) => {
    try{
        let id = req.params.id;
        let amt = req.body.amt;
        if(amt == undefined){
            throw new ExpErr('Missing Property', 500);
        }else{
            let results = await db.query(`
            UPDATE invoices
            SET amt = $1
            WHERE id = $2
            RETURNING *`,
            [amt, id]);
            if(results.rows[0] == undefined){
                throw new ExpErr(`Invoice Not Found: ${id}`, 404);
            }else{
                return res.json({'invoice' : results.rows[0]});
            };
        };
    }catch(e){
        return next(e);
    };

});

router.delete('/:id', async (req,res,next) =>{
    try{
        let id = req.params.id;
        let results = await db.query(`
        DELETE FROM invoices
        WHERE id = $1
        RETURNING id`,
        [id]);
        if(results.rows[0] == undefined){
            throw new ExpErr(`Invoice Not Found: ${id}`, 404);
        }else{
            return res.json({status : 'deleted'});
        };
    }catch(e){
        return next(e);
    };
});
module.exports = router;
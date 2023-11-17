const express = require('express');
const router = new express.Router();
let db = require('../db');
let ExpErr = require('../expressError');
const { route } = require('../app');

router.get('/', async (req,res,next)=>{
    try{
        let indRes = await db.query('SELECT * FROM industries');
        let industries = indRes.rows;
        for (let industry of industries) {
            let compRes = await db.query(`
            SELECT comp_code FROM ind_comp
            WHERE ind_code = $1`,[industry.code]);
            let companies = compRes.rows;
            industry.companies = companies.map(comp => comp.comp_code);
        };
        return res.json({industries : industries});
    }catch(e){
        return next(e);
    };
});

router.get('/:code', async (req,res,next) =>{
    try{
        let code = req.params.code;
        let indRes = await db.query(`
        SELECT * FROM industries
        WHERE code = $1`,[code]);
        if(indRes.rows[0] == undefined){
            throw new ExpErr(`Industry Not Found: ${code}`, 404);
        };
        let industry = indRes.rows[0];
        let compRes = await db.query(`
        SELECT comp_code FROM ind_comp
        WHERE ind_code = $1`,[industry.code]);
        let companies = compRes.rows;
        industry.companies = companies.map(comp => comp.comp_code);
        return res.json({industry : industry});
    }catch(e){
        return next(e);
    };
});

router.post('/', async (req,res,next)=>{
    try{
        let code = req.body.code;
        let field = req.body.field;
        if(code == undefined || field == undefined){
            throw new ExpErr('Missing Property',500);
        }else{
            let results = await db.query(`
            INSERT INTO industries
            (code, field)
            VALUES ($1, $2)
            RETURNING *`,
            [code, field]);
            console.log(results);
            res.status(201);
            return res.json({industry : results.rows[0]})
        };
    }catch(e){
        return next(e);
    };
});

router.put('/', async (req,res,next) =>{
    try{
        let ind_code = req.body.ind_code;
        let comp_code = req.body.comp_code;
        if(ind_code == undefined || comp_code == undefined){
            throw new ExpErr('Missing Property',500);
        }else{
            let results = await db.query(`
            INSERT INTO ind_comp
            (ind_code, comp_code)
            VALUES ($1, $2)
            RETURNING ind_code, comp_code`,
            [ind_code, comp_code]);
            return res.json(results.rows[0])
        }
    }catch(e){
        return next(e);
    };
});

router.delete('/:code', async (req,res,next)=>{
    try{
        let code = req.params.code;
        let results = await db.query(`
        DELETE FROM industries
        WHERE code = $1
        RETURNING code`,
        [code]);
        if(results.rows[0] == undefined){
            throw new ExpErr(`Industry Not Found: ${code}`, 404);
        }else{
            return res.json({status : 'deleted'});
        };
    }catch(e){
        return next(e);
    };
});

module.exports = router;
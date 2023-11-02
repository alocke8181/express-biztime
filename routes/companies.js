const express = require('express');
const router = new express.Router();
let db = require('../db');
let ExpErr = require('../expressError');

router.get('/', async (req,res,next) =>{
    try{
        let results = await db.query('SELECT code, name, description FROM companies ORDER BY name');
        return res.json({companies : results.rows});
    }catch(e){
        return next(new ExpErr(e.message, 500));
    };
});

module.exports = router;
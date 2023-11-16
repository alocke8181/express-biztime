const express = require('express');
const router = new express.Router();
let db = require('../db');
let ExpErr = require('../expressError');
const { route } = require('../app');

router.get('/', async (req,res,next)=>{
    let indRes = await db.query('SELECT * FROM industries');
    let industries = indRes.rows;
    industries.forEach(async (industry) => {
        let compRes = await db.query(`
        SELECT comp_code FROM ind_comp
        WHERE ind_code = $1`,[industry.code]);
        let companies = compRes.rows;
        industry.companies = companies.map(comp => comp.comp_code);
    });
    console.log(industries);
    return res.json({industries : industries});
});



module.exports = router;
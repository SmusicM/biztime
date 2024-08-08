const express = require("express");
const router = new express.Router();
const db = require("../db");
const ExpressError = require("../expressError");
const slugify = require("slugify");

router.get("/", async function (req, res, next) {
  try {
    const results = await db.query(`SELECT code,name,description FROM companies`);

    return res.json({ companies: results.rows });
    //return res.json([ results.rows ]);
  } catch (e) {
    return next(e);
  }
});

router.get("/:code", async function (req, res, next) {
  try {


    const compResult = await db.query(`SELECT code,name,description FROM companies
      WHERE code = $1`,[req.params.code])
    //const results = await db.query(`SELECT * FROM companies WHERE code = $1`,[req.params.code]);
    const results = await db.query(
      `SELECT companies.code,companies.name,companies.description ,
      invoices.id,invoices.amt,invoices.paid,invoices.add_date,invoices.paid_date,companyind.comp_ind,companyind.comp_code
      FROM companies
      LEFT JOIN companyind ON companies.code =  companyind.comp_code
      LEFT JOIN invoices ON companies.code = $1`,


      [req.params.code]
    );
    //companyind.comp_code,companyind.ind_name
    //LEFT JOIN companyind ON company.code =  companyind.comp_code
    
    if (compResult.rows.length === 0) {
      console.log(results.rows.length )
      let invalidError = new Error(
        `There is no company with that code : ${req.params.code}`
      );
      invalidError.status = 404;
      throw invalidError;
    }
    console.log(results.rows);
    //mapping for handling multiple invoices for same company
    const invoices = results.rows
      .filter((row) => row.id)
      .map((row) => ({
        id: row.id,
        amt: row.amt,
        paid: row.paid,
        add_date: row.add_date,
        paid_date: row.paid_date,
      }));
    console.log(invoices);
    const company_name_invoices = `${req.params.code}_invoices`;
    
    //maybe add if company has an invoice or industry use this structure otherwise make it simple
    return res.json({
      company: {
        code: results.rows[0].code,
        name: results.rows[0].name,
        description: results.rows[0].description,
        industry: results.rows[0].comp_ind,
      },
      [company_name_invoices]: {
        invoices: invoices,
      },
    });
  } catch (e) {
    return next(e);
  }
});

router.post("/", async function (req, res, next) {
  try {
    //slugify code and put to lowercase
    const code = slugify(req.body.name, {
      lower: false,
      strict: false,
    });
    const results = await db.query(
      `
        INSERT INTO companies(code,name,description)
        VALUES($1,$2,$3)
        RETURNING *`,
      [code, req.body.name, req.body.description]
    );

    //201 for creation
    return res.status(201).json({ companies: results.rows[0] });
  } catch (e) {
    return next(e);
  }
});

router.put("/:code", async function (req, res, next) {
  try {
    const compResult = await db.query(`SELECT code,name,description FROM companies
      WHERE code = $1`,[req.params.code])
    //so pk cant be changed
    if ("code" in req.body) {
      throw new ExpressError("Not allowed", 400);
    }
    const results = await db.query(
      `
        UPDATE companies
        SET name = $1, description = $2
        WHERE code = $3
        RETURNING *`,
      [req.body.name, req.body.description, req.params.code]
    );
   
    if(compResult.rows.length===0){
      let invalidError = new Error(
        `There is no company with that code you cannot update it : ${req.params.code}`
      );
      invalidError.status = 404;
      throw invalidError;
    }
    return res.json({ companies: results.rows[0] });
  } catch (e) {
    return next(e);
  }
});

router.delete("/:code", async function (req, res, next) {
  try {
    //so pk cant be changed
    //if ("code" in req.body) {
    //  throw new ExpressError("Not allowed", 400);
    //}
    const results = await db.query(
      `
      DELETE FROM companies WHERE code = $1 RETURNING *
      `,
      [req.params.code]
    );

    if (results.rows.length === 0) {
      throw new ExpressError(
        `There is no company with code of '${req.params.code}`,
        404
      );
    }

    return res.json({ MESSAGE: `Company Deleted: ${req.params.code}` });
  } catch (e) {
    return next(e);
  }
});

router.get("/ind", async function (req, res, next) {
  try {
    const results = await db.query(`SELECT * FROM companyind`);
  } catch {}
});
module.exports = router;

const express = require("express");
const router = new express.Router();
const db = require("../db");
const ExpressError = require("../expressError");

router.get("/", async function (req, res, next) {
  try {
    const results = await db.query(`SELECT code,name FROM companies`);

    return res.json({ companies: results.rows });
  } catch (e) {
    return next(e);
  }
});

router.get("/:code", async function (req, res, next) {
  try {
    //const results = await db.query(`SELECT * FROM companies WHERE code = $1`,[req.params.code]);
    const results = await db.query(
      `SELECT companies.code,companies.name,companies.description ,
      invoices.id,invoices.amt,invoices.paid,invoices.add_date,invoices.paid_date
      FROM companies
      LEFT JOIN invoices ON companies.code = $1`,
      [req.params.code]
    );

    if (results.rows.length === 0) {
      let invalidError = new Error(
        `There is no company with that code : ${req.params.code}`
      );
      invalidError.status = 404;
      throw invalidError;
    }
    console.log(results.rows)
   //mapping for handling multiple invoices for same company
   const invoices = results.rows.filter(row=> row.id).map(row=>({
     id: row.id,
     amt: row.amt,
     paid: row.paid,
     add_date: row.add_date,
     paid_date: row.paid_date,
   }));

  const company_name_invoices = `${req.params.code}_invoices`

    return res.json({
      company: {
        code: results.rows[0].code,
        name: results.rows[0].name,
        description: results.rows[0].description,
      },
      [company_name_invoices]: {
        invoices : invoices
        //id: results.rows.id,
        //amt: results.rows.amt,
        //paid: results.rows.paid,
        //add_date: results.rows.add_date,
        //paid_date: results.rows.paid_date,
      },
    });
  } catch (e) {
    return next(e);
  }
});

router.post("/", async function (req, res, next) {
  try {
    const results = await db.query(
      `
        INSERT INTO companies(code,name,description)
        VALUES($1,$2,$3)
        RETURNING *`,
      [req.body.code, req.body.name, req.body.description]
    );

    //201 for creation
    return res.status(201).json({ companies: results.rows[0] });
  } catch (e) {
    return next(e);
  }
});

router.put("/:code", async function (req, res, next) {
  try {
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

    //201 for creation
    return res.json({ companies: results.rows[0] });
  } catch (e) {
    return next(e);
  }
});

router.delete("/:code", async function (req, res, next) {
  try {
    //so pk cant be changed
    if ("code" in req.body) {
      throw new ExpressError("Not allowed", 400);
    }
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

module.exports = router;

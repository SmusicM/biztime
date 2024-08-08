const express = require("express");
const router = new express.Router();
const db = require("../db");
const ExpressError = require("../expressError");

router.get("/", async function (req, res, next) {
  try {
    const results = await db.query(`SELECT * FROM invoices`);

    return res.json({ invoices: results.rows });
  } catch (e) {
    return next(e);
  }
});

router.get("/:id", async function (req, res, next) {
  try {
    const results = await db.query(`SELECT * FROM invoices WHERE id = $1`, [
      req.params.id,
    ]);
    if (results.rows.length === 0) {
      let invalidError = new Error(
        `There is no invoice with that id : ${req.params.id}`
      );
      invalidError.status = 404;
      throw invalidError;
    }
    return res.json({ invoices: results.rows });
  } catch (e) {
    return next(e);
  }
});

router.post("/", async function (req, res, next) {
  try {
    //might change maybe better way for defaults than hard coding
    const results = await db.query(
      `
        INSERT INTO invoices(comp_code,amt,paid,add_date,paid_date)
        VALUES ($1,$2,false,CURRENT_DATE,NULL)
        RETURNING *
        `,
      [req.body.comp_code, req.body.amt]
    );

    return res.status(201).json({ invoices: results.rows[0] });
  } catch (e) {
    return next(e);
  }
});

router.put("/:id", async function (req, res, next) {
  try {
    const invoiceResult = await db.query(
      `SELECT id FROM invoices
        WHERE id = $1`,
      [req.params.id]
    );
    //so pk cant be changed
    if ("id" in req.body) {
      throw new ExpressError("Not allowed", 400);
    }

    const paid = req.body.paid;
    const paid_date = req.body.paid_date;
    //new let inst so we can still have const paid_date
    let paiddate = paid_date;
    if (paid === true) {
      paiddate = new Date();
    }
    const results = await db.query(
      `
          UPDATE invoices
          SET amt = $1,paid=$2,paid_date=$3
          WHERE id = $4
          RETURNING *`,
      [req.body.amt, req.body.paid, paiddate, req.params.id]
    );

    if (invoiceResult.rows.length === 0) {
      let invalidError = new Error(
        `There is no company with that code you cannot update it : ${req.params.id}`
      );
      invalidError.status = 404;
      throw invalidError;
    }
    //201 for creation
    return res.json({ invoices: results.rows[0] });
  } catch (e) {
    return next(e);
  }
});

router.delete("/:id", async function (req, res, next) {
  try {
    //so pk cant be changed
    if ("id" in req.body) {
      throw new ExpressError("Not allowed", 400);
    }
    const results = await db.query(
      `
        DELETE FROM invoices WHERE id = $1 RETURNING *
        `,
      [req.params.id]
    );

    if (results.rows.length === 0) {
      throw new ExpressError(
        `There is no invoice with id of '${req.params.id}`,
        404
      );
    }

    return res.json({
      STATUS: `Invoice Deleted: invoice id: ${req.params.id}`,
    });
  } catch (e) {
    return next(e);
  }
});

module.exports = router;

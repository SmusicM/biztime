process.env.NODE_ENV = "test";
require("dotenv").config({ path: ".env.test" });
// npm packages
const request = require("supertest");
const slugify = require("slugify");
// app imports
const app = require("../app");
const db = require("../db");

let testinvoice;
let testcompany;



beforeEach(async function () {
  await db.query(`DELETE FROM invoices WHERE comp_code = 'testcode'`);
  await db.query(`DELETE FROM companies WHERE code = 'testcode'`);
  let compresult = await db.query(`
        INSERT INTO
          companies (code,name,description) VALUES ('testcode','testname','testdesc')
          RETURNING code,name,description`);
  testcompany = compresult.rows[0];

  let result = await db.query(`
        INSERT INTO
          invoices (comp_code,amt,paid,add_date,paid_date) VALUES ('testcode',100,false,CURRENT_DATE,NULL)
          RETURNING *`);
  testinvoice = result.rows[0];
  testinvoice.add_date = testinvoice.add_date.toISOString();
  //testcompany = ({companies:[result.rows[0]] });
});

describe("GET /invoices", function () {
  test("Gets a list of all invoices", async function () {
    const response = await request(app).get(`/invoices`);
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual({
      invoices: [testinvoice],
    });
  });
});

describe("GET /invoices/:id", function () {
  test("Gets a single company with info", async function () {
    const response = await request(app).get(`/invoices/${testinvoice.id}`);
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual({
      invoices: [testinvoice],
    });
  });

  //test("Responds with 404 if can't find company by its code", async function() {
  //  const response = await request(app).get(`/invoices/6`);
  //  expect(response.statusCode).toEqual(404);
  //});
});

describe("POST /invoices", function () {
  test("Add an invoice that can be assiociated by a company", async function () {
    const CURRENT_DATE = new Date().toISOString();
    const response = await request(app).post(`/invoices`).send({
      comp_code: testcompany.code,
      amt: 1000,
      paid: false,
      add_date: CURRENT_DATE,
      paid_date: null,
    });
    console.log(response.body);
    expect(response.statusCode).toEqual(201);
    //does this run slugify , how can i test that?
    expect(response.body).toEqual({
      invoices: {
        id: response.body.invoices.id,
        comp_code: testcompany.code,
        amt: 1000,
        paid: false,
        add_date: response.body.invoices.add_date,
        paid_date: null,
      },
    });
    //expect(response.body).toEqual([testcompany]);
  });
});

describe("PUT /invoices/:id", function () {
  test("Updates a single invoice", async function () {
    const CURRENT_DATE = new Date().toISOString()
    const response = await request(app)
      .put(`/invoices/${testinvoice.id}`)
      .send({
        amt: 100,
        paid: true,
        paid_date: CURRENT_DATE
      });
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual({
      invoices: {
        id: response.body.invoices.id,
        comp_code: testcompany.code,
        amt: 100,
        paid: true,
        add_date: testinvoice.add_date,
        //paid_date: response.body.invoices.paid_date
        //paid_date: testinvoice.paid_date
        //paid_date: CURRENT_DATE
        paid_date: response.body.invoices.paid_date,
      },
    });
  });

  test("Responds with 404 if can't find invoice", async function () {
    const response = await request(app).put(`/invoices/1000000`);
    expect(response.statusCode).toEqual(404);
  });
});




afterEach(async function () {
  // delete any data created by test
  await db.query("DELETE FROM invoices");
  await db.query("DELETE FROM companies");
});

afterAll(async function () {
  // close db connection
  await db.end();
});

process.env.NODE_ENV = "test";
require("dotenv").config({ path: ".env.test" });
// npm packages
const request = require("supertest");
const slugify = require("slugify");
// app imports
const app = require("../app");
const db = require("../db");

let testcompany;

beforeEach(async function () {
  let result = await db.query(`
      INSERT INTO
        companies (code,name,description) VALUES ('testcode','testname','testdesc')
        RETURNING code,name,description`);
  testcompany = result.rows[0];
  //testcompany = ({companies:[result.rows[0]] });
});

describe("GET /companies", function () {
  test("Gets a list of all companies", async function () {
    const response = await request(app).get("/companies");
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual({companies: [testcompany]});
    //expect(response.body).toEqual([testcompany]);
  });
});

describe("POST /companies", function () {
  test("Add a company to list of companies", async function () {
    
   
    const response = await request(app)
    .post(`/companies`)
    .send({
      //code: "micros",
      name: "microsoft",
      description: "a company that is great"
    });
    expect(response.statusCode).toEqual(201);
    //does this run slugify , how can i test that?
    expect(response.body).toEqual({companies: {code:"microsoft",name:"microsoft",description:"a company that is great"}});
    //expect(response.body).toEqual([testcompany]);
  });
});

describe("GET /companies/:code", function() {
  test("Gets a single company with info", async function() {
    const response = await request(app).get(`/companies/${testcompany.code}`);
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual({
      company: {
        code: testcompany.code,
        name: testcompany.name,
        description: testcompany.description,
        industry: null,
      },
      //
      //[`${testcompany.code}_invoices`]: {
      //  //invoices:[{
      //  //  code: testcompany.code,
      //  //  name:  testcompany.name,
      //  //  description:  testcompany.description,
      //  //  id: null,
      //  //  amt: null,
      //  //  paid: null,
      //  //  add_date: null,
      //  //  paid_date: null,
      //  //  comp_ind: null,
      //  //  comp_code: null
      //  //  }],
      //  //  
      //  invoices:[testcompany.invoices],
      //},
      //
      company: {
        code: testcompany.code,
        name: testcompany.name,
        description: testcompany.description,
        industry: null,
      },
      [`${testcompany.code}_invoices`]: {
        invoices:[],
        
      },
    });
  });

  test("Responds with 404 if can't find company by its code", async function() {
    const response = await request(app).get(`/companies/b`);
    expect(response.statusCode).toEqual(404);
  });
});

describe("PUT /companies/:code", function() {
  test("Updates a single company", async function() {
    const response = await request(app)
      .put(`/companies/${testcompany.code}`)
      .send({
        name: "testnameafterupdateputreq",
        description: testcompany.description
      
      });
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual({ companies: {  name: "testnameafterupdateputreq",description: testcompany.description,code:testcompany.code} }
    );
  });

  test("Responds with 404 if can't find company", async function() {
    const response = await request(app).put(`/companies/badcompany`);
    expect(response.statusCode).toEqual(404);
  });
});

describe("DELETE /companies/:code", function() {
  test("Deletes a specific company", async function() {
    const response = await request(app)
      .delete(`/companies/${testcompany.code}`);
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual({ MESSAGE: `Company Deleted: ${testcompany.code}` });
  });
});

afterEach(async function () {
  // delete any data created by test
  await db.query("DELETE FROM companies");
});

afterAll(async function () {
  // close db connection
  await db.end();
});

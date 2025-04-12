const router = require("express").Router();
const initMYSQL = require("../../config/db");
const tableHeader = "info_header";
const tableHighlight = "info_highlight";
const tableShowcase = "info_showcase";
const tableShowTiktok = "info_showTiktok";
const tableOurTeam = "info_ourTeam";
const tableContact = "info_contact";

// ------------------------------ header -----------------------------------------
router.get("/header", async (_, res) => {
  try {
    const conn = await initMYSQL();
    const [result] = await conn.query(`SELECT * FROM ${tableHeader} `);
    res.send(result);
    conn.end();
  } catch (err) {
    res.status(500).send(`Internal server error: ${err.message}`);
  }
});

router.post("/header", async (req, res) => {
  try {
    const conn = await initMYSQL();
    const { title_th, title_en, description, link_scholarship, link_apply_to_study	 } = req.body;

    await conn.query(`DELETE FROM ${tableHeader}`);
    const [result] = await conn.query(
      `INSERT INTO ${tableHeader} 
            (title_th, title_en, description, link_scholarship, link_apply_to_study) VALUES (?, ?, ?, ?, ?)`,
      [title_th, title_en, description, link_scholarship, link_apply_to_study]
    );

    res.send(`Insert ID: ${result.insertId}`);
    conn.end();
  } catch (err) {
    res.status(500).send(`Internal server error: ${err.message}`);
  }
});

// ------------------------------ highlight -----------------------------------------
router.get("/highlight", async (_, res) => {
  try {
    const conn = await initMYSQL();
    const [result] = await conn.query(`SELECT * FROM ${tableHighlight} `);
    res.send(result);
    conn.end();
  } catch (err) {
    res.status(500).send(`Internal server error: ${err.message}`);
  }
});

router.post("/highlight", async (req, res) => {
  try {
    const conn = await initMYSQL();
    const { topic, description } = req.body;

    await conn.query(`DELETE FROM ${tableHighlight}`);
    const [result] = await conn.query(
      `INSERT INTO ${tableHighlight} 
            (topic, description) VALUES (?, ?)`,
      [topic, description]
    );

    res.send(`Insert ID: ${result.insertId}`);
    conn.end();
  } catch (err) {
    res.status(500).send(`Internal server error: ${err.message}`);
  }
});

// ------------------------------ showcase -----------------------------------------
router.get("/showcase", async (_, res) => {
  try {
    const conn = await initMYSQL();
    const [result] = await conn.query(`SELECT * FROM ${tableShowcase} `);
    res.send(result);
    conn.end();
  } catch (err) {
    res.status(500).send(`Internal server error: ${err.message}`);
  }
});

router.post("/showcase", async (req, res) => {
  try {
    const conn = await initMYSQL();
    const { topic, description } = req.body;

    await conn.query(`DELETE FROM ${tableShowcase}`);
    const [result] = await conn.query(
      `INSERT INTO ${tableShowcase} 
            (topic, description) VALUES (?, ?)`,
      [topic, description]
    );

    res.send(`Insert ID: ${result.insertId}`);
    conn.end();
  } catch (err) {
    res.status(500).send(`Internal server error: ${err.message}`);
  }
});

// ------------------------------ showtiktok -----------------------------------------
router.get("/showTiktok", async (_, res) => {
  try {
    const conn = await initMYSQL();
    const [result] = await conn.query(`SELECT * FROM ${tableShowTiktok} `);
    res.send(result);
    conn.end();
  } catch (err) {
    res.status(500).send(`Internal server error: ${err.message}`);
  }
});

router.post("/showTiktok", async (req, res) => {
  try {
    const conn = await initMYSQL();
    const { topic, description } = req.body;

    await conn.query(`DELETE FROM ${tableShowTiktok}`);
    const [result] = await conn.query(
      `INSERT INTO ${tableShowTiktok} 
              (topic, description) VALUES (?, ?)`,
      [topic, description]
    );

    res.send(`Insert ID: ${result.insertId}`);
    conn.end();
  } catch (err) {
    res.status(500).send(`Internal server error: ${err.message}`);
  }
});

// ------------------------------ our team -----------------------------------------
router.get("/ourTeam", async (_, res) => {
  try {
    const conn = await initMYSQL();
    const [result] = await conn.query(`SELECT * FROM ${tableOurTeam} `);
    res.send(result);
    conn.end();
  } catch (err) {
    res.status(500).send(`Internal server error: ${err.message}`);
  }
});

router.post("/ourTeam", async (req, res) => {
  try {
    const conn = await initMYSQL();
    const { topic, description } = req.body;

    await conn.query(`DELETE FROM ${tableOurTeam}`);
    const [result] = await conn.query(
      `INSERT INTO ${tableOurTeam} 
              (topic, description) VALUES (?, ?)`,
      [topic, description]
    );

    res.send(`Insert ID: ${result.insertId}`);
    conn.end();
  } catch (err) {
    res.status(500).send(`Internal server error: ${err.message}`);
  }
});

// ------------------------------ contact -----------------------------------------
router.get("/contact", async (_, res) => {
  try {
    const conn = await initMYSQL();
    const [result] = await conn.query(`SELECT * FROM ${tableContact} `);
    res.send(result);
    conn.end();
  } catch (err) {
    res.status(500).send(`Internal server error: ${err.message}`);
  }
});

router.post("/contact", async (req, res) => {
  try {
    const conn = await initMYSQL();
    const { topic, description, address, mobile, available, email } = req.body;
    console.log(req.body)

    await conn.query(`DELETE FROM ${tableContact}`);
    const [result] = await conn.query(
      `INSERT INTO ${tableContact} 
              (topic, description, address, mobile, available, email) VALUES (?, ?, ?, ?, ?, ?)`,
      [topic, description, address, mobile, available, email]
    );

    res.send(`Insert ID: ${result.insertId}`);
    conn.end();
  } catch (err) {
    res.status(500).send(`Internal server error: ${err.message}`);
  }
});

module.exports = router;

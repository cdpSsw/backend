const router = require("express").Router();
const bcrypt = require("bcryptjs");
const initMYSQL = require("../../config/db");
const table = "alluser";

const authorize = require('../middleware/authorize');

router.get("/", async (_, res) => {
  try {
    const conn = await initMYSQL();
    const [result] = await conn.query(`SELECT * FROM ${table}`);

    res.send(result);
    conn.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
});

router.put("/:id", authorize(["admin"]), async (req, res) => {
  try {
    const conn = await initMYSQL();
    const { id } = req.params;
    const { studentID, role, email, password, fname, lname } = req.body;
    // console.log('Put ID: ',req.params);
    // console.log('Put Info: ', req.body);
    // console.log("Table Name:", table);

    const saltRounds = parseInt(process.env.PASS_SALT, 10) || 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const newPassword = await bcrypt.hash(password, salt);
    // console.log(newPassword);

    const [result] = await conn.query(
      `UPDATE ${table} SET studentID = ?, role = ?, email = ?, password = ?, fname = ?, lname = ? WHERE id = ?`,
      [studentID, role, email, newPassword, fname, lname, id]
    );
    // console.log(result)
    res.status(200).send(`Insert ID: ${result.insertId}`);
    conn.end();

  } catch (err) {
    console.error(`Inserting: ${table}, ${err}`);
    res.status(500).send(`Error getting ${table}`);
  }
});

// ... Approve
router.put("/status/:id", authorize(["admin"]), async (req, res) => {
  try {
    const conn = await initMYSQL();
    const { id } = req.params;
    const { status } = req.body;
    // console.log(req.body);
    // console.log(req.params);

    await conn.query(`UPDATE ${table} SET status = ? WHERE id = ?`,
      [status, id]
    );

    return res.status(200).json({ message: "Update Successful" });

  } catch (err) {
    console.error(`Inserting: ${table}, ${err}`);
    res.status(500).send(`Error getting ${table}`);
  }
});

router.delete("/:id", authorize(["admin"]), async (req, res) => {
  try {
    const conn = await initMYSQL();
    const { id } = req.params;
    // console.log(req.params);
  
    await conn.query(`DELETE FROM ${table} WHERE id = ?`, [id]);
    return res.status(200).json({ message: "Delete Successful" });

  } catch (err) {
    console.error(`Inserting: ${table}, ${err}`);
    res.status(500).send(`Error getting ${table}`);
  }
});


// ----------------------------- users -------------------------------------
router.post("/", async (req, res) => {
  try {
    const conn = await initMYSQL();
    const { role, fname, lname, email, password, studentID } = req.body;
    console.log('req.body: ', req.body);

    const saltRounds = parseInt(process.env.PASS_SALT, 10) || 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const newPassword = await bcrypt.hash(password, salt);
    console.log('newPassword: ', newPassword);

    const [result] = await conn.query(
      `INSERT INTO ${table} (studentID, role, email, password, fname, lname)
          VALUES (?, ?, ? , ?, ?, ?)`,
      [studentID, role, email, newPassword, fname, lname]
    );

    res.status(200).send(`Insert ID: ${result.insertId}`);
    conn.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
});

module.exports = router;

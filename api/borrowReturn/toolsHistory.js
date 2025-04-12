const router = require("express").Router();
const initMYSQL = require("../../config/db");
const authorize = require("../middleware/authorize");

const borrowHistory = "toolsBorrowHistory"
const returnHistory = "toolsReturnHistory"

// ----------------------------------- student (borrow) ---------------------------------------
router.get("/borrow", authorize(["admin", "student"]), async (_, res) => {
  try {
    const conn = await initMYSQL();
    const [result] = await conn.query(`SELECT * FROM ${borrowHistory}`);
    res.send(result);

  } catch (err) {
    console.error(`Error getting ${borrowHistory}: ${err}`);
    res.status(500).send(`Error getting ${borrowHistory}`);
  }
});

router.get("/borrow/images", async (req, res) => {
  try {
    const conn = await initMYSQL();

    const [results] = await conn.query(
      `SELECT id, borrowCode, img1_data, img1_type, img2_data, img2_type, img3_data, img3_type, img4_data, img4_type FROM ${borrowHistory}`
    );

    if (results.length === 0) {
      return res.status(200).json([]);
    }

    const images = results.map((row) => {
      const imgs = [];

      for (let i = 1; i <= 4; i++) {
        const data = row[`img${i}_data`];
        const type = row[`img${i}_type`];

        if (data && type) {
          imgs.push(`data:${type};base64,${data.toString("base64")}`);
        }
      }

      return {
        id: row.id,
        images: imgs,
      };
    });

    res.json(images);
    conn.end();
  } catch (err) {
    console.error(err);
    res.status(500).send(`Internal server error: ${err.message}`);
  }
});

// ----------------------------------- student (return) ---------------------------------------
router.get("/return", authorize(["admin", "student"]), async (_, res) => {
  try {
    const conn = await initMYSQL();
    const [result] = await conn.query(`SELECT * FROM ${returnHistory}`);
    res.send(result);

  } catch (err) {
    console.error(`Error getting ${returnHistory}: ${err}`);
    res.status(500).send(`Error getting ${returnHistory}`);
  }
});

router.get("/return/images", async (req, res) => {
  try {
    const conn = await initMYSQL();

    const [results] = await conn.query(
      `SELECT id, returnCode, img1_data, img1_type, img2_data, img2_type, img3_data, img3_type, img4_data, img4_type FROM ${returnHistory}`
    );

    if (results.length === 0) {
      return res.status(200).json([]);
    }

    const images = results.map((row) => {
      const imgs = [];

      for (let i = 1; i <= 4; i++) {
        const data = row[`img${i}_data`];
        const type = row[`img${i}_type`];

        if (data && type) {
          imgs.push(`data:${type};base64,${data.toString("base64")}`);
        }
      }

      return {
        id: row.id,
        images: imgs,
      };
    });

    res.json(images);
    conn.end();
  } catch (err) {
    console.error(err);
    res.status(500).send(`Internal server error: ${err.message}`);
  }
});

module.exports = router;

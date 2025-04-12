const router = require("express").Router();
const initMYSQL = require("../../config/db");
const authorize = require("../middleware/authorize");
const table = "tools";

const borrowHistory = "toolsBorrowHistory";
const returnHistory = "toolsReturnHistory";

const path = require("path");
const fs = require("fs");
const multer = require("multer");

const imagePath = path.join(__dirname, "../../public/images/tools");
const imagePathBorrowHist = path.join(
  __dirname,
  "../../public/images/tools/BorrowHistory"
);
const imagePathReturnHist = path.join(
  __dirname,
  "../../public/images/tools/ReturnHistory"
);

if (!fs.existsSync(imagePath)) {
  fs.mkdirSync(imagePath, { recursive: true });
}

if (!fs.existsSync(imagePathBorrowHist)) {
  fs.mkdirSync(imagePathBorrowHist, { recursive: true });
}

if (!fs.existsSync(imagePathReturnHist)) {
  fs.mkdirSync(imagePathReturnHist, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_, __, cb) => {
    return cb(null, imagePath);
  },
  filename: (_, file, cb) => {
    const randomString = Math.random().toString(36).substring(2, 15);
    const timestamp = Date.now();
    const fileName = `${timestamp}_${randomString}_${file.originalname}`;
    return cb(null, fileName);
  },
});

const storageBorrowHist = multer.diskStorage({
  destination: (_, __, cb) => {
    return cb(null, imagePathBorrowHist);
  },
  filename: (_, file, cb) => {
    const randomString = Math.random().toString(36).substring(2, 15);
    const timestamp = Date.now();
    const fileName = `${timestamp}_${randomString}_${file.originalname}`;
    return cb(null, fileName);
  },
});

const storageReturnHist = multer.diskStorage({
  destination: (_, __, cb) => {
    return cb(null, imagePathReturnHist);
  },
  filename: (_, file, cb) => {
    const randomString = Math.random().toString(36).substring(2, 15);
    const timestamp = Date.now();
    const fileName = `${timestamp}_${randomString}_${file.originalname}`;
    return cb(null, fileName);
  },
});

const upload = multer({
  storage,
  fileFilter: (_, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed!"));
    }
    cb(null, true);
  },
});

const uploadBorrowHist = multer({
  storage: storageBorrowHist,
  fileFilter: (_, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed!"));
    }
    cb(null, true);
  },
});

const uploadReturnHist = multer({
  storage: storageReturnHist,
  fileFilter: (_, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed!"));
    }
    cb(null, true);
  },
});

router.get("/", authorize(["admin", "student"]), async (_, res) => {
  try {
    const conn = await initMYSQL();
    const [result] = await conn.query(`SELECT * FROM ${table}`);
    res.send(result);
  } catch (err) {
    console.error(`Error getting ${table}: ${err}`);
    res.status(500).send(`Error getting ${table}`);
  }
});

router.get("/images", async (req, res) => {
  try {
    const conn = await initMYSQL();

    const [results] = await conn.query(
      `SELECT id, img1_data, img1_type, img2_data, img2_type, img3_data, img3_type, img4_data, img4_type FROM ${table}`
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

router.post(
  "/",
  authorize(["admin"]),
  upload.fields([
    { name: "img1", maxCount: 1 },
    { name: "img2", maxCount: 1 },
    { name: "img3", maxCount: 1 },
    { name: "img4", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { name, description, quantity, available } = req.body;
      // console.log(req.body);
      // console.log(req.files);

      // Example: Read buffers if needed
      let imageBuffers = {};
      let mimeTypes = {};

      ["img1", "img2", "img3", "img4"].forEach((key) => {
        const file = req.files[key]?.[0];
        if (file) {
          const buffer = fs.readFileSync(file.path);
          imageBuffers[key] = buffer;
          mimeTypes[key] = file.mimetype;
          fs.unlinkSync(file.path);
        }
      });

      const conn = await initMYSQL();
      const [result] = await conn.query(
        `INSERT INTO ${table} (
          name, 
          description, 
          quantity, 
          available, 
          img1_data, 
          img1_type,
          img2_data, 
          img2_type,
          img3_data, 
          img3_type,
          img4_data, 
          img4_type
        )
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          name,
          description,
          quantity,
          available,
          imageBuffers["img1"] || null,
          mimeTypes["img1"] || null,
          imageBuffers["img2"] || null,
          mimeTypes["img2"] || null,
          imageBuffers["img3"] || null,
          mimeTypes["img3"] || null,
          imageBuffers["img4"] || null,
          mimeTypes["img4"] || null,
        ]
      );

      res.json({ insertId: result.insertId });
    } catch (err) {
      console.error(`Error inserting ${table}: ${err}`);
      res.status(500).send(`Error inserting ${table}`);
    }
  }
);

router.put(
  "/:id",
  authorize(["admin"]),
  upload.fields([
    { name: "img1", maxCount: 1 },
    { name: "img2", maxCount: 1 },
    { name: "img3", maxCount: 1 },
    { name: "img4", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const conn = await initMYSQL();
      const { id } = req.params;
      const { name, description, quantity, available } = req.body;

      if (!name || !description || !quantity) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // เตรียมเก็บ buffer กับ mime type
      const imageBuffers = {};
      const mimeTypes = {};

      // อ่านไฟล์ภาพที่ถูกอัปโหลด
      ["img1", "img2", "img3", "img4"].forEach((key) => {
        const file = req.files?.[key]?.[0];
        if (file) {
          imageBuffers[key] = fs.readFileSync(file.path);
          mimeTypes[key] = file.mimetype;
          fs.unlinkSync(file.path); // ลบ temp ไฟล์
        }
      });

      // เริ่มสร้าง SQL dynamic update
      let updateSQL = `UPDATE ${table} SET name = ?, description = ?, quantity = ?, available = ?`;
      let updateParams = [name, description, quantity, available];

      // ต่อ SQL สำหรับแต่ละภาพ (เฉพาะภาพที่อัปโหลดมาใหม่)
      ["img1", "img2", "img3", "img4"].forEach((key) => {
        if (imageBuffers[key]) {
          updateSQL += `, ${key}_data = ?, ${key}_type = ?`;
          updateParams.push(imageBuffers[key], mimeTypes[key]);
        }
      });

      updateSQL += ` WHERE id = ?`;
      updateParams.push(id);

      const [result] = await conn.query(updateSQL, updateParams);

      if (result.affectedRows > 0) {
        return res.status(200).json({ message: "Update Successful" });
      } else {
        return res.status(400).json({ message: "Update failed" });
      }
    } catch (err) {
      console.error(`Error: ${err}`);
      return res.status(500).json({ error: `Internal Server Error: ${err}` });
    }
  }
);

router.delete("/:id", authorize(["admin"]), async (req, res) => {
  try {
    const { id } = req.params;
    const conn = await initMYSQL();

    // ตรวจสอบว่าข้อมูลมีอยู่จริงหรือไม่
    const [check] = await conn.query(
      `SELECT id FROM ${table} WHERE id = ?`,
      [id]
    );

    if (check.length === 0) {
      return res.status(404).json({ error: "Data not found" });
    }

    // ลบข้อมูลออกจากฐานข้อมูล
    const [deleteResult] = await conn.query(
      `DELETE FROM ${table} WHERE id = ?`,
      [id]
    );

    if (deleteResult.affectedRows === 0) {
      return res.status(400).json({ error: "Failed to delete from database" });
    }

    return res.status(200).json({ message: "Delete Successful" });
  } catch (err) {
    console.error(`Error: ${err}`);
    return res.status(500).json({ error: `Internal Server Error: ${err}` });
  }
});


// ----------------------------------- student (borrow) ---------------------------------------
router.put(
  "/borrow/:id",
  authorize(["admin", "student"]),
  uploadBorrowHist.array("imgsBefore", 4),
  async (req, res) => {
    try {
      const conn = await initMYSQL();
      const { id } = req.params;
      const { borrowCode, studentID, toolName, borrowCount } = req.body;
      const count = Number(borrowCount);

      if (isNaN(count) || count < 1) {
        return res.status(400).send("Invalid borrow count.");
      }

      const [quantityResult] = await conn.query(
        `SELECT quantity, available FROM ${table} WHERE id = ?`,
        [id]
      );

      const currentAvailable = quantityResult[0]?.available;

      if (currentAvailable === undefined) {
        return res.status(404).send("Tool not found.");
      }

      const newAvailable = currentAvailable - count;

      if (newAvailable < 0) {
        return res.status(400).send("Not enough tools available.");
      }

      // อัปเดตจำนวนอุปกรณ์
      await conn.query(`UPDATE ${table} SET available = ? WHERE id = ?`, [
        newAvailable,
        id,
      ]);

      // เตรียมรูปภาพ (เก็บสูงสุด 4 รูปใน column img1 - img4 + mimetype)
      const imageBuffers = [];
      const mimeTypes = [];

      for (let i = 0; i < 4; i++) {
        const file = req.files[i];
        if (file) {
          const buffer = fs.readFileSync(file.path);
          imageBuffers[i] = buffer;
          mimeTypes[i] = file.mimetype;
          fs.unlinkSync(file.path);
        } else {
          imageBuffers[i] = null;
          mimeTypes[i] = null;
        }
      }

      // บันทึกประวัติการยืม
      const [result] = await conn.query(
        `INSERT INTO ${borrowHistory} 
          (
            borrowCode, 
            studentID, 
            toolName, 
            quantity, 
            img1_data, 
            img1_type, 
            img2_data, 
            img2_type, 
            img3_data, 
            img3_type, 
            img4_data, 
            img4_type
          )
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          borrowCode,
          studentID,
          toolName,
          count,
          imageBuffers[0], mimeTypes[0],
          imageBuffers[1], mimeTypes[1],
          imageBuffers[2], mimeTypes[2],
          imageBuffers[3], mimeTypes[3],
        ]
      );

      return res
        .status(200)
        .json({ message: "Borrowed successfully", insertId: result.insertId });
    } catch (err) {
      console.error("Borrowing error:", err);
      return res.status(500).send(`Internal server error: ${err.message}`);
    }
  }
);

// ----------------------------------- student (return) ---------------------------------------
router.put(
  "/return/:id",
  authorize(["admin", "student"]),
  uploadReturnHist.array("imgsAfter", 4),
  async (req, res) => {
    try {
      const conn = await initMYSQL();
      const { id } = req.params;
      const { returnCode, studentID, toolName, returnCount } = req.body;
      const count = Number(returnCount);

      if (isNaN(count) || count < 1) {
        return res.status(400).send("Invalid return count.");
      }

      const [quantityResult] = await conn.query(
        `SELECT quantity, available FROM ${table} WHERE id = ?`,
        [id]
      );

      const currentAvailable = quantityResult[0]?.available;

      if (currentAvailable === undefined) {
        return res.status(404).send("Tool not found.");
      }

      const newAvailable = currentAvailable + count;

      // อัปเดตจำนวนอุปกรณ์
      await conn.query(`UPDATE ${table} SET available = ? WHERE id = ?`, [
        newAvailable,
        id,
      ]);

      // เตรียมรูปภาพ (เก็บสูงสุด 4 รูปใน column img1 - img4 + mimetype)
      const imageBuffers = [];
      const mimeTypes = [];

      for (let i = 0; i < 4; i++) {
        const file = req.files[i];
        if (file) {
          const buffer = fs.readFileSync(file.path);
          imageBuffers[i] = buffer;
          mimeTypes[i] = file.mimetype;
          fs.unlinkSync(file.path);
        } else {
          imageBuffers[i] = null;
          mimeTypes[i] = null;
        }
      }

      // บันทึกประวัติการคืน
      const [result] = await conn.query(
        `INSERT INTO ${returnHistory} 
          (
            returnCode, 
            studentID, 
            toolName, 
            quantity, 
            img1_data, 
            img1_type, 
            img2_data, 
            img2_type, 
            img3_data, 
            img3_type, 
            img4_data, 
            img4_type
          )
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          returnCode,
          studentID,
          toolName,
          count,
          imageBuffers[0], mimeTypes[0],
          imageBuffers[1], mimeTypes[1],
          imageBuffers[2], mimeTypes[2],
          imageBuffers[3], mimeTypes[3],
        ]
      );

      return res
        .status(200)
        .json({ message: "Returned successfully", insertId: result.insertId });
    } catch (err) {
      console.error("Returning error:", err);
      return res.status(500).send(`Internal server error: ${err.message}`);
    }
  }
);

module.exports = router;

const express = require("express");
const router = express.Router();
const sql = require("mssql");

// GET all job list items
router.get("/", async (req, res) => {
  try {
    const result = await sql.query`
      SELECT TOP (1000) 
        NRP,
        NAME,
        JOB_CLASS,
        JOB_DESC,
        FACTORY,
        DUE_DATE,
        STATUS,
        created_at,
        updated_at
      FROM [DEPT_MANUFACTURING].[dbo].[USER_JOBLIST]
      ORDER BY created_at DESC
    `;
    res.status(200).json(result.recordset);
  } catch (error) {
    console.error("Error fetching job list items:", error.message);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

// GET single job list item by NRP
router.get("/:NRP", async (req, res) => {
  const { NRP } = req.params;
  try {
    const result = await sql.query`
      SELECT 
        NRP,
        NAME,
        JOB_CLASS,
        JOB_DESC,
        FACTORY,
        DUE_DATE,
        STATUS,
        created_at,
        updated_at
      FROM [DEPT_MANUFACTURING].[dbo].[USER_JOBLIST] 
      WHERE NRP = ${NRP}
    `;

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: "Job list item not found" });
    }

    res.status(200).json(result.recordset[0]);
  } catch (error) {
    console.error("Error fetching job list item:", error.message);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

// Create new job list item
router.post("/", async (req, res) => {
  const { NRP, NAME, JOB_CLASS, JOB_DESC, FACTORY, DUE_DATE, STATUS } =
    req.body;

  try {
    await sql.query`
      INSERT INTO [DEPT_MANUFACTURING].[dbo].[USER_JOBLIST] (
        NRP, 
        NAME, 
        JOB_CLASS, 
        JOB_DESC, 
        FACTORY, 
        DUE_DATE, 
        STATUS,
        created_at,
        updated_at
      ) VALUES (
        ${NRP}, 
        ${NAME}, 
        ${JOB_CLASS || null}, 
        ${JOB_DESC || null}, 
        ${FACTORY || null}, 
        ${DUE_DATE || null}, 
        ${STATUS || null},
        GETDATE(),
        GETDATE()
      )
    `;
    res.status(201).json({ message: "Job list item created successfully" });
  } catch (error) {
    console.error("Error creating job list item:", error.message);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

// Update job list item
// Update job list item
router.put("/:NRP", async (req, res) => {
  const { NRP } = req.params;
  const { NAME, JOB_CLASS, JOB_DESC, FACTORY, DUE_DATE, STATUS } = req.body;

  try {
    const checkItem = await sql.query`
      SELECT NRP FROM [DEPT_MANUFACTURING].[dbo].[USER_JOBLIST] WHERE NRP = ${NRP}
    `;

    if (checkItem.recordset.length === 0) {
      return res.status(404).json({ error: "Item not found" });
    }

    await sql.query`
      UPDATE [DEPT_MANUFACTURING].[dbo].[USER_JOBLIST] 
      SET 
        NAME = ${NAME}, 
        JOB_CLASS = ${JOB_CLASS || null}, 
        JOB_DESC = ${JOB_DESC || null}, 
        FACTORY = ${FACTORY || null}, 
        DUE_DATE = ${DUE_DATE || null}, 
        STATUS = ${STATUS || null},
        updated_at = GETDATE()
      WHERE NRP = ${NRP}
    `;
    res.status(200).json({ message: "Job list item updated successfully" });
  } catch (error) {
    console.error("Error updating job list item:", error.message);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

// Delete job list item
router.delete("/:NRP", async (req, res) => {
  const { NRP } = req.params;

  try {
    const checkItem = await sql.query`
      SELECT NRP FROM [DEPT_MANUFACTURING].[dbo].[USER_JOBLIST] WHERE NRP = ${NRP}
    `;

    if (checkItem.recordset.length === 0) {
      return res.status(404).json({ error: "Item not found" });
    }

    await sql.query`
      DELETE FROM [DEPT_MANUFACTURING].[dbo].[USER_JOBLIST] WHERE NRP = ${NRP}
    `;
    res.status(200).json({ message: "Job list item deleted successfully" });
  } catch (error) {
    console.error("Error deleting job list item:", error.message);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

module.exports = router;

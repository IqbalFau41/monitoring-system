const express = require("express");
const router = express.Router();
const sql = require("mssql");

// Endpoint untuk memindahkan job ke history
router.post("/move-to-history/:NRP", async (req, res) => {
  const { NRP } = req.params;

  try {
    // 1. Cek dulu apakah job ada
    const checkJob = await sql.query`
      SELECT * FROM [DEPT_MANUFACTURING].[dbo].[USER_JOBLIST] WHERE NRP = ${NRP}
    `;

    if (checkJob.recordset.length === 0) {
      return res.status(404).json({ error: "Job not found" });
    }

    const job = checkJob.recordset[0];

    // 2. Masukkan data ke tabel history dengan nama yang benar
    try {
      // Pastikan kita menggunakan nama tabel yang benar: USER_JOBLIST_HISTORY
      await sql.query`
        INSERT INTO [DEPT_MANUFACTURING].[dbo].[USER_JOBLIST_HISTORY] (
          NRP, 
          NAME, 
          JOB_CLASS, 
          JOB_DESC, 
          FACTORY, 
          DUE_DATE, 
          STATUS,
          COMPLETION_DATE,
          ORIGINAL_CREATED_AT
        ) VALUES (
          ${job.NRP}, 
          ${job.NAME}, 
          ${job.JOB_CLASS || null}, 
          ${job.JOB_DESC || null}, 
          ${job.FACTORY || null}, 
          ${job.DUE_DATE || null}, 
          'COMPLETED',
          GETDATE(),
          ${job.created_at || null}
        )
      `;

      // 3. Hapus data dari tabel job list
      await sql.query`
        DELETE FROM [DEPT_MANUFACTURING].[dbo].[USER_JOBLIST] WHERE NRP = ${NRP}
      `;

      res.status(200).json({
        message: "Job successfully moved to history",
        job: job,
      });
    } catch (error) {
      console.error("Database operation error:", error);

      // Periksa error tabel tidak ada
      if (error.message.includes("Invalid object name")) {
        // Coba buat tabel history jika belum ada
        try {
          await sql.query`
            IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[USER_JOBLIST_HISTORY]') AND type in (N'U'))
            BEGIN
                CREATE TABLE [dbo].[USER_JOBLIST_HISTORY] (
                    [id] INT IDENTITY(1,1) PRIMARY KEY,
                    [NRP] VARCHAR(50) NOT NULL,
                    [NAME] VARCHAR(255) NOT NULL,
                    [JOB_CLASS] VARCHAR(100) NULL,
                    [JOB_DESC] VARCHAR(MAX) NULL,
                    [FACTORY] VARCHAR(100) NULL,
                    [DUE_DATE] DATETIME NULL,
                    [STATUS] VARCHAR(50) NULL,
                    [COMPLETION_DATE] DATETIME NOT NULL,
                    [ORIGINAL_CREATED_AT] DATETIME NULL
                )
            END
          `;

          // Coba lagi setelah membuat tabel
          await sql.query`
            INSERT INTO [DEPT_MANUFACTURING].[dbo].[USER_JOBLIST_HISTORY] (
              NRP, NAME, JOB_CLASS, JOB_DESC, FACTORY, DUE_DATE, STATUS, COMPLETION_DATE, ORIGINAL_CREATED_AT
            ) VALUES (
              ${job.NRP}, ${job.NAME}, ${job.JOB_CLASS || null}, ${
            job.JOB_DESC || null
          }, 
              ${job.FACTORY || null}, ${
            job.DUE_DATE || null
          }, 'COMPLETED', GETDATE(), ${job.created_at || null}
            )
          `;

          await sql.query`
            DELETE FROM [DEPT_MANUFACTURING].[dbo].[USER_JOBLIST] WHERE NRP = ${NRP}
          `;

          return res.status(200).json({
            message:
              "Job successfully moved to history (table was created automatically)",
            job: job,
          });
        } catch (createTableError) {
          console.error("Error creating history table:", createTableError);
          return res.status(500).json({
            message: "Failed to create history table",
            error: createTableError.message,
          });
        }
      }

      throw error;
    }
  } catch (error) {
    console.error("Error moving job to history:", error.message);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

// GET all job history items
router.get("/", async (req, res) => {
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
        COMPLETION_DATE,
        ORIGINAL_CREATED_AT
      FROM [DEPT_MANUFACTURING].[dbo].[USER_JOBLIST_HISTORY]
      ORDER BY COMPLETION_DATE DESC
    `;
    res.status(200).json(result.recordset);
  } catch (error) {
    console.error("Error fetching job history:", error.message);

    // Jika tabel belum ada, berikan respons yang tepat
    if (error.message.includes("Invalid object name")) {
      return res.status(200).json([]); // Kembalikan array kosong jika tabel belum ada
    }

    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

// DELETE job history item
router.delete("/:NRP", async (req, res) => {
  const { NRP } = req.params;

  try {
    const result = await sql.query`
      DELETE FROM [DEPT_MANUFACTURING].[dbo].[USER_JOBLIST_HISTORY] 
      WHERE NRP = ${NRP}
    `;

    if (result.rowsAffected[0] === 0) {
      return res
        .status(404)
        .json({ error: "Riwayat pekerjaan tidak ditemukan" });
    }

    res.status(200).json({
      message: "Riwayat pekerjaan berhasil dihapus",
      deletedNRP: NRP,
    });
  } catch (error) {
    console.error("Error deleting job history:", error.message);
    res.status(500).json({
      message: "Gagal menghapus riwayat pekerjaan",
      error: error.message,
    });
  }
});

module.exports = router;

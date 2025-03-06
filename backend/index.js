// backend/index.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { connectDatabases } = require("./db");

const app = express();

// Middleware
app.use(express.json());

// Explicit CORS configuration
app.use(
  cors({
    origin: "*", // Allow all origins
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Fungsi async untuk inisialisasi server
const startServer = async () => {
  try {
    // Sambungkan ke semua database
    const databases = await connectDatabases();

    // Tambahkan database ke global untuk diakses di seluruh aplikasi
    global.databases = databases;

    // Prefix API
    const apiPrefix = process.env.API_PREFIX || "/api";

    // Route untuk masing-masing database
    // const userRouter = require("./routes/users"); // Menggunakan DB1 (IOT_HUB)

    // Routes using DEPT_MANUFACTURING (DB2)
    const inventoryRouter = require("./routes/inventory"); // DB2: DEPT_MANUFACTURING - inventory_parts
    const authRouter = require("./routes/auth"); // DB2: DEPT_MANUFACTURING - USER_NAME
    const jobListRouter = require("./routes/joblist"); // DB2: DEPT_MANUFACTURING - USER_JOBLIST
    const historyJobListRouter = require("./routes/history_joblist"); // DB2: DEPT_MANUFACTURING - USER_JOBLIST_HISTORY

    // Routes using IOT_HUB (DB1)
    const machineNameRouter = require("./routes/machine_name"); // DB1: IOT_HUB - CODE_MACHINE_PRODUCTION
    const machineStatusRouter = require("./routes/machine_status"); // DB1: IOT_HUB - CODE_MACHINE_PRODUCTION
    const machineHistoryRouter = require("./routes/machine_history"); // DB1: IOT_HUB - MACHINE_STATUS_PRODUCTION, CODE_MACHINE_PRODUCTION

    // Register routes for DEPT_MANUFACTURING (DB2)
    app.use(`${apiPrefix}/inventory`, inventoryRouter);
    app.use(`${apiPrefix}/auth`, authRouter);
    app.use(`${apiPrefix}/job-list`, jobListRouter);
    app.use(`${apiPrefix}/job-history`, historyJobListRouter);

    // Register routes for IOT_HUB (DB1)
    app.use(`${apiPrefix}/machine-names`, machineNameRouter);
    app.use(`${apiPrefix}/machine-status`, machineStatusRouter);
    app.use(`${apiPrefix}/machine-history`, machineHistoryRouter);

    // Health check endpoint
    app.get(`${apiPrefix}/health`, (req, res) => {
      res.status(200).json({
        status: "ok",
        message: "Server is running",
        databases: {
          db1: process.env.DB1_DATABASE, // IOT_HUB
          db2: process.env.DB2_DATABASE, // DEPT_MANUFACTURING
          db3: process.env.DB3_DATABASE, // MACHINE_LOG
        },
      });
    });

    const port = process.env.PORT || 3001;
    const host = process.env.HOST || "0.0.0.0";

    app.listen(port, host, () =>
      console.log(`Server running on http://${host}:${port}`)
    );
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

// Jalankan server
startServer();

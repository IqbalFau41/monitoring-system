// backend/db.js
const sql = require("mssql");
require("dotenv").config();

// Konfigurasi koneksi untuk DEPT_MANUFACTURING
const configDeptManufacturing = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  port: parseInt(process.env.DB_PORT) || 1433,
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

// Konfigurasi koneksi untuk IOT_HUB
const configIotHub = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: "IOT_HUB", // Hardcoded nama database IOT_HUB
  port: parseInt(process.env.DB_PORT) || 1433,
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

// Fungsi untuk menghubungkan ke database
const connectDatabases = async () => {
  try {
    // Koneksi ke DEPT_MANUFACTURING
    await sql.connect(configDeptManufacturing);
    console.log("Connected to DEPT_MANUFACTURING Database");

    // Koneksi ke IOT_HUB
    const poolIotHub = await new sql.ConnectionPool(configIotHub).connect();
    console.log("Connected to IOT_HUB Database");

    return {
      deptManufacturing: sql,
      iotHub: poolIotHub,
    };
  } catch (error) {
    console.error("Error connecting to SQL Servers:", error.message);
    throw error;
  }
};

module.exports = {
  connectDatabases,
  configDeptManufacturing,
  configIotHub,
};

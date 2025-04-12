// backend/db.js
const sql = require("mssql");
require("dotenv").config();

// Database configurations
const configDB1 = {
  user: process.env.DB1_USER,
  password: process.env.DB1_PASSWORD,
  server: process.env.DB1_SERVER,
  database: process.env.DB1_DATABASE, // IOT_HUB
  port: parseInt(process.env.DB1_PORT) || 1433,
  options: {
    encrypt: process.env.DB1_ENCRYPT === "true",
    trustServerCertificate: process.env.DB1_TRUST_CERT === "true",
    connectTimeout: 30000, // 30 second timeout
    requestTimeout: 30000, // 30 second timeout for requests
    pool: {
      max: 10, // Maximum pool size
      min: 0, // Minimum pool size
      idleTimeoutMillis: 30000, // How long a connection can be idle before being removed
    },
  },
};

const configDB2 = {
  user: process.env.DB2_USER,
  password: process.env.DB2_PASSWORD,
  server: process.env.DB2_SERVER,
  database: process.env.DB2_DATABASE, // DEPT_MANUFACTURING
  port: parseInt(process.env.DB2_PORT) || 1433,
  options: {
    encrypt: process.env.DB2_ENCRYPT === "true",
    trustServerCertificate: process.env.DB2_TRUST_CERT === "true",
    connectTimeout: 30000,
    requestTimeout: 30000,
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000,
    },
  },
};

const configDB3 = {
  user: process.env.DB3_USER,
  password: process.env.DB3_PASSWORD,
  server: process.env.DB3_SERVER,
  database: process.env.DB3_DATABASE, // MACHINE_LOG
  port: parseInt(process.env.DB3_PORT) || 1433,
  options: {
    encrypt: process.env.DB3_ENCRYPT === "true",
    trustServerCertificate: process.env.DB3_TRUST_CERT === "true",
    connectTimeout: 30000,
    requestTimeout: 30000,
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000,
    },
  },
};

// Connect to all databases with better error handling
const connectDatabases = async () => {
  const connections = {};
  let connectedDbs = 0;

  try {
    // Connect to Database 1 (IOT_HUB)
    connections.iotHub = await new sql.ConnectionPool(configDB1).connect();
    console.log(`Connected to ${process.env.DB1_DATABASE} Database (IOT_HUB)`);
    connectedDbs++;

    // Connect to Database 2 (DEPT_MANUFACTURING)
    connections.deptMfg = await new sql.ConnectionPool(configDB2).connect();
    console.log(
      `Connected to ${process.env.DB2_DATABASE} Database (DEPT_MANUFACTURING)`
    );
    connectedDbs++;

    // Connect to Database 3 (MACHINE_LOG)
    connections.plcData = await new sql.ConnectionPool(configDB3).connect();
    console.log(
      `Connected to ${process.env.DB3_DATABASE} Database (MACHINE_LOG)`
    );
    connectedDbs++;

    // Return all connections
    return connections;
  } catch (error) {
    console.error("Error connecting to SQL Servers:", error.message);
    // Log which databases connected successfully before the error
    console.error(
      `Successfully connected to ${connectedDbs} out of 3 databases`
    );

    // Close any open connections before throwing the error
    for (const key in connections) {
      if (connections[key] && typeof connections[key].close === "function") {
        try {
          await connections[key].close();
          console.log(`Closed connection to ${key} database`);
        } catch (closeError) {
          console.error(
            `Error closing ${key} database connection:`,
            closeError.message
          );
        }
      }
    }

    throw error;
  }
};

// Add a function to close all database connections
const closeDatabases = async (databases) => {
  if (!databases) return;

  for (const key in databases) {
    if (databases[key] && typeof databases[key].close === "function") {
      try {
        await databases[key].close();
        console.log(`Closed connection to ${key} database`);
      } catch (error) {
        console.error(
          `Error closing ${key} database connection:`,
          error.message
        );
      }
    }
  }
};

module.exports = {
  connectDatabases,
  closeDatabases,
  configDB1,
  configDB2,
  configDB3,
};

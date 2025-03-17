// config/database.config.js
const dbConfig = {
  user: "sa",
  password: "12345",
  server: "localhost\\SQLEXPRESS",
  database: "IOT_HUB",
  options: {
    encrypt: true,
    trustServerCertificate: true,
    enableArithAbort: true,
  },
  pool: {
    max: 20,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

module.exports = { dbConfig };

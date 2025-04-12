// backend/index.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { connectDatabases, closeDatabases } = require("./db");
const setupWebSocketServer = require("./websockets");
const helmet = require("helmet"); // Add security headers
const compression = require("compression"); // Add response compression

const app = express();

// Enhanced security middleware
app.use(helmet());

// Compress responses
app.use(compression());

// Request size limits
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// CORS configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    methods: (process.env.CORS_METHODS || "GET,POST,PUT,DELETE").split(","),
    allowedHeaders: (
      process.env.CORS_HEADERS || "Content-Type,Authorization"
    ).split(","),
    credentials: true,
  })
);

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    status: "error",
    message: "An unexpected error occurred",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Async server initialization
const startServer = async () => {
  let databases = null;
  let server = null;
  let wsServer = null;

  try {
    // Connect to all databases
    databases = await connectDatabases();
    global.databases = databases;

    // API routes prefix
    const apiPrefix = process.env.API_PREFIX || "/api";

    // Register routes
    // Routes using DEPT_MANUFACTURING (DB2)
    const inventoryRouter = require("./routes/inventory");
    const authRouter = require("./routes/auth");
    const jobListRouter = require("./routes/joblist");
    const historyJobListRouter = require("./routes/history_joblist");

    // Routes using IOT_HUB (DB1) and MACHINE_LOG (DB3)
    const machineNameRouter = require("./routes/machine_name");
    const machineStatusRouter = require("./routes/machine_status");
    const machineHistoryRouter = require("./routes/machine_history");
    const machineDetailRouter = require("./routes/machine_detail");

    // Apply routes
    app.use(`${apiPrefix}/inventory`, inventoryRouter);
    app.use(`${apiPrefix}/auth`, authRouter);
    app.use(`${apiPrefix}/job-list`, jobListRouter);
    app.use(`${apiPrefix}/job-history`, historyJobListRouter);
    app.use(`${apiPrefix}/machine-names`, machineNameRouter);
    app.use(`${apiPrefix}/machine-status`, machineStatusRouter);
    app.use(`${apiPrefix}/machine-history`, machineHistoryRouter);
    app.use(`${apiPrefix}/machine-detail`, machineDetailRouter);

    // Health check endpoint with database connectivity check
    app.get(`${apiPrefix}/health`, async (req, res) => {
      try {
        // Simple query to check DB connections
        await global.databases.iotHub.request().query("SELECT 1 as connected");
        await global.databases.deptMfg.request().query("SELECT 1 as connected");
        await global.databases.plcData.request().query("SELECT 1 as connected");

        res.status(200).json({
          status: "ok",
          message: "Server is running",
          databases: {
            db1: {
              name: process.env.DB1_DATABASE,
              status: "connected",
            },
            db2: {
              name: process.env.DB2_DATABASE,
              status: "connected",
            },
            db3: {
              name: process.env.DB3_DATABASE,
              status: "connected",
            },
          },
        });
      } catch (error) {
        res.status(500).json({
          status: "error",
          message: "Server is running but database connection issues detected",
          error: error.message,
        });
      }
    });

    // 404 handler for undefined routes
    app.use((req, res) => {
      res.status(404).json({
        status: "error",
        message: "Endpoint not found",
      });
    });

    // Server configuration
    const port = parseInt(process.env.PORT) || 3001;
    const host = process.env.HOST || "0.0.0.0";

    // Create and start HTTP server
    server = http.createServer(app);
    wsServer = setupWebSocketServer(server);

    server.listen(port, host, () => {
      console.log(
        `Server running on http://${host}:${port} with WebSocket support`
      );
    });

    // Graceful shutdown handlers
    setupGracefulShutdown(server, wsServer, databases);
  } catch (error) {
    console.error("Failed to start server:", error);

    // Clean up resources if startup fails
    if (wsServer) {
      wsServer.close();
    }

    if (server) {
      server.close();
    }

    if (databases) {
      await closeDatabases(databases);
    }

    process.exit(1);
  }
};

// Handle graceful shutdowns
function setupGracefulShutdown(server, wsServer, databases) {
  // SIGTERM handler (e.g., for docker containers)
  process.on("SIGTERM", async () => {
    console.log("SIGTERM signal received: closing servers");
    await performGracefulShutdown(server, wsServer, databases);
  });

  // SIGINT handler (e.g., Ctrl+C)
  process.on("SIGINT", async () => {
    console.log("SIGINT signal received: closing servers");
    await performGracefulShutdown(server, wsServer, databases);
  });

  // Uncaught exception handler
  process.on("uncaughtException", async (error) => {
    console.error("Uncaught exception:", error);
    await performGracefulShutdown(server, wsServer, databases);
  });

  // Unhandled rejection handler (for promises)
  process.on("unhandledRejection", async (reason) => {
    console.error("Unhandled promise rejection:", reason);
    await performGracefulShutdown(server, wsServer, databases);
  });
}

// Perform graceful shutdown
async function performGracefulShutdown(server, wsServer, databases) {
  try {
    // Close WebSocket server first
    if (wsServer) {
      await new Promise((resolve) => {
        wsServer.close(() => {
          console.log("WebSocket server closed");
          resolve();
        });
      });
    }

    // Then close HTTP server
    if (server) {
      await new Promise((resolve) => {
        server.close(() => {
          console.log("HTTP server closed");
          resolve();
        });
      });
    }

    // Finally close database connections
    if (databases) {
      await closeDatabases(databases);
    }

    console.log("Graceful shutdown completed");
    process.exit(0);
  } catch (error) {
    console.error("Error during graceful shutdown:", error);
    process.exit(1);
  }
}

// Start the server
startServer();

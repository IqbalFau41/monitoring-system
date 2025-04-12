// backend/routes/machine_detail.js
const express = require("express");
const router = express.Router();
const {
  prepareChartData,
  processShiftData,
} = require("../utils/machineDetailUtils");
const sql = require("mssql");

// Get machine detail based on machine code
router.get("/:machineCode", async (req, res) => {
  try {
    const { machineCode } = req.params;
    const { plcData, iotHub } = global.databases;

    // Verify machineCode format and sanitize to prevent SQL injection
    if (!machineCode || !/^\d+$/.test(machineCode)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid machine code format",
      });
    }

    // Check if machine exists in IOT_HUB first
    const machineInfoRequest = iotHub.request();
    machineInfoRequest.input("machineCode", sql.NVarChar, machineCode);

    const machineInfoQuery = `
      SELECT 
        [MACHINE_CODE],
        [MACHINE_NAME],
        [LINE_GROUP],
        [LOCATION]
      FROM [IOT_HUB].[dbo].[CODE_MACHINE_PRODUCTION]
      WHERE [MACHINE_CODE] = @machineCode
      AND [IS_SHOW] = 1
    `;

    const machineInfoResult = await machineInfoRequest.query(machineInfoQuery);

    if (machineInfoResult.recordset.length === 0) {
      return res.status(404).json({
        status: "error",
        message: `Machine with code ${machineCode} not found or is inactive`,
      });
    }

    const machineInfo = machineInfoResult.recordset[0];

    // Check if machine table exists in MACHINE_LOG database
    const tableCheckRequest = plcData.request();
    const tableCheck = await tableCheckRequest.query(`
      SELECT OBJECT_ID('[MACHINE_LOG].[dbo].[Machine_${machineCode}]', 'U') as TableID
    `);

    if (!tableCheck.recordset[0].TableID) {
      return res.status(404).json({
        status: "error",
        message: `No data table found for machine ${machineCode}`,
        machineInfo: machineInfo, // Return machine info even if no data exists
      });
    }

    // Get column information to build a dynamic query
    const columnsRequest = plcData.request();
    const columnsQuery = `
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'Machine_${machineCode}'
    `;

    const columnsResult = await columnsRequest.query(columnsQuery);

    if (columnsResult.recordset.length === 0) {
      return res.status(500).json({
        status: "error",
        message: `Table exists but no columns found for machine ${machineCode}`,
      });
    }

    // Build column list dynamically from schema
    const columnNames = columnsResult.recordset.map(
      (col) => `[${col.COLUMN_NAME}]`
    );
    const columnsString = columnNames.join(", ");

    // Execute main query using parameterized query for safety
    const dataRequest = plcData.request();
    const query = `
      SELECT TOP 100 ${columnsString}
      FROM [MACHINE_LOG].[dbo].[Machine_${machineCode}]
      ORDER BY [CreatedAt] DESC
    `;

    const result = await dataRequest.query(query);

    if (result.recordset.length === 0) {
      return res.status(200).json({
        status: "success",
        message: `Table exists but no data found for machine ${machineCode}`,
        machineInfo: machineInfo,
        latestRecord: null,
        shifts: [],
        chartData: { labels: [], datasets: [] },
      });
    }

    // Process the data
    const productionData = result.recordset;
    const latestRecord = productionData[0];

    // Use utility functions to process data
    const shifts = processShiftData(productionData);
    const chartData = prepareChartData(productionData);

    res.status(200).json({
      status: "success",
      machineInfo,
      latestRecord,
      shifts,
      chartData,
    });
  } catch (error) {
    console.error("Error fetching machine detail:", error);
    res.status(500).json({
      status: "error",
      message: "Server error while fetching machine detail",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

module.exports = router;

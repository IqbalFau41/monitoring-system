// routes/inventory.js
const express = require("express");
const router = express.Router();

// Middleware for validating body
const validateBody = (req, res, next) => {
  const { name_part, qty_part, date_part } = req.body;

  if (!name_part || qty_part === undefined || !date_part) {
    return res.status(400).json({
      error: "Name, Quantity, and Date are required",
    });
  }
  next();
};

// GET all inventory items
router.get("/", async (req, res) => {
  try {
    // Get database connection from global
    const { deptMfg } = global.databases;

    if (!deptMfg) {
      console.error("Database connection not available for DEPT_MANUFACTURING");
      return res.status(500).json({ message: "Database connection error" });
    }

    const request = deptMfg.request();
    const result = await request.query(`
      SELECT * FROM inventory_parts
      ORDER BY no_part DESC
    `);

    res.status(200).json(result.recordset);
  } catch (error) {
    console.error("Error fetching inventory items:", error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

// GET single inventory item by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  // Validate ID
  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ error: "Valid ID is required" });
  }

  try {
    const { deptMfg } = global.databases;

    if (!deptMfg) {
      return res.status(500).json({ message: "Database connection error" });
    }

    const request = deptMfg.request();
    request.input("id", id);

    const result = await request.query(`
      SELECT *
      FROM inventory_parts 
      WHERE no_part = @id
    `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: "Inventory item not found" });
    }

    res.status(200).json(result.recordset[0]);
  } catch (error) {
    console.error("Error fetching inventory item:", error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

// Create new inventory item
router.post("/", validateBody, async (req, res) => {
  try {
    const { deptMfg } = global.databases;

    if (!deptMfg) {
      return res.status(500).json({ message: "Database connection error" });
    }

    const request = deptMfg.request();
    request.input("date_part", req.body.date_part);
    request.input("delivery_note", req.body.delivery_note || null);
    request.input("purchase_order", req.body.purchase_order || null);
    request.input("name_part", req.body.name_part);
    request.input("type_part", req.body.type_part || null);
    request.input("maker_part", req.body.maker_part || null);
    request.input("qty_part", req.body.qty_part);
    request.input("unit_part", req.body.unit_part || null);
    request.input("recipient_part", req.body.recipient_part || null);
    request.input("information_part", req.body.information_part || null);
    request.input("pic_part", req.body.pic_part || null);

    await request.query(`
      INSERT INTO inventory_parts (
        date_part, 
        delivery_note, 
        purchase_order, 
        name_part, 
        type_part, 
        maker_part, 
        qty_part, 
        unit_part, 
        recipient_part, 
        information_part, 
        pic_part
      ) VALUES (
        @date_part, 
        @delivery_note, 
        @purchase_order, 
        @name_part, 
        @type_part, 
        @maker_part, 
        @qty_part, 
        @unit_part, 
        @recipient_part, 
        @information_part, 
        @pic_part
      )
    `);
    res.status(201).json({ message: "Item created successfully" });
  } catch (error) {
    console.error("Error creating inventory item:", error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

// Update inventory item
router.put("/:id", validateBody, async (req, res) => {
  const { id } = req.params;

  // Validate ID
  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ error: "Valid ID is required" });
  }

  try {
    const { deptMfg } = global.databases;

    if (!deptMfg) {
      return res.status(500).json({ message: "Database connection error" });
    }

    // Check if item exists
    const checkRequest = deptMfg.request();
    checkRequest.input("id", id);

    const checkItem = await checkRequest.query(`
      SELECT no_part FROM inventory_parts WHERE no_part = @id
    `);

    if (checkItem.recordset.length === 0) {
      return res.status(404).json({ error: "Item not found" });
    }

    // Update item
    const updateRequest = deptMfg.request();
    updateRequest.input("id", id);
    updateRequest.input("date_part", req.body.date_part);
    updateRequest.input("delivery_note", req.body.delivery_note || null);
    updateRequest.input("purchase_order", req.body.purchase_order || null);
    updateRequest.input("name_part", req.body.name_part);
    updateRequest.input("type_part", req.body.type_part || null);
    updateRequest.input("maker_part", req.body.maker_part || null);
    updateRequest.input("qty_part", req.body.qty_part);
    updateRequest.input("unit_part", req.body.unit_part || null);
    updateRequest.input("recipient_part", req.body.recipient_part || null);
    updateRequest.input("information_part", req.body.information_part || null);
    updateRequest.input("pic_part", req.body.pic_part || null);

    await updateRequest.query(`
      UPDATE inventory_parts 
      SET 
        date_part = @date_part, 
        delivery_note = @delivery_note, 
        purchase_order = @purchase_order, 
        name_part = @name_part, 
        type_part = @type_part, 
        maker_part = @maker_part, 
        qty_part = @qty_part, 
        unit_part = @unit_part, 
        recipient_part = @recipient_part, 
        information_part = @information_part, 
        pic_part = @pic_part
      WHERE no_part = @id
    `);
    res.status(200).json({ message: "Item updated successfully" });
  } catch (error) {
    console.error("Error updating inventory:", error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

// Delete inventory item
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  // Validate ID
  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ error: "Valid ID is required" });
  }

  try {
    const { deptMfg } = global.databases;

    if (!deptMfg) {
      return res.status(500).json({ message: "Database connection error" });
    }

    // Check if item exists
    const checkRequest = deptMfg.request();
    checkRequest.input("id", id);

    const checkItem = await checkRequest.query(`
      SELECT no_part FROM inventory_parts WHERE no_part = @id
    `);

    if (checkItem.recordset.length === 0) {
      return res.status(404).json({ error: "Item not found" });
    }

    // Delete item
    const deleteRequest = deptMfg.request();
    deleteRequest.input("id", id);

    await deleteRequest.query(`
      DELETE FROM inventory_parts WHERE no_part = @id
    `);
    res.status(200).json({ message: "Item deleted successfully" });
  } catch (error) {
    console.error("Error deleting inventory item:", error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

module.exports = router;

//backend/routes/inventory.js
const express = require("express");
const router = express.Router();
const sql = require("mssql");

// Middleware for validating ID
const validateId = (req, res, next) => {
  const { id } = req.params;
  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ error: "Valid ID is required" });
  }
  next();
};

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
    const result = await sql.query`
      SELECT * FROM inventory_parts
      ORDER BY no_part DESC
    `;
    res.status(200).json(result.recordset);
  } catch (error) {
    console.error("Error fetching inventory items:", error.message);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

// GET single inventory item by ID
router.get("/:id", validateId, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await sql.query`
      SELECT *
      FROM inventory_parts 
      WHERE no_part = ${id}
    `;

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: "Inventory item not found" });
    }

    res.status(200).json(result.recordset[0]);
  } catch (error) {
    console.error("Error fetching inventory item:", error.message);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

// Create new inventory item
router.post("/", validateBody, async (req, res) => {
  try {
    await sql.query`
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
        ${req.body.date_part}, 
        ${req.body.delivery_note || null}, 
        ${req.body.purchase_order || null}, 
        ${req.body.name_part}, 
        ${req.body.type_part || null}, 
        ${req.body.maker_part || null}, 
        ${req.body.qty_part}, 
        ${req.body.unit_part || null}, 
        ${req.body.recipient_part || null}, 
        ${req.body.information_part || null}, 
        ${req.body.pic_part || null}
      )
    `;
    res.status(201).json({ message: "Item created successfully" });
  } catch (error) {
    console.error("Error creating inventory item:", error.message);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

// Update inventory item
router.put("/:id", validateId, validateBody, async (req, res) => {
  const { id } = req.params;

  try {
    const checkItem = await sql.query`
      SELECT no_part FROM inventory_parts WHERE no_part = ${id}
    `;

    if (checkItem.recordset.length === 0) {
      return res.status(404).json({ error: "Item not found" });
    }

    await sql.query`
      UPDATE inventory_parts 
      SET 
        date_part = ${req.body.date_part}, 
        delivery_note = ${req.body.delivery_note || null}, 
        purchase_order = ${req.body.purchase_order || null}, 
        name_part = ${req.body.name_part}, 
        type_part = ${req.body.type_part || null}, 
        maker_part = ${req.body.maker_part || null}, 
        qty_part = ${req.body.qty_part}, 
        unit_part = ${req.body.unit_part || null}, 
        recipient_part = ${req.body.recipient_part || null}, 
        information_part = ${req.body.information_part || null}, 
        pic_part = ${req.body.pic_part || null}
      WHERE no_part = ${id}
    `;
    res.status(200).json({ message: "Item updated successfully" });
  } catch (error) {
    console.error("Error updating inventory:", error.message);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

// Delete inventory item
router.delete("/:id", validateId, async (req, res) => {
  const { id } = req.params;

  try {
    const checkItem = await sql.query`
      SELECT no_part FROM inventory_parts WHERE no_part = ${id}
    `;

    if (checkItem.recordset.length === 0) {
      return res.status(404).json({ error: "Item not found" });
    }

    await sql.query`
      DELETE FROM inventory_parts WHERE no_part = ${id}
    `;
    res.status(200).json({ message: "Item deleted successfully" });
  } catch (error) {
    console.error("Error deleting inventory item:", error.message);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

module.exports = router;

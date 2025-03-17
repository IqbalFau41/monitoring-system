// models/inventory.js
const sql = require("mssql");

// Function to create a new inventory item
const createInventoryItem = async (data) => {
  const {
    name_part,
    type_part,
    maker_part,
    qty_part,
    information_part,
    // Additional fields that might be required by the database
    date_part,
    delivery_note,
    purchase_order,
    unit_part,
    recipient_part,
    pic_part,
  } = data;

  // Basic validation
  if (!name_part || qty_part === undefined) {
    throw new Error("Name and Quantity are required.");
  }

  try {
    const currentDate = new Date().toISOString().split("T")[0];

    await sql.query`
      INSERT INTO INVENTORY_PARTS (
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
        ${date_part || currentDate}, 
        ${delivery_note || null}, 
        ${purchase_order || null}, 
        ${name_part}, 
        ${type_part || null}, 
        ${maker_part || null}, 
        ${qty_part}, 
        ${unit_part || null}, 
        ${recipient_part || null}, 
        ${information_part || null}, 
        ${pic_part || null}
      )`;
    return { message: "Item created successfully" };
  } catch (error) {
    console.error("Error creating inventory item:", error.message);
    throw error;
  }
};

// Function to get all inventory items with selected fields
const getInventoryItems = async () => {
  try {
    const result = await sql.query`
      SELECT 
        no_part, 
        name_part, 
        type_part, 
        maker_part, 
        qty_part, 
        information_part 
      FROM INVENTORY_PARTS
      ORDER BY no_part DESC
    `;
    return result.recordset;
  } catch (error) {
    console.error("Error fetching inventory items:", error.message);
    throw error;
  }
};

// Function to get a single inventory item by ID
const getInventoryItemById = async (id) => {
  try {
    const result = await sql.query`
      SELECT 
        no_part, 
        name_part, 
        type_part, 
        maker_part, 
        qty_part, 
        information_part 
      FROM INVENTORY_PARTS 
      WHERE no_part = ${id}
    `;

    if (result.recordset.length === 0) {
      throw new Error("Item not found");
    }

    return result.recordset[0];
  } catch (error) {
    console.error("Error fetching inventory item:", error.message);
    throw error;
  }
};

// Function to update an inventory item
const updateInventoryItem = async (id, data) => {
  const {
    name_part,
    type_part,
    maker_part,
    qty_part,
    information_part,
    // Additional fields
    date_part,
    delivery_note,
    purchase_order,
    unit_part,
    recipient_part,
    pic_part,
  } = data;

  // Validate input
  if (!name_part || qty_part === undefined) {
    throw new Error("Name and Quantity are required.");
  }

  try {
    // Check if item exists
    const checkItem = await sql.query`
      SELECT no_part FROM INVENTORY_PARTS WHERE no_part = ${id}
    `;

    if (checkItem.recordset.length === 0) {
      throw new Error("Item not found");
    }

    const currentDate = new Date().toISOString().split("T")[0];

    await sql.query`
      UPDATE INVENTORY_PARTS 
      SET 
        date_part = ${date_part || currentDate}, 
        delivery_note = ${delivery_note || null}, 
        purchase_order = ${purchase_order || null}, 
        name_part = ${name_part}, 
        type_part = ${type_part || null}, 
        maker_part = ${maker_part || null}, 
        qty_part = ${qty_part}, 
        unit_part = ${unit_part || null}, 
        recipient_part = ${recipient_part || null}, 
        information_part = ${information_part || null}, 
        pic_part = ${pic_part || null}
      WHERE no_part = ${id}
    `;
    return { message: "Item updated successfully" };
  } catch (error) {
    console.error("Error updating inventory item:", error.message);
    throw error;
  }
};

// Function to delete an inventory item
const deleteInventoryItem = async (id) => {
  try {
    // Check if item exists
    const checkItem = await sql.query`
      SELECT no_part FROM INVENTORY_PARTS WHERE no_part = ${id}
    `;

    if (checkItem.recordset.length === 0) {
      throw new Error("Item not found");
    }

    await sql.query`
      DELETE FROM INVENTORY_PARTS WHERE no_part = ${id}
    `;
    return { message: "Item deleted successfully" };
  } catch (error) {
    console.error("Error deleting inventory item:", error.message);
    throw error;
  }
};

module.exports = {
  createInventoryItem,
  getInventoryItems,
  getInventoryItemById,
  updateInventoryItem,
  deleteInventoryItem,
};

//backend/models/inventory.js
const sql = require("mssql");

// Fungsi untuk membuat item inventaris baru
const createInventoryItem = async (data) => {
  const {
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
    pic_part,
  } = data;

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
        ${date_part}, 
        ${delivery_note}, 
        ${purchase_order}, 
        ${name_part}, 
        ${type_part}, 
        ${maker_part}, 
        ${qty_part}, 
        ${unit_part}, 
        ${recipient_part}, 
        ${information_part}, 
        ${pic_part}
      )`;
    return { message: "Item created successfully" };
  } catch (error) {
    console.error("Error creating inventory item:", error.message);
    throw error;
  }
};

// Fungsi untuk mendapatkan semua item inventaris
const getInventoryItems = async () => {
  try {
    const result = await sql.query`SELECT * FROM inventory_parts`;
    return result.recordset;
  } catch (error) {
    console.error("Error fetching inventory items:", error.message);
    throw error;
  }
};

// Fungsi untuk memperbarui item inventaris
const updateInventoryItem = async (no_part, data) => {
  const {
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
    pic_part,
  } = data;

  // Validasi input
  if (!name_part || qty_part === undefined) {
    throw new Error("Name and Quantity are required.");
  }

  const checkItem =
    await sql.query`SELECT * FROM inventory_parts WHERE no_part = ${no_part}`;
  if (checkItem.recordset.length === 0) {
    throw new Error("Item not found");
  }

  try {
    await sql.query`
      UPDATE inventory_parts 
      SET 
        date_part = ${date_part}, 
        delivery_note = ${delivery_note}, 
        purchase_order = ${purchase_order}, 
        name_part = ${name_part}, 
        type_part = ${type_part}, 
        maker_part = ${maker_part}, 
        qty_part = ${qty_part}, 
        unit_part = ${unit_part}, 
        recipient_part = ${recipient_part}, 
        information_part = ${information_part}, 
        pic_part = ${pic_part}
      WHERE no_part = ${no_part}`;
    return { message: "Item updated successfully" };
  } catch (error) {
    console.error("Error updating inventory item:", error.message);
    throw error;
  }
};

// Fungsi untuk menghapus item inventaris
const deleteInventoryItem = async (no_part) => {
  // Cek apakah item ada
  const checkItem =
    await sql.query`SELECT * FROM inventory_parts WHERE no_part = ${no_part}`;
  if (checkItem.recordset.length === 0) {
    throw new Error("Item not found");
  }

  try {
    await sql.query`DELETE FROM inventory_parts WHERE no_part = ${no_part}`;
    return { message: "Item deleted successfully" };
  } catch (error) {
    console.error("Error deleting inventory item:", error.message);
    throw error;
  }
};

// Ekspor fungsi
module.exports = {
  createInventoryItem,
  getInventoryItems,
  updateInventoryItem,
  deleteInventoryItem,
};

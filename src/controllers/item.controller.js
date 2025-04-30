const itemRepository = require("../repositories/item.repository");
const baseResponse = require("../utils/baseResponse.util");
const db = require("../database/pg.database");
const fs = require("fs");

const createItem = async (req, res) => {
  try {
    const { name, price, store_id, stock } = req.body;
    const image = req.file;

    if (!name || price === undefined || !store_id || !image || stock === undefined) {
      return baseResponse(res, false, 400, "All fields are required", null);
    }

    if (price < 0) {
      return baseResponse(res, false, 400, "Price cannot be negative", null);
    }

    const storeExists = await db.query("SELECT * FROM stores WHERE id = $1", [store_id]);
    if (storeExists.rowCount === 0) {
      return baseResponse(res, false, 404, "Store doesn't exist", null);
    }

    const image_url = `http://sbd-zipline.fqto2i.easypanel.host/u/${image.filename}`;

    const item = await itemRepository.createItem({
      name,
      price,
      store_id,
      image_url,
      stock,
    });

    baseResponse(res, true, 201, "Item created", item);
  } catch (error) {
    console.error("Error creating item:", error);
    baseResponse(res, false, 500, "Internal server error", error.message);
  }
};


const getAllItems = async (req, res) => {
  try {
    const items = await db.query("SELECT * FROM items");

    if (items.rows.length === 0) {
      return baseResponse(res, false, 404, "There are no items found", null);
    }

    baseResponse(res, true, 200, "Items found", items.rows);
  } catch (error) {
    console.error("Error fetching items:", error);
    baseResponse(res, false, 500, "Internal server error", error);
  }
};

const getItemById = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await db.query("SELECT * FROM items WHERE id = $1", [id]);

    if (item.rowCount === 0) {
      return baseResponse(res, false, 404, "Item not found", null);
    }

    baseResponse(res, true, 200, "Item found", item.rows[0]);
  } catch (error) {
    console.error("Error fetching item by ID:", error);
    baseResponse(res, false, 500, "Internal server error", error);
  }
};

const getItemByStoreId = async (req, res) => {
  try {
    const { store_id } = req.params;

    const storeCheck = await db.query("SELECT * FROM stores WHERE id = $1", [store_id]);
    if (storeCheck.rowCount === 0) {
      return baseResponse(res, false, 404, "Store doesn't exist", null);
    }

    const items = await db.query("SELECT * FROM items WHERE store_id = $1", [store_id]);

    if (items.rowCount === 0) {
      return baseResponse(res, false, 404, "No items found in this store", null);
    }

    baseResponse(res, true, 200, "Items found", items.rows);
  } catch (error) {
    console.error("Error fetching items by store ID:", error);
    baseResponse(res, false, 500, "Internal server error", error);
  }
};

const updateItem = async (req, res) => {
  try {
    const { id, name, price, store_id, stock } = req.body;
    const imageUrl = req.file ? `http://sbd-zipline.fqto2i.easypanel.host/u/${req.file.filename}` : null;

    if (!id || !name || !price || !store_id || !stock) {
      if (req.file) fs.unlinkSync(req.file.path);
      return baseResponse(res, false, 400, "All fields are required", null);
    }

    const itemCheck = await db.query("SELECT * FROM items WHERE id = $1", [id]);
    if (itemCheck.rowCount === 0) {
      if (req.file) fs.unlinkSync(req.file.path);
      return baseResponse(res, false, 404, "Item not found", null);
    }

    const storeCheck = await db.query("SELECT * FROM stores WHERE id = $1", [store_id]);
    if (storeCheck.rowCount === 0) {
      if (req.file) fs.unlinkSync(req.file.path);
      return baseResponse(res, false, 404, "Store doesn't exist", null);
    }

    const updatedItem = await db.query(
      `UPDATE items 
       SET name = $1, price = $2, store_id = $3, stock = $4, image_url = COALESCE($5, image_url) 
       WHERE id = $6 RETURNING *`,
      [name, price, store_id, stock, imageUrl, id]
    );

    baseResponse(res, true, 200, "Item updated", updatedItem.rows[0]);
  } catch (error) {
    console.error("Error updating item:", error);
    if (req.file) fs.unlinkSync(req.file.path);
    baseResponse(res, false, 500, "Internal server error", error);
  }
};

const deleteItem = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await db.query("SELECT * FROM items WHERE id = $1", [id]);

    if (item.rows.length === 0) {
      return baseResponse(res, false, 404, "Item not found", null);
    }

    await db.query("DELETE FROM items WHERE id = $1", [id]);

    baseResponse(res, true, 200, "Item deleted", item.rows[0]);
  } catch (error) {
    console.error("Error deleting item:", error);
    baseResponse(res, false, 500, "Internal server error", error);
  }
};

module.exports = {
  createItem,
  getAllItems,
  getItemById,
  getItemByStoreId,
  updateItem,
  deleteItem,
};

const db = require("../database/pg.database");

exports.getAllStores = async () => {
  try {
    const res = await db.query("SELECT * FROM stores");
    return res.rows;
  } catch (error) {
    console.error("Error executing query", error);
  }
};

exports.createStore = async (store) => {
  try {
    const res = await db.query("INSERT INTO stores (name, address) VALUES ($1, $2) RETURNING *", [store.name, store.address]);
    return res.rows[0];
  } catch (error) {
    console.error("Error executing query", error);
  }
};

exports.getStoreById = async (id) => {
  try {
    const res = await db.query("SELECT * FROM stores WHERE id = $1", [id]);
    return res.rows[0];
  } catch (error) {
    console.error("Error executing query", error);
  }
};

exports.putStoreById = async (id, store) => {
  try {
    const res = await db.query("UPDATE stores SET name = $1, address = $2 WHERE id = $3 RETURNING *", [store.name, store.address, id]);
    return res.rows[0];
  } catch (error) {
    console.error("Error executing query", error);
  }
};

exports.deleteStoreById = async (id) => {
  try {
    const storeRes = await db.query("SELECT * FROM stores WHERE id = $1", [id]);

    if (storeRes.rows.length === 0) {
      return null;
    }

    const store = storeRes.rows[0];

    await db.query("DELETE FROM stores WHERE id = $1", [id]);

    return store;
  } catch (error) {
    console.error("Error executing query", error);
    throw error;
  }
};

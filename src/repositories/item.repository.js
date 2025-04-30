const db = require("../database/pg.database");

exports.createItem = async ({ name, price, store_id, image_url, stock }) => {
  if (price < 0) {
    throw new Error("Price cannot be negative");
  }

  const query = `
    INSERT INTO items (name, price, store_id, image_url, stock)
    VALUES ($1, $2, $3, $4, $5) RETURNING *;
  `;
  const values = [name, price, store_id, image_url, stock];

  try {
    const { rows } = await db.query(query, values);
    return rows[0];
  } catch (error) {
    throw error;
  }
};



exports.getItemById = async (id) => {
  try {
    const result = await db.query(`SELECT * FROM items WHERE id = $1`, [id]);
    return result.rows[0];
  } catch (error) {
    console.error("Error executing query:", error);
    throw error;
  }
};
const db = require("../database/pg.database");

exports.registerUser = async (user) => {
  try {
    const existingUser = await db.query("SELECT * FROM users WHERE email = $1", [user.email]);
    
    if (existingUser.rows.length > 0) {
      return null; 
    }

    const res = await db.query(
      "INSERT INTO users (name, email, password, balance, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING *",
      [user.name, user.email, user.password, 0]
    );

    return res.rows[0];
  } catch (error) {
    console.error("Error executing query", error);
    throw error;
  }
};

exports.loginUser = async (email, password) => {
  try {
    const res = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    return res.rows[0] || null;
  } catch (error) {
    console.error("Error executing query", error);
    throw error;
  }
};

exports.getUserByEmail = async (email) => {
  try {
    const res = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    return res.rows[0] || null;
  } catch (error) {
    console.error("Error executing query", error);
    throw error;
  }
};

exports.updateUser = async (user) => {
  try {
    const res = await db.query(
      "UPDATE users SET name = $1, email = $2, password = $3 WHERE id = $4 RETURNING *",
      [user.name, user.email, user.password, user.id]
    );
    return res.rows[0] || null;
  } catch (error) {
    console.error("Error executing query", error);
    throw error;
  }
};

exports.deleteUserById = async (id) => {
  try {
    const userRes = await db.query("SELECT * FROM users WHERE id = $1", [id]);

    if (userRes.rows.length === 0) {
      return null;
    }

    const user = userRes.rows[0];

    await db.query("DELETE FROM users WHERE id = $1", [id]);

    return user;
  } catch (error) {
    console.error("Error executing query", error);
    throw error;
  }
};

exports.topUpById = async (id, amount) => {
  try {
    if (amount <= 0) {
      return null;
    }

    const res = await db.query(
      "UPDATE users SET balance = balance + $1 WHERE id = $2 RETURNING *",
      [amount, id]
    );

    return res.rows[0] || null;
  } catch (error) {
    console.error("Error executing query", error);
    throw error;
  }
};

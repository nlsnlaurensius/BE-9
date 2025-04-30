const db = require("../database/pg.database");

exports.createTransaction = async (item_id, quantity, user_id, price) => {
  try {
    console.log("Checking item stock...");

    const stockCheckRes = await db.query(
      `SELECT stock FROM items WHERE id = $1`,
      [item_id]
    );

    if (stockCheckRes.rows.length === 0) {
      throw new Error("Item not found");
    }

    const itemStock = stockCheckRes.rows[0].stock;

    if (itemStock < quantity) {
      throw new Error("Insufficient stock");
    }

    console.log("Creating transaction...");

    const transactionRes = await db.query(
      `INSERT INTO transactions (item_id, quantity, user_id, status, total)
       VALUES ($1, $2::NUMERIC, $3, 'pending', ($2::NUMERIC) * ($4::NUMERIC))
       RETURNING *`,
      [item_id, quantity, user_id, price]
    );

    console.log("Transaction created successfully.");
    return transactionRes.rows[0];

  } catch (error) {
    console.error("Transaction creation failed.");
    console.error("Error executing query:", error.message);
    throw new Error("Transaction creation failed");
  }
};

exports.payTransaction = async (transactionId) => {
  try {
    console.log("Fetching transaction for payment...");
    const transactionRes = await db.query(
      `SELECT * FROM transactions WHERE id = $1`,
      [transactionId]
    );

    if (!transactionRes || transactionRes.rowCount === 0) {
      console.error("Transaction not found:", transactionId);
      throw new Error("Transaction not found");
    }

    const transaction = transactionRes.rows[0];

    if (transaction.status === "paid") {
      console.error("Transaction already paid:", transactionId);
      throw new Error("Transaction already paid");
    }

    console.log("Checking user balance...");
    const userRes = await db.query(
      `SELECT balance FROM users WHERE id = $1`,
      [transaction.user_id]
    );

    if (!userRes || userRes.rowCount === 0) {
      throw new Error("User not found");
    }

    const userBalance = userRes.rows[0].balance;
    if (userBalance < transaction.total) {
      console.error("Insufficient balance for user:", transaction.user_id);
      return { balanceInsufficient: true };
    }

    console.log("Processing payment...");
    await db.query(
      `UPDATE transactions SET status = 'paid' WHERE id = $1`,
      [transactionId]
    );
    
    await db.query(
      `UPDATE items SET stock = stock - $1 WHERE id = $2`,
      [transaction.quantity, transaction.item_id]
    );

    await db.query(
      `UPDATE users SET balance = balance - $1 WHERE id = $2`,
      [transaction.total, transaction.user_id]
    );

    return { message: "Payment successful", transaction };
  } catch (error) {
    console.error("Error processing payment:", error.message);
    throw error;
  }
};


exports.deleteTransactionById = async (transactionId) => {
  try {
    console.log("Deleting transaction...");
    const transactionRes = await db.query(
      `DELETE FROM transactions WHERE id = $1 RETURNING *`,
      [transactionId]
    );

    if (!transactionRes || transactionRes.rowCount === 0) {
      console.error("Transaction not found:", transactionId);
      return null;
    }

    return transactionRes.rows[0];
  } catch (error) {
    console.error("Error deleting transaction:", error.message);
    throw error;
  }
};

exports.getTransactionById = async (transactionId) => {
  try {
    console.log("Fetching transaction...");
    const transactionRes = await db.query(
      `
      SELECT 
        t.id AS transaction_id, t.user_id, t.item_id, t.quantity, t.total, t.status, t.created_at,
        u.id AS user_id, u.name AS user_name, u.email AS user_email, u.password AS user_password, u.balance, u.created_at AS user_created_at,
        i.id AS item_id, i.name AS item_name, i.price, i.store_id, i.image_url, i.stock, i.created_at AS item_created_at
      FROM transactions t
      JOIN users u ON t.user_id = u.id
      JOIN items i ON t.item_id = i.id
      WHERE t.id = $1
      `,
      [transactionId]
    );

    if (!transactionRes || transactionRes.rowCount === 0) {
      console.error("Transaction not found:", transactionId);
      return null;
    }

    const row = transactionRes.rows[0];

    return {
      id: row.transaction_id,
      user_id: row.user_id,
      item_id: row.item_id,
      quantity: row.quantity,
      total: row.total,
      status: row.status,
      created_at: row.created_at,
      user: {
        id: row.user_id,
        name: row.user_name,
        email: row.user_email,
        password: row.user_password,
        balance: row.balance,
        created_at: row.user_created_at
      },
      item: {
        id: row.item_id,
        name: row.item_name,
        price: row.price,
        store_id: row.store_id,
        image_url: row.image_url,
        stock: row.stock,
        created_at: row.item_created_at
      }
    };
  } catch (error) {
    console.error("Error fetching transaction:", error.message);
    throw error;
  }
};


exports.getAllTransactions = async () => {
  try {
    console.log("Fetching all transactions...");
    const transactionRes = await db.query(
      `
      SELECT 
        t.id AS transaction_id, t.user_id, t.item_id, t.quantity, t.total, t.status, t.created_at,
        u.id AS user_id, u.name AS user_name, u.email AS user_email, u.password AS user_password, u.balance, u.created_at AS user_created_at,
        i.id AS item_id, i.name AS item_name, i.price, i.store_id, i.image_url, i.stock, i.created_at AS item_created_at
      FROM transactions t
      JOIN users u ON t.user_id = u.id
      JOIN items i ON t.item_id = i.id
      `
    );

    if (!transactionRes || transactionRes.rowCount === 0) {
      console.error("No transactions found.");
      return null;
    }

    const transactions = transactionRes.rows.map(row => ({
      id: row.transaction_id,
      user_id: row.user_id,
      item_id: row.item_id,
      quantity: row.quantity,
      total: row.total,
      status: row.status,
      created_at: row.created_at,
      user: {
        id: row.user_id,
        name: row.user_name,
        email: row.user_email,
        password: row.user_password,
        balance: row.balance,
        created_at: row.user_created_at
      },
      item: {
        id: row.item_id,
        name: row.item_name,
        price: row.price,
        store_id: row.store_id,
        image_url: row.image_url,
        stock: row.stock,
        created_at: row.item_created_at
      }
    }));

    return transactions;
  } catch (error) {
    console.error("Error fetching all transactions:", error.message);
    throw error;
  }
}

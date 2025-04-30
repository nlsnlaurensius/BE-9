const transactionRepository = require("../repositories/transaction.repository");
const itemRepository = require("../repositories/item.repository"); // Tambahkan untuk mengambil harga item
const baseResponse = require("../utils/baseResponse.util");

exports.createTransaction = async (req, res) => {
  const { item_id, quantity, user_id } = req.body;

  if (!item_id || !user_id || quantity == null) {
    return baseResponse(res, false, 400, "All fields are required", null);
  }

  if (quantity <= 0) {
    return baseResponse(res, false, 400, "Quantity must be larger than 0", null);
  }

  try {
  
    const item = await itemRepository.getItemById(item_id);
    if (!item) {
      return baseResponse(res, false, 404, "Item not found", null);
    }
    
    const price = item.price;

    const transaction = await transactionRepository.createTransaction(item_id, quantity, user_id, price);
    baseResponse(res, true, 201, "Transaction created", transaction);
  } catch (error) {
    baseResponse(res, false, 500, error.message || "Internal server error", null);
  }
};


exports.payTransaction = async (req, res) => {
  const { transactionId } = req.params;

  try {
    const transaction = await transactionRepository.payTransaction(transactionId);
    if (!transaction) {
      return baseResponse(res, false, 404, "Transaction not found", null);
    }
    if (transaction.status === "paid") {
      return baseResponse(res, false, 400, "Transaction already paid", null);
    }
    if (transaction.balanceInsufficient) {
      return baseResponse(res, false, 400, "Insufficient balance", null);
    }

    baseResponse(res, true, 200, "Payment successful", transaction);
  } catch (error) {
    
    baseResponse(res, false, 500, error.message || "Internal server error", null);
  }
};


exports.getTransactionById = async (req, res) => {
  const { id } = req.params;

  try {
    const transaction = await transactionRepository.getTransactionById(id);
    if (!transaction) {
      return baseResponse(res, false, 404, "Transaction not found", null);
    }
    baseResponse(res, true, 200, "Transaction found", transaction);
  } catch (error) {
    baseResponse(res, false, 500, error.message || "Internal server error", null);
  }
};

exports.deleteTransactionById = async (req, res) => {
  const { id } = req.params;

  try {
    const transaction = await transactionRepository.deleteTransactionById(id);
    if (!transaction) {
      return baseResponse(res, false, 404, "Transaction not found", null);
    }
    baseResponse(res, true, 200, "Transaction deleted", { ...transaction });
  } catch (error) {
    baseResponse(res, false, 500, error.message || "Internal server error", null);
  }
};


exports.getAllTransactions = async (req, res) => {
  try {
    const transactions = await transactionRepository.getAllTransactions();
    if (!transactions) {
      return baseResponse(res, false, 404, "No transactions found", null);
    }
    baseResponse(res, true, 200, "Transactions found", transactions);
  } catch (error) {
    baseResponse(res, false, 500, error.message || "Internal server error", null);
  }
}

const bcrypt = require("bcrypt");
const userRepository = require("../repositories/user.repository");
const baseResponse = require("../utils/baseResponse.util");
const jwt = require("jsonwebtoken");

const saltRounds = 10;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

exports.registerUser = async (req, res) => {
  const { name, email, password } = req.query;

  if (!name || !email || !password) {
    return baseResponse(res, false, 400, "Name, email, and password are required", null);
  }
  
  if (!emailRegex.test(email)) {
    return baseResponse(res, false, 400, "Invalid email format", null);
  }

  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const user = await userRepository.registerUser({ name, email, password: hashedPassword });
    
    if (!user) {
      return baseResponse(res, false, 400, "Email already used", null);
    }

    return baseResponse(res, true, 201, "User created", user);
  } catch (error) {
    return baseResponse(res, false, 500, "Internal server error", error);
  }
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.query; // Mengambil email dan password dari query

  if (!email || !password) { // Memeriksa apakah email dan password ada
    return baseResponse(res, false, 400, "Email and password are required", null);
  }

  try {
    const user = await userRepository.loginUser(email); // Mencari user berdasarkan email

    // Memeriksa apakah user ditemukan DAN password sesuai (setelah di-hash)
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return baseResponse(res, false, 401, "Invalid email or password", null);
    }

    // Jika user ditemukan dan password cocok, membuat token dan merespons sukses
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role || "user" },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return baseResponse(res, true, 200, "Login success", { user, token });
  } catch (error) {
    return baseResponse(res, false, 500, "Internal server error", error);
  }
};

exports.getUserByEmail = async (req, res) => {
  try {
    const user = await userRepository.getUserByEmail(req.params.email);
    
    if (!user) {
      return baseResponse(res, false, 404, "User not found", null);
    }

    return baseResponse(res, true, 200, "User found", user);
  } catch (error) {
    return baseResponse(res, false, 500, "Error retrieving user", error);
  }
};

exports.updateUser = async (req, res) => {
  const { id, name, email, password } = req.body;

  if (!id || !name || !email || !password) {
    return baseResponse(res, false, 400, "All fields are required", null);
  }

  if (!emailRegex.test(email)) {
    return baseResponse(res, false, 400, "Invalid email format", null);
  }

  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const user = await userRepository.updateUser({ id, name, email, password: hashedPassword });
    
    if (!user) {
      return baseResponse(res, false, 404, "User not found", null);
    }

    return baseResponse(res, true, 200, "User updated", user);
  } catch (error) {
    return baseResponse(res, false, 500, "Error updating user", error);
  }
};

exports.deleteUserById = async (req, res) => {
  try {
    const user = await userRepository.deleteUserById(req.params.id);
    
    if (!user) {
      return baseResponse(res, false, 404, "User not found", null);
    }

    return baseResponse(res, true, 200, "User deleted", user);
  } catch (error) {
    return baseResponse(res, false, 500, "Error deleting user", error);
  }
};

exports.topUpById = async (req, res) => {
  const { id, amount } = req.query;

  if (!id || !amount) {
    return baseResponse(res, false, 400, "User ID and amount are required", null);
  }

  const topUpAmount = parseInt(amount, 10);
  if (isNaN(topUpAmount) || topUpAmount <= 0) {
    return baseResponse(res, false, 400, "Amount must be larger than 0", null);
  }

  try {
    const user = await userRepository.topUpById(id, topUpAmount);
    
    if (!user) {
      return baseResponse(res, false, 400, "Top up failed", null);
    }

    return baseResponse(res, true, 200, "Top up successful", user);
  } catch (error) {
    return baseResponse(res, false, 500, "Internal server error", error);
  }
};

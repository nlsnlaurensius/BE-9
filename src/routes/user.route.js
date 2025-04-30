const userController = require("../controllers/user.controller");
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const authorizeMiddleware = require("../middleware/authorizeMiddleware");

router.post("/register", userController.registerUser);
router.post("/login", userController.loginUser);
router.get("/:email", userController.getUserByEmail);
router.put("/", authMiddleware, authorizeMiddleware(["admin", "user"]), userController.updateUser);
router.delete("/:id", authMiddleware, authorizeMiddleware(["admin"]), userController.deleteUserById);
router.post("/topUp", authMiddleware, authorizeMiddleware(["admin"]), userController.topUpById);


module.exports = router;
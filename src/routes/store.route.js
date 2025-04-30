const storeController = require("../controllers/store.controller");
const express = require("express");
const router = express.Router();

router.get("/getAll", storeController.getAllStores);
router.post("/create", storeController.createStore);
router.get("/:id", storeController.getStoreById);
router.put("/", storeController.putStoreById);
router.delete("/:id", storeController.deleteStoreById);

module.exports = router;
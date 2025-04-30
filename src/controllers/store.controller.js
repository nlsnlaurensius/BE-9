const storeRepository = require("../repositories/store.repository");
const baseResponse = require("../utils/baseResponse.util");

exports.getAllStores = async (req, res) => {
  try {
    const stores = await storeRepository.getAllStores();
    
    if (!stores.length) {
      return baseResponse(res, false, 404, "There are no stores found", null);
    }

    baseResponse(res, true, 200, "Stores found", stores);
  } catch (error) {
    baseResponse(res, false, 500, "Error retrieving stores", error);
  }
};

exports.createStore = async (req, res) => {
  const { name, address } = req.body;
  if (!name || !address) {
    return baseResponse(res, false, 400, "Missing store name or address", null);
  }

  try {
    const store = await storeRepository.createStore(req.body);
    baseResponse(res, true, 201, "Store created", store);
  } catch (error) {
    baseResponse(res, false, 500, error.message || "Internal server error", error);
  }
};

exports.getStoreById = async (req, res) => {
  try {
    const store = await storeRepository.getStoreById(req.params.id);
    
    if (!store) {
      return baseResponse(res, false, 404, "Store not found", null);
    }
    
    baseResponse(res, true, 200, "Store found", store);
  } catch (error) {
    baseResponse(res, false, 500, "Error retrieving store", error);
  }
};

exports.putStoreById = async (req, res) => {
  const { id, name, address } = req.body;
  if (!name || !address) {
    return baseResponse(res, false, 400, "Missing store name or address", null);
  }

  try {
    const store = await storeRepository.putStoreById(id, req.body);
    
    if (!store) {
      return baseResponse(res, false, 404, "Store not found", null);
    }
    
    baseResponse(res, true, 200, "Store updated", store);
  } catch (error) {
    baseResponse(res, false, 500, "Error updating store", error);
  }
};

exports.deleteStoreById = async (req, res) => {
  try {
    const store = await storeRepository.deleteStoreById(req.params.id);
    
    if (!store) {
      return baseResponse(res, false, 404, "Store not found", null);
    }
    
    baseResponse(res, true, 200, "Store deleted", store);
  } catch (error) {
    baseResponse(res, false, 500, "Error deleting store", error);
  }
};

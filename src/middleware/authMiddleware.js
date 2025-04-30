const jwt = require("jsonwebtoken");
const baseResponse = require("../utils/baseResponse.util");

const authMiddleware = (req, res, next) => {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    console.log("Token:", token); // Tambahkan log ini

    if (!token) {
        return baseResponse(res, false, 401, "Authentication required", null);
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        console.error("Error verifying token:", error); // Tambahkan log ini
        return baseResponse(res, false, 401, "Invalid token", null);
    }
};

module.exports = authMiddleware;
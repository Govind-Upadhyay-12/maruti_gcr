const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const AdminToken = require("../models/AdminToken");

module.exports = async (req, res, next) => {
    try {
        const token = req.headers.authorization || req.header('Authorization');
        
        if (!token) {
            return res.status(401).json({ msg: "Unauthorized - No token provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded) {
            return res.status(401).json({ msg: "Invalid token" });
        }

        const admin = await Admin.findById(decoded.id).select('-password');

        if (!admin) {
            return res.status(404).json({ msg: "Admin not found" });
        }

        req.user = admin;
        next();
    } catch (error) {
        console.error("Authentication error:", error);
        if (error.name === "TokenExpiredError") {
            res.status(401).json({ msg: "Unauthorized - Token has expired" });
        } else {
            res.status(500).json({ msg: "Internal Server Error" });
        }
    }
};

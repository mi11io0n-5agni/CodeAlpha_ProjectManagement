import jwt from "jsonwebtoken";
import User from "../models/User.js";

const protect = async (req, res, next) => {
  try {
    let token;

    // Check Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "User not found.",
        });
      }

      return next();
    }

    return res.status(401).json({
      success: false,
      message: "Not authorized. No token provided.",
    });
  } catch (error) {
    console.error(error);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
};

export default protect;
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const requireUserAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice("Bearer ".length).trim()
      : "";

    if (!token) {
      return res.status(401).json({ message: "User authentication required" });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET || "civicrate-dev-secret");
    const userId = String(payload?.id || "");
    if (!userId) {
      return res.status(401).json({ message: "Invalid user token" });
    }

    const user = await User.findById(userId).select("username phonenumber").lean();
    if (!user) {
      return res.status(401).json({ message: "User not found for token" });
    }

    req.user = {
      id: userId,
      username: String(user.username || ""),
      phonenumber: String(user.phonenumber || ""),
    };

    return next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired user token" });
  }
};

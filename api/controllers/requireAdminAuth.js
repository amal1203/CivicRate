import jwt from "jsonwebtoken";

export const requireAdminAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice("Bearer ".length).trim()
      : "";

    if (!token) {
      return res.status(401).json({ message: "Admin authentication required" });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET || "civicrate-dev-secret");
    if (!payload?.adminId || !payload?.officeId || !payload?.role) {
      return res.status(401).json({ message: "Invalid admin token" });
    }

    req.admin = {
      adminId: String(payload.adminId),
      officeId: String(payload.officeId),
      role: payload.role,
      name: payload.name || "",
      email: payload.email || "",
    };

    return next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired admin token" });
  }
};

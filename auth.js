const jwt = require("jsonwebtoken");

function withAuthContext(req, _res, next) {
  req.auth = { role: "anonymous", username: "anonymous", fullName: "", userId: "" };

  const authHeader = String(req.header("authorization") || "").trim();
  if (!authHeader.toLowerCase().startsWith("bearer ")) return next();

  const token = authHeader.slice(7).trim();
  if (!token) return next();

  try {
    const secret = process.env.JWT_SECRET || "dev_jwt_secret_change_me";
    const payload = jwt.verify(token, secret);
    req.auth = {
      role: String(payload.role || "anonymous"),
      username: String(payload.username || "anonymous"),
      fullName: String(payload.fullName || ""),
      userId: String(payload.sub || "")
    };
  } catch {
    req.auth = { role: "anonymous", username: "anonymous", fullName: "", userId: "" };
  }

  return next();
}

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    const currentRole = req.auth?.role || "anonymous";
    if (currentRole === "anonymous") {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (!allowedRoles.includes(currentRole)) {
      return res.status(403).json({ message: "Forbidden for this role" });
    }
    return next();
  };
}

module.exports = { withAuthContext, requireRole };

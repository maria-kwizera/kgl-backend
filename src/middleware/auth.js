const jwt = require("jsonwebtoken");

function getToken(req) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return null;
  const [scheme, token] = authHeader.split(" ");
  if (!scheme || scheme.toLowerCase() !== "bearer") return null;
  return token || null;
}

function withAuthContext(req, res, next) {
  const token = getToken(req);
  if (!token) {
    req.auth = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "dev_jwt_secret_change_me");
    req.auth = decoded;
    return next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized", detail: err.message });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.auth) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (roles.length && !roles.includes(req.auth.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    return next();
  };
}

module.exports = { withAuthContext, requireRole };

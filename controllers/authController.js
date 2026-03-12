const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

async function login(req, res) {
  const { username, password } = req.body || {};
  const cleanUsername = String(username || "").trim().toLowerCase();
  const cleanPassword = String(password || "").trim();
  if (!cleanUsername || !cleanPassword) {
    return res.status(400).json({ message: "username and password are required" });
  }

  const user = await User.findOne({ username: cleanUsername, isActive: true }).lean();
  if (!user || !user.passwordHash) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const ok = await bcrypt.compare(cleanPassword, user.passwordHash);
  if (!ok) return res.status(401).json({ message: "Invalid credentials" });

  const secret = process.env.JWT_SECRET || "dev_jwt_secret_change_me";
  const token = jwt.sign(
    { sub: String(user._id), username: user.username, role: user.role, fullName: user.fullName },
    secret,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );

  return res.json({
    user: {
      username: user.username,
      role: user.role,
      fullName: user.fullName,
      token
    },
    token
  });
}

module.exports = { login };

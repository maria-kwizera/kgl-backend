const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { DEMO_USERS } = require("../constants");

async function ensureDefaultUsers() {
  const total = await User.countDocuments({});
  if (total > 0) return;

  const docs = await Promise.all(
    DEMO_USERS.map(async (u) => ({
      username: String(u.username || "").trim().toLowerCase(),
      fullName: u.fullName,
      role: u.role,
      passwordHash: await bcrypt.hash(String(u.password || ""), 10),
      isActive: true
    }))
  );

  await User.insertMany(docs);
}

module.exports = { ensureDefaultUsers };

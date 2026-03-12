function isAlphaNum(v, min = 2) {
  return typeof v === "string" && /^[a-zA-Z0-9\s.-]+$/.test(v.trim()) && v.trim().length >= min;
}

function isAlphabetic(v, min = 2) {
  return typeof v === "string" && /^[a-zA-Z\s]+$/.test(v.trim()) && v.trim().length >= min;
}

function isPhone(v) {
  return /^(\+256|0)\d{9}$/.test(String(v || "").trim());
}

function isNin(v) {
  return /^[A-Z]{2}\d{12}[A-Z0-9]{2}$/.test(String(v || "").trim().toUpperCase());
}

function isMoney(v, minDigits = 5) {
  const s = String(v || "").trim();
  return /^\d+$/.test(s) && s.length >= minDigits;
}

function isTonnage(v) {
  const s = String(v || "").trim();
  return /^\d+$/.test(s) && s.length >= 3;
}

function required(v) {
  return String(v || "").trim().length > 0;
}

module.exports = {
  isAlphaNum,
  isAlphabetic,
  isPhone,
  isNin,
  isMoney,
  isTonnage,
  required
};

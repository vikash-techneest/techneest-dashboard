const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const getAccessTokenSecret = () => {
  return process.env.JWT_SECRET || "techneest_fallback_dev_secret_change_in_prod";
};

const getRefreshTokenSecret = () => {
  return (
    process.env.JWT_REFRESH_SECRET ||
    `${getAccessTokenSecret()}_refresh_secret`
  );
};

const generateAccessToken = (payload) => {
  const expiresIn = process.env.JWT_ACCESS_EXPIRES_IN || "15m";
  return jwt.sign(payload, getAccessTokenSecret(), { expiresIn });
};

const generateRefreshToken = (payload, rememberMe = false) => {
  const expiresIn = rememberMe
    ? process.env.JWT_REFRESH_REMEMBER_EXPIRES_IN || "30d"
    : process.env.JWT_REFRESH_EXPIRES_IN || "7d";
  return jwt.sign(payload, getRefreshTokenSecret(), { expiresIn });
};

const verifyAccessToken = (token) => {
  return jwt.verify(token, getAccessTokenSecret());
};

const verifyRefreshToken = (token) => {
  return jwt.verify(token, getRefreshTokenSecret());
};

const hashToken = (token) => {
  return crypto.createHash("sha256").update(String(token)).digest("hex");
};

const generateRandomToken = (bytes = 32) => {
  const rawToken = crypto.randomBytes(bytes).toString("hex");
  const hashedToken = hashToken(rawToken);
  return { rawToken, hashedToken };
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  hashToken,
  generateRandomToken,
};

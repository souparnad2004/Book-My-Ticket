import jwt from "jsonwebtoken"
import crypto from "crypto"

const generateAccessToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
        expiresIn: "15m"
    })
}

const verifyAccessToken = (token) => {
    return jwt.verify(token, process.env.JWT_ACCESS_SECRET)
}

const generateRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn:"7d",
  });
};

const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
};

const generateResetToken = () => {
    const rawToken = crypto.randomBytes(32).toString("hex");

    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

    return {rawToken, hashedToken};
}

export {
  generateResetToken,
  verifyAccessToken,
  verifyRefreshToken,
  generateAccessToken,
  generateRefreshToken,
};

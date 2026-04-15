import ApiError from "../../common/utils/api-error.js";
import { getPool} from "../../common/config/db.js";
import bcrypt from "bcrypt";
import crypto from "crypto";

import {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  generateResetToken,
} from "../../common/utils/jwt.utils.js";

const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

const register = async ({ email, password, name, role }) => {
  const existing = await getPool().query(`SELECT * FROM users WHERE email = $1`, [
    email,
  ]);
  if (existing.rowCount > 0) throw ApiError.conflict("Email already exists");

  const { rawToken, hashedToken } = generateResetToken();

  const hashedPassword = await bcrypt.hash(password, 10);

  //email verification send

  const result = await getPool().query(
    `INSERT INTO users (name, email, password, role, verification_token) 
     VALUES ($1, $2, $3, $4, $5) 
     RETURNING id, name, email, role`,
    [name, email, hashedPassword, role, hashedToken],
  );

  return result.rows[0];
};

const login = async ({ email, password }) => {
  const result = await getPool().query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);

  if (result.rowCount === 0) {
    throw ApiError.unauthorized("User doesn't exists");
  }

  const user = result.rows[0];

  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    throw ApiError.badRequest("Wrong password");
  }

  const accessToken = generateAccessToken({ id: user.id, role: user.role });
  const refreshToken = generateRefreshToken({ id: user.id });

  await getPool().query("UPDATE users SET refresh_token = $1 WHERE id = $2", [
    hashToken(refreshToken),
    user.id,
  ]);

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    accessToken,
    refreshToken,
  };
};

const refresh = async (token) => {
  if(!token) throw ApiError.unauthorized("Refresh token missing");

  const decoded = verifyRefreshToken(token);

  const result = await getPool().query("SELECT * FROM users WHERE id=$1", [
    decoded.id,
  ]);

  if (result.rowCount === 0)
    throw ApiError.unauthorized("User no longer exists");

  const user = result.rows[0];

  if (user.refresh_token !== hashToken(token)) {
    throw ApiError.unauthorized("Invalid refresh token");
  }
  const accessToken = generateAccessToken({ id: user.id, role: user.role });

  return {accessToken};

};

const logout = async (userId) => {
  await getPool().query("UPDATE users SET refresh_token = NULL WHERE id = $1", [
    userId,
  ]);

  return { message: "Logged out successfully" };
};

const getme = async (userId) => {
  const result = await getPool().query("SELECT * FROM users WHERE id = $1", [
    userId,
  ]);

  if (result.rowCount === 0) throw ApiError.notFound("User not found");

  const user = result.rows[0];

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  };
};

export { register, login, refresh, logout, getme };

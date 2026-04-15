import { getPool } from "../../common/config/db.js";
import ApiError from "../../common/utils/api-error.js";
import { verifyAccessToken } from "../../common/utils/jwt.utils.js";

const authenticate = async(req, res, next) => {
    let token;

    if(req.headers.authorization?.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    }

    if(!token) throw ApiError.unauthorized("Not authenticated");

    const decoded = verifyAccessToken(token);
    const result = await getPool().query("SELECT * FROM users WHERE id = $1", [decoded.id])
    if(result.rowCount === 0)  throw ApiError.unauthorized("User no longer exists");

    const user = result.rows[0];

    req.user = {
        id: user.id,
        role: user.role,
        name: user.name,
        email: user.email
    }
    next();
};

export {authenticate};
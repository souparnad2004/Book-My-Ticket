import * as authService from "./auth.service.js";
import ApiResponse from "../../common/utils/api-response.js";


const register = async(req, res) => {
    const user = await authService.register(req.body);
    ApiResponse.created(res, "Registerd Successfully", user);
}

const login = async(req, res) => {
    const {user, accessToken, refreshToken} = await authService.login(req.body);
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    })

    ApiResponse.ok(res, "Login successful", {user, accessToken})
}

const refreshToken = async (req, res) => {
  const token = req.cookies?.refreshToken;
  const { accessToken } = await authService.refresh(token);
  ApiResponse.ok(res, "Token refreshed", { accessToken });
};

const getme = async (req, res) => {
  const user = await authService.getme(req.user.id);
  ApiResponse.ok(res, "User profile", user);
};

const logout = async (req, res) => {
  await authService.logout(req.user.id);
  res.clearCookie("refreshToken");
  ApiResponse.ok(res, "Logged out successfully");
};

export {register, login, getme, logout, refreshToken};
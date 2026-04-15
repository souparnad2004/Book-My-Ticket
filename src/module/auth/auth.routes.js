import { Router } from "express";
import * as authController from "./auth.controller.js"
import { authenticate } from "./auth.middleware.js";

const router = Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/refresh", authController.refreshToken)
router.get("/getme", authenticate, authController.getme)
router.post("/logout", authenticate, authController.logout)

export default router;
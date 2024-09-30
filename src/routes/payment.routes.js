import { Router } from "express";
import { payment, verify } from "../controllers/payment.controllers.js";

const router = Router();

//joinus
router.route("/donate").post(payment);
//verify
router.route("/verify").post(verify);
export default router;

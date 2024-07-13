import { Router } from "express";
import { joinus, verify } from "../controllers/payment.controllers.js";

const router = Router();

//joinus
router.route("/join-us").post(joinus);
//verify
router.route("/verify").post(verify);
export default router;

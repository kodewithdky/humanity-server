import { Router } from "express";
import { joinus } from "../controllers/joinus.controllers.js";

const router = Router();

//joinus
router.route("/join-us").post(joinus);

export default router;

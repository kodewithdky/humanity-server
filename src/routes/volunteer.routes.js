import { Router } from "express";
import { resgisterAsVolunteer } from "../controllers/volunteer.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

//express router
const router = Router();
//reoutes
//register as volunteer
router.route("/re-as-volunteer").post(verifyJWT,resgisterAsVolunteer);

export default router;

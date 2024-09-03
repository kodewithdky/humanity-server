import { Router } from "express";
import { resgisterAsVolunteer } from "../controllers/volunteer.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";

//express router
const router = Router();
//reoutes
//register as volunteer
router.route("/re-as-volunteer").post(
   upload.fields([
      {
         name: "avatar",
         maxCount: 1,
      },
   ]),
   resgisterAsVolunteer
);

export default router;

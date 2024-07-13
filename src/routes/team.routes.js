import { Router } from "express";
import { isAdmin, verifyJWT } from "../middlewares/auth.middleware.js";
import {
   addTeam,
   deleteTeam,
   getAllTeam,
} from "../controllers/team.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";

//express router
const router = Router();
//reoutes
//add program
router.route("/add").post(
   upload.fields([
      {
         name: "avatar",
         maxCount: 1,
      },
   ]),
   verifyJWT,
   isAdmin,
   addTeam
);
//get program
router.route("/get").get(getAllTeam);
//delete program
router.route("/delete/:id").delete(verifyJWT, isAdmin, deleteTeam);

export default router;

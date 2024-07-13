import { Router } from "express";
import { isAdmin, verifyJWT } from "../middlewares/auth.middleware.js";
import {
   addProgram,
   deleteProgram,
   getAllProgram,
} from "../controllers/program.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";

//express router
const router = Router();
//reoutes
//add program
router.route("/add").post(
   upload.fields([
      {
         name: "coverImage",
         maxCount: 1,
      },
   ]),
   verifyJWT,
   isAdmin,
   addProgram
);
//get program
router.route("/get").get(getAllProgram);
//delete program
router.route("/delete/:id").delete(verifyJWT, isAdmin, deleteProgram);

export default router;

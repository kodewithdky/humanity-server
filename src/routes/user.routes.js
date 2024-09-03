import { Router } from "express";
import {
   changeUserPassword,
   getUser,
   updateAccountDetails,
} from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
//express router
const router = Router();
//routes
//change password
router.route("/change-password").put(verifyJWT, changeUserPassword);
//update account details
router.route("/update-acc-details").put(
   upload.fields([
      {
         name: "avatar",
         maxCount: 1,
      },
   ]),
   verifyJWT,
   updateAccountDetails
);
//get user
router.route("/get-user").get(verifyJWT, getUser);
//delete avatar

export default router;

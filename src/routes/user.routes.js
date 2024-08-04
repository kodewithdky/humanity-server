import { Router } from "express";
import {
   addAvatar,
   changeUserPassword,
   deleteAvatar,
   getUser,
   updateAccountDetails,
   updateAvatar,
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
//aad avater
router.route("/add-avatar").post(
   upload.fields([
      {
         name: "avatar",
         maxCount: 1,
      },
   ]),
   verifyJWT,
   addAvatar
);
//update avater
router.route("/update-avatar").put(
   upload.fields([
      {
         name: "avatar",
         maxCount: 1,
      },
   ]),
   verifyJWT,
   updateAvatar
);
//get user
router.route("/get-user").get(verifyJWT, getUser);
//delete avatar
router.route("/delete-avatar").delete(verifyJWT, deleteAvatar);

export default router;

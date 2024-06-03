import { Router } from "express";
import {
   addAvatar,
   addCoverImage,
   changeUserPassword,
   deleteAvatar,
   deleteCoverImage,
   updateAccountDetails,
   updateCoverImage,
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
router.route("/update-acc-details").put(verifyJWT, updateAccountDetails);
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
//aad cover image
router.route("/add-cover-image").post(
   upload.fields([
      {
         name: "coverImage",
         maxCount: 1,
      },
   ]),
   verifyJWT,
   addCoverImage
);
//delete avatar
router.route("/delete-avatar").delete(verifyJWT, deleteAvatar);
//delete cover image
router.route("/delete-cover-image").delete(verifyJWT, deleteCoverImage);
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
//update cover image
router.route("/update-cover-image").put(
   upload.fields([
      {
         name: "coverImage",
         maxCount: 1,
      },
   ]),
   verifyJWT,
   updateCoverImage
);

export default router;

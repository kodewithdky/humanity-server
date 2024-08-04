import { Router } from "express";
import {
   changePrivlage,
   deleteUser,
   deleteVolunteer,
   exportExcel,
   getPayments,
   getUsers,
   getVolunteers,
   updateVolunteerDetails,
} from "../controllers/admin.controllers.js";
import { isAdmin, verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
//express router
const router = Router();
//routes
//get users
router.route("/get-users").get(verifyJWT, isAdmin, getUsers);
//get volunteer
router.route("/get-volunteers").get(verifyJWT, isAdmin, getVolunteers);
//update volunteer details
router.route("/update-volunteer-details/:id").put(
   upload.fields([
      {
         name: "avatar",
         maxCount: 1,
      },
   ]),
   verifyJWT,
   isAdmin,
   updateVolunteerDetails
);
//get payments
router.route("/get-payments").get(verifyJWT, isAdmin, getPayments);
// delete user
router.route("/delete-user/:id").delete(verifyJWT, isAdmin, deleteUser);
// delete user with volunteer
router
   .route("/delete-user-volunteer/:id")
   .delete(verifyJWT, isAdmin, deleteVolunteer);
//change user privilage
router.route("/change-privilage/:id").put(verifyJWT, isAdmin, changePrivlage);
//export excel
router.route("/export-user").get(verifyJWT, isAdmin, exportExcel);

export default router;

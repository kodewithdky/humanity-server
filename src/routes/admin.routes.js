import { Router } from "express";
import {
   changePrivlage,
   deleteUser,
   exportExcel,
   getUsers,
   getVolunteerDetails,
   getVolunteers,
} from "../controllers/admin.controllers.js";
import { isAdmin, verifyJWT } from "../middlewares/auth.middleware.js";
//express router
const router = Router();
//routes
//get users
router.route("/get-users").get(verifyJWT, isAdmin, getUsers);
//get volunteer
router.route("/get-volunteers").get(verifyJWT, isAdmin, getVolunteers);
//get volunteer details
router
   .route("/get-volunteer-details/:id")
   .get(verifyJWT, isAdmin, getVolunteerDetails);
// delete user
router.route("/delete-user/:id").delete(verifyJWT, isAdmin, deleteUser);
//change user privilage
router.route("/change-privilage/:id").post(verifyJWT, isAdmin, changePrivlage);
//export excel
router.route("/export-user").get(verifyJWT, isAdmin, exportExcel);

export default router;

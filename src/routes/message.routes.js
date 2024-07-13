import { Router } from "express";
import { isAdmin, verifyJWT } from "../middlewares/auth.middleware.js";
import {
   deleteMessage,
   getMessages,
   sendMessage,
} from "../controllers/message.controllers.js";

//express router
const router = Router();
//reoutes
//send message
router.route("/send").post(sendMessage);
//get message
router.route("/get").get(verifyJWT, isAdmin, getMessages);
//delete message
router.route("/delete/:id").delete(verifyJWT, isAdmin, deleteMessage);

export default router;

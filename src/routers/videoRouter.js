import express from "express";
//import {upload, watch, getEdit, postEdit, getUpload, postUpload, deleteVideo} from "../controllers/videoController";
import {watch, getEdit, postEdit, getUpload, postUpload, deleteVideo} from "../controllers/videoController";
import {protectorMiddleware, videoUpload} from "./../middlewares"

const videoRouter = express.Router();

//videoRouter.get("/upload", upload); // parameter url 보다 앞에 써야함
videoRouter.get("/:id([0-9a-f]{24})", watch);
videoRouter.route("/:id([0-9a-f]{24})/edit").all(protectorMiddleware).get(getEdit).post(postEdit);
//videoRouter.get("/:id(\\d+)/edit", getEdit);
//videoRouter.post("/:id(\\d+)/edit", postEdit);
videoRouter.all(protectorMiddleware).get("/:id([0-9a-f]{24})/delete", deleteVideo);
videoRouter.route("/upload").all(protectorMiddleware).get(getUpload).post(videoUpload.single("video"), postUpload);
// videoRouter.get("/upload", getUpload);
// videoRouter.post("/upload", postUpload);

export default videoRouter;
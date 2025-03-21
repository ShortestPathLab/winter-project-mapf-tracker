import { Router, Application } from "express";
import * as request from "../controllers/request";
import passport from "passport";
import { authenticate } from "auth";
import { requests } from "models";

export default (app: Application) => {
  const router = Router();
  router.get("/", authenticate, request.findAll);
  router.use(
    "/basic",
    passport.authenticate("jwt", { session: false }),
    requests.basic()
  );
  router.get("/key/:key", request.findByKey);
  router.get("/id/:id", request.findByInstance_id);
  router.post("/create", request.create);
  router.post("/update/:id", request.updateRequest);
  router.post(
    "/updateElevated/:id",
    authenticate,
    request.updateRequestElevated
  );
  router.get("/email/:email", request.findByEmail);
  app.use("/api/request", router);
};

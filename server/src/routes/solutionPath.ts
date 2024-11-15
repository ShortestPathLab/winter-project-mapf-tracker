import { Router, Application } from "express";
import * as solution_path from "../controllers/solutionPath";

export default (app: Application) => {
  const router = Router();
  router.get("/:id", solution_path.find_path);
  app.use("/api/solution_path", router);
};

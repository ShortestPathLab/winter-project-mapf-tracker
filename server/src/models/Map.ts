import { model as createModel } from "mongoose";
import { createSchema } from "./createSchema";

const schema = createSchema({
  map_name: String,
  map_size: String,
  map_type: String,
  scens: Number,
  instances: Number,
  instances_closed: Number,
  instances_solved: Number,
});

export const model = createModel("map", schema);
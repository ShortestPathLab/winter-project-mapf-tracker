import { Schema, model as createModel } from "mongoose";
import { createSchema } from "./createSchema";

const schema = createSchema(
  {
    algo_name: String,
    authors: String,
    papers: String,
    github: String,
    comments: String,
    user_id: { type: Schema.Types.ObjectId, ref: "user" },
    best_lower: Number,
    best_solution: Number,
    instances_closed: Number,
    instances_solved: Number,
  },
  {
    versionKey: false,
  }
);

export const model = createModel("algorithm", schema);
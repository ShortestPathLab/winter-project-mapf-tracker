import { Map } from "models";
import { PipelineStage } from "../pipeline";

/**
 * Updates the maps collection with the number of instances, instances closed,
 * and instances solved for each map. This should be run after the scenarios have been modified.
 *
 * @returns The aggregation pipeline to update the maps collection.
 */

export const updateMapsFromScenarios = () =>
  Map.aggregate([
    {
      $lookup: {
        from: "scenarios",
        localField: "_id",
        foreignField: "map_id",
        as: "scenarios",
      },
    },
    {
      $addFields: {
        scens: { $size: "$scenarios" },
        instances: { $sum: "$scenarios.instances" },
        instances_closed: { $sum: "$scenarios.instances_closed" },
        instances_solved: { $sum: "$scenarios.instances_solved" },
      },
    },
    {
      $addFields: {
        proportion_instances_closed: {
          $cond: {
            if: { $eq: ["$instances", 0] },
            then: 0,
            else: { $divide: ["$instances_closed", "$instances"] },
          },
        },
        proportion_instances_solved: {
          $cond: {
            if: { $eq: ["$instances", 0] },
            then: 0,
            else: { $divide: ["$instances_solved", "$instances"] },
          },
        },
      },
    },
    {
      $project: {
        scenarios: 0,
      },
    },
    {
      $merge: {
        into: "maps",
        whenMatched: "merge",
        whenNotMatched: "fail",
      },
    },
  ]);

export const stage: PipelineStage = {
  key: "updateMapsFromScenarios",
  run: async () => ({ result: await updateMapsFromScenarios() }),
  dependents: [],
};

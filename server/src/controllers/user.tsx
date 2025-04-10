import { RequestHandler } from "express";
import { mail } from "mail";
import { Types } from "mongoose";

import { render } from "@react-email/components";
import { randomBytes } from "crypto";
import { addMonths, format } from "date-fns";
import ReviewOutcome from "emails/ReviewOutcome";
import { log } from "logging";
import {
  Algorithm,
  Instance,
  Map,
  Request,
  Scenario,
  SolutionPath,
  Submission,
  SubmissionKey,
} from "models";
import React from "react";
import z from "zod";

const titles = {
  approved: "Your submission (API) key for MAPF Tracker",
  "not-reviewed": "Your submission request status for MAPF Tracker",
  rejected: "Your submission request for MAPF Tracker was rejected",
};

async function queueMail({
  apiKey,
  requesterEmail,
  requesterName,
  status,
  comments,
}: {
  apiKey: string;
  requestId: string;
  requesterEmail: string;
  requesterName: string;
  status: "approved" | "not-reviewed" | "rejected";
  comments?: string;
}) {
  log.info("Preparing mail", { apiKey, requesterEmail });
  mail(
    "noreply@pathfinding.ai",
    requesterEmail,
    titles[status],
    await render(
      <ReviewOutcome
        apiKey={apiKey}
        status={status}
        name={requesterName}
        comments={comments}
      />,
      { pretty: true }
    )
  );
}

export const createKeyAndSendMail: RequestHandler<
  unknown,
  unknown,
  { requestId: string }
> = async (req, res) => {
  const { requestId } = z.object({ requestId: z.string() }).parse(req.body);
  const {
    requesterEmail,
    requesterName,
    reviewStatus: { comments, status },
  } = await Request.findById(requestId);
  const apiKey = await createSubmissionKey(requestId);
  log.info("Sending mail");
  await queueMail({
    apiKey,
    requestId,
    requesterEmail,
    requesterName,
    comments,
    status,
  });
  res.json({ success: true });
};

export const sendMail: RequestHandler<
  unknown,
  unknown,
  {
    requestId: string;
    requesterEmail: string;
    status: "approved" | "not-reviewed" | "rejected";
    comments?: string;
  }
> = (req, res) => {
  // /**/;
  // const request_email = req.body.requesterEmail;
  // const request_name = req.body.requesterName;
  // const { status, comments } = req.body;
  // let subjectText = `Dear ${request_name},\n\nHope this email finds you well. Our team has reviewed your request and here is your request status:\n\nStatus: ${startCase(status)}\nComments: ${comments}`;
  // if (status === "approved") {
  //   const apiKey = req.body;
  //   subjectText += `\n\nYour API key is: ${apiKey}`;
  // } else {
  //   subjectText += `\n\nUnfortunately, your request was not approved. Please review the comments and submit your request again with the correct information.`;
  // }
  // mail(
  //   "noreply@pathfinding.ai",
  //   request_email,
  //   "Submission Request Status",
  //   subjectText
  // );
};

export const findSubmittedAlgoByID: RequestHandler = (req, res) => {
  const { id } = req.params;
  Algorithm.find({ user_id: id }, {})
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials.",
      });
    });
};

export const updateAlgoByID: RequestHandler = (req, res) => {
  if (!req.body) {
    return res.status(400).send({
      message: "Data to update can not be empty!",
    });
  }

  const { id } = req.params;
  Algorithm.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
    .then((data) => {
      if (!data) {
        res.status(404).send({
          message: `Cannot update Algorithm with id=${id}. Maybe  Algorithm was not found!`,
        });
      } else res.send({ message: " Algorithm was updated successfully." });
    })
    .catch((err) => {
      res.status(500).send({
        message: `Error updating  Algorithm with id=${id}`,
      });
    });
};

export const checkAlgoExist: RequestHandler = (req, res) => {
  /**/ /**/ if (!req.body) {
    return res.status(400).send({
      message: "Data to update can not be empty!",
    });
  }
  /**/ const { id } = req.params;
  if (id === "-1") {
    Algorithm.findOne({ algo_name: req.body.algo_name })
      .then((data) => {
        if (data === null) {
          res.status(200).send({
            message: "valid name",
          });
        } else {
          res.status(404).send({
            message: `Cannot update Algorithm with id=${id}. Maybe  Algorithm was not found!`,
          });
        }
      })
      .catch((err) => {
        /**/ res.status(500).send({
          message: err,
        });
      });
  } else {
    Algorithm.findOne({ _id: { $ne: id }, algo_name: req.body.algo_name })
      .then((data) => {
        if (data === null) {
          res.status(200).send({
            message: "valid name",
          });
        } else {
          res.status(404).send({
            message: `Cannot update Algorithm with id=${id}. Maybe  Algorithm was not found!`,
          });
        }
      })
      .catch((err) => {
        /**/ res.status(500).send({
          message: err,
        });
      });
  }
};

export const createAlgo: RequestHandler = (req, res) => {
  if (!req.body.algo_name) {
    res.status(400).send({ message: "Content can not be empty!" });
    return;
  }
  const algo = new Algorithm({
    algo_name: req.body.algo_name,
    authors: req.body.authors,
    papers: req.body.papers,
    github: req.body.github,
    comments: req.body.comments,
    user_id: req.body.user_id,
    best_lower: 0,
    best_solution: 0,
    instances_closed: 0,
  });
  algo
    .save()
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Algorithm.",
      });
    });
};

export const getMapSubmittedInfo: RequestHandler = (req, res) => {
  const id = new Types.ObjectId(req.params.id);
  const query1 = Map.find({}).catch((err) => {
    res.status(500).send({
      message:
        err.message || "Some error occurred while creating the Algorithm.",
    });
  });

  const query2 = Submission.aggregate([
    { $match: { algo_id: id, best_lower: true } },
    {
      $group: {
        _id: { map_id: "$map_id" },
        count: { $count: {} },
      },
    },
  ]).catch((err) => {
    res.status(500).send({
      message:
        err.message || "Some error occurred while creating the Algorithm.",
    });
  });

  const query3 = Submission.aggregate([
    { $match: { algo_id: id, best_solution: true } },
    {
      $group: {
        _id: { map_id: "$map_id" },
        count: { $count: {} },
      },
    },
  ]).catch((err) => {
    res.status(500).send({
      message:
        err.message || "Some error occurred while creating the Algorithm.",
    });
  });

  const query4 = Submission.aggregate([
    { $match: { algo_id: id, $expr: { $ne: ["$solution_cost", null] } } },
    {
      $group: {
        _id: { map_id: "$map_id" },
        count: { $count: {} },
      },
    },
  ]).catch((err) => {
    res.status(500).send({
      message:
        err.message || "Some error occurred while creating the Algorithm.",
    });
  });

  const query5 = Submission.aggregate([
    {
      $match: {
        algo_id: id,
        $expr: { $eq: ["$lower_cost", "$solution_cost"] },
      },
    },
    {
      $group: {
        _id: { map_id: "$map_id" },
        count: { $count: {} },
      },
    },
  ]).catch((err) => {
    res.status(500).send({
      message:
        err.message || "Some error occurred while creating the Algorithm.",
    });
  });
  Promise.all([query1, query2, query3, query4, query5])
    .then((result) => {
      const map_info = {};
      const [r0, r1, r2, r3, r4] = result;
      if (!(r0 && r1 && r2 && r3 && r4)) return;
      r0.forEach((element) => {
        map_info[element.id] = {};
        map_info[element.id].map_name = element.map_name;
        map_info[element.id].map_size = element.map_size;
        map_info[element.id].map_type = element.map_type;
        map_info[element.id].scens = element.scens;
        map_info[element.id].instances = element.instances;
        map_info[element.id].best_solution = 0;
        map_info[element.id].best_lower = 0;
        map_info[element.id].closed = 0;
        map_info[element.id].solved = 0;
      });
      r1.forEach((element) => {
        map_info[element._id.map_id].best_lower = element.count;
      });
      r2.forEach((element) => {
        map_info[element._id.map_id].best_solution = element.count;
      });
      r3.forEach((element) => {
        map_info[element._id.map_id].solved = element.count;
      });
      r4.forEach((element) => {
        map_info[element._id.map_id].closed = element.count;
      });
      const final_results = [];
      for (const key in map_info) {
        final_results.push(map_info[key]);
      }
      res.send(final_results);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred.",
      });
    });
};

export const submitData = async (req, res) => {
  const algo_id = new Types.ObjectId(req.params.id);
  if (!req.body) {
    res.status(400).send({ message: "Content can not be empty!" });
    return;
  }
  const algo = await Algorithm.findOne({ _id: algo_id }).catch((err) => {
    res.status(400).send({
      message: err.message || "Some error occurred while finding algorithm.",
    });
  });
  if (!algo) {
    res.status(400).send({ message: "Error: algorithm not found" });
    return;
  }
  const { algo_name } = algo;
  const map = await Map.findOne({ map_name: req.body[0].map_name }).catch(
    (err) => {
      res.status(400).send({
        message: err.message || "Some error occurred while finding map.",
      });
    }
  );
  if (!map) {
    res.status(400).send({ message: "Error: map not found" });
    return;
  }
  const map_id = map._id;
  for (const index in req.body) {
    const scen = await Scenario.findOne({
      map_id,
      scen_type: req.body[index].scen_type,
      type_id: parseInt(req.body[index].type_id),
    }).catch((err) => {
      res.status(400).send({
        message: err.message || "Some error occurred while finding scenario.",
      });
    });
    if (!scen) {
      res.status(400).send({ message: "Error: scenario not found" });
      return;
    }
    const scen_id = scen._id;
    const curr_instance = await Instance.findOne({
      map_id,
      scen_id,
      agents: parseInt(req.body[index].agents),
    }).catch((err) => {
      res.status(400).send({
        message: err.message || "Some error occurred while finding instance.",
      });
    });
    if (!curr_instance) {
      res.status(400).send({ message: "Error: instance not found" });
      return;
    }
    const instance_id = curr_instance._id;
    const curr_submission = {
      map_id,
      instance_id,
      algo_id,
      lower_cost:
        req.body[index].lower_cost === ""
          ? null
          : parseInt(req.body[index].lower_cost),
      solution_cost:
        req.body[index].solution_cost === ""
          ? null
          : parseInt(req.body[index].solution_cost),
      best_lower: false,
      best_solution: false,
      date: format(new Date(), "YYYY-MM-DD"),
      agents: parseInt(req.body[index].agents),
      scen_id,
    };
    const path = req.body[index].solution_plan;
    if (curr_submission.lower_cost !== null) {
      if (curr_instance.lower_cost !== null) {
        if (curr_instance.lower_cost > curr_submission.lower_cost) {
          /**/
        }
      }
      if (curr_instance.lower_cost === null) {
        curr_submission.best_lower = true;
        curr_instance.lower_cost = curr_submission.lower_cost;
        curr_instance.lower_date = curr_submission.date;
        curr_instance.empty = false;
        curr_instance.lower_algos.push({
          algo_name,
          algo_id: curr_submission.algo_id,
          date: curr_submission.date,
        });
      } else {
        if (curr_instance.lower_cost < curr_submission.lower_cost) {
          await Submission.updateMany(
            { instance_id },
            {
              $set: {
                best_lower: false,
              },
            }
          ).catch((err) => {
            res.status(400).send({
              message:
                err.message ||
                "Some error occurred while updating lower-bound.",
            });
          });

          curr_submission.best_lower = true;
          curr_instance.lower_cost = curr_submission.lower_cost;
          curr_instance.lower_date = curr_submission.date;
          curr_instance.empty = false;
          curr_instance.lower_algos = [
            {
              algo_name,
              algo_id: curr_submission.algo_id,
              date: curr_submission.date,
            },
          ];
        } else if (curr_instance.lower_cost === curr_submission.lower_cost) {
          curr_submission.best_lower = true;
          let record_exist = false;
          let earliest_date = "2222-10-10";
          for (let i = 0; i < curr_instance.lower_algos.length; i++) {
            if (
              curr_instance.lower_algos[i].algo_id.equals(
                curr_submission.algo_id
              )
            ) {
              curr_instance.lower_algos[i].date = curr_submission.date;
              record_exist = true;
            }
            earliest_date =
              earliest_date < curr_instance.lower_algos[i].date
                ? earliest_date
                : curr_instance.lower_algos[i].date;
          }
          if (record_exist) {
            curr_instance.lower_date = earliest_date;
            curr_instance.empty = false;
          } else {
            curr_instance.lower_algos.push({
              algo_name,
              algo_id: curr_submission.algo_id,
              date: curr_submission.date,
            });
          }
        }
      }
    }

    if (curr_submission.solution_cost !== null) {
      if (curr_instance.solution_cost === null) {
        let path_id = null;
        await SolutionPath.collection
          .insertOne({ instance_id, solution_path: path })
          .then((result) => {
            path_id = result.insertedId;
          })
          .catch((err) => {
            res.status(400).send({
              message:
                err.message || "Some error occurred while updating solution.",
            });
          });
        curr_submission.best_solution = true;
        curr_instance.solution_cost = curr_submission.solution_cost;
        curr_instance.solution_date = curr_submission.date;
        curr_instance.solution_path_id = path_id;
        curr_instance.empty = false;
        curr_instance.solution_algos.push({
          algo_name,
          algo_id: curr_submission.algo_id,
          date: curr_submission.date,
        });
      } else {
        if (curr_instance.solution_cost > curr_submission.solution_cost) {
          await Submission.updateMany(
            { instance_id },
            {
              $set: {
                best_solution: false,
              },
            }
          ).catch((err) => {
            res.status(400).send({
              message:
                err.message || "Some error occurred while updating solution.",
            });
          });
          let path_id = null;
          await SolutionPath.collection
            .insertOne({ instance_id, solution_path: path })
            .then((result) => {
              path_id = result.insertedId;
            })
            .catch((err) => {
              res.status(400).send({
                message:
                  err.message || "Some error occurred while updating solution.",
              });
            });
          curr_submission.best_solution = true;
          curr_instance.solution_cost = curr_submission.solution_cost;
          curr_instance.solution_date = curr_submission.date;
          curr_instance.solution_path_id = path_id;
          curr_instance.solution_algos = [
            {
              algo_name,
              algo_id: curr_submission.algo_id,
              date: curr_submission.date,
            },
          ];
          curr_instance.empty = false;
        } else if (
          curr_instance.solution_cost === curr_submission.solution_cost
        ) {
          curr_submission.best_solution = true;
          let record_exist = false;
          let earliest_date = "2222-10-10";
          for (let i = 0; i < curr_instance.solution_algos.length; i++) {
            if (
              curr_instance.solution_algos[i].algo_id.equals(
                curr_submission.algo_id
              )
            ) {
              curr_instance.solution_algos[i].date = curr_submission.date;
              record_exist = true;
            }
            earliest_date =
              earliest_date < curr_instance.solution_algos[i].date
                ? earliest_date
                : curr_instance.solution_algos[i].date;
          }
          if (record_exist) {
            curr_instance.solution_date = earliest_date;
            curr_instance.empty = false;
          } else {
            curr_instance.solution_algos.push({
              algo_name,
              algo_id: curr_submission.algo_id,
              date: curr_submission.date,
            });
          }
        }
      }
    }

    if (
      curr_instance.lower_cost !== null &&
      curr_instance.solution_cost !== null
    ) {
      if (curr_instance.lower_cost === curr_instance.solution_cost) {
        curr_instance.closed = true;
      }
    }

    let mongo_update = await Instance.updateOne(
      { _id: instance_id },
      curr_instance
    ).catch((err) => {
      res.status(400).send({
        message: err.message || "Some error occurred while updating instance.",
      });
    });

    mongo_update = await Submission.updateOne(
      {
        map_id: curr_submission.map_id,
        instance_id: curr_submission.instance_id,
        algo_id: curr_submission.algo_id,
      },
      curr_submission,
      { upsert: true }
    ).catch((err) => {
      res.status(400).send({
        message:
          err.message || "Some error occurred while updating submission.",
      });
    });
  }
  return res.status(200).send({ message: "Update successful" });
};

export async function createSubmissionKey(requestId: string) {
  log.info("Creating API key");
  const apiKey = randomBytes(16).toString("hex");
  const creationDate = new Date();
  const expirationDate = addMonths(creationDate, 1);
  await new SubmissionKey({
    request_id: requestId,
    creationDate,
    expirationDate,
    api_key: apiKey,
  }).save();
  return apiKey;
}

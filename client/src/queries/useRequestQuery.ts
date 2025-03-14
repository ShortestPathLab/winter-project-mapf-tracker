import { useQueries, useQuery } from "@tanstack/react-query";
import { APIConfig } from "core/config";
import { map } from "lodash";
import { InferType, object, string } from "yup";
import { json } from "./query";
import { RequestWithReviewOutcome } from "./useRequestsQuery";

export type Request = InferType<typeof requestSchema> & { id?: string };

export const requestSchema = object({
  requesterName: string().required("Requester name is required."),
  requesterEmail: string()
    .email("Please enter a valid email address.")
    .required("Contact email is required."),
  requesterAffiliation: string().required("Affiliation is required."),
  googleScholar: string().url("Please enter a valid URL."),
  dblp: string().url("Please enter a valid URL."),
  justification: string(),
  algorithmName: string().required("Algorithm name is required."),
  authorName: string().required("Author name is required."),
  paperReference: string().required("Paper reference is required."),
  githubLink: string().url("Please enter a valid URL."),
  comments: string(),
});

const requestQuery = (key: string | number) => ({
  queryKey: ["submissionRequestDetails", key],
  queryFn: async () => ({
    ...(await json<Request>(`${APIConfig.apiUrl}/request/key/${key}`)),
    key,
  }),
  enabled: !!key,
});

export const useRequestData = (key: string | number) =>
  useQuery(requestQuery(key));

export const useRequestsData = (keys: string[]) =>
  useQueries({ queries: map(keys, requestQuery) });

export const requestByEmailQueryFn = (email: string) => async () =>
  await json<Pick<RequestWithReviewOutcome, "requesterEmail">[]>(
    `${APIConfig.apiUrl}/request/email/${email}`
  );

export const useRequestByEmailData = (email: string) =>
  useQuery({
    queryKey: ["submissionRequestDetails", "email", email],
    queryFn: requestByEmailQueryFn(email),
    enabled: !!email,
  });

import { createFilterOptions, Stack, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { Autocomplete, Field } from "components/Field";
import { Form, Formik, FormikConfig, FormikProps } from "formik";
import { chain, noop, once } from "lodash";
import { json } from "queries/query";
import { Request, requestSchema } from "queries/useRequestQuery";
import { ReactNode, useMemo } from "react";
import { paper } from "theme";

const defaultRequest: Request = {
  requesterName: "",
  requesterEmail: "",
  requesterAffilation: "",
  googleScholar: "",
  dblp: "",
  justification: "",
  algorithmName: "",
  authorName: "",
  paperReference: "",
  githubLink: "",
  comments: "",
};

const filterOptions = createFilterOptions({
  limit: 5,
  ignoreCase: true,
  matchFrom: "any",
  ignoreAccents: true,
});

const DISABLED_OPTION = "Keep typing to see suggestions";

const WORLD_UNIVERSITIES_API =
  "https://raw.githubusercontent.com/Hipo/university-domains-list/master/world_universities_and_domains.json";

export type SubmissionKeyRequestFormProps = Partial<FormikConfig<Request>> & {
  disabled?: boolean;
  onTouched?: () => void;
  submit?: (state: FormikProps<Request>) => ReactNode;
};

export function SubmissionKeyRequestForm({
  submit = () => <></>,
  disabled,
  onTouched,
  ...props
}: SubmissionKeyRequestFormProps) {
  const touch = useMemo(() => once(() => onTouched?.()), []);
  const { data: options = [] } = useQuery({
    queryKey: ["universities"],
    queryFn: async () =>
      chain(await json<{ name: string }[]>(WORLD_UNIVERSITIES_API))
        .map("name")
        .uniq()
        .value(),
  });
  const renderLabel = (label: ReactNode) => (
    <Typography
      variant="h6"
      sx={{
        fontSize: "1em",
        pt: 2,
        pb: 1,
        color: disabled ? "text.secondary" : "text.primary",
      }}
    >
      {label}
    </Typography>
  );

  const renderRow = (...row: ReactNode[]) => (
    <Stack direction="row" gap={2} sx={{ gap: 2, "> *": { flex: 1 } }}>
      {row}
    </Stack>
  );

  return (
    <Formik<Request>
      validationSchema={requestSchema}
      onSubmit={noop}
      initialValues={defaultRequest}
      {...props}
    >
      {(state) => (
        <Form onChangeCapture={touch}>
          <Stack gap={2}>
            {renderLabel("About you")}
            {renderRow(
              <Field<Request>
                name="requesterName"
                disabled={disabled}
                label="Name"
                placeholder="John Doe"
                required
              />,
              <Field<Request>
                name="requesterEmail"
                disabled={disabled}
                type="email"
                label="Contact email"
                placeholder="john.doe@example.com"
                required
              />
            )}
            <Field<Request, typeof Autocomplete>
              freeSolo
              disabled={disabled}
              as={Autocomplete}
              autoCompleteProps={{
                defaultValue: state.initialValues.requesterAffilation,
                freeSolo: true,
                options,
                getOptionDisabled: (o) => o === DISABLED_OPTION,
                filterOptions: (o: string[], s) =>
                  s.inputValue.length > 2
                    ? filterOptions(o, s)
                    : [DISABLED_OPTION],
                ListboxProps: { sx: paper(2) },
              }}
              name="requesterAffilation"
              getOptionDisabled={(o) => o === DISABLED_OPTION}
              filterOptions={(o: string[], s) =>
                s.inputValue.length > 2
                  ? filterOptions(o, s)
                  : [DISABLED_OPTION]
              }
              label="Affiliation"
              placeholder="Monash University"
              required
            />
            {renderLabel("About your algorithm")}
            {renderRow(
              <Field<Request>
                name="algorithmName"
                disabled={disabled}
                label="Algorithm name"
                placeholder="Constraint-based search"
                required
              />,
              <Field<Request>
                name="authorName"
                disabled={disabled}
                label="Authors"
                placeholder="John Doe, Wei Zhang, Joe Smith"
                required
              />
            )}
            <Field<Request>
              name="paperReference"
              disabled={disabled}
              label="Paper references"
              multiline
              placeholder="APA references to papers describing your algorithm, separate with a new line"
              minRows={3}
              required
            />
            <Field<Request>
              name="googleScholar"
              disabled={disabled}
              type="url"
              label="Google Scholar link"
              required
            />
            <Field<Request>
              name="dblp"
              type="url"
              label="DBLP link"
              required
              disabled={disabled}
            />
            <Field<Request>
              name="githubLink"
              disabled={disabled}
              type="url"
              label="GitHub link"
              required
            />
            {renderLabel("Other info")}
            <Field<Request>
              multiline
              disabled={disabled}
              minRows={3}
              name="justification"
              label="Justification"
              placeholder="Why would you like to submit your algorithm to our tracker?"
              required
            />
            <Field<Request>
              name="comments"
              disabled={disabled}
              label="Comments"
              fullWidth
              minRows={4}
              multiline
            />
            {submit(state)}
          </Stack>
        </Form>
      )}
    </Formik>
  );
}
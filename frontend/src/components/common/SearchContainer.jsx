import { Form, useSubmit, Link } from "react-router-dom";
import FormRow from "./FormRow";
import FormRowSelect from "./FormRowSelect";
import { useAllJobsContext } from "../pages/AllJobs";

const SearchContainer = (useContext) => {
  const { searchValues, setSearchValues } = useContext();
  const { search, jobStatus, jobType, sort } = searchValues;

  const handelResetForm = (e) => {
    e.preventDefault();
    const defaultValue = {
      search: "",
      jobStatus: "all",
      jobType: "all",
      sort: "newest",
    };
    setSearchValues(defaultValue);

    const form = e.currentTarget.closest("form");
    if (form) {
      Object.entries(defaultValue).forEach(([key, value]) => {
        const input = form.elements.namedItem(key);
        if (input) input.value = value;
      });
      submit(form);
    }
  };
  const submit = useSubmit();

  const debounce = (onChange) => {
    let timeout;
    return (e) => {
      const form = e.currentTarget.form;
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        onChange(form);
      }, 2000);
    };
  };

  return (
    <Wrapper>
      <Form className="form">
        <h5 className="form-title">search form</h5>
        <div className="form-center">
          <FormRow
            onChange={debounce((form) => {
              submit(form);
            })}
            type="search"
            name="search"
            defaultValue={search}
            placeHolder="Type job title or company…"
          />
          <FormRowSelect
            onChange={(e) => {
              submit(e.currentTarget.form);
            }}
            labelText="job status"
            name="jobStatus"
            defaultValue={jobStatus}
            list={["all", ...Object.values(JOB_STATUS)]}
          />
          <FormRowSelect
            onChange={(e) => {
              submit(e.currentTarget.form);
            }}
            labelText="job type"
            name="jobType"
            defaultValue={jobType}
            list={["all", ...Object.values(JOB_TYPE)]}
          />
          <FormRowSelect
            onChange={(e) => {
              submit(e.currentTarget.form);
            }}
            name="sort"
            labelText="sort by"
            defaultValue={sort}
            list={[...Object.values(JOB_SORT_BY)]}
          />
          <Link
            to="/dashboard/all-jobs"
            className="btn form-btn delete-btn"
            onClick={handelResetForm}
          >
            Reset Search Values
          </Link>
        </div>
      </Form>
    </Wrapper>
  );
};

export default SearchContainer;

import { Col, Row } from "react-bootstrap";
import StudentFilter from "../students/StudentFilter";
import {useRouter} from "next/router";
import {addFilterGlobal} from "../students/StudentsFilters";

/***
 * This element makes the filters for students in the email students tab
 * @param props the props contains an array filters, which contains 2 arrays, one for the general filters and one for
 * the decisions, these arrays contain te filters that are currently active
 * @returns {JSX.Element} An element for the filter column in the email students tab
 */
export default function EmailStudentsFilters(props) {

  const router = useRouter();

  const filters = props.filters[0];
  const decision = props.filters[1];

  /***
   * This function is called when pressed on the 'reset filters' button, it resets the filters to their original value,
   * which is no filters. Changing the filters is done by changing the url, the url contains all the filters. In the
   * email-students page, we will use the url to filter the students.
   */
  function resetFilters() {
    let newQuery = router.query;
    delete newQuery["filters"];
    delete newQuery["decision"];
    router.push({
      pathname: router.pathname,
      query: newQuery
    }, undefined, {shallow: true})
  }
  

  /***
   * This function adds or removes a skill from the filters. Changing the filters is done by changing the url,
   * the url contains all the filters. In the email-students page, we will use the url to filter the students.
   * @param filter the type of filter that is added or deleted: "filters" or "decision"
   * @param startItems the array that contains the filters that are active of the chosen type ("filters" or "decision")
   * @param itemName the name of the filter that is added or deleted
   * @param value true if a filter needs to be added, false if it needs to be deleted
   */
  function addFilter(filter, startItems, itemName, value) {
    let newQuery = addFilterGlobal(router.query, filter, startItems, itemName, value);
    router.push({
      pathname: router.pathname,
      query: newQuery
    }, undefined, {shallow: true})
  }


  /***
   * The HTML representation of the filters in the 'Select students' tab
   */
  return (
    <Col md="auto" className="filters fill_height scroll-overflow" >
      <Row className="title-row-filters">
        <Col>
          <h2 className="filters-title">Filters</h2>
        </Col>
        <Col />
        <Col md="auto" style={{ alignSelf: "center" }}>
          <button className="reset-filters-button" onClick={resetFilters}>
            Reset filters
          </button>
        </Col>
      </Row>

      <StudentFilter filter_id="correct-email" filter_text="Only students without correct email"
                     value={filters.includes("no-correct-email")}
                     onChange={(ev) => addFilter("filters", filters, "no-correct-email", ev.target.checked)}/>

      <Row className="filter-title">
        <Col><h3>Decision</h3></Col>
      </Row>

      <StudentFilter filter_id="yes-checkbox" filter_text="Yes" value={decision.includes("yes")}
                     onChange={(ev) => addFilter("decision", decision, "yes", ev.target.checked)}/>
      <StudentFilter filter_id="maybe-checkbox" filter_text="Maybe" value={decision.includes("maybe")}
                     onChange={(ev) => addFilter("decision", decision, "maybe", ev.target.checked)} />
      <StudentFilter filter_id="no-checkbox" filter_text="No" value={decision.includes("no")}
                     onChange={(ev) => addFilter("decision", decision, "no", ev.target.checked)} />

    </Col>
  )
}
import { Col, Row } from "react-bootstrap";
import StudentsFilter from "../select_students/StudentFilter";
import {useRouter} from "next/router";


export default function EmailStudentsFilters(props) {

  const router = useRouter();

  const filters = props.filters[0];
  const decision = props.filters[1];

  // called when pressed on "reset filters"
  function resetFilters() {
    let newQuery = router.query;
    delete newQuery["filters"];
    delete newQuery["skills"];
    router.push({
      pathname: router.pathname,
      query: newQuery
    }, undefined, {shallow: true})
  }
  
  // this function adds or removes a skill from the filters
  function addFilter(filter, startItems, itemName, value) {
    let newQuery = router.query;
    let newItems = startItems;
    if (value) {
      newItems = startItems.concat([itemName]);
    } else {
      let index = startItems.indexOf(itemName);
      if (index > -1) {
        startItems.splice(index, 1);
        newItems = startItems;
      }
    }
    newQuery[filter] = newItems.join(",");
    router.push({
      pathname: router.pathname,
      query: newQuery
    }, undefined, {shallow: true})
  }

  // The HTML representation of the filters in the 'Select students' tab
  return (
    <Col md="auto" className="filters fill_height scroll-overflow" style={{visibility: props.visibility}}>
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

      <StudentsFilter filter_id="correct-email" filter_text="Only students without correct email"
                      value={filters.includes("no-correct-email")}
                      onChange={(ev) => addFilter("filters", filters, "no-correct-email", ev.target.checked)}/>

      <Row className="filter-title">
        <Col><h3>Decision</h3></Col>
      </Row>

      <StudentsFilter filter_id="yes-checkbox" filter_text="Yes" value={decision.includes("yes")}
                      onChange={(ev) => addFilter("decision", decision, "yes", ev.target.checked)}/>
      <StudentsFilter filter_id="maybe-checkbox" filter_text="Maybe" value={decision.includes("maybe")}
                      onChange={(ev) => addFilter("decision", decision, "maybe", ev.target.checked)} />
      <StudentsFilter filter_id="no-checkbox" filter_text="No" value={decision.includes("no")}
                      onChange={(ev) => addFilter("decision", decision, "no", ev.target.checked)} />
      <StudentsFilter filter_id="undecided-checkbox" filter_text="Undecided" value={decision.includes("undecided")}
                      onChange={(ev) => addFilter("decision", decision, "undecided", ev.target.checked)} />

    </Col>
  )
}
import { useEffect, useState } from "react";
import { Col, Row } from "react-bootstrap";
import StudentsFilter from "./StudentFilter";
import {useRouter} from "next/router";
import {getJson} from "../../utils/json-requests";


export default function StudentsFilters(props) {

  const router = useRouter();

  // These constants are initialized empty, the data will be inserted in useEffect
  const [extendedRoleList, setExtendedRoleList] = useState(false);
  const [allSkills, setAllSkills] = useState([]);
  const [filtersChanged, setFiltersChanged] = useState(true);

  // These constants represent the filters
  const filters = (router.query.filters)? router.query.filters.split(","): [];
  const chosenSkills = (router.query.skills)? router.query.skills.split(","): [];
  const decision = (router.query.decision)? router.query.decision.split(","): [];

  useEffect(() => {
    if (props.students && filtersChanged) {
      setFiltersChanged(false);
      filterStudents();
    }
  })

  // get the decision for the student (yes, maybe, no or undecided)
  function getDecision(studentDecision) {
    if (studentDecision === -1) {
      return "Undecided";
    }
    let possibleDecisions = ["No", "Maybe", "Yes"];
    return possibleDecisions[studentDecision];
  }

  function filterStudents() {
    /*if (decision.length !== 0) {
      console.log(props.students);
      props.setStudents(props.students.filter(student => {

      }))
    }*/
  }

  // called when pressed on "reset filters"
  function resetFilters() {
    let newQuery = router.query;
    delete newQuery["filters"];
    delete newQuery["decision"];
    delete newQuery["skills"];
    router.push({
      pathname: router.pathname,
      query: newQuery
    }, undefined, {shallow: true})
  }

  // this function makes all the roles visible
  const showMore = () => {
    setExtendedRoleList(true);
  }

  // this function makes only 5 roles visible
  const showLess = () => {
    setExtendedRoleList(false);
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
        newItems = startItems.splice(index, 1);
      }
    }
    newQuery[filter] = newItems.join(",");
    router.push({
      pathname: router.pathname,
      query: newQuery
    }, undefined, {shallow: true})
  }

  // returns a list of html StudentFilters, which represents the skills of students, only 5 elements or the whole
  // list depending on extendedRoleList
  function getSkills() {
    if (allSkills) {
      let shownSkills = allSkills;

      if (!extendedRoleList) {
        shownSkills = allSkills.slice(0, 5);
      }

      return shownSkills.map((skill, index) =>
        <StudentsFilter filter_id={skill.id} filter_text={skill.name} onChange={(ev) => addFilter("skills", chosenSkills, skill.name, ev.target.value)}/>
      );
    }
    return null;
  }

  // returns the html representation for the 'more or less' button, the button to show more or less skills
  function moreOrLessButton() {
    if (extendedRoleList) {
      return <button className="more-or-less-button" id="less-skills-button" onClick={showLess}>Less</button>
    }
    return <button className="more-or-less-button" id="more-skills-button" onClick={showMore}>More</button>
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

      <StudentsFilter filter_id="alumni_checkbox" filter_text="Only alumni" value={filters.includes("alumn")}
                      onChange={(ev) => addFilter("filters", filters, "alumn", ev.target.value)}/>
      <StudentsFilter filter_id="student-coach-volunteers-checkbox" filter_text="Only student coach volunteers"
                      value={filters.includes("student-coach")}
                      onChange={(ev) => addFilter("filters", filters, "student-coach", ev.target.value)}/>
      <StudentsFilter filter_id="only-not-suggested-checkbox" filter_text="Only students you haven't suggested for"
                      value={filters.includes("not-suggested")}
                      onChange={(ev) => addFilter("filters", filters, "not-suggested", ev.target.value)}/>
      <StudentsFilter filter_id="unmatched-students-checkbox" filter_text="Only unmatched students"
                      value={filters.includes("unmatched")}
                      onChange={(ev) => addFilter("filters", filters, "unmatched", ev.target.value)}/>
      <StudentsFilter filter_id="practical-problems-checkbox" filter_text="Only students without practical problems"
                      value={filters.includes("practical-problems")}
                      onChange={(ev) => addFilter("filters", filters, "practical-problems", ev.target.value)}/>

      <Row className="filter-title">
        <Col><h3>Skills</h3></Col>
      </Row>
      <Row className="skills-search-filters">
        <Col>
          <input type="text" id="search-skills-filters" className="search" placeholder="Search skills" />
        </Col>
      </Row>
      {getSkills()}
      <Row>
        <Col>{moreOrLessButton()}</Col>
      </Row>

      <Row className="filter-title">
        <Col><h3>Decision</h3></Col>
      </Row>

      <StudentsFilter filter_id="yes-checkbox" filter_text="Yes"
                      onChange={(ev) => addFilter("decision", decision, "yes", ev.target.value)}/>
      <StudentsFilter filter_id="maybe-checkbox" filter_text="Maybe"
                      onChange={(ev) => addFilter("decision", decision, "maybe", ev.target.value)} />
      <StudentsFilter filter_id="no-checkbox" filter_text="No"
                      onChange={(ev) => addFilter("decision", decision, "no", ev.target.value)} />
      <StudentsFilter filter_id="undecided-checkbox" filter_text="Undecided"
                      onChange={(ev) => addFilter("decision", decision, "undecided", ev.target.value)} />

    </Col>
  )
}
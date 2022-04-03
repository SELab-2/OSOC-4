import {useEffect, useState} from "react";
import {getJson} from "../utils/json-requests";
import {getSkillsPath, getStudentsPath} from "../routes";
import {Col, Container, Row} from "react-bootstrap";

export default function StudentsFilters(props) {

  const [extendedRoleList, setExtendedRoleList] = useState(false);
  const [skills, setSkills] = useState(undefined);
  const [filters, setFilters] = useState({});

  useEffect(() => {
    if (!skills) {
      getJson(getSkillsPath()).then(res => {
        setSkills(res.data)
      })
    }
    if (filters === {}) {
      let newFilters = {};
      let url = window.location.href;

      let startindex = url.search(getStudentsPath()) + getStudentsPath().length;
      url = url.slice(startindex);
      let filterStrings = url.split("/");

      for (let filter in filterStrings) {
        filter = filter.split(":");
        let filterValue = filter[1].split(",");
        if (filterValue === ["true"]) {
          filterValue = true;
        }
        newFilters[filter[0]] = filterValue;
      }

      setFilters(newFilters);
    }
  })

  const resetFilters = () => {

  }

  const onlyAlumni = (value) => {

  }

  const onlyCoachVolunteers = (value) => {

  }

  const includeStudentsYouSuggestedFor = (value) => {

  }

  const onlyUnmatchedStudents = (value) => {

  }

  const onlyStudentsWithoutPracticalProblems = (value) => {

  }

  const decision = (decision, value) => {

  }

  const addRole = (roleId, value) => {

  }

  const showMore = () => {
    setExtendedRoleList(true);
  }

  const showLess = () => {
    setExtendedRoleList(false);
  }

  function getSkills() {
    if (skills) {
      let shownSkills = skills;

      if (! extendedRoleList) {
        shownSkills = skills.slice(0,5);
      }

      return shownSkills.map((role,index) =>
        <Row key={index}>
          <Col md="auto">
            <input id={role.id} type="checkbox" onChange={val => addRole(role.id, val.target.checked)}/>
          </Col>
          <Col>
            <label htmlFor={role.id}>{role.name}</label>
          </Col>
        </Row>
      );
    }
    return null;
  }

  function moreOrLessButton() {
    if (extendedRoleList) {
      return <button id="less-skills-button" onClick={showLess}>Less</button>
    }
    return <button id="more-skills-button" onClick={showMore}>More</button>
  }

  // The HTML representation of the filters in the 'Select students' tab
  return(
    <Container>
      <Row>
        <Col>
          <h2>Filters</h2>
        </Col>
        <Col/>
        <Col md="auto" style={{alignSelf: "center"}}>
          <button className={"reset-filters-button"} onClick={resetFilters}>
            Reset filters
          </button>
        </Col>
      </Row>

      <Row>
        <Col md="auto">
          <input id="alumni-checkbox" type="checkbox" onChange={val => onlyAlumni(val.target.checked)}/>
        </Col>
        <Col><label htmlFor="alumni-checkbox">Only alumni</label></Col>
      </Row>

      <Row>
        <Col md="auto">
          <input id="student-coach-volunteers-checkbox" type="checkbox"
                 onChange={val => onlyCoachVolunteers(val.target.checked)}/>
        </Col>
        <Col>
          <label htmlFor="student-coach-volunteers-checkbox">Only student coach volunteers</label>
        </Col>
      </Row>

      <Row>
        <Col md="auto">
          <input id="include-suggested-students-checkbox" type="checkbox"
                 onChange={val => includeStudentsYouSuggestedFor(val.target.checked)}/>
        </Col>
        <Col>
          <label htmlFor="include-suggested-students-checkbox">Only students you haven't suggested for</label>
        </Col>
      </Row>

      <Row>
        <Col md="auto">
          <input id="unmatched-students-checkbox" type="checkbox"
                 onChange={val => onlyUnmatchedStudents(val.target.checked)}/>
        </Col>
        <Col>
          <label htmlFor="unmatched-students-checkbox">Only unmatched students</label>
        </Col>
      </Row>

      <Row>
        <Col md="auto">
          <input id="practical-problems-checkbox" type="checkbox"
                 onChange={val => onlyStudentsWithoutPracticalProblems(val.target.checked)}/>
        </Col>
        <Col>
          <label htmlFor="practical-problems-checkbox">Only students without practical problems</label>
        </Col>
      </Row>

      <div id="skills-filters">
        <h3>Skills</h3>
        <input type="text" id="search-skills-filters" className="search" placeholder="Search skills"/>
        {getSkills()}
        {moreOrLessButton()}
        <br/>
      </div>

      <div id="decisions-filters">
        <h3>Decision</h3>

        <Row>
          <Col md="auto">
            <input id="yes-checkbox" type="checkbox" onChange={val => decision("yes", val.target.checked)}/>
          </Col>
          <Col>
            <label htmlFor="yes-checkbox">Yes</label>
          </Col>
        </Row>

        <Row>
          <Col md="auto">
            <input id="maybe-checkbox" type="checkbox" onChange={val => decision("maybe", val.target.checked)}/>
          </Col>
          <Col>
            <label htmlFor="maybe-checkbox">Maybe</label>
          </Col>
        </Row>

        <Row>
          <Col md="auto">
            <input id="no-checkbox" type="checkbox" onChange={val => decision("no",val.target.checked)}/>
          </Col>
          <Col>
            <label htmlFor="no-checkbox">No</label>
          </Col>
        </Row>

        <Row>
          <Col md="auto">
            <input id="undecided-checkbox" type="checkbox" onChange={val => decision("undecided", val.target.checked)}/>
          </Col>
          <Col>
            <label htmlFor="undecided-checkbox">Undecided</label>
          </Col>
        </Row>

      </div>

    </Container>

  )
}
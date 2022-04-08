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
        <Row key={index} className="filter-row">
          <Col md="auto" className="checkbox-filters">
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
      return <button className="more-or-less-button" id="less-skills-button" onClick={showLess}>Less</button>
    }
    return <button className="more-or-less-button" id="more-skills-button" onClick={showMore}>More</button>
  }

  // The HTML representation of the filters in the 'Select students' tab

  return(
    <Container>
      <Row className="title-row-filters">
        <Col>
          <h2 className="filters-title">Filters</h2>
        </Col>
        <Col/>
        <Col md="auto" style={{alignSelf: "center"}}>
          <button onClick={resetFilters}>
            Reset filters
          </button>
        </Col>
      </Row>

      <Row className="filter-row">
        <Col md="auto" className="checkbox-filters">
          <input id="alumni-checkbox" type="checkbox" onChange={val => onlyAlumni(val.target.checked)}/>
        </Col>
        <Col><label htmlFor="alumni-checkbox">Only alumni</label></Col>
      </Row>

      <Row className="filter-row">
        <Col md="auto" className="checkbox-filters">
          <input id="student-coach-volunteers-checkbox" type="checkbox"
                 onChange={val => onlyCoachVolunteers(val.target.checked)}/>
        </Col>
        <Col>
          <label htmlFor="student-coach-volunteers-checkbox">Only student coach volunteers</label>
        </Col>
      </Row>

      <Row className="filter-row">
        <Col md="auto" className="checkbox-filters">
          <input id="include-suggested-students-checkbox" type="checkbox"
                 onChange={val => includeStudentsYouSuggestedFor(val.target.checked)}/>
        </Col>
        <Col>
          <label htmlFor="include-suggested-students-checkbox">Only students you haven't suggested for</label>
        </Col>
      </Row>

      <Row className="filter-row">
        <Col md="auto" className="checkbox-filters">
          <input id="unmatched-students-checkbox" type="checkbox"
                 onChange={val => onlyUnmatchedStudents(val.target.checked)}/>
        </Col>
        <Col>
          <label htmlFor="unmatched-students-checkbox">Only unmatched students</label>
        </Col>
      </Row>

      <Row className="filter-row">
        <Col md="auto" className="checkbox-filters">
          <input id="practical-problems-checkbox" type="checkbox"
                 onChange={val => onlyStudentsWithoutPracticalProblems(val.target.checked)}/>
        </Col>
        <Col>
          <label htmlFor="practical-problems-checkbox">Only students without practical problems</label>
        </Col>
      </Row>

      <Row className="filter-title">
        <Col><h3>Skills</h3></Col>
      </Row>
      <Row className="skills-search-filters">
        <Col>
          <input type="text" id="search-skills-filters" className="search" placeholder="Search skills"/>
        </Col>
      </Row>
      {getSkills()}
      <Row>
        <Col>{moreOrLessButton()}</Col>
      </Row>

      <Row className="filter-title">
        <Col><h3>Decision</h3></Col>
      </Row>

      <Row className="filter-row">
        <Col md="auto" className="checkbox-filters">
          <input id="yes-checkbox" type="checkbox" onChange={val => decision("yes", val.target.checked)}/>
        </Col>
        <Col>
          <label htmlFor="yes-checkbox">Yes</label>
        </Col>
      </Row>

      <Row className="filter-row">
        <Col md="auto" className="checkbox-filters">
          <input id="maybe-checkbox" type="checkbox" onChange={val => decision("maybe", val.target.checked)}/>
        </Col>
        <Col>
          <label htmlFor="maybe-checkbox">Maybe</label>
        </Col>
      </Row>

      <Row className="filter-row">
        <Col md="auto" className="checkbox-filters">
          <input id="no-checkbox" type="checkbox" onChange={val => decision("no",val.target.checked)}/>
        </Col>
        <Col>
          <label htmlFor="no-checkbox">No</label>
        </Col>
      </Row>

      <Row className="filter-row">
        <Col md="auto" className="checkbox-filters">
          <input id="undecided-checkbox" type="checkbox" onChange={val => decision("undecided", val.target.checked)}/>
        </Col>
        <Col>
          <label htmlFor="undecided-checkbox">Undecided</label>
        </Col>
      </Row>



    </Container>
  )
}
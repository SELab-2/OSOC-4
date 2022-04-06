import {useEffect, useState} from "react";
import {getJson} from "../../utils/json-requests";
import {getSkillsPath, getStudentsPath} from "../../routes";
import {Col, Container, Row} from "react-bootstrap";
import StudentsFilter from "./StudentFilter";


export default function StudentsFilters(props) {

  const [extendedRoleList, setExtendedRoleList] = useState(false);
  const [skills, setSkills] = useState(undefined);
  const [filters, setFilters] = useState({});

  useEffect(() => {
    /*if (!skills) {
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
    }*/
  })

  const resetFilters = () => {

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

      return shownSkills.map((skill,index) =>
        <StudentsFilter filter_id={skill.id} filter_text={skill.name} />
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
    <Col md="auto" className="filters fill_height scroll-overflow">
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

      <StudentsFilter filter_id="alumni_checkbox" filter_text="Only alumni"/>
      <StudentsFilter filter_id="student-coach-volunteers-checkbox" filter_text="Only student coach volunteers" />
      <StudentsFilter filter_id="only-not-suggested-checkbox" filter_text="Only students you haven't suggested for" />
      <StudentsFilter filter_id="unmatched-students-checkbox" filter_text="Only unmatched students" />
      <StudentsFilter filter_id="practical-problems-checkbox" filter_text="Only students without practical problems" />

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

      <StudentsFilter filter_id="yes-checkbox" filter_text="Yes" />
      <StudentsFilter filter_id="maybe-checkbox" filter_text="Maybe" />
      <StudentsFilter filter_id="no-checkbox" filter_text="No" />
      <StudentsFilter filter_id="undecided-checkbox" filter_text="Undecided" />

    </Col>
  )
}
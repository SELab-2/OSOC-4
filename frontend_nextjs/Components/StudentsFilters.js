import {useEffect, useState} from "react";
import {getJson} from "../utils/json-requests";
import {getSkillsPath, getStudentsPath} from "../routes";

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
        <div key={index}>
          <input id={role.id} type="checkbox" onChange={val => addRole(role.id, val.target.checked)}/>
          <label htmlFor={role.id}>{role.name}</label>
          <br/>
        </div>
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
    <div id="filters" style={{textAlign: "left", width: "300px"}}>
      <div id="filters-header" style={{position: "relative", height: "50px"}}>
        <h2 style={{bottom: 0, left: 0, position: "absolute", marginBottom: 0}}>Filters</h2>
        <button className={"reset-filters-button"} style={{bottom: 0, position: "absolute", right: 0}} onClick={resetFilters}>
          Reset filters
        </button>
      </div>

      <div id="general-filters">
        <input id="alumni-checkbox" type="checkbox" onChange={val => onlyAlumni(val.target.checked)}/>
        <label htmlFor="alumni-checkbox">Only alumni</label>
        <br/>

        <input id="student-coach-volunteers-checkbox" type="checkbox"
               onChange={val => onlyCoachVolunteers(val.target.checked)}/>
        <label htmlFor="student-coach-volunteers-checkbox">Only student coach volunteers</label>
        <br/>

        <input id="include-suggested-students-checkbox" type="checkbox"
               onChange={val => includeStudentsYouSuggestedFor(val.target.checked)}/>
        <label htmlFor="include-suggested-students-checkbox">Only students you've not suggested for</label>
        <br/>

        <input id="unmatched-students-checkbox" type="checkbox"
               onChange={val => onlyUnmatchedStudents(val.target.checked)}/>
        <label htmlFor="unmatched-students-checkbox">Only unmatched students</label>
        <br/>

        <input id="practical-problems-checkbox" type="checkbox"
               onChange={val => onlyStudentsWithoutPracticalProblems(val.target.checked)}/>
        <label htmlFor="practical-problems-checkbox">Only students without practical problems</label>
        <br/><br/>
      </div>

      <div id="skills-filters">
        <h3>Skills</h3>
        <input type="text" id="search-skills-filters" className="search" placeholder="Search skills"/>
        {getSkills()}
        {moreOrLessButton()}
        <br/>
      </div>

      <div id="decisions-filters">
        <h3>Decision</h3>

        <input id="yes-checkbox" type="checkbox" onChange={val => decision("yes", val.target.checked)}/>
        <label htmlFor="yes-checkbox">Yes</label>
        <br/>

        <input id="maybe-checkbox" type="checkbox" onChange={val => decision("maybe", val.target.checked)}/>
        <label htmlFor="maybe-checkbox">Maybe</label>
        <br/>

        <input id="no-checkbox" type="checkbox" onChange={val => decision("no",val.target.checked)}/>
        <label htmlFor="no-checkbox">No</label>
        <br/>

        <input id="undecided-checkbox" type="checkbox" onChange={val => decision("undecided", val.target.checked)}/>
        <label htmlFor="undecided-checkbox">Undecided</label>
        <br/>
      </div>

    </div>
  )
}
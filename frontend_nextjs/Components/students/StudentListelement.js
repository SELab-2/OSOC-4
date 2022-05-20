import React from "react";
import GeneralInfo from "./GeneralInfo"
import { Col, Container, Row } from "react-bootstrap";
import { useRouter } from "next/router";
import SuggestionsCount from "./SuggestionsCount";
import Image from "next/image";
import Hint from "../Hint";
import alumniIcon from "../../public/assets/alumni-svgrepo-com.svg";
import studCoachIcon from "../../public/assets/student-coach.svg";

// get the decision for the student (yes, maybe, no or undecided)
export function getDecisionString(value) {
  if (value === -1) {
    return "Undecided";
  }
  let possibleDecisions = ["No", "Maybe", "Yes"];
  return possibleDecisions[value];
}

/**
 * This component represents one element in the list of students in the 'select students' tab.
 * @param props props has the field student, which is the student the element is rendered for.
 * @returns {JSX.Element} A component that renders one element in the list of students in the 'select students' tab.
 */
export default function StudentListelement(props) {

  // These constants are initialized empty, the data will be inserted in useEffect
  const router = useRouter()

  /**
   * get the list of the skills of the student in HTML format
   * @returns {unknown[]} The list of the skills of the student in HTML format
   */
  function getSkills() {
    return props.student["skills"].map((skill, index) =>
      <li className="skill" style={{ display: "inline-block" }} key={index}>{skill["name"].toUpperCase()}</li>
    )
  }

  /**
   * get the background color of the student, based on the decision
   * @returns {string} the background color of the student, based on the decision
   */
  function getBackground() {
    if (props.student.decision === -1) {
      return "white";
    }
    let colors = ["var(--no_red_20)", "var(--maybe_yellow_20)", "var(--yes_green_20)"];
    return colors[props.student.decision];
  }


  function getBorder() {
    if (!isSelected(props.student)) {
      return "var(--not-selected-gray)"
    }
    if (props.student.decision === -1) {
      return "grey";
    }
    let colors = ["var(--no_red_45)", "var(--maybe_yellow_45)", "var(--yes_green_45)"];
    return colors[props.student.decision];
  }

  /**
   * get the background color of practical problems
   * @returns {string} the background color of practical problems
   */
  function getProblemsColor() {
    let practicalProblems = 0;
    if (practicalProblems === 0) {
      return "var(--yes_green_65)"
    }
    return "var(--no_red_65)"
  }

  /**
   * a function to open the details of a student, it changes the studentId in the url.
   */
  function studentDetails() {
    let i = props.student.id.lastIndexOf('/');
    let id = props.student.id.substring(i + 1);

    let newQuery = router.query;
    newQuery["studentId"] = id;

    // the path is not changed, but there is a query added which contains the id of the student
    router.push({
      pathname: router.pathname,
      query: newQuery
    }, undefined, { shallow: true })
  }

  /**
   * a function to change the selected student
   */
  function selectStudent() {
    // if the selected student is this student then unselect the student
    if (props.elementType === "emailstudents") {
      if (isSelected(props.student)) {
        props.setSelectedStudents(prevState => prevState.filter((o, i) => o !== props.student.id))
      } else {
        props.setSelectedStudents(prevState => [...prevState, props.student.id])
      }
    } else {
      if (isSelected(props.student)) {
        props.setSelectedStudents([])
      } else {
        props.setSelectedStudents([props.student])
      }
    }
  }

  /**
   * Indicates whether a student is included in the selection.
   *
   * @param student
   * @returns boolean
   */
  function isSelected(student) {
    return props.selectedStudents.includes(student) || props.selectedStudents.includes(student.id)
  }

  /**
   * get the suggestion count for a certain decision ("yes", "maybe" or "no").
   * @param decision the decision for what the suggestions must be counted.
   * @returns {number|*} the amount of suggestions with the given decision.
   */
  function getSuggestions(decision) {
    if (!props.student["suggestions"]) {
      return 0;
    }
    return Object.values(props.student["suggestions"]).filter(suggestion => suggestion["decision"] === decision).length
  }

  /**
   * The html representation of a list-element
   */
  return (
    <Container id="list-element"
      className={"list-element" + (isSelected(props.student) ? "-selected" : "")}
      style={{ backgroundColor: getBackground(), borderColor: getBorder() }}
      onClick={() => props.elementType === "students" ? studentDetails() : selectStudent()}>
      <Row className="upper-layer">
        <Col id="name" className="name" xs="auto">
          {props.student["mandatory"]["first name"]} {props.student["mandatory"]["last name"]}
        </Col>
        <Col md="auto" className="student-listelement-icon">
          {(props.student["mandatory"]["alumni"] === "yes") &&
            <Hint message="Student claims to be an alumni">
              <Image src={alumniIcon} width="25pt" height="35pt"/>
            </Hint>
          }
        </Col>
        <Col md="auto" className="student-listelement-icon">
          {(props.student["mandatory"]["student-coach"] === "yes") &&
            <Hint message="applied to be student coach">
              <Image src={studCoachIcon} width="25px" height="35px"/>
            </Hint>
          }
        </Col>
        <Col id="practical-problems" className="practical-problems" xs="auto">
          {/* if practical problems gets implemented, this is where it should be shown */}
        </Col>
        <Col />
        <Col xs="auto" className="nopadding">
          <Row xs="auto" className="nomargin">
            <Col className="suggestions" xs="auto">Suggestions:</Col>
            <SuggestionsCount ownsuggestion={props.student["own_suggestion"]} suggestionsYes={getSuggestions(2)}
                              suggestionsMaybe={getSuggestions(1)} suggestionsNo={getSuggestions(0)} />
          </Row>
        </Col>
      </Row>

      <Row id="info" className="info">
        <GeneralInfo listelement={true} elementType={props.elementType} student={props.student}
                     decision={getDecisionString(props.student.decision)} />
        <Col />
        <Col id="skills" align="right" className="skills" sm="auto">
          <ul className="nomargin">
            {getSkills()}
          </ul>
        </Col>
      </Row>
    </Container>
  )
}
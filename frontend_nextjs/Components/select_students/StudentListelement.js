import {useEffect, useState} from "react";
import GeneralInfo from "./GeneralInfo"
import { Col, Container, Row } from "react-bootstrap";
import { useRouter } from "next/router";
import SuggestionsCount from "./SuggestionsCount";

// represents one list element card in the student list
export default function StudentListelement(props) {

  // These constants are initialized empty, the data will be inserted in useEffect
  const [decision,setDecision] = useState(-2);
  let prevDecision = -2;

  const router = useRouter()

  // This function inserts the data in the variables
  useEffect(() => {
    if (props.student["suggestions"] && (decision === -2 || prevDecision !== decision)) {
        // a decision is a suggestion which is definitive
        let decisions = props.student["suggestions"].filter(suggestion => suggestion["definitive"])
          if (decisions) {
            (decisions.length === 0)? setDecision(-1): setDecision(decisions[0]["decision"]);
            (decisions.length === 0)? prevDecision = -1: prevDecision = decisions[0]["decision"];
          }
    }
  });

  // get the decision for the student (yes, maybe, no or undecided)
  function getDecision() {
    if (decision === -1) {
      return "Undecided";
    }
    let possibleDecisions = ["No", "Maybe", "Yes"];
    return possibleDecisions[decision];
  }

  // get a list of the skills of the student in HTML format
  function getSkills() {
    let skills = [];
    return skills.map((skill,index) =>
      <li className="skill" style={{display: "inline-block"}} key={index}>{skill.toUpperCase()}</li>
    )
  }


  // get the background color of the student, based on the decision
  function getBackground() {
    if (decision === -1) {
      return "white";
    }
    let colors = ["var(--no_red_20)", "var(--maybe_yellow_20)", "var(--yes_green_20)"];
    return colors[decision];
  }

  // get the background color of practical problems
  function getProblemsColor() {
    let practicalProblems = 0;
    if (practicalProblems === 0) {
      return "var(--yes_green_65)"
    }
    return "var(--no_red_65)"
  }

  // a function to open the details of a student
  function studentDetails() {
    let i = props.student.id.lastIndexOf('/');
    let id = props.student.id.substring(i + 1);

    let newQuery = router.query;
    newQuery["studentId"] = id;

    // the path is not changed, but there is a query added wich contains the id of the student
    router.push({
      pathname: router.pathname,
      query: newQuery
    }, undefined, { shallow: true})
  }

  // get the suggestion count for a certain decision ("yes", "maybe" or "no")
  function getSuggestions(decision) {
    if (! props.student["suggestions"]) {
      return 0;
    }
    return props.student["suggestions"].filter(suggestion => ! suggestion["definitive"] && suggestion["decision"] === decision).length
  }

  // The html representation of a list-element
  return (
    <Container fluid id="list-element" className="list-element" style={{ backgroundColor: getBackground() }}
      onClick={() => studentDetails()}>
      <Row className="upper-layer">
        <Col id="name" className="name" md="auto">{props.student["first name"]} {props.student["last name"]}</Col>
        <Col id="practical-problems" style={{ backgroundColor: getProblemsColor() }} className="practical-problems" md="auto">
          No practical problems
        </Col>
        <Col />
        <Col md="auto">
          <Row md="auto" className="nomargin">
            <Col className="suggestions" md="auto">Suggestions:</Col>
            <SuggestionsCount suggestionsYes={getSuggestions(2)} suggestionsMaybe={getSuggestions(1)} suggestionsNo={getSuggestions(0)} />
          </Row>
        </Col>
      </Row>

      <Row id="info" className="info">
        <GeneralInfo student={props.student} decision={getDecision()} />
        <Col id="skills" align="right" className="skills" md="auto">
          <ul>
            {getSkills()}
          </ul>
        </Col>
      </Row>
    </Container>
  )
}
import { useEffect, useState } from "react";
import { getJson } from "../../utils/json-requests";
import GeneralInfo from "./GeneralInfo"
import { Col, Container, Row } from "react-bootstrap";
import { useRouter } from "next/router";
import SuggestionsCount from "./SuggestionsCount";

// represents one list element card in the student list
export default function StudentListelement(props) {

  // These constants are initialized empty, the data will be inserted in useEffect
  const [student, setStudent] = useState({});
  const [decision, setDecision] = useState(-1);


  const router = useRouter()

  // This function inserts the data in the variables
  useEffect(() => {
    if (!Object.keys(student).length) {
      getJson(props.student).then(res => {
        setStudent(res);
        // a decision is a suggestion which is definitive
        let decisions = res["suggestions"].filter(suggestion => suggestion["definitive"])
        if (decisions.length !== 0) {
          setDecision(decisions[0]["decision"]);
        }
      })
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
    return skills.map((skill, index) =>
      <li className="skill" style={{ display: "inline-block" }} key={index}>{skill.toUpperCase()}</li>
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
    let i = props.student.lastIndexOf('/');
    let id = props.student.substring(i + 1);

    // the path is not changed, but there is a query added wich contains the id of the student
    router.push({
      pathname: router.pathname,
      query: {
        studentId: id  // update the query param
      }
    }, undefined, { shallow: true })
  }

  // get the suggestion count for a certain decision ("yes", "maybe" or "no")
  function getSuggestions(decision) {
    if (!student["suggestions"]) {
      return 0;
    }
    return student["suggestions"].filter(suggestion => !suggestion["definitive"] && suggestion["decision"] === decision).length
  }

  // The html representation of a list-element
  return (
    <div>
      {Object.keys(student).length &&
        <Container fluid id="list-element" className="list-element" style={{ backgroundColor: getBackground() }}
          onClick={() => studentDetails()}>
          <Row className="upper-layer">

            <Col id="name" className="name" md="auto">{student["mandatory"]["first name"]} {student["mandatory"]["last name"]}</Col>

            <Col id="practical-problems" style={{ backgroundColor: getProblemsColor() }} className="practical-problems" md="auto">
              No practical problems
            </Col>
            <Col />
            <Col md="auto">
              <Row md="auto">
                <Col className="suggestions" md="auto">Suggestions:</Col>
                <SuggestionsCount suggestionsYes={getSuggestions(2)} suggestionsMaybe={getSuggestions(1)} suggestionsNo={getSuggestions(0)} />
              </Row>
            </Col>
          </Row>

          <Row id="info" className="info">
            <GeneralInfo student={student} listelement={true} decision={getDecision()} />
            <Col id="skills" align="right" className="skills">
              <ul>
                {getSkills()}
              </ul>
            </Col>
          </Row>
        </Container>
      }
    </div>


  )
}
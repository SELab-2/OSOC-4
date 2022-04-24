import React, { useEffect, useState } from "react";
import GeneralInfo from "./GeneralInfo"
import { Col, Container, Row } from "react-bootstrap";
import { useRouter } from "next/router";
import SuggestionsCount from "./SuggestionsCount";
import Image from "next/image";
import selected from "../../public/assets/selected.svg";
import not_selected from "../../public/assets/not_selected.svg";

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


  function getBorder(){
    if(props.student !== props.selectedStudent){ return "var(--not-selected-gray)"}
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

    // the path is not changed, but there is a query added wich contains the id of the student
    router.push({
      pathname: router.pathname,
      query: newQuery
    }, undefined, { shallow: true })
  }

  /**
   * a function to change the selected student
   */
  function selectStudent(){
    // if the selected student is this student then unselect the student
    props.setSelectedStudent(props.selectedStudent === props.student ? undefined :props.student)
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
               className={"list-element" + (props.student === props.selectedStudent ? "-selected" : "")}
               style={{ backgroundColor: getBackground(), borderColor: getBorder()}}
               onClick={() => props.studentsTab ? studentDetails() : selectStudent()}>
      <Row className="upper-layer">
        <Col id="name" className="name" xs="auto">{props.student["mandatory"]["first name"]} {props.student["mandatory"]["last name"]}</Col>
        <Col id="practical-problems" style={{ backgroundColor: getProblemsColor() }} className="practical-problems" xs="auto">
          No practical problems
        </Col>
        <Col />
        <Col xs="auto" className="nopadding">
          <Row xs="auto" className="nomargin">
            <Col className="suggestions" xs="auto">Suggestions:</Col>
            <SuggestionsCount suggestionsYes={getSuggestions(2)} suggestionsMaybe={getSuggestions(1)} suggestionsNo={getSuggestions(0)} />
          </Row>
        </Col>
        {/*<Col>*/}
        {/*  <Image src={props.student === props.selectedStudent ? selected : not_selected} height={25} width={25}/>*/}
        {/*</Col>*/}
      </Row>

      <Row id="info" className="info">
        <GeneralInfo listelement={true} studentsTab={props.studentsTab} student={props.student} decision={getDecisionString(props.student.decision)} />
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
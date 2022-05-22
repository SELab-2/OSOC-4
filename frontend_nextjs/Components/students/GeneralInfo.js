import { Col, Row } from "react-bootstrap";
import {useEffect, useState} from "react";
import {Url} from "../../utils/ApiClient";

/**
 * This element return the basic questions and answers about a student, which questions and answers are shown depends
 * on where they are displayed (listelement or details) and on which questions/answers the user wants to see in the
 * listelements, this can be changed in the settings.
 * @param props props has the fields student and listelement. 'student' is the student who we display the general
 * info for. 'listelement' is true if we display the general info in the list of students and false if we display it in
 * the student details.
 * @returns {JSX.Element} An element that renders the correct questions and answers
 */
export default function GeneralInfo(props) {

  const [projects, setProjects] = useState(undefined);

  /**
   * This useEffect() initializes the 'projects' state variable.
   */
  useEffect(() => {
    if (! projects && props.student["participations"]) {
      for (let newProject of props.student["participations"]) {
        let newProjects = []
        Url.fromUrl(newProject["project"]).get().then(res => {
          if (res.success && res.data) {
            newProjects = newProjects.concat([res.data["name"]]);
            setProjects(newProjects);
          }
        })
      }
    }
  })

  /**
   * get the correct questions and answers.
   * @returns {*[]} a list of the questions and answers we want to see.
   */
  function getInfo() {
    if (props.student["suggestions"]) {
      let decision = (props.student.decision === -1) ? "Undecided" : ["No", "Maybe", "Yes"][props.student.decision];

      let rows = [];

      // props.students["listtags"] contains the (question,answer) pair that the user wants to show in the list of
      // students.
      Object.entries(props.student["listtags"]).map(([k, v]) => {
        rows.push(
          <Row key={k} className="question-answer-row">
            <Col md="auto" className="info-titles">{k}</Col>
            <Col md="auto" className="info-answers">{v}</Col>
          </Row>
        )
      })

      // If we don't show the general info in the list of students, we add the (question, answer) pairs that we don't
      // want to see in the list of students, they are in props.students["detailtags"].
      if (!props.listelement) {
        // the email address
        if (props.student["mandatory"]["email"]) {
          rows.push(
            <Row className="question-answer-row">
              <Col md="auto" className="info-titles">email</Col>
              <Col md="auto" className="info-answers">{props.student["mandatory"]["email"]}</Col>
            </Row>
          );
        }
        // the other detail-tags
        Object.entries(props.student["detailtags"]).map(([k, v]) => {
          rows.push(
            <Row key={k} className="question-answer-row">
              <Col md="auto" className="info-titles">{k}</Col>
              <Col md="auto" className="info-answers">{v}</Col>
            </Row>
          )
        })
      }

      // add the project of the student to the general info
      if (!props.listelement || props.elementType !== "students") {
        rows.push(
          <Row key={"Project"} className="question-answer-row">
            <Col md="auto" className="info-titles">{"Project"}</Col>
            <Col md="auto" className="info-answers">
              {(! projects || projects.length === 0)? "None": projects.join(", ")}
            </Col>
          </Row>
        )
      }

      // add the decision of the student to the general info
      rows.push(
        <Row key={"Decision"} className="question-answer-row">
          <Col md="auto" className="info-titles">Decision</Col>
          <Col md="auto" className="info-answers">{decision}</Col>
        </Row>
      )
      // add the email_sent field if the email bar at the bottom of the screen is expanded.
      if (props.elementType === "emailstudents") {
        rows.push(
          <Row key={"email_sent"} className="question-answer-row">
            <Col md="auto" className="info-titles">Email sent</Col>
            <Col md="auto" className="info-answers">{props.student["email_sent"] ? "Yes" : "No"}</Col>
          </Row>
        )
      }

      return rows;
    }
  }

  /**
   * return html representation of the suggestion counts for a student
   */
  return (
    <Col md="auto">
      {getInfo()}
    </Col>
  );
}
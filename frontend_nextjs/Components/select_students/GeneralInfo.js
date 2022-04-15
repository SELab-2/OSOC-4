import { Col, Row } from "react-bootstrap";

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

  /**
   * get the correct questions and answers.
   * @returns {*[]} a list of the questions and answers we want to see.
   */
  function getInfo() {
    if (props.student["suggestions"]) {
      let decisions = props.student["suggestions"].filter(sugg => sugg["definitive"]);
      let decision = (decisions.length === 0) ? "Undecided" : ["No", "Maybe", "Yes"][decisions[0]["decision"]];

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
        Object.entries(props.student["detailtags"]).map(([k, v]) => {
          rows.push(
            <Row key={k} className="question-answer-row">
              <Col md="auto" className="info-titles">{k}</Col>
              <Col md="auto" className="info-answers">{v}</Col>
            </Row>
          )
        })
      }

      // add the decision of the student to the general info
      rows.push(
        <Row key={"Decision"} className="question-answer-row">
          <Col md="auto" className="info-titles">{"Decision"}</Col>
          <Col md="auto" className="info-answers">{decision}</Col>
        </Row>
      )

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
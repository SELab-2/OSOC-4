import { Col, Row } from "react-bootstrap";

// displays the counts of the suggestions for a student
export default function SuggestionsCount(props) {

  // get the info of the basic questions shown in the list element
  function getInfo() {
    if (props.student["suggestions"]) {
      let decision = (props.student.decision === -1) ? "Undecided" : ["No", "Maybe", "Yes"][props.student.decision];

      let rows = [];

      Object.entries(props.student["listtags"]).map(([k, v]) => {
        rows.push(
          <Row key={k} className="question-answer-row">
            <Col md="auto" className="info-titles">{k}</Col>
            <Col md="auto" className="info-answers">{v}</Col>
          </Row>
        )
      })
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

      rows.push(
        <Row key={"Decision"} className="question-answer-row">
          <Col md="auto" className="info-titles">{"Decision"}</Col>
          <Col md="auto" className="info-answers">{decision}</Col>
        </Row>
      )

      return rows;
    }
  }

  // return html representation of the suggestion counts for a student
  return (
    <Col md="auto">
      {getInfo()}
    </Col>
  );
}
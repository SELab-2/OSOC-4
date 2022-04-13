import {Col, Row} from "react-bootstrap";

// displays the counts of the suggestions for a student
export default function SuggestionsCount(props) {

  // get the info of the basic questions shown in the list element
  function getInfo() {
    let questions = ["Studies:", "Type of degree:", "First language:", "Level of English:"];
    let answers = [props.student["studies"], props.student["type of degree"],
      props.student["first language"], props.student["level of english"]];
    return questions.map((question,index) =>
      <Row key={index} className="question-answer-row">
        <Col md="auto" className="info-titles">{question}</Col>
        <Col md="auto" className="info-answers">{answers[index]}</Col>
      </Row>
    )
  }

  // return html representation of the suggestion counts for a student
  return (
    <Col md="auto">
      {getInfo()}
    </Col>
  );
}
import {Col} from "react-bootstrap";

// displays the counts of the suggestions for a student
export default function SuggestionsCount(props) {

  // get the titles of the basic questions shown in the list element
  function getInfoTitles() {
    let questions = ["Studies:", "Type of degree:", "First language:", "Level of English:"];
    return questions.map((question,index) =>
      <p key={index}>{question}</p>
    )
  }

  // get the answers on the basic questions in HTML format
  function getInfoAnswers() {
    let answers = [props.student["studies"], props.student["type of degree"],
      props.student["first_languages"], props.student["level of english"]];
    return answers.map((answer,index) =>
      <p key={index}>{answer}</p>
    )
  }

  // return html representation of the suggestion counts for a student
  return [
    <Col key="info-titles" className="info-titles" md="auto">
      {getInfoTitles()}
      Decision:
    </Col>,
    <Col key="info-answers" md="auto" className="info-answers">
      {getInfoAnswers()}
      {props.decision}
    </Col>]
}
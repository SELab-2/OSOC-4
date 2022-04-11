import { Col } from "react-bootstrap";

// displays the counts of the suggestions for a student
export default function SuggestionsCount(props) {

  // get the titles of the basic questions shown in the list element
  function getInfoTitles() {
    return props.tags.map(tag =>
      <p key={tag}>{tag["tag"]}</p>
    )
  }

  // get the answers on the basic questions in HTML format
  function getInfoAnswers() {
    console.log(props.tags)
    console.log(props.student)
    let answers = props.tags.map(tag => props.student[tag.tag])
    console.log(answers)
    return answers.map((answer, index) =>
      <p key={`${index}_${answer}`}>{answer}</p>
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
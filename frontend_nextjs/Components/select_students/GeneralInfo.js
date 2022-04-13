import { Col } from "react-bootstrap";

// displays the counts of the suggestions for a student
export default function SuggestionsCount(props) {

  // get the titles of the basic questions shown in the list element
  function getInfoTitles() {

    let tags = []

    if (Object.keys(props.student).length) {

      Object.entries(props.student["listtags"]).map(([k, _]) => {
        tags.push(<p key={k}>{k}</p>)
      })

      if (!props.listelement) {
        Object.entries(props.student["detailtags"]).map(([k, _]) => {
          tags.push(<p key={k}>{k}</p>)
        })
      }

    }

    return tags;
  }

  // get the answers on the basic questions in HTML format
  function getInfoAnswers() {
    let answers = []

    if (Object.keys(props.student).length) {

      Object.entries(props.student["listtags"]).map(([_, v]) => {
        answers.push(<p key={`${v}`}>{v}</p>)
      })

      if (!props.listelement) {
        Object.entries(props.student["detailtags"]).map(([_, v]) => {
          answers.push(<p key={`${v}`}>{v}</p>)
        })
      }
    }

    return answers;
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
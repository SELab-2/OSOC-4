import { Col } from "react-bootstrap";

// displays the counts of the suggestions for a student
export default function SuggestionsCount(props) {

  // returns the html representation for the suggestion counts
  return [
    <Col key="suggestionsYes" className="suggestionsYes" xs="auto">{props.suggestionsYes}</Col>,
    <Col key="suggestionsMaybe" className="suggestionsMaybe" xs="auto">{props.suggestionsMaybe}</Col>,
    <Col key="suggestionsNo" className="suggestionsNo" xs="auto">{props.suggestionsNo}</Col>
  ]
}
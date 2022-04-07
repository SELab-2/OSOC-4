import {Col} from "react-bootstrap";

// displays the counts of the suggestions for a student
export default function SuggestionsCount(props) {

  return [
      <Col className="suggestionsYes" md="auto">{props.suggestionsYes}</Col>,
      <Col className="suggestionsMaybe" md="auto">{props.suggestionsMaybe}</Col>,
      <Col className="suggestionsNo" md="auto">{props.suggestionsNo}</Col>
  ]
}
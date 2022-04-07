import {Col, Row} from "react-bootstrap";

export default function SuggestionsCount(props) {

  return [
      <Col className="suggestionsYes" md="auto">{props.suggestionsYes}</Col>,
      <Col className="suggestionsMaybe" md="auto">{props.suggestionsMaybe}</Col>,
      <Col className="suggestionsNo" md="auto">{props.suggestionsNo}</Col>
  ]
}
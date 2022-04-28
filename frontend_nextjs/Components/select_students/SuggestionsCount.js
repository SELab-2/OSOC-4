import { Col } from "react-bootstrap";

/**
 * This element displays the counts of the suggestions for a student
 * @param props props has a field student which is the student we want the counts of suggestions for
 * @returns {JSX.Element} An element that renders the counts of the suggestions for a student
 */
export default function SuggestionsCount(props) {

  console.log(props.ownsuggestion)

  /**
   * returns the html representation for the suggestion counts
   */
  return [
    <Col key="suggestionsYes" className={`suggestionsYes ${props.ownsuggestion && props.ownsuggestion["decision"] == 2 ? "selected" : ""}`} xs="auto">{props.suggestionsYes}</Col>,
    <Col key="suggestionsMaybe" className={`suggestionsMaybe ${props.ownsuggestion && props.ownsuggestion["decision"] == 1 ? "selected" : ""}`} xs="auto">{props.suggestionsMaybe}</Col>,
    <Col key="suggestionsNo" className={`suggestionsNo ${props.ownsuggestion && props.ownsuggestion["decision"] == 0 ? "selected" : ""}`} xs="auto">{props.suggestionsNo}</Col>
  ]
}
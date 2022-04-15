import {Col} from "react-bootstrap";

/**
 * This element displays the counts of the suggestions for a student
 * @param props props has a field student which is the student we want the counts of suggestions for
 * @returns {JSX.Element} An element that renders the counts of the suggestions for a student
 */
export default function SuggestionsCount(props) {

  /**
   * returns the html representation for the suggestion counts
   */
  return [
      <Col key="suggestionsYes" className="suggestionsYes" md="auto">{props.suggestionsYes}</Col>,
      <Col key="suggestionsMaybe" className="suggestionsMaybe" md="auto">{props.suggestionsMaybe}</Col>,
      <Col key="suggestionsNo" className="suggestionsNo" md="auto">{props.suggestionsNo}</Col>
  ]
}
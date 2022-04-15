import {Col, Row} from "react-bootstrap";
import {useEffect, useState} from "react";
import {getJson} from "../../utils/json-requests";

/**
 * Component that represents a suggestion in the student details.
 * @param props props has the fields suggestion and classNames. Suggestion is the suggestion that must be rendered.
 * ClassNames are the names of the css classes that the component must have. These are different for the different
 * decisions ("yes", "maybe" or "no").
 * @returns {JSX.Element} A component that represents one suggestion in the student details.
 */
export default function Suggestion(props) {

  // These constants are initialized empty, the data will be inserted in useEffect
  const [suggestedBy, setSuggestedBy] = useState("")

  /**
   * This functin inserts the data in the variables.
   */
  useEffect( () => {
    if (suggestedBy === "") {
      getJson(props.suggestion["suggested_by_id"]).then(res => setSuggestedBy(res.data["name"]));
    }
  })

  /**
   * returns the html representation of a suggestion
   */
  return (
    <Row>
      <Col md="auto" className={props.classNames}/>
      <Col>{suggestedBy + ": " + props.suggestion["reason"]}</Col>
    </Row>
  )
}
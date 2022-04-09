import {Col, Row} from "react-bootstrap";
import {useEffect, useState} from "react";
import {getJson} from "../../utils/json-requests";
import {getStudentPath} from "../../routes";

// displays the counts of the suggestions for a student
export default function SuggestionsCount(props) {

  // These constants are initialized empty, the data will be inserted in useEffect
  const [suggestedBy, setSuggestedBy] = useState("")

  // This function inserts the data in the variables
  useEffect( () => {
    if (suggestedBy === "") {
      getJson(props.suggestion["suggested_by_id"]).then(res => setSuggestedBy(res.data["name"]));
    }
  })

  // returns the html representation of a suggestion
  return (
    <Row key={props.key}>
      <Col md="auto" className={props.classNames}/>
      <Col>{suggestedBy + ": " + props.suggestion["reason"]}</Col>
    </Row>
  )
}
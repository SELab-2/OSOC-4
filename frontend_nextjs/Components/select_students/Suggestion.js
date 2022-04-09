import {Col, Row} from "react-bootstrap";
import {useEffect, useState} from "react";
import {getJson} from "../../utils/json-requests";
import {getStudentPath} from "../../routes";

// displays the counts of the suggestions for a student
export default function SuggestionsCount(props) {

  const [suggestedBy, setSuggestedBy] = useState("")

  // This function inserts the data in the variables
  useEffect( () => {
    if (suggestedBy === "") {
      getJson(props.suggestion["suggested_by_id"]).then(res => setSuggestedBy(res.data["name"]));
    }
  })

  return (
    <Row key={props.key}>
      <Col md="auto" className={props.classNames}/>
      <Col>{suggestedBy + ": " + props.suggestion["reason"]}</Col>
    </Row>
  )
}
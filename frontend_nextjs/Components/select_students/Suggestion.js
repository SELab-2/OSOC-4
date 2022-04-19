import {Col, Row} from "react-bootstrap";
import {useEffect, useState} from "react";
import {Url} from "../../utils/ApiClient";
import Login from "../../pages/login";

// displays the counts of the suggestions for a student
export default function Suggestion(props) {

  // These constants are initialized empty, the data will be inserted in useEffect
  const [suggestedBy, setSuggestedBy] = useState("")

  // This function inserts the data in the variables
  useEffect( () => {
    if (suggestedBy === "") {
      Url.fromUrl(props.suggestion["suggested_by_id"]).get().then(res =>  {
        if (res.success) {
          res = res.data;
          setSuggestedBy(res.data["name"]);
        }
      });
    }
  })

  // returns the html representation of a suggestion
  return (
    <Row>
      <Col md="auto" className={props.classNames}/>
      <Col>{suggestedBy + ": " + props.suggestion["reason"]}</Col>
    </Row>
  )
}
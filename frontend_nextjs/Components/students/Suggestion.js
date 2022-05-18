import {Col, Row} from "react-bootstrap";
import {useEffect, useState} from "react";
import {Url} from "../../utils/ApiClient";
import Login from "../../pages/login";

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
   * This function is called when suggestionBy is empty, this is when the component is made.
   */
  useEffect( () => {
    Url.fromUrl(props.suggestion["suggested_by_id"]).get().then(res =>  {
      if (res.success) {
        res = res.data;
        setSuggestedBy(res.data["name"]);
      }
    });
  }, [props.suggestion]);

  /**
   * returns the html representation of a suggestion
   */
  return (
    <Row className="nomargin suggestion">
      <Col md="auto" className={props.classNames}/>
      <Col className={props.classNamesText}>{suggestedBy + ": " + props.suggestion["reason"]}</Col>
    </Row>
  )
}
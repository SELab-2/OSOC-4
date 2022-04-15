import {Col, Row} from "react-bootstrap";

// Represents one line of a filter, with checkbox and label
/**
 * This component represents one line of a filter, with checkbox and label
 * @param props props had the fields filter_id, onChange, value and filter_text. filter_id is an id to identify the
 * filter. onChange is a function that will be executed when the checkbox changes its value. value is the value of the
 * checkbox. filter_text is the label text.
 * @returns {JSX.Element} A component that renders one line of a filter, with checkbox and label.
 */
export default function StudentsFilter(props) {

  /**
   * The HTML representation of a filter line
   */
  return(
      <Row className="filter-row">
        <Col md="auto" className="checkbox-filters">
          <input id={props.filter_id} type="checkbox" onChange={props.onChange} checked={props.value}/>
        </Col>
        <Col><label htmlFor={props.filter_id}>{props.filter_text}</label></Col>
      </Row>
  )
}
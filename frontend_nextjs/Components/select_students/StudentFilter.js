import {Col, Row} from "react-bootstrap";

// Represents one line of a filter, with checkbox and label
export default function StudentsFilter(props) {

  // The HTML representation of the filters in the 'Select students' tab
  return(
      <Row className="filter-row">
        <Col md="auto" className="checkbox-filters">
          <input id={props.filter_id} type="checkbox" onChange={props.onChange} checked={props.value}/>
        </Col>
        <Col><label htmlFor={props.filter_id}>{props.filter_text}</label></Col>
      </Row>
  )
}
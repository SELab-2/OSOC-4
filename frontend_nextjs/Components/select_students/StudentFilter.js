import {Col, Row} from "react-bootstrap";


export default function StudentsFilter(props) {

  function changeFilter(checked) {

  }

  // The HTML representation of the filters in the 'Select students' tab
  return(
      <Row className="filter-row">
        <Col md="auto" className="checkbox-filters">
          <input id={props.filter_id} type="checkbox" onChange={val => changeFilter(val.target.checked)}/>
        </Col>
        <Col><label htmlFor={props.filter_id}>{props.filter_text}</label></Col>
      </Row>
  )
}
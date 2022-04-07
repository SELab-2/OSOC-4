import {Button, ButtonGroup, Col, Container, Dropdown, DropdownButton, Row} from "react-bootstrap";
import StudentListelement from "./StudentListelement";
import {useEffect, useState} from "react";
import Scrollbar from "bootstrap/js/src/util/scrollbar";
import StudentList from "./StudentList";
import DropdownMenu from "react-bootstrap/DropdownMenu";
import DropdownItem from "react-bootstrap/DropdownItem";
import SuggestionsCount from "./SuggestionsCount";
import {getJson} from "../../utils/json-requests";
import {getStudentPath} from "../../routes";

// This function returns the details of a student
export default function StudentDetails(props) {

  // These constants are initialized empty, the data will be inserted in useEffect
  const [student, setStudent] = useState({});
  const [studentId, setStudentId] = useState(undefined);


  // This function inserts the data in the variables
  useEffect( () => {
    if (studentId !== props.student_id) {
      setStudentId(props.student_id);
      getJson(getStudentPath(props.student_id)).then(res => setStudent(res))
    }
  })

  // returns the html for student details
  return(
      <Col className="fill_height student-details-window">
          <Row className="details-upper-layer">
            <Col md="auto">
              <Row className="name_big">
                {student["name"]}
              </Row>
              <Row>
                <Col md="auto" className="skill">VIDEO EDITOR</Col>
              </Row>
            </Col>
            <Col/>
            <Col md="auto">
              <Row>
                <Col md="auto"><button className="suggest-yes-button suggest-button">Suggest yes</button></Col>
                <Col md="auto"><button className="suggest-maybe-button suggest-button">Suggest maybe</button></Col>
                <Col md="auto"><button className="suggest-no-button suggest-button">Suggest no</button></Col>
              </Row>
              <Row>
                <Col>
                  <select className="dropdown-decision">
                    <option value="">Undecided</option>
                    <option value="">Yes</option>
                    <option value="">Maybe</option>
                    <option value="">No</option>
                  </select>
                </Col>
                <Col md="auto"><Button className="suggest-confirm-button">Confirm</Button></Col>
              </Row>
            </Col>
          </Row>
          <Row className="remaining-height-details" md="auto">
            <Col md="auto" className="fill_height scroll-overflow student-details">
              <Row md="auto" className="h2-titles"><Col md="auto"><h2>Decision</h2></Col></Row>
              <Row md="auto"><Col md="auto">Undecided</Col></Row>
              <Row md="auto" className="student-details-suggestions-line h2-titles">
                <Col md="auto" className="suggestions-title"><h2>Suggestions</h2></Col>
                <SuggestionsCount suggestionsYes={0} suggestionsMaybe={0} suggestionsNo={0}/>
              </Row>
              <Row>
                <Col md="auto" className="suggestions-circle suggestions-circle-red"/>
                <Col>Michiel Leyman</Col>
              </Row>
            </Col>
          </Row>
      </Col>
  )
}
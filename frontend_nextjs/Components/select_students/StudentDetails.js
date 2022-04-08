import {Button, Col, Modal, ModalBody, ModalDialog, ModalFooter, ModalHeader, ModalTitle, Row} from "react-bootstrap";
import {useEffect, useState} from "react";
import SuggestionsCount from "./SuggestionsCount";
import Suggestion from "./Suggestion"
import GeneralInfo from "./GeneralInfo"
import {getJson} from "../../utils/json-requests";
import {getStudentPath} from "../../routes";
import {render} from "react-dom";

// This function returns the details of a student
export default function StudentDetails(props) {

  // These constants are initialized empty, the data will be inserted in useEffect
  const [student, setStudent] = useState({});
  const [studentId, setStudentId] = useState(undefined);
  const [suggestions, setSuggestions] = useState([]);
  const [modalShow, setModalShow] = useState(false);

  // This function inserts the data in the variables
  useEffect( () => {
    if (studentId !== props.student_id) {
      setStudentId(props.student_id);
      getJson(getStudentPath(props.student_id)).then(res => {
        console.log(res);
        setStudent(res);
        setSuggestions(res["suggestions"]);
      })
    }
  })

  function getDecision() {
    let decisions = suggestions.filter(suggestion => suggestion["definitive"]);
    if (decisions.length === 0) {
      return "Undecided"
    }
    let decisionwords = ["No", "Maybe", "Yes"];
    return decisionwords[decisions[0]["decision"]];
  }

  function getSuggestionsCount(decision) {
    let temp_suggestions = suggestions.filter(suggestion => ! suggestion["definitive"]);
    return temp_suggestions.filter(suggestion => suggestion["decision"] === decision).length;
  }

  function getSuggestions() {
    let result = [];
    let cases = [[2, "suggestions-circle-green"], [1, "suggestions-circle-yellow"], [0, "suggestions-circle-red"]];
    for (let variables of cases) {
      let classNames = "suggestions-circle " + variables[1];
      for (let i = 0; i < suggestions.length; i ++) {
        let suggestion = suggestions[i];
        if (suggestion["decision"] === variables[0] && ! suggestion["definitive"]) {
          result.push(<Suggestion key={i} suggestion={suggestion} classNames={classNames}/>)
        }
      }
    }
    if (result.length > 0) {
      return result;
    }
    return <Row>No suggestions</Row>
  }

  function MyVerticallyCenteredModal(props) {
    return (
      <Modal
        {...props}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <ModalHeader closeButton>
          <ModalTitle id="contained-modal-title-vcenter">
            Modal heading
          </ModalTitle>
        </ModalHeader>
        <Modal.Body>
          <h4>Centered Modal</h4>
          <p>
            Cras mattis consectetur purus sit amet fermentum. Cras justo odio,
            dapibus ac facilisis in, egestas eget quam. Morbi leo risus, porta ac
            consectetur ac, vestibulum at eros.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={props.onHide}>Close</Button>
        </Modal.Footer>
      </Modal>
    );
  }

  // returns the html for student details
  return(
      <Col className="fill_height student-details-window">

          <MyVerticallyCenteredModal
            show={modalShow}
            onHide={() => setModalShow(false)}
          />
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
                <Col md="auto"><button className="suggest-yes-button suggest-button" onClick={() => setModalShow(true)}>Suggest yes</button></Col>
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
              <Row md="auto" className="h2-titles"><Col><h2>General</h2></Col></Row>
              <Row md="auto" className="decision">
                <GeneralInfo student={student} decision={getDecision()} />
              </Row>
              <Row md="auto" className="student-details-suggestions-line h2-titles">
                <Col md="auto" className="suggestions-title"><h2>Suggestions</h2></Col>
                <SuggestionsCount suggestionsYes={getSuggestionsCount(2)} suggestionsMaybe={getSuggestionsCount(1)}
                                  suggestionsNo={getSuggestionsCount(0)}/>
              </Row>
              {getSuggestions()}
            </Col>
          </Row>
      </Col>
  )
}
import { Button, Col, Modal, ModalHeader, ModalTitle, Row, Card } from "react-bootstrap";
import {useEffect, useState} from "react";
import {api, Url} from "../../utils/ApiClient";
import ParticipationCard from "./ParticipationCard";
import Hint from "../Hint";
import LoadingPage from "../LoadingPage"

/**
 * This element shows the pop up window when solving the conflicts.
 * @param props props has the fields popUpShow, setPopUpShow and conflicts. popUpShow decided the visibility of
 * the pop up window. setPopUpShow is used to change popUpShow. conflicts are the conflicts that need to be solved.
 * @returns {JSX.Element} An element that renders the pop-up window when pushing the conflicts button.
 * @constructor
 */
export default function ConflictsPopUpWindow(props) {

  // defines whether or not the pop up window must be shown
  const [popUpShow, setPopUpShow] = [props.popUpShow, props.setPopUpShow];

  const [currentStudentIndex, setCurrentStudentIndex] = useState(0);
  const [currentStudent, setCurrentStudent] = useState(undefined);

  const [loading, setLoading] = useState(false);

  /**
   * This function is called when currentStudent changes
   */
  useEffect(() => {
    setLoading(true);
    if (currentStudentIndex >= props.conflicts.length || currentStudentIndex < 0) {
      setCurrentStudentIndex(props.conflicts.length - 1);
    }
    
    if (props.conflicts[currentStudentIndex]) {
      Url.fromUrl(props.conflicts[currentStudentIndex]).get(null, true).then(student => {
        setCurrentStudent(student.data);
        setLoading(false);
      });
    } else {
      setCurrentStudent(undefined);
      setLoading(false);
    }

  }, [currentStudentIndex, props.conflicts])

  /**
   * This function is called when the pop up window is closed.
   */
  function onHide() {
    setLoading(false);
    setCurrentStudentIndex(0);
    setPopUpShow(false);
  }

  /**
   * Called when the previous button is clicked. It shows the previous student conflict.
   */
  function previousStudent() {
    if (currentStudentIndex > 0) {
      setCurrentStudentIndex(currentStudentIndex - 1);
    }
  }

  /**
   * Called when the next button is clicked. It shows the next student conflict.
   */
  function nextStudent() {
    if (currentStudentIndex < props.conflicts.length - 1) {
      setCurrentStudentIndex(currentStudentIndex + 1)
    }
  }

  /**
   * returns the html representation for the pop-up window
   */
  return (
    <Modal
      show={popUpShow}
      onHide={() => onHide()}
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <ModalHeader closeButton>
        <ModalTitle id="contained-modal-title-vcenter">
          Conflicts
        </ModalTitle>
      </ModalHeader>
      <Modal.Body className="modalbody-margin"> 
        <>
        <p>
          Some students were assigned to two or more projects, please make sure every student is assigned to only one project.
        </p>

        <Row>
        <Row style={{height: "300px"}}>
        {(loading)? <LoadingPage/> :
        (currentStudent)?
            <>
            <Row>
              <Col md="auto">
                <h4>
                  {currentStudent["mandatory"] ? currentStudent["mandatory"]["first name"] : ""} {currentStudent["mandatory"] ? currentStudent["mandatory"]["last name"] : ""}
                </h4>
              </Col>
            </Row>
            <ul style={{overflow:"auto", height: "250px"}}>
              {currentStudent.participations.map(
              participation =>
                <ParticipationCard key={participation.project} participation={participation} student={currentStudent}/>)}
            </ul>
            </>
          : null}
          </Row>

          <Row> 
            <Row>
             <h4>{currentStudentIndex + 1} / {props.conflicts.length}</h4>
            </Row>
            <Row >
              <Col md="auto"><Hint message="Previous conflict"><button className="prevnextbutton" onClick={previousStudent}>&#8249;</button></Hint></Col>
              <Col md="auto"><Hint message="Next conflict"><button className="prevnextbutton" onClick={nextStudent}>&#8250;</button></Hint></Col>
            </Row>
          </Row>
          
        </Row>


        
       
        </>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
}
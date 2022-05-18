import { Button, Col, Modal, ModalHeader, ModalTitle, Row } from "react-bootstrap";
import {useEffect, useState} from "react";
import {api, Url} from "../../utils/ApiClient";
import ParticipationCard from "./ParticipationCard";

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

  /**
   * This function is called when currentStudent changes
   */
  useEffect(() => {
    if (currentStudentIndex >= props.conflicts.length || currentStudentIndex < 0) {
      setCurrentStudentIndex(props.conflicts.length - 1);
    }
    if (props.conflicts[currentStudentIndex]) {
      Url.fromUrl(props.conflicts[currentStudentIndex]).get(null, true).then(student => {
        setCurrentStudent(student.data);
      });
    } else {
      setCurrentStudent(undefined);
    }
  }, [currentStudentIndex, props.conflicts])

  /**
   * This function is called when the pop up window is closed.
   */
  function onHide() {
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
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <ModalHeader closeButton>
        <ModalTitle id="contained-modal-title-vcenter">
          Conflicts
        </ModalTitle>
      </ModalHeader>
      <Modal.Body className="modalbody-margin">
        {(currentStudent)?
          [<Row>
            <Col md="auto">
              <h4>{
                currentStudent["mandatory"] ? currentStudent["mandatory"]["first name"] : ""
              } {
                currentStudent["mandatory"] ? currentStudent["mandatory"]["last name"] : ""
              }</h4>
            </Col>
            <Col />
            <Col md="auto">
              {currentStudentIndex + 1} / {props.conflicts.length}
            </Col>
          </Row>,
            currentStudent.participations.map(
              participation =>
                <ParticipationCard key={participation.project} participation={participation} student={currentStudent}/>)
          ]
          : "No conflicts"
        }
        <Row style={{marginTop: "10px"}} >
          <Col/>
          <Col md="auto"><button className="prevnextbutton" onClick={previousStudent}>&#8249;</button></Col>
          <Col md="auto"><button className="prevnextbutton" onClick={nextStudent}>&#8250;</button></Col>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
}
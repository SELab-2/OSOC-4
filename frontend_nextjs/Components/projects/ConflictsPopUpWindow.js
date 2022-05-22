import { Button, Col, Modal, ModalHeader, ModalTitle, Row, Card } from "react-bootstrap";
import {useEffect, useState} from "react";
import {api, Url} from "../../utils/ApiClient";
import ParticipationCard from "./ParticipationCard";
import Hint from "../Hint";
import LoadingPage from "../LoadingPage"
import Image from "next/image";
import left from "../../public/assets/left.svg"
import right from "../../public/assets/right.svg"


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
   * This function is called when currentStudent or conflicts changes. It loads the correct current student depending
   * on the current page.
   */
  useEffect(() => {
    setLoading(true);
    if (currentStudentIndex && (currentStudentIndex >= props.conflicts.length || currentStudentIndex < 0)) {
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
          Resolve Conflicts
        </ModalTitle>
      </ModalHeader>
      <Modal.Body className="modalbody-margin">
        {(props.conflicts.length > 0) ?
          <p>
            Some students were assigned to two or more projects, please make sure every student is assigned to only one project.
          </p> :
          <p>
            There are no students with conflicts found.
          </p>
        }

        <Row style={{height: "300px"}}>
          {(loading)? <LoadingPage /> :
          (currentStudent) &&
              [
              <Row>
                <Col md="auto">
                  <h4>
                    {currentStudent["mandatory"] ? currentStudent["mandatory"]["first name"] : ""} {currentStudent["mandatory"] ? currentStudent["mandatory"]["last name"] : ""}
                  </h4>
                </Col>
              </Row>,
              <ul style={{overflow:"auto", height: "250px"}}>
                {currentStudent.participations.map(
                participation =>
                  <ParticipationCard key={participation.project} participation={participation} student={currentStudent}/>)}
              </ul>
              ]
            }
        </Row>
          
      </Modal.Body>
      <Modal.Footer>
        <Row >
          <Col className="conflict-resolve-page-col">
            {
              currentStudentIndex > 0 ? 
              <div className={"prevnextbutton" + ( currentStudentIndex <= 0 ? "-disabled" : "")} onClick={previousStudent}>
                <Image width={48} height={48} src={left}/>
              </div>
              :
              null
            }    
          </Col>
          {props.conflicts.length > 0 &&
            <Col className="conflict-resolve-page-number">
              <h4>{currentStudentIndex + 1} / {props.conflicts.length}</h4>
            </Col>
          }
          <Col className="conflict-resolve-page-col">
            {currentStudentIndex + 1 < props.conflicts.length ?
              <Hint message="Next conflict">
                <div className={"prevnextbutton" + ( currentStudentIndex + 1 >= props.conflicts.length ? "-disabled" : "")} onClick={nextStudent}>
                  <Image width={48} height={48} src={right}/>
                </div>
              </Hint>
              :
              null
            }
          </Col>
        </Row>
      </Modal.Footer>
    </Modal>
  );
}
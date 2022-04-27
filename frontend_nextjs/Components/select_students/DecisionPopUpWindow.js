import { Button, Col, Modal, ModalHeader, ModalTitle, Row } from "react-bootstrap";
import { useState } from "react";
import { getDecisionString } from "./StudentListelement";
import { Url } from "../../utils/ApiClient";

/**
 * This element shows the pop up window when making a decision about a student.
 * @param props props has the fields popUpShow, setPopUpShow, decision and student. popUpShow decided the visibility of
 * the pop up window. setPopUpShow is used to change popUpShow. decision is the decision we want to make for the
 * student. student is the student we want to make a decision for.
 * @returns {JSX.Element} An element that renders the pop-up window when making a decision about a student.
 * @constructor
 */
export default function DecisionPopUpWindow(props) {

  // defines whether or not the pop up window must be shown
  const [popUpShow, setPopUpShow] = [props.popUpShow, props.setPopUpShow];
  const [textAreaDisabled, setTextAreaDisabled] = useState(true);

  /**
   * This function is called when the pop up window is closed.
   */
  function onHide() {
    setPopUpShow(false);
  }

  /**
   * This functin is called on submitting the decision.
   */
  function submitDecision() {

    console.log(props.decision)

    Url.fromUrl(props.student.id).setBody({ "decision": parseInt(props.decision) }).patch().then(res => {

      if (res.success) {
        setPopUpShow(false);
      }
    })


  }

  /**
   * This function returns "disabled-text" if the text area should be disabled.
   * @returns {string} "disabled-text" if the text area should be disabled.
   */
  function getTextClassName() {
    if (textAreaDisabled) {
      return "disabled-text";
    }
    return "";
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
          Decision &apos;{getDecisionString(props.decision)}&apos; for {props.student.mandatory["first name"] + " " +
            props.student.mandatory["last name"]}
        </ModalTitle>
      </ModalHeader>
      <Modal.Body className="modalbody-margin">
        <Row className="filter-row">
          <Col md="auto" className="send-email-checkbox">
            <input id="send_email" type="checkbox" onChange={val => setTextAreaDisabled(!val.target.checked)} />
          </Col>
          <Col><label htmlFor="send_email">Send email to {props.student.mandatory["first name"] + " " +
            props.student.mandatory["last name"]}</label></Col>
        </Row>
        <Row className={getTextClassName()}>
          Message:
        </Row>
        <Row className={getTextClassName()}>
          <textarea id="decision-email" className={"fill_width suggestion-reason " + getTextClassName()}
            disabled={textAreaDisabled} defaultValue="default email" />
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Close</Button>
        <Button variant="primary" onClick={submitDecision}>Submit</Button>
      </Modal.Footer>
    </Modal>
  );
}
import {Button, Col, Modal, ModalHeader, ModalTitle, Row} from "react-bootstrap";
import {useState} from "react";

// This view shows the pop up window when making a decision about a student.
export default function DecisionPopUpWindow(props) {

  // defines wheater or not the pop up window must be shown
  const [popUpShow, setPopUpShow] = [props.popUpShow, props.setPopUpShow];
  const [textAreaDisabled, setTextAreaDisabled] = useState(true);

  // returns the string for decision of the student
  function getDecision() {
    if (props.decision === -1) {
      return "undecided" // this can only be shown untill the suggested value is adjusted
    }
    let decisions = ["no", "maybe", "yes"];
    return decisions[props.decision];
  }

  // called when the pop up window is closed
  function onHide() {
    setPopUpShow(false);
  }

  // called on submitting the decision
  function submitDecision() {
    setPopUpShow(false);
  }

  // returns "disabled-text" if the text area should be disabled
  function getTextClassName() {
    if (textAreaDisabled) {
      return "disabled-text";
    }
    return "";
  }

  // returns the html representation for the pop up window
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
          Decision '{getDecision()}' for {props.student["name"]}
        </ModalTitle>
      </ModalHeader>
      <Modal.Body className="modalbody-margin">
        <Row className="filter-row">
          <Col md="auto" className="send-email-checkbox">
            <input id="send_email" type="checkbox" onChange={val => setTextAreaDisabled(! val.target.checked)}/>
          </Col>
          <Col><label htmlFor="send_email">Send email to {props.student["name"]}</label></Col>
        </Row>
        <Row className={getTextClassName()}>
          Message to {props.student["name"]}:
        </Row>
        <Row className={getTextClassName()}>
          <textarea id="decision-email" className={"fill_width suggestion-reason " + getTextClassName()}
                    disabled={textAreaDisabled} defaultValue="default email"/>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Close</Button>
        <Button variant="primary" onClick={submitDecision}>Submit</Button>
      </Modal.Footer>
    </Modal>
  );
}
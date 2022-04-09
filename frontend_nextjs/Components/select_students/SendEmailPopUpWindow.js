import {Button, Modal, ModalHeader, ModalTitle, Row} from "react-bootstrap";

// This view shows the pop up window when making a decision about a student.
export default function SendEmailPopUpWindow(props) {

  // defines whether or not the pop up window must be shown
  const [popUpShow, setPopUpShow] = [props.popUpShow, props.setPopUpShow];

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

  // called on submitting the email
  function submitEmail() {
    setPopUpShow(false);
  }

  // returns the html representation for the email pop up window
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
          Send &apos;{getDecision()}&apos; email to {props.student["name"]}
        </ModalTitle>
      </ModalHeader>
      <Modal.Body className="modalbody-margin">
        <Row>
          Message to {props.student["name"]}:
        </Row>
        <Row>
          <textarea id="decision-email" className={"fill_width suggestion-reason "} defaultValue="default email"/>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Close</Button>
        <Button variant="primary" onClick={submitEmail}>Submit</Button>
      </Modal.Footer>
    </Modal>
  );
}
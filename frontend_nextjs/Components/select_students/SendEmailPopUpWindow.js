import {Button, Modal, ModalHeader, ModalTitle, Row} from "react-bootstrap";

/**
 * This element shows the pop up window when sending an email to a student.
 * @param props props has the fields popUpShow, setPopUpShow, decision and student. popUpShow decided the visibility of
 * the pop up window. setPopUpShow is used to change popUpShow. decision is the decision for the student. student is
 * the student we want to send an email.
 * @returns {JSX.Element} An element that renders the pop-up window when sending an email to a student.
 */
export default function SendEmailPopUpWindow(props) {

  // defines whether or not the pop up window must be shown
  const [popUpShow, setPopUpShow] = [props.popUpShow, props.setPopUpShow];

  /**
   * This function returns the string for the decision of the student
   * @returns {string} the string for the decision of the student
   */
  function getDecision() {
    if (props.decision === -1) {
      return "undecided" // this can only be shown untill the suggested value is adjusted
    }
    let decisions = ["no", "maybe", "yes"];
    return decisions[props.decision];
  }

  /**
   * This function is called when the pop up window is closed.
   */
  function onHide() {
    setPopUpShow(false);
  }

  /**
   * This function is called on submitting the email.
   */
  function submitEmail() {
    setPopUpShow(false);
  }

  /**
   * returns the html representation for the email pop up window
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
          Send &apos;{getDecision()}&apos; email to {props.student.mandatory["first name"] + " " +
          props.student.mandatory["last name"]}
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
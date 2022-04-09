import {Button, Col, Modal, ModalHeader, ModalTitle, Row} from "react-bootstrap";
import {useState} from "react";

export default function SendEmailPopUpWindow(props) {

  const [popUpShow, setPopUpShow] = [props.popUpShow, props.setPopUpShow];

  function getDecision() {
    if (props.decision === -1) {
      return "undecided" // this can only be shown untill the suggested value is adjusted
    }
    let decisions = ["no", "maybe", "yes"];
    return decisions[props.decision];
  }

  function onHide() {
    setPopUpShow(false);
  }

  function submitEmail() {
    setPopUpShow(false);
  }

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
          Send '{getDecision()}' email to {props.student["name"]}
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
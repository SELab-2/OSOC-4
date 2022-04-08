import {Button, Col, Modal, ModalHeader, ModalTitle, Row} from "react-bootstrap";
import {useState} from "react";

export default function PopUpWindow(props) {

  const [popUpShow, setPopUpShow] = [props.popUpShow, props.setPopUpShow];
  const [textAreaDisabled, setTextAreaDisabled] = useState(true);

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

  function submitSuggestion() {
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
          Decision '{getDecision()}' for {props.student["name"]}
        </ModalTitle>
      </ModalHeader>
      <Modal.Body>
        <Row className="filter-row">
          <Col md="auto" className="send-email-checkbox">
            <input id="send_email" type="checkbox" onChange={val => setTextAreaDisabled(! val.target.checked)}/>
          </Col>
          <Col><label htmlFor="send_email">Send email to {props.student["name"]}</label></Col>
        </Row>
        <textarea id="decision-email" className="fill_width suggestion-reason"
                  disabled={textAreaDisabled} value="default email"/>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Close</Button>
        <Button variant="primary" onClick={submitSuggestion}>Submit</Button>
      </Modal.Footer>
    </Modal>
  );
}
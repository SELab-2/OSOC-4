import {Button, Modal, ModalHeader, ModalTitle} from "react-bootstrap";

export default function PopUpWindow(props) {

  const [popUpShow, setPopUpShow] = [props.popUpShow, props.setPopUpShow];

  function getSuggestion() {
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
          Suggest '{getSuggestion()}' for {props.student["name"]}
        </ModalTitle>
      </ModalHeader>
      <Modal.Body>
        <h4>Why are you making this decision?</h4>
        <input id="suggestion-reason" type="text" className="fill_width suggestion-reason"/>
        A reason is not required, but will open up discussion and help us and your fellow coaches to understand.
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Cancel</Button>
        <Button variant="primary" onClick={submitSuggestion}>Submit</Button>
      </Modal.Footer>
    </Modal>
  );
}
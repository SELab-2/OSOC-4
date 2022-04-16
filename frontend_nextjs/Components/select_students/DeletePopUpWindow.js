import {Button, Modal, ModalHeader, ModalTitle} from "react-bootstrap";

// This view shows the pop up window when making a decision about a student.
export default function DeletePopUpWindow(props) {

  // defines whether or not the pop up window must be shown
  const [popUpShow, setPopUpShow] = [props.popUpShow, props.setPopUpShow];

  // called when the pop up window is closed
  function onHide() {
    setPopUpShow(false);
  }

  // called on submitting the delete
  function submitDelete() {
    setPopUpShow(false);
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
          Are you sure you want to delete {props.student.mandatory["first name"] + " " +
          props.student.mandatory["last name"]}
        </ModalTitle>
      </ModalHeader>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>No</Button>
        <Button variant="primary" onClick={submitDelete}>Yes</Button>
      </Modal.Footer>
    </Modal>
  );
}
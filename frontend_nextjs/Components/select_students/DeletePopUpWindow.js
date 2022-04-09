import {Button, Modal, ModalHeader, ModalTitle} from "react-bootstrap";

// This view shows the pop up window when making a decision about a student.
export default function DeletePopUpWindow(props) {

  // defines wheater or not the pop up window must be shown
  const [popUpShow, setPopUpShow] = [props.popUpShow, props.setPopUpShow];

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
          Are you sure you want to delete {props.student["name"]}
        </ModalTitle>
      </ModalHeader>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>No</Button>
        <Button variant="primary" onClick={submitEmail}>Yes</Button>
      </Modal.Footer>
    </Modal>
  );
}
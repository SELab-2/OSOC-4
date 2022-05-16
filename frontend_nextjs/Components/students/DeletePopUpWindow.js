import { Button, Modal, ModalHeader, ModalTitle } from "react-bootstrap";
import { Url, api, cache } from "../../utils/ApiClient";

/**
 * This element shows the pop up window when deleting a student.
 * @param props props has the fields popUpShow, setPopUpShow and student. popUpShow decided the visibility of
 * the pop up window. setPopUpShow is used to change popUpShow. student is the student we want to delete.
 * @returns {JSX.Element} An element that renders the pop-up window when deleting a student.
 * @constructor
 */
export default function DeletePopUpWindow(props) {

  // defines whether or not the pop up window must be shown
  const [popUpShow, setPopUpShow] = [props.popUpShow, props.setPopUpShow];

  /**
   * This function is called when the pop up window is closed.
   */
  function onHide() {
    setPopUpShow(false);
  }

  /**
   * This function is called on submitting the deletion.
   */
  function submitDelete() {
    // delete participation
    Url.fromUrl(props.student.id).delete().then(res => {
      //TODO remove when using websockets
      if (res.success) {
        cache.remove_student(props.student.id);
        setPopUpShow(false);
      }
    })


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
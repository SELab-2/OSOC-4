import {Button, Modal, ModalHeader, ModalTitle} from "react-bootstrap";

/**
 * This component renders the pop-up window when making a suggestion about a student.
 * @param props props has the fields popUpShow, setPopUpShow, decision and student. popUpShow decided the visibility of
 * the pop up window. setPopUpShow is used to change popUpShow. decision is the decision ("yes", "maybe" or "no") of the
 * suggestion we want to make for the student. student is the student we want to make a suggestion for.
 * @returns {JSX.Element} A component that renders the pop-up window when making a suggestion about a student
 */
export default function SuggestionPopUpWindow(props) {

  // defines whether the pop-up window must be shown
  const [popUpShow, setPopUpShow] = [props.popUpShow, props.setPopUpShow];

  /**
   * get the string for the suggestion you want to make for the student
   * @returns {string} The string for the suggestion you want to make for the student
   */
  function getSuggestion() {
    if (props.decision === -1) {
      return "undecided" // this can only be shown untill the suggested value is adjusted
    }
    let decisions = ["no", "maybe", "yes"];
    return decisions[props.decision];
  }

  /**
   * called when the pop-up window is closed
   */
  function onHide() {
    setPopUpShow(false);
  }

  /**
   * called on submitting the suggestion
   */
  function submitSuggestion() {
    setPopUpShow(false);
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
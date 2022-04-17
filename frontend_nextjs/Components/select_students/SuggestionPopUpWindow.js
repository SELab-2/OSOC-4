import { Button, Modal, ModalHeader, ModalTitle } from "react-bootstrap";
import React, { useEffect, useState } from "react";
import { postCreate } from "../../utils/json-requests";

// This view shows the pop up window when making a suggestion about a student.
export default function PopUpWindow(props) {

  // defines wheater or not the pop up window must be shown
  const [popUpShow, setPopUpShow] = [props.popUpShow, props.setPopUpShow];

  const [suggestion, setSuggestion] = useState({ "reason": "" });

  useEffect(() => {
    if (props.popUpShow && props.student["own_suggestion"]) {
      setSuggestion(props.student["own_suggestion"])
    } else {
      setSuggestion({ "reason": "" })
    }
    setSuggestion(prevState => ({
      ...prevState,
      ["decision"]: props.decision
    }));

  }, [props.popUpShow])

  // returns the string for suggestion for the student
  function getSuggestion() {
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

  const handleChange = (event) => {
    event.preventDefault()
    const { name, value } = event.target;
    setSuggestion(prevState => ({
      ...prevState,
      [name]: value
    }));
  }

  // called on submitting the suggestion
  async function submitSuggestion() {

    await postCreate("/suggestions/create", {
      ...suggestion,
      ["student_id"]: props.student["id_int"]
    });
    console.log(suggestion)
    props.updateSuggestion(suggestion)
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
          Suggest '{getSuggestion()}' for {props.student.mandatory["first name"] + " " +
            props.student.mandatory["last name"]}
        </ModalTitle>
      </ModalHeader>
      <Modal.Body>
        <h4>Why are you making this decision?</h4>
        <input id="suggestin-reason" name="reason" type="text" className="fill_width suggestion-reason" onChange={handleChange} value={suggestion["reason"]} />
        A reason is not required, but will open up discussion and help us and your fellow coaches to understand.
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Cancel</Button>
        <Button variant="primary" onClick={submitSuggestion}>Submit</Button>
      </Modal.Footer>
    </Modal>
  );
}
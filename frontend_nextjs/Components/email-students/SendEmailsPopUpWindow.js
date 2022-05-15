import { Button, Col, Modal, ModalHeader, ModalTitle, Row } from "react-bootstrap";
import StudentFilter from "../students/StudentFilter";
import { useState, useEffect } from "react";
import { cache } from "../../utils/ApiClient";
import { api, Url } from "../../utils/ApiClient";

/***
 * This element shows the pop up window when sending emails in the 'email students' tab.
 * @param props popUpShow decides wheater or not the pop-up window is visible, we use setPopUpShow to change the
 * visibility of the pop-up window (it changes popUpShow), students contains a list of students who will receive the email
 * @returns {JSX.Element} an element to render a pop-up window to send emails to students in the 'email students' tab
 */
export default function SendEmailsPopUpWindow(props) {

  const [defaultEmail, setDefaultEmail] = useState(true);

  // defines whether or not the pop up window must be shown
  const [popUpShow, setPopUpShow] = [props.popUpShow, props.setPopUpShow];

  const [students, setStudents] = useState([])

  useEffect(() => {
    Promise.all(props.selectedStudents.map(student => cache.getStudent(student, ""))).then(allstudents => {
      setStudents([...allstudents]);
    })
  }, [props.selectedStudents])

  /***
   * This function is called when the pop-up window is closed
   */
  function onHide() {
    setPopUpShow(false);
  }

  /***
   * This function is called on submitting the emails, it sends the emails and hides the pop-up window
   */
  function submitEmail() {
    Url.fromName(api.sendemails).extend("/decisions").setBody({ "emails": props.selectedStudents }).post().then(() => {
      setPopUpShow(false);
    })
  }

  // returns the html representation for the send emails pop up window
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
          {`Are you sure you want to send ${props.selectedStudents.length} decision emails?`}
        </ModalTitle>
      </ModalHeader>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Cancel</Button>
        <Button variant="primary" onClick={submitEmail}>Yes</Button>
      </Modal.Footer>
    </Modal>
  );
}
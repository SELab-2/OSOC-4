import {Button, Col, Modal, ModalHeader, ModalTitle, Row} from "react-bootstrap";
import StudentsFilter from "../select_students/StudentFilter";
import {useState} from "react";

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
    setPopUpShow(false);
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
          Send mails to...
        </ModalTitle>
      </ModalHeader>
      <Modal.Body className="modalbody-margin">
        <Row className="send-email-names">
          {(props.students)? props.students.map(student => student.mandatory["first name"] + " " +
            student.mandatory["last name"]).join(", ") : null}
        </Row>
        <Row>
          <h5 className="content-title">Content</h5>
        </Row>
        <StudentsFilter filter_id="default-email" filter_text="Use default emails" value={defaultEmail}
                        onChange={ev => setDefaultEmail(true)}/>
        <StudentsFilter filter_id="own-email" filter_text="Type your email here:" value={! defaultEmail}
                        onChange={ev => setDefaultEmail(false)}/>
        <Row>
          <Col/>
          <Col md="auto" className={"email-help-text " + ((defaultEmail)? "disabled-text": null)}>
            (Use @Name, @Firstname, @Lastname, @Decision to address the receiver)
          </Col>
        </Row>
        <Row>
          <textarea id="student-emails" className="fill_width send-emails" disabled={defaultEmail}/>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Cancel</Button>
        <Button variant="primary" onClick={submitEmail}>Submit</Button>
      </Modal.Footer>
    </Modal>
  );
}
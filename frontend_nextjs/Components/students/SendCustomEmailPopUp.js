import { Button, Col, Modal, ModalHeader, ModalTitle, Row, Form } from "react-bootstrap";
import StudentFilter from "./StudentFilter";
import { useState, useEffect } from "react";
import { cache } from "../../utils/ApiClient";
import { api, Url } from "../../utils/ApiClient";

/***
 * This element shows the pop up window when sending emails in the 'email students' tab.
 * @param props popUpShow decides wheater or not the pop-up window is visible, we use setPopUpShow to change the
 * visibility of the pop-up window (it changes popUpShow), students contains a list of students who will receive the email
 * @returns {JSX.Element} an element to render a pop-up window to send emails to students in the 'email students' tab
 */
export default function SendCustomEmailPopUp(props) {

  // defines whether or not the pop up window must be shown
  const [popUpShow, setPopUpShow] = [props.popUpShow, props.setPopUpShow];
  const [emailBody, setEmailBody] = useState("");
  const [emailSubject, setEmailSubject] = useState("");

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
    Url.fromName(api.sendemails).extend("/custom").setBody({ "student": props.student.id, "subject": emailSubject, "email": emailBody }).post().then(() => {
      if (res.success) {
        setEmailBody("");
        setEmailSubject("");
        setPopUpShow(false);
      }
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
          Send custom email.
        </ModalTitle>
      </ModalHeader>
      <Modal.Body className="modalbody-margin">

        <Row >
          <Form>
            <Form.Label>Email Subject</Form.Label>
            <Form.Control type="text" placeholder="Enter email subject" value={emailSubject} onChange={(ev => setEmailSubject(ev.target.value))} />
          </Form>
        </Row>
        <Row>
          <Col />
          <Col md="auto" className={"email-help-text"}>
            (Use @firstname, @lastname, @username to address the receiver)
          </Col>
        </Row>
        <Row>
          <textarea id="student-emails" className="fill_width send-emails" value={emailBody} onChange={(ev => setEmailBody(ev.target.value))} />
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Cancel</Button>
        <Button variant="primary" disabled={emailBody === "" || emailSubject === ""} onClick={submitEmail}>Submit</Button>
      </Modal.Footer>
    </Modal >
  );
}
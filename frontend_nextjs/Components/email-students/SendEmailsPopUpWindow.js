import { Button, Modal, ModalHeader, ModalTitle, Spinner } from "react-bootstrap";
import { useState } from "react";
import { api, Url } from "../../utils/ApiClient";
import { toast, ToastContainer } from "react-toastify";

/***
 * This element shows the pop up window when sending emails in the 'email students' tab.
 * @param props popUpShow decides wheater or not the pop-up window is visible, we use setPopUpShow to change the
 * visibility of the pop-up window (it changes popUpShow), students contains a list of students who will receive the email
 * @returns {JSX.Element} an element to render a pop-up window to send emails to students in the 'email students' tab
 */
export default function SendEmailsPopUpWindow(props) {

  const [sending, setSending] = useState(false);

  /***
   * This function is called when the pop-up window is closed
   */
  function onHide() {
    props.setSelectedStudents([]);
    props.setPopUpShow(false);
  }

  /***
   * This function is called on submitting the emails, it sends the emails and hides the pop-up window
   */
  function submitEmail() {
    setSending(true);
    Url.fromName(api.sendemails).extend("/decisions").setBody({ "emails": props.selectedStudents }).post().then((res) => {
      if (res.success){
        onHide();
        toast.success(`${props.selectedStudents.length} decision emails were sent succesfully!`);
        setSending(false);
      } else {
        setSending(false);
        toast.error("Something went wrong, please try again");
        props.setPopUpShow(false); //Instead of onHide() -> To keep the original selected students selected when the request to send emails fails, otherwise al the studens get deselected
      }
    })
  }

  /**
   * returns the html representation for the send emails pop up window
   */
  return (
    <div>
      <Modal
        show={props.popUpShow}
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
          {sending ?
            <Button variant="primary" disabled>
            Sending emails...
            <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
            />
            </Button>
            :
              <div>
                <Button variant="secondary" onClick={onHide}>Cancel</Button>
                <Button variant="primary" onClick={submitEmail} className="invite-button">Send</Button>
              </div>
              }
        </Modal.Footer>
      </Modal>
      <ToastContainer autoClose={4000}/>
    </div>
  );
}
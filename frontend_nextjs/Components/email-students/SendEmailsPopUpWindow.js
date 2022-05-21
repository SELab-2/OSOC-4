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

  const [defaultEmail, setDefaultEmail] = useState(true);
  const [fail, setFail] = useState(false);
  const [sending, setSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  /***
   * This function is called when the pop-up window is closed
   */
  function onHide() {
    props.setSelectedStudents([]);
    setFail(false);
    setSentSuccess(false);
    props.setPopUpShow(false);
  }

  /***
   * This function is called on submitting the emails, it sends the emails and hides the pop-up window
   */
  function submitEmail() {
    setSending(true);
    Url.fromName(api.sendemails).extend("/decisions").setBody({ "emails": props.selectedStudents }).post().then((res) => {
      if (res.success){
        toast.success(`${props.selectedStudents.length} decision emails were sent succesfully!`);
        setSending(false);
        setSentSuccess(true);
      } else {
        toast.error("Something went wrong, please try again");
        setSending(false);
        setFail(true);
      }
    })
  }

  /**
   * When something went wrong when sending emails and 'try again' is pushed, this method is called.
   */
  function handleTryAgain(){
    setFail(false);
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
          {(! sending && ! fail && ! sentSuccess) && 
          <div>
            <Button variant="secondary" onClick={onHide}>Cancel</Button>
            <Button variant="primary" onClick={submitEmail} className="invite-button">Send</Button>
          </div>}
          {sending && 
            <Button variant="primary" disabled>
            Sending...
            <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
            />
          </Button>}
          {sentSuccess &&
            <Button variant="primary" onClick={onHide}>Close</Button>
          }
          {fail && 
            <div>
              <Button variant="secondary" onClick={onHide}>Cancel</Button>
              <Button variant="primary" onClick={handleTryAgain} className="invite-button">Try again</Button>
            </div>}
        </Modal.Footer>
      </Modal>
      <ToastContainer autoClose={4000}/>
    </div>
  );
}
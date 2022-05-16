import { Button, Spinner, Row, Form } from "react-bootstrap";
import React, { useState, useEffect } from "react";
import { api, Url } from "../../utils/ApiClient";
import { Card } from "react-bootstrap";

/***
 * This element makes a From with a title on the left, to change a default email
 * @param props the props contain templateName and the value ("Yes", "No", "Maybe", "Undecided")
 * @returns {JSX.Element} An element that represents a 
 */
export default function DefaultEmail(props) {

  const [template, setTemplate] = useState({ "subject": "", "template": "" });
  const [prevTemplate, setPrevTemplate] = useState({ "subject": "", "template": "" });
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fail, setFail] = useState(false);

  useEffect(() => {
    Url.fromName(api.emailtemplates).extend("/" + props.templatename).get().then(res => {
      if (res.success) {
        setTemplate(res.data);
        setPrevTemplate(res.data);
      }
    })
  }, [])

    /**
   * This function is called when the Change default button is clicked, it makes the subject and content field editable
   */
  function changeDefaultEmail(){
    setPrevTemplate(template);
    setEditing(! editing);
  }

  /**
   * This function is called when the Add default button is clicked, it reveals the subject and content field
   */
  function addDefaultEmail(){
    setPrevTemplate(template);
    setEditing(! editing);
  }

  /**
 * This function is called when the save button is clicked, it saves the emails in the database
 */
  function saveDefaultEmails() {
    setSaving(true);
    Url.fromName(api.emailtemplates).extend("/" + props.templatename).setBody(template).patch().then(async res => {
      if (res.success){
          setPrevTemplate(template);
          setSaving(false);
      } else {
        setSaving(false);
        setFail(true);
      }
      setEditing(false);
    })
    
  }

  const handleTryAgain = (event) => {
    setTemplate(prevTemplate);
    setEditing(true);
    setFail(false);
  }

  /**
   * This function is called when the close button is clicked, it closes the edible window and discard all changes to the default emails
   */
  function close(){
    setTemplate(prevTemplate);
    setEditing(false);
    setFail(false);
  }

  return (
    <>
      <Row>
        <Card>
          <Card.Body>
            <Card.Title>
              {props.value} email
            </Card.Title>
            {((template.subject !== "" && template.template !== "") || editing || fail) ? (
              <Form>
              <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                <Form.Label className="email-label">Subject</Form.Label>
                <Form.Control size="sm" value={template.subject} disabled={! editing} onChange={(ev => setTemplate({ ...template, ["subject"]: ev.target.value }))}/>
              </Form.Group>
              <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
                {(editing || saving) &&
                  <Form.Label className="email-help-text">(Use @firstname, @lastname, @username to address the receiver)</Form.Label>}
                <Form.Control as="textarea" size="sm" className="email-content" value={template.template} disabled={! editing} onChange={(ev => setTemplate({ ...template, ["template"]: ev.target.value }))}/>
              </Form.Group>
            </Form>
            ) : (
              <div>
                <Card.Text>Currently no default email</Card.Text> 
                <Button variant="primary" className="email-button" onClick={addDefaultEmail}>{"Add default" }</Button>
              </div>
              
            )}
            {saving &&
              <div>
                <Button variant="primary" disabled>
                  Saving...
                  <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                  />
                </Button>
                <br/>
              </div>
              }
            {editing && ! saving &&
              <div>
                <Button variant="primary" onClick={saveDefaultEmails}>Save</Button>
                <Button variant="secondary" className="invite-button" onClick={close}>Close</Button>
              </div>}
            {(template.subject !== "" && template.template !== "") && ! editing && ! fail && <Button variant="primary" onClick={changeDefaultEmail}>Change default</Button>}
            {fail && 
              <div>
                <p>Something went wrong, please try again</p>
                <Button variant="primary" onClick={handleTryAgain}>Try again</Button>
                <Button variant="secondary" onClick={close} className="invite-button">Close</Button>
              </div>}
          </Card.Body>
        </Card>
      </Row>
    </>
  )
}
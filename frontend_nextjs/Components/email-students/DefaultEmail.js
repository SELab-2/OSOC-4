import { Button, Col, Row, Form } from "react-bootstrap";
import React, { useState, useEffect } from "react";
import { api, Url } from "../../utils/ApiClient";
import DefaultEmailCard from "./DefaulEmailCard";
import { Card } from "react-bootstrap";

/***
 * This element makes a TextField with a title on the left, to change a default email
 * @param props the props contain email and setEmail, which represent the value of the textfield
 * @returns {JSX.Element} An element that represents a title (for example 'Yes' email) with a textField
 */
export default function DefaultEmail(props) {

  const [template, setTemplate] = useState({ "subject": "", "template": "" })
  const [prevTemplate, setPrevTemplate] = useState({ "subject": "", "template": "" })
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    Url.fromName(api.emailtemplates).extend("/" + props.templatename).get().then(res => {
      if (res.success) {
        res = res.data;
        setTemplate(res);
        setPrevTemplate(res)
      }
    })
  }, [])

  function changeDefault(){
    setIsOpen(! isOpen);

  }

  function addDefault(){
    setIsOpen(! isOpen);
  }

  /**
 * This function is called when the save button is clicked, it saves the emails in the database and goes back to the
 * 'email students' page
 */
  function saveDefaultEmails() {
    Url.fromName(api.emailtemplates).extend("/" + props.templatename).setBody(template).patch().then(res => {
      setPrevTemplate(template)
    })
    setIsOpen(false);
  }

  return (
    <>
      <Row>
        <Card >
          <Card.Body>
              <table className="table">
                  <tbody>
                  <tr className={"tr"}>
                      <td className="column-text">
                        <p className="card-title">{props.value} email</p>
                        {((template.subject !== "" && template.template !== "") || isOpen) ? (
                          <div>
                            <Form>
                            <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                              <Form.Label>Subject</Form.Label>
                              <Form.Control value={template.subject} disabled={! isOpen} onChange={(ev => setTemplate({ ...template, ["subject"]: ev.target.value }))}/>
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
                              <Form.Label>Content</Form.Label>
                              <Form.Label className="email-help-text">(Use @firstname, @lastname, @username to address the receiver)</Form.Label>
                              <Form.Control as="textarea" value={template.template} disabled={! isOpen} className="send-emails" onChange={(ev => setTemplate({ ...template, ["template"]: ev.target.value }))}/>
                            </Form.Group>
                          </Form>  
                          </div>
                        ) : (
                          <p className="card-subtitle">Currently no default</p>
                        )}
                      </td>
                      <td className="column-button">
                        {isOpen ? (
                          <Button className="button" variant="primary" onClick={saveDefaultEmails}>Save</Button>
                        ) : null} 
                        {(template.subject !== "" && template.template !== "") ? (
                          <Button className="button" variant="primary" onClick={changeDefault}>{isOpen ? "Close" : "Change default" }</Button>
                        ) : (
                            <Button className="button" variant="primary" onClick={addDefault}>{isOpen ? "Close" : "Add default" }</Button>
                        )}    
                      </td>
                  </tr>
                  </tbody>
              </table>
          </Card.Body>
        </Card>
      </Row>
    
      {/* <Row>
        <Col className="nomargin email-title" md="auto">
          {props.value} email
        </Col>
        <Col>
          <Row className="nomargin">
            <Form>
              <Form.Label>Email Subject</Form.Label>
              <Form.Control type="text" placeholder="Enter email subject" value={template.subject} onChange={(ev => setTemplate({ ...template, ["subject"]: ev.target.value }))} />
            </Form>
          </Row>

          <Row className="nomargin">
            <Col />
            <Col md="auto" className="email-help-text">
              (Use @firstname, @lastname, @username to address the receiver)
            </Col>
          </Row>
          <Row className="nomargin">
            <textarea id="yes-email" className="send-emails" value={template.template}
              onChange={(ev => setTemplate({ ...template, ["template"]: ev.target.value }))} />
          </Row>
        </Col>
      </Row>
      {prevTemplate !== template &&
        <Row>
          <Col />
          <Col md="auto" className="change-emails-savebutton">
            <Button className="send-emails-button save-button"
              onClick={saveDefaultEmails}>Save</Button>
          </Col>
        </Row>
      } */}

    </>
  )
}
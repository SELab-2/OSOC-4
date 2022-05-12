import { Button, Col, Row, Form } from "react-bootstrap";
import React, { useState, useEffect } from "react";
import { api, Url } from "../../utils/ApiClient";
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
        <Card>
          <Card.Body>
              <table className="email-table">
                  <tbody>
                  <tr className={"email-tr"}>
                      <td className="email-column-text">
                        <p className="email-card-title">{props.value} email</p>
                        {((template.subject !== "" && template.template !== "") || isOpen) ? (
                          <div>
                            <Form>
                            <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                              <Form.Label className="email-label">Subject</Form.Label>
                              <Form.Control size="sm" value={template.subject} disabled={! isOpen} onChange={(ev => setTemplate({ ...template, ["subject"]: ev.target.value }))}/>
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
                              {isOpen ? (
                                <Form.Label className="email-help-text">(Use @firstname, @lastname, @username to address the receiver)</Form.Label>
                              ) : null}
                              <Form.Control as="textarea" size="sm" className="email-content" value={template.template} disabled={! isOpen} onChange={(ev => setTemplate({ ...template, ["template"]: ev.target.value }))}/>
                            </Form.Group>
                          </Form>  
                          </div>
                        ) : (
                          <p className="card-subtitle">Currently no default {props.value} email</p>
                        )}
                      </td>
                      <td className="column-button">
                        {isOpen ? (
                          <Button className="email-button" variant="primary" onClick={saveDefaultEmails}>Save</Button>
                        ) : null} 
                        {(template.subject !== "" && template.template !== "") ? (
                          <Button className="email-button" variant="primary" onClick={changeDefault}>{isOpen ? "Close" : "Change default" }</Button>
                        ) : (
                            <Button className="email-button" variant="primary" onClick={addDefault}>{isOpen ? "Close" : "Add default" }</Button>
                        )}    
                      </td>
                  </tr>
                  </tbody>
              </table>
          </Card.Body>
        </Card>
      </Row>
    </>
  )
}
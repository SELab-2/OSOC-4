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

  const [template, setTemplate] = useState({ "subject": "", "template": "" });
  const [prevTemplate, setPrevTemplate] = useState({ "subject": "", "template": "" });
  const [isOpen, setIsOpen] = useState(false);
  const [isChanging, setIsChanging] = useState(false);
  const [isChanged, setIsChanged] = useState(false);
  const [fail, setFail] = useState(false);

  useEffect(() => {
    Url.fromName(api.emailtemplates).extend("/" + props.templatename).get().then(res => {
      if (res.success) {
        res = res.data;
        setTemplate(res);
        setPrevTemplate(res);
      }
    })
  }, [])

  function changeDefaultEmail(){
    setPrevTemplate(template);
    setIsOpen(! isOpen);
  }

  function addDefaultEmail(){
    setPrevTemplate(template);
    setIsOpen(! isOpen);
  }

  /**
 * This function is called when the save button is clicked, it saves the emails in the database and goes back to the
 * 'email students' page
 */
  function saveDefaultEmails() {
    setIsChanging(true);
    Url.fromName(api.emailtemplates).extend("/" + props.templatename).setBody(template).patch().then(async res => {
      setPrevTemplate(template);
    })
    setIsChanging(false);
    setIsChanged(true);
    setIsOpen(false);
  }

  function close(){
    setTemplate(prevTemplate);
    setIsOpen(false);
    setIsChanged(false);
  }

  return (
    <>
      <Row>
        <Card>
          <Card.Body>
            <Card.Title>
              {props.value} email
            </Card.Title>
            {((template.subject !== "" && template.template !== "") || isOpen) ? (
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
            ) : (
              <Card.Text>Currently no default email</Card.Text> 
            )}
            {isChanging ? (
              <div>
                <Form.Text>Trying to change default {props.value} email!</Form.Text>
                <br/>
              </div>) : null}
            {isChanged ? (
              <div>
                <Form.Text>Default {props.value} email has been changed!</Form.Text>
                <br/>
              </div>
            ) : null}
            {(isOpen && ! isChanged)? (
              <Button variant="primary" onClick={saveDefaultEmails}>Save</Button>
            ) : null}
            {(template.subject !== "" && template.template !== "") ? (
              <Button variant="primary" onClick={(isOpen || isChanged)? close : changeDefaultEmail}>{(isOpen || isChanged) ? "Close" : "Change default" }</Button>
            ) : (
                <Button variant="primary" onClick={isOpen? close : addDefaultEmail}>{isOpen ? "Close" : "Add default" }</Button>
            )}    
          </Card.Body>
        </Card>
      </Row>
    </>
  )
}
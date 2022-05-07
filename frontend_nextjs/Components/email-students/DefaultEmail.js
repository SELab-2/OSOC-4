import { Button, Col, Row, Form } from "react-bootstrap";
import React, { useState, useEffect } from "react";
import { api, Url } from "../../utils/ApiClient";


/***
 * This element makes a TextField with a title on the left, to change a default email
 * @param props the props contain email and setEmail, which represent the value of the textfield
 * @returns {JSX.Element} An element that represents a title (for example 'Yes' email) with a textField
 */
export default function DefaultEmail(props) {

  const [template, setTemplate] = useState({ "subject": "", "template": "" })
  const [prevTemplate, setPrevTemplate] = useState({ "subject": "", "template": "" })

  useEffect(() => {
    Url.fromName(api.emailtemplates).extend("/" + props.templatename).get().then(res => {
      if (res.success) {
        res = res.data;
        setTemplate(res);
        setPrevTemplate(res)
      }
    })
  }, [])

  /**
 * This function is called when the save button is clicked, it saves the emails in the database and goes back to the
 * 'email students' page
 */
  function saveDefaultEmails() {
    Url.fromName(api.emailtemplates).extend("/" + props.templatename).setBody(template).patch().then(res => {
      setPrevTemplate(template)
    })
  }

  return (
    <>
      <Row className="emails-margin">
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
      }

    </>
  )
}
import {Button, Col, Row, Form} from "react-bootstrap";
import React, {useState, useEffect} from "react";
import {api, Url} from "../../utils/ApiClient";


/***
 * This element makes a TextField with a title on the left, to change a default email
 * @param props the props contain email and setEmail, which represent the value of the textfield
 * @returns {JSX.Element} An element that represents a title (for example 'Yes' email) with a textField
 */
export default function DefaultEmail(props) {

    const [template, setTemplate] = useState({"subject": "", "template": ""})
    const [prevTemplate, setPrevTemplate] = useState({"subject": "", "template": ""})

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
        Url.fromName(api.emailtemplates).extend("/" + props.templatename)
            .setBody(template)
            .patch().then(res => {
            setPrevTemplate(template)
        })
    }

    return (
        <>
            <Col className="emails-margin">
                <Row className="email-title" md="auto">
                    {props.value} email
                </Row>
                <Row className="email-subject">
                    Email subject:&nbsp;
                    <Form>
                        <Form.Control type="text" placeholder="Enter email subject" value={template.subject}
                                      onChange={(ev => setTemplate({...template, ["subject"]: ev.target.value}))}/>
                    </Form>
                </Row>
                <Row className="email-help-text">(Use @firstname, @lastname, @username to address the receiver)</Row>
                <Row>
                    <textarea id="yes-email" className="send-emails" value={template.template}
                              onChange={(ev => setTemplate({...template, ["template"]: ev.target.value}))}/>
                </Row>
                {prevTemplate !== template ?
                    <Row md="auto" className="change-emails-savebutton">
                        <Button className="send-emails-button save-button" onClick={saveDefaultEmails}>Save</Button>
                    </Row> : <></>
                }
            </Col>
        </>
    )
}
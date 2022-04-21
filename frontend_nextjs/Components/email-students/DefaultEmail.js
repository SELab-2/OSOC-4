import {Col, Row} from "react-bootstrap";

import React from "react";


/***
 * This element makes a TextField with a title on the left, to change a default email
 * @param props the props contain email and setEmail, which represent the value of the textfield
 * @returns {JSX.Element} An element that represents a title (for example 'Yes' email) with a textField
 */
export default function DefaultEmail(props) {

  return (
    <Row className="emails-margin">
      <Col className="nomargin email-title" md="auto">
        {props.value} email
      </Col>
      <Col>
        <Row className="nomargin">
          <Col/>
          <Col md="auto" className="email-help-text">
            (Use @Name, @Firstname, @Lastname, @Decision to address the receiver)
          </Col>
        </Row>
        <Row className="nomargin">
          <textarea id="yes-email" className="send-emails" value={props.email}
                    onChange={(ev => props.setEmail(ev.target.value))}/>
        </Row>
      </Col>
    </Row>
  )
}
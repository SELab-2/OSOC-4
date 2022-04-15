import {Col, Row} from "react-bootstrap";

import { useRouter } from "next/router";
import React from "react";


// The page corresponding is used to change the default emails
export default function DefaultEmail(props) {

  // the html that displays the overview of students
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
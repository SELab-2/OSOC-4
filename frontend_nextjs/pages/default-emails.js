import {Col, Row} from "react-bootstrap";

import { useRouter } from "next/router";
import backIcon from "../public/assets/back.svg";
import Image from "next/image";
import React from "react";


// The page corresponding is used to change the default emails
export default function DefaultEmails() {
  const router = useRouter();



  // the html that displays the overview of students
  return (
    <Row className="fill_width nomargin">
      <Row className="nomargin" md="auto">
        <Col md="auto">
          <button onClick={() => router.back()} className="back-button">
            <Image src={backIcon} className="delete-icon"/>
          </button>
        </Col>
      </Row>
      <Row className="emails-leftmargin title-bottom-margin" md="auto">
        <h2 className="nopadding" >Change default emails</h2>
      </Row>
      <Row className="emails-leftmargin">
        <Col className="nomargin email-title" md="auto">
          'Yes' email
        </Col>
        <Col>
          <Row className="textbox-margin">
            <Col/>
            <Col md="auto" className="email-help-text">
              (Use @Name, @Firstname, @Lastname, @Decision to address the receiver)
            </Col>
          </Row>
          <Row className="textbox-margin">
            <textarea id="yes-email" className="send-emails" />
          </Row>
        </Col>
      </Row>
      <Row></Row>
    </Row>
  )

}
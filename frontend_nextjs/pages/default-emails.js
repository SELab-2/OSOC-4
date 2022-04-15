import {Button, Col, Row} from "react-bootstrap";

import { useRouter } from "next/router";
import backIcon from "../public/assets/back.svg";
import Image from "next/image";
import React, {useState} from "react";
import DefaultEmail from "../Components/email-students/DefaultEmail";
import {getEmailStudentsPath} from "../routes";


// The page corresponding is used to change the default emails
export default function DefaultEmails() {
  const router = useRouter();

  const [yesEmail, setYesEmail] = useState("default yes email");
  const [maybeEmail, setMaybeEmail] = useState("default maybe email");
  const [noEmail, setNoEmail] = useState("default no email");

  function saveDefaultEmails() {
    router.push(getEmailStudentsPath());
  }

  function cancel() {
    router.push(getEmailStudentsPath());
  }

  // the html that displays the overview of students
  return (
    <Row className="fill_width">
      <Col>
        <Row className="nomargin" md="auto">
          <Col md="auto">
            <button onClick={() => router.back()} className="back-button">
              <Image src={backIcon} className="delete-icon"/>
            </button>
          </Col>
        </Row>
        <Row className="emails-title-margin" md="auto">
          <h2 className="nopadding" >Change default emails</h2>
        </Row>
        <DefaultEmail value="'Yes'" email={yesEmail} setEmail={setYesEmail} />
        <DefaultEmail value="'Maybe'" email={maybeEmail} setEmail={setMaybeEmail} />
        <DefaultEmail value="'No'" email={noEmail} setEmail={setNoEmail} />
        <Row>
          <Col />
          <Col md="auto" >
            <Button className="btn-secondary send-emails-button cancel-button"
                    onClick={cancel}>Cancel</Button>
          </Col>
          <Col md="auto" className="change-emails-savebutton">
            <Button className="send-emails-button save-button"
                    onClick={saveDefaultEmails}>Save</Button>
          </Col>
        </Row>
      </Col>
    </Row>
  )

}
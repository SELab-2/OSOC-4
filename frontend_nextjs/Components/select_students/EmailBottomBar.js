import React, { useState } from "react";
import { Col, Row, Button } from "react-bootstrap";
import SendEmailsPopUpWindow from "../email-students/SendEmailsPopUpWindow";
import arrowUp from "../../public/assets/arrow_up.svg";

import Image from "next/image";
import Hint from "../Hint";

export default function StudentList(props) {

    // These constant define wheater the pop-up windows should be shown or not
    const [sendEmailsPopUpShow, setSendEmailsPopUpShow] = useState(false);

    const selectAll = (event) => {
        if (props.students.length === props.selectedStudents.length) {
            props.setSelectedStudents([])
        } else {
            props.setSelectedStudents([...props.students])
        }
    }

    return [
        <div className="email-bar">
            <SendEmailsPopUpWindow key="emailPopUp" popUpShow={sendEmailsPopUpShow} setPopUpShow={setSendEmailsPopUpShow}
                selectedStudents={props.selectedStudents} />
            <Row className="nomargin align-items-center">
                <Hint message="Open to email students" placement="top">
                    <button className="table-button" onClick={() => props.setShowEmailBar(!props.showEmailBar)}>
                        <Image className={`arrow-button ${props.showEmailBar ? 'down' : ''}`} src={arrowUp} height="25px" />
                    </button>
                </Hint>
            </Row>

            <Row className={`bottombar ${props.showEmailBar ? "nomargin" : "nomargin down"}`}>

                <Col className="text-center"><h style={{ "font-weight": 'bold', "font-size": "25px" }}>{props.selectedStudents.length} / {props.students.length}</h></Col>
                <Col><Button className="send-emails-button"
                    onClick={selectAll}>{props.selectedStudents.length === props.students.length ? "Deselect All" : "Select All"}</Button></Col>
                <Col><Button className="send-emails-button" disabled={!props.selectedStudents.length}
                    onClick={() => setSendEmailsPopUpShow(true)}>Send emails</Button></Col>
            </Row>

        </div>
    ]

}
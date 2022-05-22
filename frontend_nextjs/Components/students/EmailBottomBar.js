import React, {useState} from "react";
import {Col, Row, Button} from "react-bootstrap";
import SendEmailsPopUpWindow from "../email-students/SendEmailsPopUpWindow";
import arrowUp from "../../public/assets/arrow_up.svg";

import Image from "next/image";

/**
 * This component represents the email bar on the bottom of the students list.
 * It provides the functionality to select/deselect all the students and send them emails in bulk.
 * @param props props contains the fields students, selectedStudents, setSelectedStudents, showEmailBar,
 * setShowEmailBar. students and selectedStudents are state variables which contains respectively the students and
 * the selected students to send an email. setSelectedStudents changes the selectedStudents state variable.
 * showEmailBar decides the visibility of the  emailBar. setEmailBar can change the showEmailBar variable.
 * @returns {JSX.Element[]} The component that renders the email bar on the bottom of the students list.
 * @constructor
 */
export default function EmailBottomBar(props) {
    // These constant define whether the pop-up windows should be shown or not
    const [sendEmailsPopUpShow, setSendEmailsPopUpShow] = useState(false);

    /**
     * This function selects all the students present in the student list.
     * If all the students are already selected, then deselect all the students.
     */
    function selectAll() {
        if (props.students.length === props.selectedStudents.length) {
            props.setSelectedStudents([])
        } else {
            props.setSelectedStudents([...props.students])
        }
    }

    /**
     * Returns the html of the EmailBottomBar component
     */
    return [
        <Row className="email-bar">
            <SendEmailsPopUpWindow key="emailPopUp" popUpShow={sendEmailsPopUpShow}
                                   setPopUpShow={setSendEmailsPopUpShow}
                                   selectedStudents={props.selectedStudents}
                                   setSelectedStudents={props.setSelectedStudents}/>
            <Row style={{height: "20px"}} className="nomargin align-items-center">
                <button className="table-button" onClick={() => {
                    props.setSelectedStudents([]);
                    props.setShowEmailBar(!props.showEmailBar);
                }}>
                    <Image className={`arrow-button ${props.showEmailBar ? 'down' : ''}`} src={arrowUp} height="20px"/>
                </button>
            </Row>
            <Row className="nomargin align-items-center">
                <button style={{textAlign: "center", "font-size": "14px", "height": "20px", overflow: "hidden"}}
                        className="table-button" onClick={() => {
                    props.setSelectedStudents([]);
                    props.setShowEmailBar(!props.showEmailBar);
                }}>
                    {props.showEmailBar ? "dismiss" : "send emails"}
                </button>
            </Row>

            <Row className={`bottombar ${props.showEmailBar ? "nomargin" : "nomargin down"}`}>
                <Col className="text-center">
                    <h style={{ "font-weight": 'bold', "font-size": "25px" }}>
                        {props.selectedStudents.length} / {props.students.length}
                    </h>
                </Col>
                <Col><Button className="send-emails-button"
                             onClick={selectAll}>
                    {props.selectedStudents.length === props.students.length ? "Deselect All" : "Select All"}
                </Button></Col>
                <Col><Button className="send-emails-button" disabled={!props.selectedStudents.length}
                             onClick={() => setSendEmailsPopUpShow(true)}>Send emails</Button></Col>
            </Row>
        </Row>
    ]
}
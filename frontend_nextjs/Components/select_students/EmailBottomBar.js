import React, { useState } from "react";
import { Col, Row, Button } from "react-bootstrap";

import arrowUp from "../../public/assets/arrow_up.svg";

import Image from "next/image";

export default function StudentList(props) {

    const selectAll = (event) => {
        if (props.students.length === props.selectedStudents.length) {
            props.setSelectedStudents([])
        } else {
            props.setSelectedStudents([...props.students])
        }
    }

    return (
        <div className="email-bar">
            <Row className="align-items-center">
                <button className="table-button" onClick={() => props.setShowEmailBar(!props.showEmailBar)}>
                    <Image className={`arrow-button ${props.showEmailBar ? 'down' : ''}`} src={arrowUp} height="25px" />
                </button>
            </Row>
            <Row className="no-margin">
                <Col>{props.selectedStudents.length} / {props.students.length}</Col>
                <Col><Button className="send-emails-button"
                    onClick={selectAll}>{props.selectedStudents.length === props.students.length ? "Deselect All" : "Select All"}</Button></Col>
                <Col><Button className="send-emails-button" disabled={!props.selectedStudents.length}
                    onClick={() => setSendEmailsPopUpShow(true)}>Send emails</Button></Col>
            </Row>
        </div>
    )

}
import React, {useEffect, useState} from "react";
import {Button, Col, Row} from "react-bootstrap";

import {useSession} from "next-auth/react";
import {api, cache, Url} from "../utils/ApiClient";
import {useRouter} from "next/router";
import SearchSortBar from "../Components/select_students/SearchSortBar";
import EmailStudentsFilters from "../Components/email-students/EmailStudentsFilters";
import EmailStudentsTable from "../Components/email-students/EmailStudentsTable";
import {filterStudents} from "./select-students";
import SendEmailsPopUpWindow from "../Components/email-students/SendEmailsPopUpWindow";
import LoadingPage from "../Components/LoadingPage";
import {getChangeDefaultEmailsPath} from "../routes";
import StudentListAndFilters from "../Components/select_students/StudentListAndFilters";

/**
 * The page corresponding with the 'email students' tab
 * @returns {JSX.Element} An element that renders the 'email students' tab
 */
export default function EmailStudents() {

  return (
    <Row className="nomargin screen-content-row">
      <StudentListAndFilters emailStudents={true} />
    </Row>
  )

  /**
   * the html that displays the 'email students' tab
   */
  /*return (
    <Row className="remaining_height fill_width">

      <SendEmailsPopUpWindow popUpShow={sendEmailsPopUpShow} setPopUpShow={setSendEmailsPopUpShow} students={receivers} />

      <Col className="fill_height">
        <Row className="fill_height nomargin">
          <EmailStudentsFilters students={students} filters={filters} />
          <Col className="fill_height students-list-paddingtop">
            <Row className="nomargin searchbar-margin">
              <Col><SearchSortBar /></Col>
              <Col md="auto" className="change-emails-positioning">
                <Button className="btn-secondary change-emails-button"
                        onClick={() => router.push(getChangeDefaultEmailsPath())}>
                  Change default emails
                </Button>
              </Col>
            </Row>
            <Row className="email-list-positioning">
              {getEmailStudentsTable()}
            </Row>
            <Row className="send-emails-positioning">
              <Col/>
              <Col md="auto">
                <Button className="send-emails-button" disabled={! receivers || ! receivers.length}
                        onClick={() => setSendEmailsPopUpShow(true)}>Send emails</Button>
              </Col>
            </Row>
          </Col>
        </Row>
      </Col>
    </Row>
  )*/

}
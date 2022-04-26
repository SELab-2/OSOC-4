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
import StudentList from "../Components/select_students/StudentList";
import StudentListComponent from "../Components/StudentListComponent";

/**
 * The page corresponding with the 'email students' tab
 * @returns {JSX.Element} An element that renders the 'email students' tab
 */
export default function EmailStudents() {

  return (
    <Row className="nomargin screen-content-row">
      <StudentListComponent studentsTab={true} emailStudents={true} studentId={undefined}/>
    </Row>
  )

}
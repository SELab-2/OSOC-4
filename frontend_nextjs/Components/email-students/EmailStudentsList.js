import {useRouter} from "next/router";
import React, {useEffect, useState} from "react";
import {api, Url} from "../../utils/ApiClient";
import LoadingPage from "../LoadingPage";
import EmailStudentsTable from "./EmailStudentsTable";
import {getChangeDefaultEmailsPath} from "../../routes";
import {Button, Col, Row} from "react-bootstrap";
import EmailStudentsFilters from "./EmailStudentsFilters";
import SearchSortBar from "../select_students/SearchSortBar";
import SendEmailsPopUpWindow from "./SendEmailsPopUpWindow";

export default function StudentList(props) {

  const router = useRouter();

  // check if authorized
  const [role, setRole] = useState(undefined);

  useEffect(() => {
    if (! role ) {
      Url.fromName(api.me).get().then(res => {
        if (res.success) {
          res = res.data.data;
          setRole(res.role);
        }
      })
    }
  }, [role]);


  // These constant define wheater the pop-up windows should be shown or not
  const [sendEmailsPopUpShow, setSendEmailsPopUpShow] = useState(false);

  // These constants are initialized empty, the data will be inserted in useEffect
  const [receivers, setReceivers] = useState(undefined);

  if (!role) {
    return <LoadingPage />;
  }
  if (role !== 2) {
    return (<h1>Unauthorized</h1>);
  }

  /**
   * This function adds ro removes a student from the receivers list (the students that will receive the email).
   * @param checked True if the student needs to be added, false if the student needs to be removed.
   * @param student The student that needs to be added or removed from the receivers list.
   */
  function addToReceivers(checked, student) {
    if (checked && receivers) {
      setReceivers(receivers.concat([student]));
    } else if (checked) {
      setReceivers([student]);
    } else if (receivers) {
      setReceivers(receivers.filter(receiver => receiver.id !== student.id));
    }
  }

  /**
   * This function return the table of students if it is loaded and the list of students is not empty.
   * If the list is empty, we show 'No students found'. If it is not loaded, we show a loading animation.
   * @returns {JSX.Element|string} The table of students if it is loaded and if the list of students is not empty.
   * If the list is empty, we show 'No students found'. If it is not loaded, we show a loading animation.
   */
  function getEmailStudentsTable() {
    if (props.students === undefined) {
      return <LoadingPage />
    }
    if (props.students.length === 0) {
      return "No students found"
    }
    return <EmailStudentsTable studentUrls={props.studentUrls} fetchData={props.fetchData} addToReceivers={addToReceivers}
                               students={props.students} />
  }

  return [
    <SendEmailsPopUpWindow key="emailPopUp" popUpShow={sendEmailsPopUpShow} setPopUpShow={setSendEmailsPopUpShow}
                           students={receivers} />,

    <Row className="email-list-positioning">
      {getEmailStudentsTable()}
    </Row>,
    <Row className="send-emails-positioning">
      <Col/>
      <Col md="auto">
        <Button className="send-emails-button" disabled={! receivers || ! receivers.length}
                onClick={() => setSendEmailsPopUpShow(true)}>Send emails</Button>
      </Col>
    </Row>
  ]
}
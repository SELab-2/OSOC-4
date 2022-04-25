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

/**
 * The page corresponding with the 'email students' tab
 * @returns {JSX.Element} An element that renders the 'email students' tab
 */
export default function EmailStudents() {
  const router = useRouter();

  // check if authorized
  const [role, setRole] = useState(0)
  useEffect(() => {
    if (role === 0 ) {
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
  const [students, setStudents] = useState([]);
  const [studentUrls, setStudentUrls] = useState([]);
  const [receivers, setReceivers] = useState(undefined);

  // These variables are used to notice if search or filters have changed
  const [search, setSearch] = useState("");
  let [sortby, setSortby] = useState("");
  const [localFilters, setLocalFilters] = useState([-1, -1]);

  // This represents the filters, filters[0] contains the general filters and filters[1] contains the decision filters
  const filters = [(router.query.filters) ? router.query.filters.split(",") : [],
    (router.query.decision) ? router.query.decision.split(",") : []]

  /**
   * This function inserts the data in the variables.
   */
  const { data: session, status } = useSession()
  useEffect(() => {
    if (session) {

      // Check if the search or sortby variable has changed from the search/sortby in the url. If so, update the
      // variables and update the students list. If the list is updated, we change the local filters. This will provoke
      // the second part of useEffect to filter the students again.
      if ((!students) || (router.query.search !== search) || (router.query.sortby !== sortby)) {
        setSearch(router.query.search);
        setSortby(router.query.sortby);

        // the urlManager returns the url for the list of students
        Url.fromName(api.editions_students).setParams(
          { decision: router.query.decision || "",
            search: router.query.search || "", orderby: router.query.sortby || "" }
        ).get().then(res => {
          setLocalFilters([0, 0, 0]);
          let p1 = res.data.slice(0, 10);
          let p2 = res.data.slice(10);
          setStudentUrls(p2);
          if (res.success) {
            setLocalFilters([0, 0, 0]);
            let p1 = res.data.slice(0, 10);
            let p2 = res.data.slice(10);
            setStudentUrls(p2);
            Promise.all(p1.map(studentUrl =>
              cache.getStudent(studentUrl, session["userid"])
            )).then(newstudents => {
              setStudents([...newstudents]);
              setLocalFilters([0, 0, 0]);
            })
          }
          });
      }
    }
  })

  if (role !== 2) {
    return (<h1>Unauthorized</h1>)
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
    if (students === undefined) {
      return <LoadingPage />
    }
    if (students.length === 0) {
      return "No students found"
    }
    return <EmailStudentsTable studentUrls={studentUrls} fetchData={fetchData} addToReceivers={addToReceivers}
                               students={students} />
  }

  const fetchData = () => {

    let p1 = studentUrls.slice(0, 10);
    let p2 = studentUrls.slice(10);

    Promise.all(p1.map(studentUrl =>
      cache.getStudent(studentUrl, session["userid"])
    )).then(newstudents => {
      setStudents([...students, ...newstudents]);
      setStudentUrls(p2);
    })
  }

  /**
   * the html that displays the 'email students' tab
   */
  return (
    <Row className="remaining_height fill_width">

      <SendEmailsPopUpWindow popUpShow={sendEmailsPopUpShow} setPopUpShow={setSendEmailsPopUpShow} students={receivers} />

      <Col className="fill_height">
        <Row className="fill_height">
          <EmailStudentsFilters students={students} filters={filters} />
          <Col className="fill_height students-list-paddingtop">
            <Row className="nomargin">
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
  )

}
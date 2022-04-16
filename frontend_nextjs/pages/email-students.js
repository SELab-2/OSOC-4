import React, {useEffect, useState} from "react";
import {getJson} from "../utils/json-requests";
import {Button, Col, Row} from "react-bootstrap";

import {useSession} from "next-auth/react";
import {urlManager} from "../utils/ApiClient";
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

  // These constant define wheater the pop-up windows should be shown or not
  const [sendEmailsPopUpShow, setSendEmailsPopUpShow] = useState(false);

  // These constants are initialized empty, the data will be inserted in useEffect
  const [students, setStudents] = useState(undefined);
  const [visibleStudents, setVisibleStudents] = useState(undefined);
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
        urlManager.getStudents().then(url =>
          getJson(url, { search: router.query.search || "", orderby: router.query.sortby || "" }).then(res => {
            Promise.all(res.map(studentUrl =>
              getJson(studentUrl).then(res => res)
            )).then(students => {
              setStudents(students);
              setLocalFilters([-1, -1]);
            })
          })
        );
      }

      // Check if the real filters have changed from the local filters. If so, update the localfilters and
      // filter the students.
      if (students &&
        (localFilters.some((filter, index) => filter !== filters[index].length ))) {
        let filterFunctions = [filterStudentsFilters, filterStudentsDecision];
        let filteredStudents = filterUndecided();
        filterStudents(filterFunctions, filteredStudents, localFilters, filters, setLocalFilters, setVisibleStudents);
      }
    }
  })

  /**
   * The email students tab does not show students with the decision 'Undecided',
   * This function filters them out of the list of students.
   * @returns {*} The list of students without students with the decision 'Undecided'.
   */
  function filterUndecided() {
    return students.filter(
      student => student["suggestions"].filter(suggestion => suggestion["definitive"]).length !== 0
    );
  }

  /**
   * This function filters the students for the general filters (the filters in filters[0]).
   * @param filteredStudents The list of students that need to be filtered.
   * @returns {*} The list of students that are allowed by the general filters.
   */
  function filterStudentsFilters(filteredStudents) {
    let newFilteredStudents = filteredStudents;

    // if filters[0] contains "no-correct-email", we filter the list so that only students who did not get the
    // correct email are in the resulting list
    if (filters[0].includes("no-correct-email")) {
      newFilteredStudents =  newFilteredStudents.filter(student =>
        ! student["suggestions"].filter(suggestion => suggestion["definitive"])[0]["mail_sent"]
      )
    }
    return newFilteredStudents;
  }

  /**
   * This function filters the studnets for the decision filters (the filters in filters[1]).
   * @param filteredStudents The list of students that need to be filtered.
   * @returns {*} The list of students that are allowed by the decision filters.
   */
  function filterStudentsDecision(filteredStudents) {
    let decisionNumbers = filters[1].map(studentDecision => ["no", "maybe", "yes"].indexOf(studentDecision))

    return filteredStudents.filter(student => {
      let decisions = student["suggestions"].filter(suggestion => suggestion["definitive"]);
      return decisionNumbers.length === 0 || decisionNumbers.includes(decisions[0]["decision"]);
    });
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
    if (visibleStudents === undefined) {
      return <LoadingPage />
    }
    if (visibleStudents.length === 0) {
      return "No students found"
    }
    return <EmailStudentsTable addToReceivers={addToReceivers} students={visibleStudents} />
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
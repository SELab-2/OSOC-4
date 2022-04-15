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

// The page corresponding with the 'email students' tab
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
  const [localFilters, setLocalFilters] = useState([-1, -1]);

  // These constants represent the filters
  const filters = [(router.query.filters) ? router.query.filters.split(",") : [],
    (router.query.decision) ? router.query.decision.split(",") : []]

  // This function inserts the data in the variables
  const { data: session, status } = useSession()
  useEffect(() => {
    if (session) {
      if ((!students) || (router.query.search !== search)) {
        setSearch(router.query.search);
        // the urlManager returns the url for the list of students
        urlManager.getStudents(router.query.sortby, router.query.search).then(url => getJson(url).then(res => {
            Promise.all(res.map(studentUrl =>
              getJson(studentUrl).then(res => res)
            )).then(students => {
              setStudents(students);
              setLocalFilters([-1, -1]);
            })
          })
        );
      }
      if (students &&
        (localFilters.some((filter, index) => filter !== filters[index].length ))) {
        let filterFunctions = [filterStudentsFilters, filterStudentsDecision];
        let filteredStudents = filterUndecided();
        filterStudents(filterFunctions, filteredStudents, localFilters, filters, setLocalFilters, setVisibleStudents);
      }
    }
  })

  function filterUndecided() {
    return students.filter(
      student => student["suggestions"].filter(suggestion => suggestion["definitive"]).length !== 0
    );
  }

  function filterStudentsFilters(filteredStudents) {
    if (filters[0].includes("no-correct-email")) {
      return filteredStudents.filter(student =>
        ! student["suggestions"].filter(suggestion => suggestion["definitive"])[0]["mail_sent"]
      )
    }
    return filteredStudents;
  }

  function filterStudentsDecision(filteredStudents) {
    let decisionNumbers = filters[1].map(studentDecision => ["no", "maybe", "yes"].indexOf(studentDecision))

    return filteredStudents.filter(student => {
      let decisions = student["suggestions"].filter(suggestion => suggestion["definitive"]);
      return decisionNumbers.length === 0 || decisionNumbers.includes(decisions[0]["decision"]);
    });
  }

  function addToReceivers(checked, student) {
    if (checked && receivers) {
      setReceivers(receivers.concat([student]));
    } else if (checked) {
      setReceivers([student]);
    } else if (receivers) {
      setReceivers(receivers.filter(receiver => receiver.id !== student.id));
    }
  }

  function getEmailStudentsTable() {
    if (visibleStudents === undefined) {
      return <LoadingPage />
    }
    if (visibleStudents.length === 0) {
      return "No students found"
    }
    return <EmailStudentsTable addToReceivers={addToReceivers} students={visibleStudents} />
  }

  // the html that displays the 'email students' tab
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
import React, { useEffect, useState } from "react";
import { getJson } from "../utils/json-requests";
import {Button, Col, Row} from "react-bootstrap";

import { useSession } from "next-auth/react";
import { urlManager } from "../utils/ApiClient";
import { useRouter } from "next/router";
import SearchSortBar from "../Components/select_students/SearchSortBar";
import EmailStudentsFilters from "../Components/email-students/EmailStudentsFilters";
import EmailStudentsTable from "../Components/email-students/EmailStudentsTable";

// The page corresponding with the 'select students' tab
export default function EmailStudents() {
  const router = useRouter();

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
        filterStudents(filterFunctions);
      }
    }
  })

  function filterStudents(filterFunctions) {
    let filteredStudents = students;
    let newLocalFilters = localFilters;
    for (let i = 0; i < localFilters.length; i++) {
      if (filters[i].length !== localFilters[i]) {
        newLocalFilters[i] = filters[i].length;
        filteredStudents = filterFunctions[i](filteredStudents);
      }
    }
    setLocalFilters(newLocalFilters);
    setVisibleStudents(filteredStudents);
  }

  function filterStudentsFilters(filteredStudents) {
    return filteredStudents;
  }

  function filterStudentsDecision(filteredStudents) {
    let decisionNumbers = filters[1].map(studentDecision => ["no", "maybe", "yes"].indexOf(studentDecision))

    filteredStudents = filteredStudents.filter(student => {
      let decisions = student["suggestions"].filter(suggestion => suggestion["definitive"]);
      return decisions.length !== 0 && (decisionNumbers.length === 0 || decisionNumbers.includes(decisions[0]));
    })

    return filteredStudents;
  }

  function addToReceivers(checked, student) {
    if (checked && receivers) {
      setReceivers(receivers.concat([student]));
    } else if (checked) {
      setReceivers([student]);
    } else if (receivers) {
      setReceivers(receivers.filter(receiver => receiver.id !== student.id));
    }
    console.log(receivers);
  }

  // the html that displays the overview of students
  return (
    <Row className="remaining_height fill_width">
      <Col className="fill_height">
        <Row className="fill_height">
          <EmailStudentsFilters students={students} filters={filters} />
          <Col className="fill_height students-list-paddingtop">
            <Row className="nomargin">
              <Col><SearchSortBar /></Col>
              <Col md="auto" className="change-emails-positioning">
                <Button className="change-emails-button btn-secondary">Change default emails</Button>
              </Col>
            </Row>
            <Row className="email-list-positioning">
              <EmailStudentsTable addToReceivers={addToReceivers} students={visibleStudents} />
            </Row>
            <Row className="send-emails-positioning">
              <Col/>
              <Col md="auto">
                <Button className="send-emails-button" disabled={! receivers || ! receivers.length}>Send emails</Button>
              </Col>
            </Row>
          </Col>
        </Row>
      </Col>
    </Row>
  )

}
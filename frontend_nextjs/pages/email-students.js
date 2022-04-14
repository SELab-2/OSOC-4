import React, { useEffect, useState } from "react";
import { getJson } from "../utils/json-requests";
import StudentsFilters from "../Components/select_students/StudentsFilters";
import { Col, Row } from "react-bootstrap";

import StudentList from "../Components/select_students/StudentList";
import { useSession } from "next-auth/react";
import { urlManager } from "../utils/ApiClient";
import { useRouter } from "next/router";
import StudentDetails from "../Components/select_students/StudentDetails";
import SearchSortBar from "../Components/select_students/SearchSortBar";

// The page corresponding with the 'select students' tab
export default function EmailStudents() {
  const router = useRouter();

  // These constants are initialized empty, the data will be inserted in useEffect
  const [students, setStudents] = useState(undefined);
  const [visibleStudent, setVisibleStudents] = useState(undefined);

  // These variables are used to notice if search or filters have changed
  const [search, setSearch] = useState("");
  const [localFilters, setLocalFilters] = useState([0, 0]);

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
              setLocalFilters([0, 0, 0]);
            })
          })
        );
      }
      if (students &&
        (localFilters.some((filter, index) => filter !== filters[index].length))) {
        let filterFunctions = [filterStudentsFilters, filterStudentsDecision];
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
      if (filters.every(filter => filter.length === 0)) {
        setVisibleStudents(students);
      }
    }
  })

  function filterStudentsFilters(filteredStudents) {
    return filteredStudents;
  }

  function filterStudentsDecision(filteredStudents) {
    let decisionNumbers = filters[2].map(studentDecision => ["no", "maybe", "yes"].indexOf(studentDecision))
    if (filters[2].length !== 0) {
      filteredStudents = filteredStudents.filter(student => {
        let decisions = student["suggestions"].filter(suggestion => suggestion["definitive"]);
        let decisionNumber = (decisions.length === 0) ? -1 : decisions[0]["decision"];
        return decisionNumbers.includes(decisionNumber);
      })
    }
    return filteredStudents;
  }

  // the html that displays the overview of students
  return (
    <Row className="remaining_height fill_width">
      <Col className="fill_height">
        <Row className="fill_height">
          <StudentsFilters students={students} filters={filters} />
          <Col className="fill_height students-list-paddingtop">
            <SearchSortBar />
            <Row className="student-list-positioning">
              <StudentList students={visibleStudent} />
            </Row>
          </Col>
        </Row>
      </Col>
    </Row>
  )

}
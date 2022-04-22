import { Col } from "react-bootstrap";
import StudentListelement from "./StudentListelement";
import LoadingPage from "../LoadingPage";
import InfiniteScroll from 'react-infinite-scroll-component';

import { useEffect, useState } from "react";

/**
 * This component represents te list of students in the 'select students' tab.
 * @param props props has a field students, which is the list of students that must be displayed.
 * @returns {JSX.Element} A component that renders the list of students in the 'select students' tab.
 */
export default function StudentList(props) {

  /**
   * this function renders the elements of the students. if it is not empty or undefined. when it is empty it displays
   * "No students found". When it is undefined, the students are still loading and a loading animation will be showed.
   * @returns {JSX.Element|JSX.Element[]|*} The elements of the students list, if it is not empty or undefined.
   * when it is empty it displays "No students found". When it is undefined, the students are still loading and a
   * loading animation will be showed.
   */
  function getStudents() {
    if (props.students && props.students.length > 0) {
      return props.students.map(student =>
        // generate a list of students, each student needs 'student' as a prop
        <li key={student.id}>
          <StudentListelement student={student} />
        </li>
      );
    }
    if (props.students) {
      return [<p />, <p>No students found</p>]
    }
    return <LoadingPage />
  }

  /**
   * returns the html representation for the student list
   */
  return (
    <Col className="fill_height scroll-overflow fill_width">
      <ul className="students_list fill_height">
        {getStudents()}
      </ul>
    </Col>
  )
}
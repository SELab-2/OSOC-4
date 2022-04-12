import { Col } from "react-bootstrap";
import StudentListelement from "./StudentListelement";
import { useEffect, useState } from "react";

export default function StudentList(props) {

  // function to get a list of students
  function getStudents() {
    if (props.students && props.students.length !== 0) {
      return props.students.map(student =>
        // generate a list of students, each student needs 'student' as a prop
        <li key={student[0]}>
          <StudentListelement studentId={student[0]} student={student[1]}/>
        </li>
      );
    }
    return [<p/>, <p>No students found</p>]
  }

  // returns the html representation for the student list
  return (
    <Col className="fill_height scroll-overflow fill_width">
      <ul className="students_list fill_height">
        {getStudents()}
      </ul>
    </Col>
  )
}
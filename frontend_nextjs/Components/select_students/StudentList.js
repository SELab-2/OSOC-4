import { Col } from "react-bootstrap";
import StudentListelement from "./StudentListelement";
import LoadingPage from "../LoadingPage";

export default function StudentList(props) {

  // function to get a list of students
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

  // returns the html representation for the student list
  return (
    <Col className="fill_height scroll-overflow fill_width">
      <ul className="students_list fill_height">
        {getStudents()}
      </ul>
    </Col>
  )
}
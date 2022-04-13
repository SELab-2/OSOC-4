import { Col } from "react-bootstrap";
import StudentListelement from "./StudentListelement";

export default function StudentList(props) {

  // function to get a list of students
  function getStudents() {
    if (props.students) {
      return props.students.map(student =>
        // generate a list of students, each student needs 'student' as a prop
        <li key={student[0]}>
          <StudentListelement student={student}/>
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
import { Col } from "react-bootstrap";
import StudentListelement from "./StudentListelement";
import { useEffect, useState } from "react";
import { getJson } from "../../utils/json-requests";
import { urlManager } from "../../utils/ApiClient";

export default function StudentList(props) {

  // These constants are initialized empty, the data will be inserted in useEffect
  const [students, setStudents] = useState(undefined);
  const [showInListTags, setShowInListTags] = useState([])


  // This function inserts the data in the variables
  useEffect(async () => {
    urlManager.getQuestionTags().then(questiontags_url => {
      getJson(questiontags_url).then(res => {
        console.log(res)

        Promise.all(res.map(url => getJson(url).then(r => {
          return r
        }))).then(values => {
          setShowInListTags(values.filter(tag => tag.showInList == true));
        })
      }
      )
    })
    if (!students) {
      setStudents(props.students)
    }
  }, [students, props.students])

  // function to get a list of students
  function getStudents() {
    if (students) {
      return students.map(student =>
        // generate a list of students, each student needs 'student' as a prop
        <li key={student}>
          <StudentListelement tags={showInListTags} student={student} />
        </li>
      );
    }
    return null;
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
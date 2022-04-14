import {Col, Table} from "react-bootstrap";
import React, {useState} from "react";
import StudentTableRow from "./StudentTableRow";


export default function EmailStudentsTable(props) {

  let receivers = [];

  function addToReceivers(checked, student) {
    console.log(student);
    if (checked) {
      receivers = receivers.concat([student]);
    } else {
      let index = receivers.indexOf(student);
      if (index > -1) {
        receivers.splice(index, 1);
      }
    }
    console.log(receivers);
  }

  // returns the html representation for the student list
  return (
    <Col className="fill_height scroll-overflow fill_width">
      <Table>
        <thead>
        <tr>
          <th>
            <p />
          </th>
          <th>
            <p>Name</p>
          </th>
          <th>
            <p>Email</p>
          </th>
          <th>
            <p>Decision</p>
          </th>
          <th>
            <p>Correct email sent</p>
          </th>
        </tr>
        </thead>
        <tbody>
        {(props.students && props.students.length) ?
          (props.students.map(student => (<StudentTableRow key={student.id} student={student}
                                                           addToReceivers={addToReceivers} />))) : null}
        </tbody>
      </Table>
    </Col>
  )
}
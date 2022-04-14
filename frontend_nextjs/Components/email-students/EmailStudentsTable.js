import {Col, Table} from "react-bootstrap";
import React, {useState} from "react";
import StudentTableRow from "./StudentTableRow";


export default function EmailStudentsTable(props) {

  // returns the html representation for the student list
  return (
    <Col className="fill_height scroll-overflow fill_width">
      <Table>
        <thead>
        <tr className="table-head">
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
        <tbody className="email-students-cell">
        {(props.students && props.students.length) ?
          (props.students.map(student => (<StudentTableRow key={student.id} student={student}
                                                           addToReceivers={props.addToReceivers} />))) : null}
        </tbody>
      </Table>
    </Col>
  )
}
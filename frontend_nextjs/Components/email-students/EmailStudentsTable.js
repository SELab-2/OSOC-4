import {Col, Row, Table} from "react-bootstrap";
import React, {useState} from "react";
import StudentTableRow from "./StudentTableRow";
import InfiniteScroll from "react-infinite-scroll-component";
import LoadingPage from "../LoadingPage";
import StudentListelement from "../select_students/StudentListelement";

/***
 * This element return the table of students in the 'email students page'. The table does not show students with
 * decision 'Undecided'.
 * @param props the props contain the list of students who will be displayed and 'addToReceivers',
 * a function to add or delete a student to the receivers of the emails
 * @returns {JSX.Element} an element that renders the table of students in the 'email students page'
 */
export default function EmailStudentsTable(props) {

  // returns the html representation for the student list
  return (
    <Col className="nomargin">
      <InfiniteScroll
        style={{
          "height": "calc(100vh - 254px)",
          "position": "relative"
        }}
        dataLength={props.students.length} //This is important field to render the next data
        next={props.fetchData}
        hasMore={props.studentUrls.length > 0}
        loader={<LoadingPage />}
        endMessage={
          <p style={{ textAlign: 'center' }}>
            <b>Yay! You have seen it all</b>
          </p>
        }
      >
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
          {props.students.map(student => (

            <StudentTableRow key={student.id} student={student} addToReceivers={props.addToReceivers} />

          ))}
        </tbody>
      </Table>
      </InfiniteScroll>
    </Col>
  )
}
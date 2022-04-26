import { Row } from "react-bootstrap";
import InfiniteScroll from "react-infinite-scroll-component";
import StudentListelement from "./StudentListelement";
import LoadingPage from "../LoadingPage"


export default function StudentList(props) {

  return (
    <Row className="infinite-scroll">
      <InfiniteScroll
        style={{
          "height": "calc(100vh - 146px)",
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
        {props.students.map((i, index) => (

          <StudentListelement key={index} student={i} studentsTab={props.studentsTab} />

        ))}
      </InfiniteScroll>
    </Row>
  )

}
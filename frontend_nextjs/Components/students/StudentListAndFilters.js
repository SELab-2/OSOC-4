import { Alert, Button, Col, Row } from "react-bootstrap";
import StudentsFilters from "./StudentsFilters";
import CheeseburgerMenu from "cheeseburger-menu";
import SearchSortBar from "./SearchSortBar";
import InfiniteScroll from "react-infinite-scroll-component";
import StudentListelement from "./StudentListelement";
import React, { useEffect, useState } from "react";
import useWindowDimensions from "../../utils/WindowDimensions";
import { api, Url } from "../../utils/ApiClient";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { cache } from "../../utils/ApiClient"
import { useWebsocketContext } from "../WebsocketProvider"
import LoadingPage from "../LoadingPage"
import filterIcon from "../../public/assets/show-filter-svgrepo-com.svg"
import Image from "next/image";
import { ToastContainer, toast } from 'react-toastify';

export default function StudentList(props) {

  const router = useRouter();

  const listheights = { "students": "178px", "emailstudents": "245px" } // The custom height for the studentlist for the page of key

  // These constants are initialized empty, the data will be inserted in useEffect
  const [studentUrls, setStudentUrls] = useState([]); // list of student you should show
  const [students, setStudents] = useState([]);  // list of all retrieved students (the data)

  // These variables are used to notice if search or filters have changed, they will have the values of search,
  // sortby and filters that we filtered for most recently.
  let [search, setSearch] = useState("");
  let [sortby, setSortby] = useState("first name+asc,last name+asc");
  const [decisions, setDecisions] = useState("");
  const [skills, setSkills] = useState("");
  const [ownSuggestion, setOwnSuggestion] = useState("")
  const [filters, setFilters] = useState("")
  const [unmatched, setUnmatched] = useState("")

  const { data: session, status } = useSession()
  const { height, width } = useWindowDimensions();

  const [showFilter, setShowFilter] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const { websocketConn } = useWebsocketContext();

  // clear all selected students when the list of students changes
  useEffect(() => {
      props.setSelectedStudents([]); // clear selected students
  }, [studentUrls])

  useEffect(() => {
    if (props.category === "emailstudents") {
      props.setStudents([...students.map(student => student.id), ...studentUrls])
    }
  }, [students, studentUrls, props.category])

  useEffect(() => {

    if (websocketConn) {
      websocketConn.addEventListener("message", updateDetailsFromWebsocket)

      return () => {
        websocketConn.removeEventListener('message', updateDetailsFromWebsocket)
      }
    }

  }, [websocketConn, students, studentUrls, router.query, decisions])

  useEffect(() => {
    if (session) {

      // Check if the search or sortby variable has changed from the search/sortby in the url. If so, update the
      // variables and update the students list. If the list is updated, we change the local filters. This will
      // provoke the second part of useEffect to filter the students again.
      if ((!studentUrls) || (router.query.search !== search) || (router.query.sortby !== sortby) || (router.query.decision !== decisions) || (router.query.skills !== skills) || (router.query.own_suggestion !== ownSuggestion) || (router.query.filters !== filters) || (router.query.unmatched !== unmatched)) {
        setSearch(router.query.search);
        setSortby(router.query.sortby);
        setDecisions(router.query.decision);
        setSkills(router.query.skills);
        setOwnSuggestion(router.query.own_suggestion)
        setFilters(router.query.filters);
        setUnmatched(router.query.unmatched)

        // the urlManager returns the url for the list of students
        fetchStudents().then(res => {
          if (res.success) {
            setErrorMessage("")
            let p1 = res.data.slice(0, 20);
            let p2 = res.data.slice(20);
            setStudentUrls(p2);
            Promise.all(p1.map(studentUrl =>
              cache.getStudent(studentUrl, session["userid"])
            )).then(newstudents => {
              setStudents([...newstudents]);
            })
          } else {
            setErrorMessage(res.error.response.data.message);
          }
        });
      }
    }
  }, [session, students, studentUrls, router.query, search, sortby])

  const fetchStudents = () => Url.fromName(api.editions_students).setParams(
    {
      decision: router.query.decision || "",
      search: router.query.search || "",
      orderby: router.query.sortby || "first name+asc,last name+asc",
      skills: router.query.skills || "",
      own_suggestion: router.query.own_suggestion || "",
      filters: router.query.filters || "",
      unmatched: router.query.unmatched || ""
    }
  ).get();

  const refreshStudents = () => {
    const studentsLength = students.length < 20 ? 20 : students.length;
    fetchStudents().then(res => {
      if (res.success) {
        let p1 = res.data.slice(0, studentsLength);
        let p2 = res.data.slice(studentsLength);
        setStudentUrls(p2);
        Promise.all(p1.map(studentUrl =>
          cache.getStudent(studentUrl, session["userid"])
        )).then(newstudents => {
          setStudents([...newstudents]);
        })
      }
    });
  }

  const updateDetailsFromWebsocket = async (event) => {
    let data = JSON.parse(event.data)
    await cache.updateCache(event.data, session["userid"]);
    refreshStudents();

    // if users student details is the deleted student => close the details page
    if ("deleted_student" in data) {
      let newQuery = router.query;
      if (newQuery.studentId.toString() === data["student_int"].toString()) {
        delete newQuery["studentId"];
        router.push({
          pathname: router.pathname,
          query: newQuery
        }, undefined, { shallow: true })
        toast.info("The student was deleted by an admin");
      }
    }

  }

  const fetchData = () => {

    let p1 = studentUrls.slice(0, 20);
    let p2 = studentUrls.slice(20);

    Promise.all(p1.map(studentUrl =>
      cache.getStudent(studentUrl, session["userid"])
    )).then(newstudents => {
      setStudents([...students, ...newstudents]);
      setStudentUrls(p2);
    })
  }

  return [
    <CheeseburgerMenu isOpen={showFilter} closeCallback={() => setShowFilter(false)}>
      <StudentsFilters />
    </CheeseburgerMenu>
    ,

    <Col className={(props.elementType === "students") ? "col nomargin student-list-positioning fill_height" :
      ((width > 1500) || (width > 1000 && !router.query.studentId && props.elementType === "students")) ?
        "col-4 nomargin student-list-positioning fill_height" :
        "col-5 nomargin student-list-positioning fill_height"} key="studentList">
      {!props.fullview &&
        <Row className="nomargin">
          <Button className="filter-btn" onClick={() => setShowFilter(!showFilter)}>
            <Image className="test" width="20%" height="20%" src={filterIcon} placeholder="empty" />
            <span>Filters</span>
          </Button>
        </Row>
      }
      <SearchSortBar />
      {errorMessage ?
        <Alert variant="danger">
          <Alert.Heading>{errorMessage}</Alert.Heading>
        </Alert>
        :
        <InfiniteScroll
          style={{
            // TODO find a better way to do this
            // TODO fix for portrait screens, test for non 1080p screens
            // ATTENTION THIS ONLY WORKS FOR SCREENS IN LANDSCAPE MODE
            // listheights[props.category] contains the custom offset for a given category. Default 155px for projects
            "height": listheights[props.category] ? `calc(100vh - ${listheights[props.category]})` : "calc(100vh - 155px)",
            "position": "relative",
            "transition": "height 0.6s"
          }}
          dataLength={students.length} //This is important field to render the next data
          height={1}
          next={fetchData}
          hasMore={studentUrls.length > 0}
          loader={<LoadingPage />}
          endMessage={
            <p style={{ textAlign: 'center' }}>
              <b>Yay! You have seen it all</b>
            </p>
          }
        >
          {students.map((i, index) => {
            if (props.category === "emailstudents") {
              return <StudentListelement key={i.id} student={i} setSelectedStudents={props.setSelectedStudents} selectedStudents={props.selectedStudents} elementType="emailstudents" />
            } else {
              return <StudentListelement selectedStudents={props.selectedStudents} setSelectedStudents={props.setSelectedStudents} key={i.id} student={i} elementType={props.elementType} />// elementType is projects or students
            }
          })}
        </InfiniteScroll>
      }
    </Col>,
    <ToastContainer />
  ]
}
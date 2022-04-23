import {Col, Row} from "react-bootstrap";
import StudentsFilters from "./StudentsFilters";
import CheeseburgerMenu from "cheeseburger-menu";
import HamburgerMenu from "react-hamburger-menu";
import SearchSortBar from "./SearchSortBar";
import InfiniteScroll from "react-infinite-scroll-component";
import StudentListelement from "./StudentListelement";
import React, {useEffect, useState} from "react";
import useWindowDimensions from "../../utils/WindowDimensions";
import {api, Url} from "../../utils/ApiClient";
import {useSession} from "next-auth/react";
import {useRouter} from "next/router";
import LoadingPage from "../LoadingPage";


export default function StudentListAndFilters(props) {

  const router = useRouter();

  const { height, width } = useWindowDimensions();

  const [showFilter, setShowFilter] = useState(false);

  // These constants are initialized empty, the data will be inserted in useEffect
  const [studentUrls, setStudentUrls] = useState([]);
  const [students, setStudents] = [props.students, props.setStudents];

  // These constants represent the filters
  const filters = [(router.query.filters) ? router.query.filters.split(",") : [],
    (router.query.skills) ? router.query.skills.split(",") : [],
    (router.query.decision) ? router.query.decision.split(",") : []]

  // These variables are used to notice if search or filters have changed, they will have the values of search,
  // sortby and filters that we filtered for most recently.
  let [search, setSearch] = useState("");
  let [sortby, setSortby] = useState("first name+asc,last name+asc");
  const [decisions, setDecisions] = useState("");
  const [skills, setSkills] = useState("");

  const [localFilters, setLocalFilters] = useState([0,0,0]);


  const [ws, setWs] = useState(undefined);

  const { data: session, status } = useSession()

  /**
   * This function is called when students, router.query.sortby, router.query.search or filters is changed
   */
  useEffect(() => {
    if (ws) {
      ws.onmessage = (event) => updateFromWebsocket(event);
    } else {
      const new_ws = new WebSocket("ws://localhost:8000/ws")
      new_ws.onmessage = (event) => updateFromWebsocket(event);
      setWs(new_ws);

    }

  }, [students, updateFromWebsocket, ws])

  useEffect(() => {
    if (session) {

      // Check if the search or sortby variable has changed from the search/sortby in the url. If so, update the
      // variables and update the students list. If the list is updated, we change the local filters. This will
      // provoke the second part of useEffect to filter the students again.
      if ((!studentUrls) || (router.query.search !== search) || (router.query.sortby !== sortby) || (router.query.decision !== decisions) || (router.query.skills !== skills)) {
        setSearch(router.query.search);
        setSortby(router.query.sortby);
        setDecisions(router.query.decision);
        setSkills(router.query.skills);

        // the urlManager returns the url for the list of students
        Url.fromName(api.editions_students).setParams({ decision: router.query.decision || "", search: router.query.search || "", orderby: router.query.sortby || "", skills: router.query.skills || "" }).get().then(res => {
          if (res.success) {
            setLocalFilters([0, 0, 0]);
            let p1 = res.data.slice(0, 10);
            let p2 = res.data.slice(10);
            setStudentUrls(p2);
            Promise.all(p1.map(studentUrl =>
              Url.fromUrl(studentUrl).get().then(res => {
                if (res.success) {
                  res = res.data;
                  Object.values(res["suggestions"]).forEach((item, index) => {
                    if (item["suggested_by_id"] === session["userid"]) {
                      res["own_suggestion"] = item;
                    }
                  });
                  return res;
                }
              })
            )).then(newstudents => {
              setStudents([...newstudents]);
              setLocalFilters([0, 0, 0]);
            })
          }
        });
      }
    }
  }, [session, students, studentUrls, router.query.search, router.query.sortby, router.query.decision, search, sortby, localFilters, filters])

  const updateFromWebsocket = (event) => {
    let data = JSON.parse(event.data)
    students.find((o, i) => {
      if (o["id"] === data["suggestion"]["student_id"]) {
        let new_students = [...students]
        new_students[i]["suggestions"][data["id"]] = data["suggestion"];
        setStudents(new_students);
        return true; // stop searching
      }
    });
  }

  /**
   * This function filters the students for the general filters (the filters in filters[0]).
   * @param filteredStudents The list of students that need to be filtered.
   * @returns {*} The list of students that are allowed by the general filters.
   */
  function filterStudentsFilters(filteredStudents) {
    return filteredStudents;
  }

  /**
   * This function filters the students for the skills filters (the filters in filters[1]).
   * @param filteredStudents The list of students that need to be filtered.
   * @returns {*} The list of students that are allowed by the skills filters.
   */
  function filterStudentsSkills(filteredStudents) {
    return filteredStudents;
  }

  const fetchData = () => {

    let p1 = studentUrls.slice(0, 10);
    let p2 = studentUrls.slice(10);

    Promise.all(p1.map(studentUrl =>
      Url.fromUrl(studentUrl).get().then(res => {
        if (res.success) {
          res = res.data;
          Object.values(res["suggestions"]).forEach((item, index) => {
            if (item["suggested_by_id"] === session["userid"]) {
              res["own_suggestion"] = item;
            }
          });
          return res;
        }
      })
    )).then(newstudents => {
      setStudents([...students, ...newstudents]);
      setStudentUrls(p2);
    })
  }

  return [
    ((width > 1500) || (width > 1000 && !props.studentId && props.studentsTab)) ?
      <Col md="auto" key="studentFilters">
        <StudentsFilters students={students} filters={filters} />
      </Col>
      :
      <CheeseburgerMenu isOpen={showFilter} closeCallback={() => setShowFilter(false)} key="hamburger">
        <StudentsFilters students={students} filters={filters} />
      </CheeseburgerMenu>
    ,

    (width > 800 || (!props.studentId && props.studentsTab)) &&

    <div className={(props.studentsTab)? "col nomargin student-list-positioning":
      ((width > 1500) || (width > 1000 && !props.studentId && props.studentsTab)) ?
        "col-4 nomargin student-list-positioning": "col-5 nomargin student-list-positioning"} key="studentList" >
      <Row className="nomargin">
        {!((width > 1500) || (width > 1000 && !props.studentId && props.studentsTab)) &&
          <Col md="auto">
            <div className="hamburger">
              <HamburgerMenu
                isOpen={showFilter}
                menuClicked={() => setShowFilter(!showFilter)}
                width={18}
                height={15}
                strokeWidth={1}
                rotate={0}
                color='black'
                borderRadius={0}
                animationDuration={0.5}
              />
            </div>
          </Col>

        }
        <Col><SearchSortBar /></Col>
      </Row>
      <Row className="infinite-scroll">
        <InfiniteScroll
          style={{
            "height": "calc(100vh - 146px)",
            "position": "relative"
          }}
          dataLength={students.length} //This is important field to render the next data
          next={fetchData}
          hasMore={studentUrls.length > 0}
          loader={<LoadingPage />}
          endMessage={
            <p style={{ textAlign: 'center' }}>
              <b>Yay! You have seen it all</b>
            </p>
          }
        >
          {students.map((i, index) => (

            <StudentListelement key={index} student={i} studentsTab={props.studentsTab}/>

          ))}
        </InfiniteScroll>
      </Row>
    </div>

  ]
}
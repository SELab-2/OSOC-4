import { Button, Row } from "react-bootstrap";
import StudentsFilters from "./StudentsFilters";
import CheeseburgerMenu from "cheeseburger-menu";
import SearchSortBar from "./SearchSortBar";
import InfiniteScroll from "react-infinite-scroll-component";
import StudentListelement from "./StudentListelement";
import React, { useEffect, useContext, useState } from "react";
import useWindowDimensions from "../../utils/WindowDimensions";
import { api, Url } from "../../utils/ApiClient";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { cache } from "../../utils/ApiClient"
import { useWebsocketContext } from "../WebsocketProvider"
import LoadingPage from "../LoadingPage"
import EmailStudentListElement from "../email-students/EmailStudentListelement"
import filterIcon from "../../public/assets/show-filter-svgrepo-com.svg"
import Image from "next/image";

export default function StudentList(props) {

  const router = useRouter();

  const listheights = { "students": "195px", "emailstudents": "264px" } // The custom height for the studentlist for the page of key

  // These constants are initialized empty, the data will be inserted in useEffect
  const [studentUrls, setStudentUrls] = useState([]);
  const [students, setStudents] = useState([]);

  // These variables are used to notice if search or filters have changed, they will have the values of search,
  // sortby and filters that we filtered for most recently.
  let [search, setSearch] = useState("");
  let [sortby, setSortby] = useState("first name+asc,last name+asc");
  const [decisions, setDecisions] = useState("");
  const [skills, setSkills] = useState("");
  const [ownSuggestion, setOwnSuggestion] = useState("")
  const [filters, setFilters] = useState("")

  const { data: session, status } = useSession()
  const { height, width } = useWindowDimensions();

  const [showFilter, setShowFilter] = useState(false);

  const { websocketConn } = useWebsocketContext();

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
      if ((!studentUrls) || (router.query.search !== search) || (router.query.sortby !== sortby) || (router.query.decision !== decisions) || (router.query.skills !== skills) || (router.query.own_suggestion !== ownSuggestion) || (router.query.filters !== filters)) {
        setSearch(router.query.search);
        setSortby(router.query.sortby);
        setDecisions(router.query.decision);
        setSkills(router.query.skills);
        setOwnSuggestion(router.query.own_suggestion)
        setFilters(router.query.filters);

        // the urlManager returns the url for the list of students
        Url.fromName(api.editions_students).setParams(
          {
            decision: router.query.decision || "",
            search: router.query.search || "",
            orderby: router.query.sortby || "first name+asc,last name+asc",
            skills: router.query.skills || "",
            own_suggestion: router.query.own_suggestion || "",
            filters: router.query.filters || ""
          }
        ).get().then(res => {
          if (res.success) {
            let p1 = res.data.slice(0, 20);
            let p2 = res.data.slice(20);
            setStudentUrls(p2);
            Promise.all(p1.map(studentUrl =>
              cache.getStudent(studentUrl, session["userid"])
            )).then(newstudents => {
              setStudents([...newstudents]);
            })
          }
        });
      }
    }
  }, [session, students, studentUrls, router.query.search, router.query.sortby, router.query.decision, router.query.skills, router.query.own_suggestion, search, sortby, router.query.filters])


  const updateDetailsFromWebsocket = (event) => {
    let data = JSON.parse(event.data)
    if ("suggestion" in data) {
      students.find((o, i) => {
        if (o["id"] === data["suggestion"]["student_id"]) {
          let new_students = [...students]
          new_students[i]["suggestions"][data["id"]] = data["suggestion"];
          if (data["suggestion"]["suggested_by_id"] === session["userid"]) {
            new_students[i]["own_suggestion"] = data["suggestion"];
          }
          setStudents(new_students);
          return true; // stop searching
        }
      });

    } else if ("decision" in data) {
      let found = students.find((o, i) => {
        if (o["id"] === data["id"]) {

          // if filtered on decisions
          if (decisions && !decisions.includes(["no", "maybe", "yes", "undecided"][data["decision"]["decision"]])) {
            // remove the student
            let students_copy = [...students];
            students_copy.splice(i, 1);
            setStudents(students_copy)
          } else {
            let new_students = [...students]
            new_students[i]["decision"] = data["decision"]["decision"];
            new_students[i]["email_sent"] = false;
            setStudents(new_students);
          }
          return true;
        }

      })
      if (found) {
        return true;
      }
      // get last shown user and index of the user as fallback
      if (students) {
        const laststudent = students.at(-1);
        const lastindex = students.length - 1;

        console.log("getting new urls")
        // get the new studenturls
        Url.fromName(api.editions_students).setParams({ decision: router.query.decision || "", search: router.query.search || "", orderby: router.query.sortby || "", skills: router.query.skills || "" }).get().then(res => {
          if (res.success) {
            // find the index of the laststudent in the new url list
            let foundstudent = res.data.indexOf(laststudent.id)
            if (foundstudent === -1) {
              foundstudent = lastindex;
            }
            if (foundstudent < 10) {
              foundstudent = 10;
            }
            let p1 = res.data.slice(0, foundstudent);
            let p2 = res.data.slice(foundstudent);
            setStudentUrls(p2);
            Promise.all(p1.map(studentUrl => {
              // get the student from the cache + update the decision (needed when cache updated later than studentlis)
              let student = cache.getStudent(studentUrl, session["userid"])
              student["decision"] = data["decision"]["decision"];
              student["email_sent"] = false;
              return student;
            }
            )).then(newstudents => {
              setStudents([...newstudents]);
            })
          }
        });
      } else {
        Url.fromName(api.editions_students).setParams({ decision: router.query.decision || "", search: router.query.search || "", orderby: router.query.sortby || "", skills: router.query.skills || "" }).get().then(res => {
          if (res.success) {
            let p1 = res.data.slice(0, 10);
            let p2 = res.data.slice(10);
            setStudentUrls(p2);
            Promise.all(p1.map(studentUrl => {
              // get the student from the cache + update the decision (needed when cache updated later than studentlis)
              let student = cache.getStudent(studentUrl, session["userid"])
              student["decision"] = data["decision"]["decision"];
              student["email_sent"] = false;
              return student;
            }

            )).then(newstudents => {
              setStudents([...newstudents]);
            })
          }
        });
      }
    } else if ("email_sent" in data) {

      students.find((o, i) => {
        if (o["id"] === data["id"]) {
          let new_students = [...students]
          new_students[i]["email_sent"] = data["email_sent"];
          setStudents(new_students);
          return true; // stop searching
        }
      });


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
    !((width > 1500) || (width > 1000 && !router.query.studentId && props.studentsTab)) &&
    <CheeseburgerMenu isOpen={showFilter} closeCallback={() => setShowFilter(false)}>
      <StudentsFilters />
    </CheeseburgerMenu>
    ,

    (width > 800 || (!router.query.studentId && props.studentsTab)) &&

    <div className={(props.studentsTab) ? "col nomargin student-list-positioning fill_height" :
      ((width > 1500) || (width > 1000 && !router.query.studentId && props.studentsTab)) ?
        "col-4 nomargin student-list-positioning fill_height" :
        "col-5 nomargin student-list-positioning fill_height"} key="studentList">
      {!((width > 1500) || (width > 1000 && !router.query.studentId && props.studentsTab)) &&
        <Row className="nomargin">
          <Button className="filter-btn" onClick={() => setShowFilter(!showFilter)}>
            <Image className="test" width="20%" height="20%" src={filterIcon} placeholder="empty" />
            <span>Filters</span>
          </Button>
        </Row>
      }
      <SearchSortBar />
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
            return <EmailStudentListElement key={i.id} student={i} setSelectedStudents={props.setSelectedStudents} selectedStudents={props.selectedStudents} />
          } else {
            return <StudentListelement selectedStudent={props.selectedStudent} setSelectedStudent={props.setSelectedStudent} key={i.id} student={i} studentsTab={props.studentsTab} />
          }

        })}
      </InfiniteScroll>
    </div>

  ]
}
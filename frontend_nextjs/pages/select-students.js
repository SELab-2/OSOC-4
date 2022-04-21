import React, { useEffect, useState } from "react";
import StudentsFilters from "../Components/select_students/StudentsFilters";
import { Col, Row } from "react-bootstrap";
import StudentListelement from "../Components/select_students/StudentListelement";
import { useSession } from "next-auth/react";
import { api, Url } from "../utils/ApiClient";
import { useRouter } from "next/router";
import StudentDetails from "../Components/select_students/StudentDetails";
import SearchSortBar from "../Components/select_students/SearchSortBar";
import InfiniteScroll from 'react-infinite-scroll-component';
import useWindowDimensions from '../utils/WindowDimensions';
import CheeseburgerMenu from 'cheeseburger-menu'
import HamburgerMenu from 'react-hamburger-menu'

// This function filters the list of students, it is also used in email-students
export function filterStudents(filterFunctions, students, localFilters, filters, setLocalFilters, setVisibleStudents) {
    let filteredStudents = students
    let newLocalFilters = localFilters;
    for (let i = 0; i < localFilters.length; i++) {
        newLocalFilters[i] = filters[i].length;
        filteredStudents = filterFunctions[i](filteredStudents);
    }
    setLocalFilters(newLocalFilters);
    setVisibleStudents(filteredStudents);
}

// The page corresponding with the 'select students' tab
export default function SelectStudents() {
    const router = useRouter();

    // These constants are initialized empty, the data will be inserted in useEffect
    const [students, setStudents] = useState([]);
    const [studentUrls, setStudentUrls] = useState([]);

    const [visibleStudent, setVisibleStudents] = useState(undefined);
    const studentId = router.query.studentId

    // These variables are used to notice if search or filters have changed
    let [search, setSearch] = useState("");
    let [sortby, setSortby] = useState("first name+asc,last name+asc");
    const [localFilters, setLocalFilters] = useState([0, 0, 0]);

    // These constants represent the filters
    const filters = [(router.query.filters) ? router.query.filters.split(",") : [],
    (router.query.skills) ? router.query.skills.split(",") : [],
    (router.query.decision) ? router.query.decision.split(",") : []]

    const [ws, setWs] = useState(undefined);

    // This function inserts the data in the variables
    const { data: session, status } = useSession()
    const { height, width } = useWindowDimensions();

    const [showFilter, setShowFilter] = useState(false);

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
        console.log(router.query.sortby)
        if (session) {
            if ((!studentUrls) || (router.query.search !== search) || (router.query.sortby !== sortby)) {
                setSearch(router.query.search);
                setSortby(router.query.sortby);

                // the urlManager returns the url for the list of students
                Url.fromName(api.editions_students).setParams({ search: router.query.search || "", orderby: router.query.sortby || "" }).get().then(res => {
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
            // if (students &&
            //     (localFilters.some((filter, index) => filter !== filters[index].length))) {
            //     let filterFunctions = [filterStudentsFilters, filterStudentsSkills, filterStudentsDecision];
            //     filterStudents(filterFunctions, students, localFilters, filters, setLocalFilters, setVisibleStudents);
            // }
            // if (filters.every(filter => filter.length === 0)) {
            //     setVisibleStudents(students);
            // }
        }
    }, [session, students, studentUrls, router.query.search, router.query.sortby, search, sortby, localFilters, filters, filterStudentsDecision])

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

    function filterStudentsFilters(filteredStudents) {
        return filteredStudents;
    }

    function filterStudentsSkills(filteredStudents) {
        return filteredStudents;
    }

    function filterStudentsDecision(filteredStudents) {
        let decisionNumbers = filters[2].map(studentDecision => ["no", "maybe", "yes"].indexOf(studentDecision))
        if (filters[2].length !== 0) {
            filteredStudents = filteredStudents.filter(student => {
                let decisions = Object.values(student["suggestions"]).filter(suggestion => suggestion["definitive"]);
                let decisionNumber = (decisions.length === 0) ? -1 : decisions[0]["decision"];
                return decisionNumbers.includes(decisionNumber);
            })
        }
        return filteredStudents;
    }

    function getStudentById() {
        if (students) {
            return students.find((o, i) => {
                if (o["id_int"] === studentId) {
                    return o;
                }
            });
        }
        return undefined;
    }


    const fetchData = () => {

        let p1 = studentUrls.slice(0, 10);
        let p2 = studentUrls.slice(10);
        // 
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



    // the html that displays the overview of students
    return (

        <Row>
            {((width > 1500) || (width > 1000 && !studentId)) ?
                <Col md="auto">
                    <StudentsFilters students={students} filters={filters} />
                </Col>
                :
                <CheeseburgerMenu isOpen={showFilter} closeCallback={() => setShowFilter(false)}>
                    <StudentsFilters students={students} filters={filters} />
                </CheeseburgerMenu>
            }
            {(width > 800 || !studentId) &&

                <Col className="nomargin student-list-positioning">
                        <Row className="nomargin">
                            {!((width > 1500) || (width > 1000 && !studentId)) &&
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
                              }}
                              dataLength={students.length} //This is important field to render the next data
                              next={fetchData}
                              hasMore={studentUrls.length > 0}
                              loader={<h4>Loading...</h4>}
                              endMessage={
                                  <p style={{ textAlign: 'center' }}>
                                      <b>Yay! You have seen it all</b>
                                  </p>
                              }
                            >
                                {students.map((i, index) => (

                                  <StudentListelement key={index} student={i} />

                                ))}
                            </InfiniteScroll>
                        </Row>
                </Col>

            }

            {
                (studentId) &&
                <Col>
                    <StudentDetails student={getStudentById()} student_id={studentId} />
                </Col>
            }
        </Row >
    )

}
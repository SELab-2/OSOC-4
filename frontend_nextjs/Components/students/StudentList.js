import { set } from "cypress/types/lodash";
import { useState } from "react";

export default function StudentFilter(props) {
    const router = useRouter();

    // These constants are initialized empty, the data will be inserted in useEffect
    const [studentUrls, setStudentUrls] = useState([]);
    const [students, setStudents] = useState([]);

    // These variables are used to notice if search or filters have changed, they will have the values of search,
    // sortby and filters that we filtered for most recently.
    let [search, setSearch] = useState("");
    let [sortby, setSortby] = useState("first name+asc,last name+asc");
    const [decisions, setDecisions] = useState("");
    const [skills, setSkills] = useState("");
    const [filters, setFilters] = useState("")

    const { data: session, status } = useSession()

    useEffect(() => {
        if (session) {

            // Check if the search or sortby variable has changed from the search/sortby in the url. If so, update the
            // variables and update the students list. If the list is updated, we change the local filters. This will
            // provoke the second part of useEffect to filter the students again.
            if ((!studentUrls) || (router.query.search !== search) || (router.query.sortby !== sortby) || (router.query.decision !== decisions) || (router.query.skills !== skills) || (router.query.filters !== filters)) {
                setSearch(router.query.search);
                setSortby(router.query.sortby);
                setDecisions(router.query.decision);
                setSkills(router.query.skills);
                setFilters(router.query.filters);

                // the urlManager returns the url for the list of students
                Url.fromName(api.editions_students).setParams(
                    {
                        decision: router.query.decision || "",
                        search: router.query.search || "",
                        orderby: router.query.sortby || "",
                        skills: router.query.skills || "",
                        filters: router.query.filters || "",
                    }
                ).get().then(res => {
                    if (res.success) {
                        setLocalFilters([0, 0, 0]);
                        let p1 = res.data.slice(0, 10);
                        let p2 = res.data.slice(10);
                        setStudentUrls(p2);
                        Promise.all(p1.map(studentUrl =>
                            cache.getStudent(studentUrl, session["userid"])
                        )).then(newstudents => {
                            setStudents([...newstudents]);
                            setLocalFilters([0, 0, 0]);
                        })
                    }
                });
            }
        }
    }, [session, students, studentUrls, router.query.search, router.query.sortby, router.query.decision, search, sortby, router.query.filters])

}
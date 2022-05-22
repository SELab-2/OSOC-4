import { useEffect, useState } from "react";
import { Col, Row } from "react-bootstrap";
import StudentsFilter from "./StudentFilter";
import { useRouter } from "next/router";
import { api, Url } from "../../utils/ApiClient";

/**
 * this function adds or removes a filter from the filters, the changes are made in the url.
 * @param query The old query of the url.
 * @param filter The name of the filter category from which the filter must be added/removed.
 * @param startItems The current filters in the filter chosen filter category.
 * @param itemName The name of the filter that must be added or removed.
 * @param value True if the filter must be added, False if it must be removed.
 */
export function addFilterGlobal(query, filter, startItems, itemName, value) {
    let newQuery = query;
    let newItems = startItems;
    if (value) {
        newItems = startItems.concat([itemName]);
    } else {
        let index = startItems.indexOf(itemName);
        if (index > -1) {
            startItems.splice(index, 1);
            newItems = startItems;
        }
    }
    newQuery[filter] = newItems.join(",");
    return newQuery
}

/**
 * This component represents the filters in the students tab.
 * @returns {JSX.Element} the component that renders the student filters.
 * @constructor
 */
export default function StudentsFilters() {

    const router = useRouter();

    // These constants are initialized empty, the data will be inserted in useEffect
    const [extendedRoleList, setExtendedRoleList] = useState(false);
    const [allSkills, setAllSkills] = useState([]);
    const [filteredSkills, setFilteredSkills] = useState([]);

    // These variables represent the filters of the different categories

    const filters = (router.query.filters) ? router.query.filters.split(",") : []
    const chosenSkills = (router.query.skills) ? router.query.skills.split(",") : []
    const decision = (router.query.decision) ? router.query.decision.split(",") : []
    const own_suggestion = (router.query.own_suggestion) ? router.query.own_suggestion.split(",") : []
    const unmatched = router.query.unmatched || ""

    /**
     * This useEffect initializes the state variables allSkills and filteredSkills.
     */
    useEffect(() => {
        Url.fromName(api.skills).get().then(async res => {
            if (res.success) {
                res = res.data;
                if (res) {
                    setAllSkills(res);
                    setFilteredSkills(res);
                }
            }
        })
    }, [])

    /**
     * This function is called when pressed on "reset filters", it resets the filters to their original values.
     * The changes are made to the url.
     */
    function resetFilters() {
        let newQuery = router.query;
        delete newQuery["filters"];
        delete newQuery["decision"];
        delete newQuery["skills"];
        delete newQuery["unmatched"];
        delete newQuery["own_suggestion"];

        router.push({
            pathname: router.pathname,
            query: newQuery
        }, undefined, { shallow: true })
    }

    /**
     * this function makes all the skills visible
     */
    const showMore = () => {
        setExtendedRoleList(true);
    }

    /**
     * this function makes only 5 skills visible
     */
    const showLess = () => {
        setExtendedRoleList(false);
    }

    /**
     * returns a list of html StudentFilters, which represents the skills of students, only 5 elements or the whole
     * list are rendered depending on extendedRoleList.
     * @returns {unknown[]|null} A list of html StudentFilters, which represents the skills of students, only 5 elements
     * or the whole list are returned depending on extendedRoleList.
     */
    function getSkills() {
        if (filteredSkills) {
            let shownSkills = filteredSkills;

            if (!extendedRoleList) {
                shownSkills = filteredSkills.slice(0, 5);
            }

            return shownSkills.map((skill, index) =>
                <StudentsFilter filter_id={skill} filter_text={skill}
                    value={chosenSkills.includes(skill)}
                    onChange={(ev) => addFilter("skills", chosenSkills, skill, ev.target.checked)} />
            );
        }
        return null;
    }

    /**
     * get the html representation for the 'more or less' button, the button to show more or less skills.
     * @returns {JSX.Element} The html representation for the 'more or less' button, the button to show more or less
     * skills.
     */
    function moreOrLessButton() {
        if (filteredSkills.length > 5) {
            if (extendedRoleList) {
                return <button className="more-or-less-button" id="less-skills-button" onClick={showLess}>Less</button>
            }
            return <button className="more-or-less-button" id="more-skills-button" onClick={showMore}>More</button>
        }
    }

    /**
     * this function adds or removes a filter from the filters, the changes are made in the url.
     * @param filter The name of the filter category from which the filter must be added/removed.
     * @param startItems The current filters in the filter chosen filter category.
     * @param itemName The name of the filter that must be added or removed.
     * @param value True if the filter must be added, False if it must be removed.
     */
    function addFilter(filter, startItems, itemName, value) {
        let newQuery = addFilterGlobal(router.query, filter, startItems, itemName, value)
        router.push({
            pathname: router.pathname,
            query: newQuery
        }, undefined, { shallow: true })
    }

    function searchSkills(value) {
        let searchedString = value.toLowerCase();
        setFilteredSkills(allSkills.filter(skill =>
            skill.toLowerCase().startsWith(searchedString) ||
            skill.split(" ").some(partSkill => partSkill.toLowerCase().startsWith(searchedString))));
    }

    /**
     * The HTML representation of the filters in the 'Select students' tab
     */
    return (
        <Col md="auto" className="filters fill_height scroll-overflow" key="studentFilters">
            <Row className="title-row-filters">
                <Col>
                    <h2 className="filters-title">Filters</h2>
                </Col>
                <Col />
                <Col md="auto" style={{ alignSelf: "center" }}>
                    <button className="reset-filters-button" onClick={resetFilters}>
                        Reset filters
                    </button>
                </Col>
            </Row>

            <StudentsFilter filter_id="alumni_checkbox" filter_text="Only alumni" value={filters.includes("alumni")}
                onChange={(ev) => addFilter("filters", filters, "alumni", ev.target.checked)} />
            <StudentsFilter filter_id="student-coach-volunteers-checkbox" filter_text="Only student coach volunteers"
                value={filters.includes("student-coach")}
                onChange={(ev) => addFilter("filters", filters, "student-coach", ev.target.checked)} />
            <StudentsFilter filter_id="unmatched-students-checkbox" filter_text="Only unmatched students"
                value={(unmatched === "true")}
                onChange={(ev) => addFilter("unmatched", [], "true", ev.target.checked)} />

            <Row className="filter-title">
                <Col><h3>Skills</h3></Col>
            </Row>
            <Row className="skills-search-filters">
                <Col>
                    <input type="text" id="search-skills-filters" className="search" placeholder="Search skills"
                        onChange={(ev) => searchSkills(ev.target.value)} />
                </Col>
            </Row>
            {getSkills()}
            <Row>
                <Col>{moreOrLessButton()}</Col>
            </Row>

            <Row className="filter-title">
                <Col><h3>Decision</h3></Col>
            </Row>

            <StudentsFilter filter_id="yes-checkbox" filter_text="Yes" value={decision.includes("yes")}
                onChange={(ev) => addFilter("decision", decision, "yes", ev.target.checked)} />
            <StudentsFilter filter_id="maybe-checkbox" filter_text="Maybe" value={decision.includes("maybe")}
                onChange={(ev) => addFilter("decision", decision, "maybe", ev.target.checked)} />
            <StudentsFilter filter_id="no-checkbox" filter_text="No" value={decision.includes("no")}
                onChange={(ev) => addFilter("decision", decision, "no", ev.target.checked)} />
            <StudentsFilter filter_id="undecided-checkbox" filter_text="Undecided"
                value={decision.includes("undecided")}
                onChange={(ev) => addFilter("decision", decision, "undecided", ev.target.checked)} />


            <Row className="filter-title">
                <Col><h3>Own Suggestion</h3></Col>
            </Row>

            <StudentsFilter filter_id="none-suggestion-checkbox" filter_text="No suggestion"
                value={own_suggestion.includes("no-suggestion")}
                onChange={(ev) => addFilter("own_suggestion", own_suggestion, "no-suggestion", ev.target.checked)} />
            <StudentsFilter filter_id="yes-sugguestion-checkbox" filter_text="Yes" value={own_suggestion.includes("yes")}
                onChange={(ev) => addFilter("own_suggestion", own_suggestion, "yes", ev.target.checked)} />
            <StudentsFilter filter_id="maybe-suggestion-checkbox" filter_text="Maybe" value={own_suggestion.includes("maybe")}
                onChange={(ev) => addFilter("own_suggestion", own_suggestion, "maybe", ev.target.checked)} />
            <StudentsFilter filter_id="no-suggestion-checkbox" filter_text="No" value={own_suggestion.includes("no")}
                onChange={(ev) => addFilter("own_suggestion", own_suggestion, "no", ev.target.checked)} />

        </Col>
    )
}
import {
    Button,
    Col,
    Row,
} from "react-bootstrap";
import React, { useEffect, useState, useContext } from "react";
import SuggestionsCount from "./SuggestionsCount";
import Suggestion from "./Suggestion"
import GeneralInfo from "./GeneralInfo"
import SuggestionPopUpWindow from "./SuggestionPopUpWindow"
import DecisionPopUpWindow from "./DecisionPopUpWindow"
import SendCustomEmailPopUp from "./SendCustomEmailPopUp";
import deleteIcon from '../../public/assets/delete.svg';
import DeletePopUpWindow from "./DeletePopUpWindow";
import { useRouter } from "next/router";
import closeIcon from "../../public/assets/close.svg";
import Image from "next/image";

import { Url, api } from "../../utils/ApiClient";
import { getDecisionString } from "./StudentListelement";
import { useSession } from "next-auth/react";
import LoadingPage from "../LoadingPage"
import { useWebsocketContext } from "../WebsocketProvider"
import Hint from "../Hint";

/**
 * This component returns the details of a student
 * @param props props has the field studentId. The studentId holds the url of the student
 * @returns {JSX.Element} The component that renders the student details
 */
export default function StudentDetails(props) {

    const router = useRouter();

    // These constants are initialized empty, the data will be inserted in useEffect
    // These constants contain info about the student
    const [student, setStudent] = useState(undefined);
    const [suggestions, setSuggestions] = useState([]);
    const [decision, setDecision] = useState(-1);
    const [questionAnswers, setQuestionAnswers] = useState([])

    // These constants define wheater the pop-up windows should be shown or not
    const [suggestionPopUpShow, setSuggestionPopUpShow] = useState(false);
    const [decisionPopUpShow, setDecisionPopUpShow] = useState(false);
    const [emailPopUpShow, setEmailPopUpShow] = useState(false);
    const [deletePopUpShow, setDeletePopUpShow] = useState(false);

    // These constants contain the value of the decide field and which suggestion window should be shown
    const [suggestion, setSuggestion] = useState(0);
    const [decideField, setDecideField] = useState(-1);
    const [detailLoading, setDetailLoading] = useState(true);

    const { websocketConn } = useWebsocketContext();
    const { data: session, status } = useSession()
    const [prevStudentid, setPrevStudentid] = useState(undefined)

    useEffect(() => {

        if (websocketConn) {
            websocketConn.addEventListener("message", updateFromWebsocket)

            return () => {
                websocketConn.removeEventListener('message', updateFromWebsocket)
            }
        }

    }, [websocketConn, student])

    /**
     * This function is called when studentId or props.student_id is changed
     */
    useEffect(() => {
        // Only fetch the data if the wrong student is loaded

        if (!student || prevStudentid !== router.query.studentId) {
            setPrevStudentid(router.query.studentId)
            setDetailLoading(true)
            Url.fromName(api.students).extend(`/${router.query.studentId}`).get(null, true).then(retrieved_student => {
                setStudent(retrieved_student.data);
                setDecision(retrieved_student.data["decision"])
                setDecideField(retrieved_student.data["decision"])
                setSuggestions(retrieved_student.data["suggestions"]);
                // Fill in the questionAnswers
                Url.fromUrl(retrieved_student.data["question-answers"]).get().then(res => {
                    if (res.success) {
                        setQuestionAnswers(res["data"]);
                    }
                })
                setDetailLoading(false)
            })
        }


    }, [router.query.studentId]);

    const updateFromWebsocket = (event) => {
        let data = JSON.parse(event.data)
        if ("suggestion" in data) {
            if (student && student["id"] === data["suggestion"]["student_id"]) {
                let new_student = student
                new_student["suggestions"][data["id"]] = data["suggestion"];
                if (data["suggestion"]["suggested_by_id"] === session["userid"]) {
                    new_student["own_suggestion"] = data["suggestion"];
                }
                setStudent({ ...new_student })
            }

        } else if ("decision" in data) {
            if (student && student["id"] === data["id"]) {
                let new_student = student
                new_student["decision"] = data["decision"]["decision"];
                new_student["email_sent"] = false
                setStudent({ ...new_student })
                setDecision(data["decision"]["decision"])
                setDecideField(data["decision"]["decision"])
            }
        } else if ("email_sent" in data) {

            if (student && student["id"] === data["id"]) {
                let new_student = student
                new_student["email_sent"] = data["email_sent"];
                setStudent({ ...new_student });
                return true; // stop searching
            }



        }
    }

    // counts the amount of suggestions for a certain value: "yes", "maybe" or "no"
    /**
     * This function counts the amount of suggestions for a certain value: "yes", "maybe", or "no".
     * @param decision De type of suggestions that need to be counted ("yes", "maybe", or "no").
     * @returns {number} The amount of suggestions of the given type for the student.
     */
    function getSuggestionsCount(decision) {
        return Object.values(suggestions).filter(suggestion => suggestion["decision"] === decision).length;
    }

    // returns a list of html suggestions, with the correct css classes.
    // If there are no suggestions: this returns "No suggestions"
    /**
     * This function generates a list of html suggestions, with the correct css classes.
     * If there ar no suggestions this function returns "No suggestions".
     * @returns {JSX.Element|*[]} A list of html suggestions, with the correct css classes.
     * If there ar no suggestions this function returns "No suggestions".
     */
    function getSuggestions() {
        let result = [];
        const classes = ["suggestions-circle-red", "suggestions-circle-yellow", "suggestions-circle-green"];

        const sortedsuggestions = Object.values(suggestions).sort((a, b) => a.decision < b.decision);

        for (let i = 0; i < sortedsuggestions.length; i++) {
            let suggestion = sortedsuggestions[i];
            let classNames = "suggestions-circle " + classes[suggestion["decision"]];
            result.push(<Suggestion key={i} suggestion={suggestion} classNames={classNames}
                classNamesText={(suggestion["suggested_by_id"] === session["userid"]) ?
                    "bold_text" : "null"} />)
        }

        if (result.length > 0) {
            return result;
        }
        return <Row>No suggestions</Row>
    }

    /**
     * This function is called when you click on 'suggest yes', 'suggest maybe' or 'suggest no', it will show the correct
     * pop-up window.
     * @param suggestion "yes", "maybe" or "no", depending on which button is clicked.
     */
    function suggest(suggestion) {
        setSuggestion(suggestion);
        setSuggestionPopUpShow(true);
    }

    /**
     * This function is called when the student details are closed, it will go back to the studetn list with filters,
     * without reloading the page
     */
    function hideStudentDetails() {
        let newQuery = router.query;
        delete newQuery["studentId"];
        router.push({
            pathname: router.pathname,
            query: newQuery
        }, undefined, { shallow: true })
    }

    /**
     * This function renders the (question, answer) pairs from the tally form that don't have a questionTag.
     * @returns {JSX.Element[][]} A list of (question, answer) pairs from the tally form that don't have a questionTag.
     */
    function getQuestionAnswers() {
        return questionAnswers.map((questionAnswer, i) =>
            [
                <Row key={"question" + i}
                    className="student-details-question nomargin">{questionAnswer["question"]}</Row>,
                <Row key={"answer" + i} className="student-details-answer nomargin">{questionAnswer["answer"]}</Row>
            ]
        )
    }

    function updateSuggestion(suggestion) {
        setStudent(prevState => ({
            ...prevState,
            ["own_suggestion"]: suggestion
        }));
    }

    if (detailLoading) {
        return (
            <Col className="student-details-window" style={{ "position": "relative", "height": "calc(100vh - 75px)" }}>
                <LoadingPage />
            </Col>)
    }

    return (
        <Col className="student-details-window" style={{ "height": "calc(100vh - 75px)" }}>
            {student["mandatory"] &&
                <div>
                    <SuggestionPopUpWindow popUpShow={suggestionPopUpShow} setPopUpShow={setSuggestionPopUpShow}
                        updateSuggestion={updateSuggestion} decision={suggestion} student={student} />
                    <DecisionPopUpWindow popUpShow={decisionPopUpShow} setPopUpShow={setDecisionPopUpShow}
                        decision={decideField} student={student} />
                    <SendCustomEmailPopUp popUpShow={emailPopUpShow} setPopUpShow={setEmailPopUpShow}
                        decision={decision} student={student} />
                    <DeletePopUpWindow popUpShow={deletePopUpShow} setPopUpShow={setDeletePopUpShow} student={student} />
                </div>
            }

            <Row className="nomargin">
                <Col xs="auto">
                    <h1>{student["mandatory"] ? student["mandatory"]["first name"] : ""} {student["mandatory"] ? student["mandatory"]["last name"] : ""}</h1>
                    <Row className="nomargin" style={{marginBottom: "15px"}}>
                        <ul className="nomargin nopadding">
                            {(student["skills"]) && student["skills"].map((skill, index) =>
                                <li className="skill" style={{ display: "inline-block" }}
                                    key={index}>{skill["name"].toUpperCase()}</li>)}
                        </ul>
                    </Row>
                </Col>
                <Col>
                    <Hint message="Delete the student">
                        <button className="delete-button" onClick={() => setDeletePopUpShow(true)}>
                            <Image src={deleteIcon} className="delete-icon" />
                        </button>
                    </Hint>
                </Col>
                <Col />
                <Col xs="auto" className="close-button">
                    <Hint message="Close the details">
                        <Image onClick={() => hideStudentDetails()} className="d-inline-block align-top"
                               src={closeIcon} alt="close-icon" width="25px" height="25px" objectFit={'contain'} />
                    </Hint>
                </Col>
            </Row>
            <Row className="info-and-buttons nomargin">
                <Col md="auto">
                    <Row md="auto" className="decision nomargin">
                        <GeneralInfo listelement={false} student={student} decision={getDecisionString(decision)} />
                    </Row>
                    <Row md="auto" className="nomargin">
                        <Button className="send-email-button"
                                onClick={() => setEmailPopUpShow(true)}>
                            Send email
                        </Button>
                    </Row>
                </Col>
                <Col xs="auto" className="buttongroup-paddingtop">
                    <Row>
                        <Col xs="auto" className="nopadding">
                            <Hint message="Suggest yes">
                                <button className="suggest-yes-button suggest-button" onClick={() => suggest(2)}>Yes</button>
                            </Hint>
                        </Col>
                        <Col xs="auto" className="nopadding">
                            <Hint message="Suggest maybe">
                                <button className="suggest-maybe-button suggest-button" onClick={() => suggest(1)}>Maybe</button>
                            </Hint>
                        </Col>
                        <Col xs="auto" className="nopadding">
                            <Hint message="Suggest no">
                                <button className="suggest-no-button suggest-button" onClick={() => suggest(0)}>No</button>
                            </Hint>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                        <select className="dropdown-decision" id="dropdown-decision"
                                onChange={(ev) => setDecideField(ev.target.value)} value={decideField}>
                                <option value={-1}>Undecided</option>
                                <option value={0}>No</option>
                                <option value={1}>Maybe</option>
                                <option value={2}>Yes</option>
                            </select>
                        </Col>
                        <Col md="auto">
                            <Hint message="Confirms the decision">
                                <Button className="suggest-confirm-button" disabled={decideField == decision}
                                    onClick={() => setDecisionPopUpShow(true)}>
                                    Confirm
                                </Button>
                            </Hint>
                        </Col>
                    </Row>
                </Col>
            </Row>
            <Row className="nomargin" md="auto" style={{}}>
                <Col className="fill_height scroll-overflow">

                    <Row md="auto" className="h2-titles student-details-suggestions-line nomargin">
                        <Col md="auto" className="suggestions-title"><h2>Suggestions</h2></Col>
                        <SuggestionsCount ownsuggestion={student["own_suggestion"]} suggestionsYes={getSuggestionsCount(2)}
                            suggestionsMaybe={getSuggestionsCount(1)}
                            suggestionsNo={getSuggestionsCount(0)} />
                    </Row>
                    {getSuggestions()}

                    <h2 className="h2-titles">Questions</h2>
                    {getQuestionAnswers()}
                </Col>
            </Row>

        </Col>
    )
}

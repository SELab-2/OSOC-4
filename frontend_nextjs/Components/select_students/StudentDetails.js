import {
  Button,
  Col, Dropdown,
  Row
} from "react-bootstrap";
import React, { useEffect, useState } from "react";
import SuggestionsCount from "./SuggestionsCount";
import Suggestion from "./Suggestion"
import GeneralInfo from "./GeneralInfo"
import SuggestionPopUpWindow from "./SuggestionPopUpWindow"
import DecisionPopUpWindow from "./DecisionPopUpWindow"
import SendEmailPopUpWindow from "./SendEmailPopUpWindow";
import deleteIcon from '../../public/assets/delete.svg';
import DeletePopUpWindow from "./DeletePopUpWindow";
import { useRouter } from "next/router";
import closeIcon from "../../public/assets/close.svg";
import Image from "next/image";

import { Url } from "../../utils/ApiClient";
import { getDecisionString } from "./StudentListelement";
import { useSession } from "next-auth/react";
import LoadingPage from "../LoadingPage"

/**
 * This component returns the details of a student
 * @param props props has the field studentId. The studentId holds the url of the student
 * @returns {JSX.Element} The component that renders the student details
 */
export default function StudentDetails(props) {

  const router = useRouter();

  // These constants are initialized empty, the data will be inserted in useEffect
  // These constants contain info about the student
  const [student, setStudent] = useState({});
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


  const { data: session, status } = useSession()

  /**
   * This function is called when studentId or props.student_id is changed
   */
  useEffect(() => {
    // Only fetch the data if the wrong student is loaded
    if (props.student) {
      setStudent(props.student);
      setDecision(props.student["decision"])
      setDecideField(props.student["decision"])
      setSuggestions(props.student["suggestions"]);
      // Fill in the questionAnswers
      Url.fromUrl(props.student["question-answers"]).get().then(res => {
        if (res.success) {
          setQuestionAnswers(res["data"]);
        }
      })
    }

  }, [props.student]);

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

    for (let i = 0; i < Object.values(suggestions).length; i++) {
      let suggestion = Object.values(suggestions)[i];
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
        <Row key={"question" + i} className="student-details-question">{questionAnswer["question"]}</Row>,
        <Row key={"answer" + i} className="student-details-answer">{questionAnswer["answer"]}</Row>
      ]
    )
  }

  function updateSuggestion(suggestion) {
    setStudent(prevState => ({
      ...prevState,
      ["own_suggestion"]: suggestion
    }));
  }

  if (props.loading) {
    return (
      <Col className="student-details-window" style={{ "position": "relative", "height": "calc(100vh - 75px)" }} >
        <LoadingPage />
      </Col>)
  }

  return (
    <Col className="student-details-window" style={{ "height": "calc(100vh - 75px)", visibility: props.visibility }} >
      {student["mandatory"] &&
        <div>
          <SuggestionPopUpWindow popUpShow={suggestionPopUpShow} setPopUpShow={setSuggestionPopUpShow} updateSuggestion={updateSuggestion} decision={suggestion} student={student} />
          <DecisionPopUpWindow popUpShow={decisionPopUpShow} setPopUpShow={setDecisionPopUpShow} decision={decideField} student={student} />
          <SendEmailPopUpWindow popUpShow={emailPopUpShow} setPopUpShow={setEmailPopUpShow} decision={decision} student={student} />
          <DeletePopUpWindow popUpShow={deletePopUpShow} setPopUpShow={setDeletePopUpShow} student={student} />
        </div>
      }


      <Row className="details-upper-layer">
        <Col md="auto">
          <Row>
            <Col xs="auto" className="name_big">
              {student["mandatory"] ? student["mandatory"]["first name"] : ""} {student["mandatory"] ? student["mandatory"]["last name"] : ""}
            </Col>
            <Col>
              <button className="delete-button" onClick={() => setDeletePopUpShow(true)}>
                <Image src={deleteIcon} className="delete-icon" />
              </button>
            </Col>
          </Row>
          <Row>
            <Col md="auto" className="skill">VIDEO EDITOR</Col>
          </Row>
        </Col>
        <Col />
        <Col xs="auto" className="buttongroup-paddingtop">
          <Row>
            <Col xs="auto" className="nopadding">
              <button className="suggest-yes-button suggest-button" onClick={() => suggest(2)}>Yes</button>
            </Col>
            <Col xs="auto" className="nopadding">
              <button className="suggest-maybe-button suggest-button" onClick={() => suggest(1)}>Maybe</button>
            </Col>
            <Col xs="auto" className="nopadding">
              <button className="suggest-no-button suggest-button" onClick={() => suggest(0)}>No</button>
            </Col>
            <Col xs="auto" className="close-button">
              <Image onClick={() => hideStudentDetails()} className="d-inline-block align-top"
                src={closeIcon} alt="close-icon" width="42px" height="42px" objectFit={'contain'} />
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
              <Button className="suggest-confirm-button" disabled={decideField == decision} onClick={() => setDecisionPopUpShow(true)}>
                Confirm
              </Button>
            </Col>
          </Row>
        </Col>
      </Row >
      <Row className="remaining-height-details" md="auto" style={{}}>
        <Col md="auto" className="fill_height scroll-overflow student-details">
          <Row md="auto" className="decision">
            <GeneralInfo listelement={false} student={student} decision={getDecisionString(decision)} />
          </Row>
          <Row md="auto">
            <Button className="send-email-button" disabled={decision === -1} onClick={() => setEmailPopUpShow(true)}>
              Send email
            </Button>
          </Row>
          <Row md="auto" className="student-details-suggestions-line h2-titles">
            <Col md="auto" className="suggestions-title"><h2>Suggestions</h2></Col>
            <SuggestionsCount suggestionsYes={getSuggestionsCount(2)} suggestionsMaybe={getSuggestionsCount(1)}
              suggestionsNo={getSuggestionsCount(0)} />
          </Row>
          {getSuggestions()}
          <Row md="auto" className="h2-titles">
            <Col md="auto"><h2>Questions</h2></Col>
          </Row>
          {getQuestionAnswers()}
        </Col>
      </Row>

    </Col >
  )
}

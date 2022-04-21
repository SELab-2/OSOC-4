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

import { api, Url } from "../../utils/ApiClient";
import { getDecisionString } from "./StudentListelement";
import { useSession } from "next-auth/react";

// This function returns the details of a student
export default function StudentDetails(props) {

  const router = useRouter();
  // These constants are initialized empty, the data will be inserted in useEffect
  // These constants contain info about the student
  const [student, setStudent] = useState({});
  const [studentId, setStudentId] = useState(undefined);
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

  // This function inserts the data in the variables
  useEffect(() => {
    // Only fetch the data if the wrong student is loaded
    if (studentId !== props.student_id && props.student_id) {
      setStudentId(props.student_id);
      if (!props.student) {
        Url.fromName(api.students).extend(`/${props.student_id}`).get().then(res => {
          if (res.success) {
            res = res.data;
            Object.values(res["suggestions"]).forEach((item, index) => {
              if (item["suggested_by_id"] === session["userid"]) {
                res["own_suggestion"] = item;
              }
            });

            setStudent(res);

            // Fill in the suggestions field, this contains all the suggestions which are not definitive
            setSuggestions(res["suggestions"]);

            // Fill in the decisions field, this contains the decision for the student if there is one,
            // this decision is stored as a suggestion which is definitive
            let decisions = Object.values(res["suggestions"]).filter(suggestion => suggestion["definitive"]);
            if (decisions.length !== 0) {
              setDecision(decisions[0]["decision"]);
            } else {
              setDecision(-1);
            }

            // Fill in the questionAnswers
            Url.fromUrl(res["question-answers"]).get().then(res => {
              if (res.success) { setQuestionAnswers(res.data); }
            })
          }
        });
      }

      else {
        setStudent(props.student);
        setSuggestions(props.student["suggestions"]);
        let decisions = Object.values(props.student["suggestions"]).filter(suggestion => suggestion["definitive"]);
        if (decisions.length !== 0) {
          setDecision(decisions[0]["decision"]);
        } else {
          setDecision(-1);
        }

        // Fill in the questionAnswers
        Url.fromUrl(props.student["question-answers"]).get().then(res => {
          if (res.success) {
            setQuestionAnswers(res.data);
          }
        })
      }
    }
  }, [studentId, props.student_id, props.student, session]);

  // counts the amount of suggestions for a certain value: "yes", "maybe" or "no"
  function getSuggestionsCount(decision) {
    return Object.values(suggestions).filter(suggestion => suggestion["decision"] === decision).length;
  }

  // returns a list of html suggestions, with the correct css classes.
  // If there are no suggestions: this returns "No suggestions"
  function getSuggestions() {
    let result = [];
    const classes = ["suggestions-circle-red", "suggestions-circle-yellow", "suggestions-circle-green"];

    for (let i = 0; i < Object.values(suggestions).length; i++) {
      let suggestion = Object.values(suggestions)[i];
      let classNames = "suggestions-circle " + classes[suggestion["decision"]];
      result.push(<Suggestion key={i} suggestion={suggestion} classNames={classNames} />)
    }

    if (result.length > 0) {
      return result;
    }
    return <Row>No suggestions</Row>
  }

  // called when you click on 'suggest yes', 'suggest maybe' or 'suggest no', it will show the correct pop-up window
  function suggest(suggestion) {
    setSuggestion(suggestion);
    setSuggestionPopUpShow(true);
  }

  // this function is called when the student details are closed, it will go back to the student list with filters,
  // without reloading the page
  function hideStudentDetails() {
    let newQuery = router.query;
    delete newQuery["studentId"];
    router.push({
      pathname: router.pathname,
      query: newQuery
    }, undefined, { shallow: true })
  }

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

  // returns the html for student details
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
            <Col xs="auto" className="nopadding"><button className={`suggest-yes-button suggest-button ${(student["own_suggestion"]) ? (student["own_suggestion"]["decision"] === 2 ? "suggest-button-selected" : "") : ""}`} onClick={() => suggest(2)}>
              Yes</button>
            </Col>
            <Col xs="auto" className="nopadding"><button className={`suggest-maybe-button suggest-button ${(student["own_suggestion"]) ? (student["own_suggestion"]["decision"] === 1 ? "suggest-button-selected" : "") : ""}`} onClick={() => suggest(1)}>
              Maybe</button>
            </Col>
            <Col xs="auto" className="nopadding"><button className={`suggest-no-button suggest-button ${(student["own_suggestion"]) ? (student["own_suggestion"]["decision"] === 0 ? "suggest-button-selected" : "") : ""}`} onClick={() => suggest(0)}>
              No</button>
            </Col>
            <Col xs="auto" className="close-button">
              <Image onClick={() => hideStudentDetails()} className="d-inline-block align-top" src={closeIcon} alt="close-icon" width="42px" height="42px" objectFit={'contain'} />
            </Col>
          </Row>
          <Row>
            <Col>
              <select className="dropdown-decision" id="dropdown-decision"
                onChange={(ev) => setDecideField(ev.target.value)}>
                <option value="-1">Decision</option>
                <option value="2">Yes</option>
                <option value="1">Maybe</option>
                <option value="0">No</option>
              </select>
            </Col>
            <Col md="auto">
              <Button className="suggest-confirm-button" disabled={decideField < 0} onClick={() => setDecisionPopUpShow(true)}>
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
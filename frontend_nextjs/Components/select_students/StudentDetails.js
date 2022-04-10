import {
  Button,
  Col,
  Row
} from "react-bootstrap";
import { useEffect, useState } from "react";
import SuggestionsCount from "./SuggestionsCount";
import Suggestion from "./Suggestion"
import GeneralInfo from "./GeneralInfo"
import { getJson } from "../../utils/json-requests";
import SuggestionPopUpWindow from "./SuggestionPopUpWindow"
import DecisionPopUpWindow from "./DecisionPopUpWindow"
import SendEmailPopUpWindow from "./SendEmailPopUpWindow";
import deleteIcon from '../../public/assets/delete.svg';
import DeletePopUpWindow from "./DeletePopUpWindow";
import { useRouter } from "next/router";
import { getStudentPath } from "../../routes";
import closeIcon from "../../public/assets/close.svg";
import Image from "next/image";

// This function returns the details of a student
export default function StudentDetails(props) {

  const router = useRouter();
  // These constants are initialized empty, the data will be inserted in useEffect
  // These constants contain info about the student
  const [student, setStudent] = useState({});
  const [studentId, setStudentId] = useState(undefined);
  const [suggestions, setSuggestions] = useState([]);
  const [decision, setDecision] = useState(-1);

  // These constant define wheater the pop-up windows should be shown or not
  const [suggestionPopUpShow, setSuggestionPopUpShow] = useState(false);
  const [decisionPopUpShow, setDecisionPopUpShow] = useState(false);
  const [emailPopUpShow, setEmailPopUpShow] = useState(false);
  const [deletePopUpShow, setDeletePopUpShow] = useState(false);

  // These constants contain the value of the decide field and which suggestion window should be shown
  const [suggestion, setSuggestion] = useState(0);
  const [decideField, setDecideField] = useState(-1);

  // This function inserts the data in the variables
  useEffect(() => {
    // Only fetch the data if the wrong student is loaded
    if (studentId !== props.student_id && props.student_id) {
      setStudentId(props.student_id);
      getJson(getStudentPath(props.student_id)).then(res => {
        setStudent(res);

        // Fill in the suggestions field, this contains all the suggestions which are not definitive
        setSuggestions(res["suggestions"].filter(suggestion => !suggestion["definitive"]));

        // Fill in the decisions field, this contains the decision for the student if there is one,
        // this decision is stored as a suggestion which is definitive
        let decisions = res["suggestions"].filter(suggestion => suggestion["definitive"]);
        if (decisions.length !== 0) {
          setDecision(decisions[0]["decision"]);
        } else {
          setDecision(-1);
        }
      })
    }
  })

  // return a string representation of the decision
  function getDecision() {
    if (decision === -1) {
      return "Undecided"
    }
    let decisionwords = ["No", "Maybe", "Yes"];
    return decisionwords[decision];
  }

  // counts the amount of suggestions for a certain value: "yes", "maybe" or "no"
  function getSuggestionsCount(decision) {
    return suggestions.filter(suggestion => suggestion["decision"] === decision).length;
  }

  // returns a list of html suggestions, with the correct css classes.
  // If there are no suggestions: this returns "No suggestions"
  function getSuggestions() {
    let result = [];
    const classes = ["suggestions-circle-red", "suggestions-circle-yellow", "suggestions-circle-green"];

    for (let i = 0; i < suggestions.length; i++) {
      let suggestion = suggestions[i];
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
    router.push({
      pathname: router.pathname
    }, undefined, { shallow: true })
  }

  // returns the html for student details
  return (
    <Col className="fill_height student-details-window" style={{ visibility: props.visibility }} >

      <SuggestionPopUpWindow popUpShow={suggestionPopUpShow} setPopUpShow={setSuggestionPopUpShow} decision={suggestion} student={student} />
      <DecisionPopUpWindow popUpShow={decisionPopUpShow} setPopUpShow={setDecisionPopUpShow} decision={decideField} student={student} />
      <SendEmailPopUpWindow popUpShow={emailPopUpShow} setPopUpShow={setEmailPopUpShow} decision={decision} student={student} />
      <DeletePopUpWindow popUpShow={deletePopUpShow} setPopUpShow={setDeletePopUpShow} student={student} />

      <Row className="details-upper-layer">
        <Col md="auto">
          <Row>
            <Col md="auto" className="name_big">
              {student["first name"]} {student["last name"]}
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
        <Col md="auto">
          <Row>
            <Col md="auto"><button className="suggest-yes-button suggest-button" onClick={() => suggest(2)}>
              Suggest yes</button>
            </Col>
            <Col md="auto"><button className="suggest-maybe-button suggest-button" onClick={() => suggest(1)}>
              Suggest maybe</button>
            </Col>
            <Col md="auto"><button className="suggest-no-button suggest-button" onClick={() => suggest(0)}>
              Suggest no</button>
            </Col>
            <Col md="auto" className="close-button">
              <Image onClick={() => hideStudentDetails()} className="d-inline-block align-top" src={closeIcon} alt="close-icon" width="52px" height="52px" objectFit={'contain'} />
            </Col>
          </Row>
          <Row>
            <Col>
              <select className="dropdown-decision" id="dropdown-decision"
                onChange={(ev) => setDecideField(ev.target.value)}>
                <option value="-1">Undecided</option>
                <option value="2">Yes</option>
                <option value="1">Maybe</option>
                <option value="0">No</option>
              </select>
            </Col>
            <Col md="auto">
              <Button className="suggest-confirm-button" disabled={decideField === -1} onClick={() => setDecisionPopUpShow(true)}>
                Confirm
              </Button>
            </Col>
          </Row>
        </Col>
      </Row>
      <Row className="remaining-height-details" md="auto" style={{}}>
        <Col md="auto" className="fill_height scroll-overflow student-details">
          <Row md="auto" className="decision">
            <GeneralInfo student={student} decision={getDecision()} />
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
        </Col>
      </Row>
    </Col>
  )
}
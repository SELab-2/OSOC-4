import {
  Button,
  Col,
  Row
} from "react-bootstrap";
import {useEffect, useState} from "react";
import SuggestionsCount from "./SuggestionsCount";
import Suggestion from "./Suggestion"
import GeneralInfo from "./GeneralInfo"
import {getJson} from "../../utils/json-requests";
import SuggestionPopUpWindow from "./SuggestionPopUpWindow"
import DecisionPopUpWindow from "./DecisionPopUpWindow"
import SendEmailPopUpWindow from "./SendEmailPopUpWindow";
import deleteIcon from '../../public/assets/delete.svg';
import editIcon from '../../public/assets/edit.svg'
import DeletePopUpWindow from "./DeletePopUpWindow";
import {getSelectStudentsPath, getStudentPath, getStudentsPath} from "../../routes";
import {router} from "next/client";
import closeIcon from "../../public/assets/close.svg";
import Image from "next/image";

// This function returns the details of a student
export default function StudentDetails(props) {

  // These constants are initialized empty, the data will be inserted in useEffect
  const [student, setStudent] = useState({});
  const [studentId, setStudentId] = useState(undefined);
  const [suggestions, setSuggestions] = useState([]);

  const [suggestionPopUpShow, setSuggestionPopUpShow] = useState(false);
  const [decisionPopUpShow, setDecisionPopUpShow] = useState(false);
  const [emailPopUpShow, setEmailPopUpShow] = useState(false);
  const [deletePopUpShow, setDeletePopUpShow] = useState(false);

  const [decision, setDecision] = useState(-1);
  const [suggestion, setSuggestion] = useState(0);
  const [confirmButton, setConfirmButton] = useState(true);
  const [decideField, setDecideField] = useState(-1);

  // This function inserts the data in the variables
  useEffect( () => {
    if (studentId !== props.student_id) {
      setStudentId(props.student_id);
      getJson(getStudentPath(props.student_id)).then(res => {
        setStudent(res);

        setSuggestions(res["suggestions"].filter(suggestion => ! suggestion["definitive"]));

        let decisions = res["suggestions"].filter(suggestion => suggestion["definitive"]);
        if (decisions.length !== 0) {
          setDecision(decisions[0]["decision"]);
        } else {
          setDecision(-1);
        }
      })
    }
  })

  function getDecision() {
    if (decision === -1) {
      return "Undecided"
    }
    let decisionwords = ["No", "Maybe", "Yes"];
    return decisionwords[decision];
  }

  function getSuggestionsCount(decision) {
    return suggestions.filter(suggestion => suggestion["decision"] === decision).length;
  }

  function getSuggestions() {
    let result = [];
    let classes = ["suggestions-circle-red", "suggestions-circle-yellow", "suggestions-circle-green"];

    for (let i = 0; i < suggestions.length; i ++) {
      let suggestion = suggestions[i];
      let classNames = "suggestions-circle " + classes[suggestion["decision"]];
      result.push(<Suggestion key={i} suggestion={suggestion} classNames={classNames}/>)
    }

    if (result.length > 0) {
      return result;
    }
    return <Row>No suggestions</Row>
  }

  function suggest(suggestion) {
    setSuggestion(suggestion);
    setSuggestionPopUpShow(true);
  }

  // returns the html for student details
  return(
      <Col className="fill_height student-details-window">

          <SuggestionPopUpWindow popUpShow={suggestionPopUpShow} setPopUpShow={setSuggestionPopUpShow} decision={suggestion} student={student}/>
          <DecisionPopUpWindow popUpShow={decisionPopUpShow} setPopUpShow={setDecisionPopUpShow} decision={decideField} student={student} />
          <SendEmailPopUpWindow popUpShow={emailPopUpShow} setPopUpShow={setEmailPopUpShow} decision={decision} student={student} />
          <DeletePopUpWindow popUpShow={deletePopUpShow} setPopUpShow={setDeletePopUpShow} student={student} />

          <Row>
            <Col />
            <Col md="auto">
                <Image  onClick={() => router.push(getSelectStudentsPath())} className="d-inline-block align-top" src={closeIcon} alt="close-icon" width="36px" height="36px" objectFit={'contain'} />
            </Col>
          </Row>
          <Row className="details-upper-layer">
            <Col md="auto">
              <Row>
                <Col md="auto" className="name_big">
                  {student["name"]}
                </Col>
                <Col>
                  <button className="delete-button" onClick={() => setDeletePopUpShow(true)}>
                    <Image src={deleteIcon} className="delete-icon"/>
                  </button>
                </Col>
              </Row>
              <Row>
                <Col md="auto" className="skill">VIDEO EDITOR</Col>
              </Row>
            </Col>
            <Col/>
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
          <Row className="remaining-height-details" md="auto">
            <Col md="auto" className="fill_height scroll-overflow student-details">
              <Row md="auto" className="first-h2-titles"><Col><h2>General</h2></Col></Row>
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
                                  suggestionsNo={getSuggestionsCount(0)}/>
              </Row>
              {getSuggestions()}
            </Col>
          </Row>
      </Col>
  )
}
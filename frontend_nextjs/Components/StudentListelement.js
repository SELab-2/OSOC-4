import {useEffect, useState} from "react";
import {getJson} from "../utils/json-requests";

import {
  getDegreeQuestionId, getFirstLanguageQuestionId, getLevelOfEnglishQuestionId,
  getQuestionAnswersPath, getRolesPath,
  getStudyQuestionId,
  getSuggestionsPath
} from "../routes";
import {Col, Container, Row} from "react-bootstrap";

export default function StudentListelement(props) {

  // These constants are initialized empty, the data will be inserted in useEffect
  const [student, setStudent] = useState(undefined);
  const [name, setName] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsYes, setSuggestionsYes] = useState(0);
  const [suggestionsMaybe, setSuggestionsMaybe] = useState(0);
  const [suggestionsNo, setSuggestionsNo] = useState(0);
  const [decision,setDecision] = useState(-1);
  const [skills, setSkills] = useState([]);
  const [studies, setStudies] = useState(undefined);
  const [degree, setDegree] = useState(undefined);
  const [fistLanguage, setFirstLanguage] = useState(undefined);
  const [levelOfEnglish, setLevelOfEnglish] = useState(undefined);
  const [practicalProblems, setPracticalProblems] = useState(0);

  // This function inserts the data in the variables
  useEffect(() => {
    // only insert data if the student in still undefined
    if (!student) {
      setStudent(props.student)
      setName(props.student.name)
      let localStudent = props.student;

      // check if there are no suggestions yet
      if (suggestions.length === 0) {
        getJson(getSuggestionsPath()).then(res => {
          let possibleSuggestions = res.data;
          // only get the suggestions of the current student
          let localSuggestions = possibleSuggestions.filter(suggestion => suggestion.student === localStudent.id);
          setSuggestions(localSuggestions);

          // filter the suggestions on yes, maybe or no
          setSuggestionsYes(localSuggestions.filter(
            suggestion => suggestion.decision === 2 && (! suggestion.definitive)).length);
          setSuggestionsMaybe(localSuggestions.filter(
            suggestion => suggestion.decision === 1 && (! suggestion.definitive)).length);
          setSuggestionsNo(localSuggestions.filter(
            suggestion => suggestion.decision === 0 && (! suggestion.definitive)).length);

          // get the decision from the suggestions if there is one
          let newDecision = localSuggestions.filter(suggestion => suggestion.definitive);
          if (newDecision.length) {
            setDecision(newDecision[0].decision);
          }
        })
      }

      // check if there are no skills yet
      if (skills.length === 0) {
        getJson(getRolesPath()).then(res => {
          let skillObjs = res.data.filter(skill => localStudent.skills.includes(skill.id));
          setSkills(skillObjs.map(skill => skill.name));
        })
      }

      
      if (studies === undefined) {
        getJson(getQuestionAnswersPath()).then(res => {
          let questionAnswers = res.data.filter(questionAnswer => localStudent.question_answers.includes(questionAnswer.id));

          setStudies(questionAnswers.find((questionAnswer => questionAnswer.question === getStudyQuestionId())));

          setDegree(questionAnswers.find((questionAnswer => questionAnswer.question === getDegreeQuestionId())));

          setFirstLanguage(questionAnswers.find((questionAnswer =>
            questionAnswer.question === getFirstLanguageQuestionId())));

          setLevelOfEnglish(questionAnswers.find((questionAnswer =>
            questionAnswer.question === getLevelOfEnglishQuestionId())));

        })
      }
    }
  });

  // get the decision for the student (yes, maybe, no or undecided)
  function getDecision() {
    if (decision === -1) {
      return "Undecided";
    }
    let possibleDecisions = ["No", "Maybe", "Yes"];
    return possibleDecisions[decision];
  }

  // get a list of the roles of the student in HTML format
  function getRoles() {
    return skills.map((skill,index) =>
      <li className="role" style={{display: "inline-block"}} key={index}>{skill.toUpperCase()}</li>
    )
  }

  // get the titles of the basic questions shown in the list element
  function getInfoTitles() {
    let questions = ["Studies:", "Type of degree:", "First language:", "Level of English:"];
    let answers = [studies, degree, fistLanguage, levelOfEnglish];
    questions = questions.filter((question, index) => answers[index] !== undefined);
    return questions.map((question,index) =>
      <p key={index}>{question}</p>
    )
  }

  // get the answers on the basic questions in HTML format
  function getInfoAnswers() {
    let answers = [studies, degree, fistLanguage, levelOfEnglish];
    answers = answers.filter((answer) => answer !== undefined);
    return answers.map((answer,index) =>
      <p key={index}>{answer}</p>
    )
  }

  // get the background color of the student, based on the decision
  function getBackground() {
    if (decision === -1) {
      return "white";
    }

    let colors = ["var(--no_red_20)", "var(--maybe_yellow_20)", "var(--yes_green_20)"];
    return colors[decision];
  }

  // get the background color of practical problems
  function getProblemsColor() {
    if (practicalProblems === 0) {
      return "var(--yes_green_65)"
    }
    return "var(--no_red_65)"
  }

  // The html representation of a list-element
  return (
    <Container id="list-element" className="list-element" style={{backgroundColor: getBackground()}}>
      <Row>
        <Col id="name" className="name" md="auto">{name}</Col>
        <Col id="practical-problems" style={{backgroundColor: getProblemsColor()}} className="practical-problems" md="auto">
          No practical problems
        </Col>
        <Col/>
        <Col className="suggestions" md="auto">Suggestions:</Col>
        <Col className="suggestionsYes" md="auto">{suggestionsYes}</Col>
        <Col className="suggestionsMaybe" md="auto">{suggestionsMaybe}</Col>
        <Col className="suggestionsNo" md="auto">{suggestionsNo}</Col>
      </Row>

      <Row id="info" className="info">
        <Col id="info-titles" className="info-titles" md="auto">
          {getInfoTitles()}
          Decision:
        </Col>
        <Col id="info-answers" md="auto" className="info-answers">
          {getInfoAnswers()}
          {getDecision()}
        </Col>

        <Col id="roles" align="right" className="roles">
          <ul>
            {getRoles()}
          </ul>
        </Col>
      </Row>
    </Container>
  )
}
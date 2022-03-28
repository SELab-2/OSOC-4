import {useEffect, useState} from "react";
import {getJson} from "../utils/json-requests";

import {
  getDegreeQuestionId, getFirstLanguageQuestionId, getLevelOfEnglishQuestionId,
  getQuestionAnswersPath, getRolesPath,
  getStudyQuestionId,
  getSuggestionsPath
} from "../routes";

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
    if (!student) {
      setStudent(props.student)
      setName(props.student.name)
      let localStudent = props.student;

      if (suggestions.length === 0) {
        getJson(getSuggestionsPath()).then(res => {
          let possibleSuggestions = res.data;
          let localSuggestions = possibleSuggestions.filter(suggestion => suggestion.student === localStudent.id);
          setSuggestions(localSuggestions);

          setSuggestionsYes(localSuggestions.filter(
            suggestion => suggestion.decision === 2 && (! suggestion.definitive)).length);
          setSuggestionsMaybe(localSuggestions.filter(
            suggestion => suggestion.decision === 1 && (! suggestion.definitive)).length);
          setSuggestionsNo(localSuggestions.filter(
            suggestion => suggestion.decision === 0 && (! suggestion.definitive)).length);

          let newDecision = localSuggestions.filter(suggestion => suggestion.definitive);
          if (newDecision.length) {
            setDecision(newDecision[0].decision);
          }
        })
      }

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

  function getDecision() {
    if (decision === -1) {
      return "Undecided";
    }
    let possibleDecisions = ["No", "Maybe", "Yes"];
    return possibleDecisions[decision];
  }

  function getRoles() {
    return skills.map((skill,index) =>
      <li className="role" style={{display: "inline-block"}} key={index}>{skill.toUpperCase()}</li>
    )
  }

  function getInfoTitles() {
    let questions = ["Studies:", "Type of degree:", "First language:", "Level of English:"];
    let answers = [studies, degree, fistLanguage, levelOfEnglish];
    questions = questions.filter((question, index) => answers[index] !== undefined);
    return questions.map((question,index) =>
      <p key={index}>{question}</p>
    )
  }

  function getInfoAnswers() {
    let answers = [studies, degree, fistLanguage, levelOfEnglish];
    answers = answers.filter((answer) => answer !== undefined);
    return answers.map((answer,index) =>
      <p key={index}>{answer}</p>
    )
  }

  function getBackground() {
    if (decision === -1) {
      return "white";
    }

    let colors = ["var(--no_red_20)", "var(--maybe_yellow_20)", "var(--yes_green_20)"];
    return colors[decision];
  }

  function getProblemsColor() {
    if (practicalProblems === 0) {
      return "var(--yes_green_65)"
    }
    return "var(--no_red_65)"
  }

  // The html representation of a list-element
  return(
    <div id="list-element" className="list-element"
         style={{position: "relative", backgroundColor: getBackground()}}>

      <div id="upper-layer" style={{height: "35px"}}>
        <div id="name" style={{float: "left"}} className="name">{name}</div>
        <div id="practical-problems" style={{float: "left", backgroundColor: getProblemsColor()}} className="practical-problems">No practical problems</div>
        <div id="suggestions" style={{float: "right"}}>
          <div style={{float: "right"}} className="suggestionsNo">{suggestionsNo}</div>
          <div style={{float: "right"}} className="suggestionsMaybe">{suggestionsMaybe}</div>
          <div style={{float: "right"}} className="suggestionsYes">{suggestionsYes}</div>
          <p style={{float: "right"}} className="suggestions">Suggestions:</p>
        </div>
      </div>

      <div id="info-titles" style={{float: "left"}} className="info-titles">
          {getInfoTitles()}
          Decision:
      </div>

      <div id="info-answers" className="info-answers">
        {getInfoAnswers()}
        {getDecision()}
      </div>

      <div id="roles" align="right" className="roles">
        <ul>
          {getRoles()}
        </ul>
      </div>

    </div>
  )
}
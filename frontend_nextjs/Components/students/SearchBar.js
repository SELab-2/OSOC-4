import Hint from "../Hint";
import Image from "next/image";
import resetSearchIcon from "../../public/assets/reset-search.svg";
import {ButtonGroup} from "react-bootstrap";

/**
 * This component shows the searchbar in the students and projects tab.
 * @param props props contains search, placeholder, doSearch and reset. search is the value of the search bar.
 * Placeholder is the text the search bar shows with an empty bar. doSearch is the function that will be called
 * when changing the search input. reset is called when pushing the reset button (cross image).
 * @returns {JSX.Element} component that renders the searchbar in the students and projects tab.
 * @constructor
 */
export default function SearchBar(props) {

  /**
   * Return the html for the SearchBar component.
   */
  return (
    <ButtonGroup className="nopadding search-project">
      <input type="text" value={props.search} placeholder={props.placeholder} style={{paddingLeft: "15px"}}
             onChange={props.doSearch}/>
      <button className="reset-search-button" onClick={props.reset}>
        <Hint message="Clear the search-bar">
          <Image src={resetSearchIcon}/>
        </Hint>
      </button>
    </ButtonGroup>
  )
}
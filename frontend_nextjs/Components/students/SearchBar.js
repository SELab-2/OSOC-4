import Hint from "../Hint";
import Image from "next/image";
import resetSearchIcon from "../../public/assets/reset-search.svg";
import {ButtonGroup} from "react-bootstrap";


export default function SearchBar(props) {

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
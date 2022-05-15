import {ButtonGroup, Col, Form, Row} from "react-bootstrap";
import React, { useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import resetSearchIcon from "../../public/assets/reset-search.svg";
import searchIcon from "../../public/assets/search.svg";
import Hint from "../Hint";

/**
 * This component displays the searchbar and sort dropdown in the 'select students' tab and the 'email students' tab.
 * @returns {JSX.Element} The searchbar and sort dropdown in the 'select students' tab and the 'email students' tab.
 */
export default function SearchSortBar() {

  const router = useRouter();

  // This constants contains the values of the searchbar and the sortby dropdown
  const [search, setSearch] = useState((router.query.search) ? router.query.search : "");
  const sortby = (router.query.sortby) ? router.query.sortby : "name_asc";

  /**
   * This function is called when we change the value of the sortby dropdown. It changes the sortby param in the url.
   * @param value the value that decides how we want to sort.
   */
  function sort(value) {
    let newQuery = router.query;
    newQuery["sortby"] = value;
    router.push({
      pathname: router.pathname,
      query: newQuery
    }, undefined, { shallow: true });
  }

  /**
   * This function is called when we press enter in the searchbar or click the search button. It changes the search
   * param in the url.
   */
  function doSearch() {
    let newQuery = router.query;
    newQuery["search"] = search;
    router.push({
      pathname: router.pathname,
      query: newQuery
    }, undefined, { shallow: true });
  }

  /**
   * return html representation of the suggestion counts for a student
   */
  return (
    <Row className="nomargin">
      <ButtonGroup className="nopadding">
        <Form onSubmit={ev => {
          ev.preventDefault();
          doSearch();
        }}>
          <Form.Group controlId="searchStudents">
            <Form.Control type="text" value={search} placeholder={"Search students"}
              onChange={(ev) => setSearch(ev.target.value)}>
            </Form.Control>
          </Form.Group>
        </Form>
        <button className="reset-search-button" onClick={() => setSearch("")}>
          <Hint message="Clear the search-bar">
            <Image src={resetSearchIcon} />
          </Hint>
        </button>
        <button className="search-button" onClick={() => setSearch(() => doSearch())}>
          <Hint message="Search">
            <Image src={searchIcon} />
          </Hint>
        </button>
      </ButtonGroup>
      <Col/>
      <div className="sortby-label nopadding">
        Sort by:
        <select className="dropdown-sortby" id="dropdown-decision" value={sortby}
          onChange={(ev) => sort(ev.target.value)}>
          <option value={"first name+asc,last name+asc"}>Name A-Z</option>
          <option value={"first name+dc,last name+desc"}>Name Z-A</option>
          <option value={"id+asc"}>Old-New</option>
          <option value={"id+desc"}>New-Old</option>
        </select>
      </div>
    </Row>
  )
}
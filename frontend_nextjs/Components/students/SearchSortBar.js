import { Col, Row } from "react-bootstrap";
import React, { useState } from "react";
import { useRouter } from "next/router";
import SearchBar from "./SearchBar";

/**
 * This component displays the searchbar and sort dropdown in the 'select students' tab and the 'email students' tab.
 * @returns {JSX.Element} The searchbar and sort dropdown in the 'select students' tab and the 'email students' tab.
 */
export default function SearchSortBar() {

  const router = useRouter();

  // This constants contains the values of the searchbar and the sortby dropdown
  const [search, setSearch] = useState((router.query.search) ? router.query.search : "");
  const sortby = (router.query.sortby) ? router.query.sortby : "name_asc";
  const [timer, setTimer] = useState(null)

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
  function doSearch(newSearch) {
    let newQuery = router.query;
    if (newSearch === null) {
      newSearch = search;
    }
    newQuery["search"] = newSearch;
    router.push({
      pathname: router.pathname,
      query: newQuery
    }, undefined, { shallow: true });
  }

  /**
   * This function is called when the searchbar changed its value.
   * It will search the inserted value after 200ms.
   * @param ev the event of changing the search bar.
   */
  function searchChanged(ev) {

    setSearch(ev.target.value);
    clearTimeout(timer);

    const newTimer = setTimeout(() => {
      doSearch(ev.target.value);
    }, 200)

    setTimer(newTimer);
  }

  /**
   * return html representation of the SearchSortBar.
   */
  return (
    <Row className="nomargin" style={{marginBottom: "10px"}}>
      <Col md="auto">
        <SearchBar doSearch={searchChanged} search={search} placeholder="Search students" reset={() => {
          setSearch("")
          doSearch("")
        }}/>
      </Col>
      <Col />
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
    </Row >
  )
}
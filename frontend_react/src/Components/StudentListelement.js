export default function StudentListelement(props) {
  return(
    <div id="list-element" className="list-element" style={{textAlign: "left", width: "800px", position: "relative"}}>

      <div id="upper-layer">
        <div id="name" style={{float: "left"}} className="name">Name</div>
        <div id="practical-problems" style={{float: "left"}} className="practical-problems">2 practical problems</div>
        <div id="suggestions" style={{float: "right"}} className="suggestions">Suggestions</div>
      </div>

      <br/>

      <div id="info-titles" style={{float: "left"}}>
        <p>Studies:<br/>
        Type of degree:<br/>
        First language:<br/>
        Level of English:<br/>
        Decision:
        </p>
      </div>
      <br/><br/><br/><br/><br/>

      <div id="roles" style={{float: "right"}}>
        <ul>
          <li className="role" style={{float: "right", bottom: 0}}>VIDEO EDITOR</li>
          <li className="role" style={{float: "right"}}>BACKEND DEVELOPPER</li>
        </ul>
      </div>


    </div>
  )
}
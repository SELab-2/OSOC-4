import logo from './logo.svg';
import './App.css';
import Login from './Components/Login'
import { BrowserRouter, Route, Routes, useLocation, Switch } from 'react-router-dom'
import {isStillAuthenticated} from "./utils/json-requests";
import {useState} from "react";
import NavHeader fr './Components/NavHeader.js'
import { isStillAuthenticated } from "./utils/json-requests";

function App() {

  let [isLoggedIn, setIsLoggedIn] = useState()

  return (
    <div className="App">
      { (! isLoggedIn)?
        // sign in page
        <Login setIsLoggedIn={setIsLoggedIn} />
        : (
          <NavHeader />
          // <Routes>
          //   <Route path="/" element={<HomeHeader />} >
          //     <Route index element={<HomeHeader />} />
          //   </Route>
          // </Routes>

        )}
    </div>
  );
}

export default App;

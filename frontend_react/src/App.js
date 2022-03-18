import logo from './logo.svg';
import './App.css';
import Login from './Components/Login'
import { BrowserRouter, Route, Routes, useLocation, Switch } from 'react-router-dom'
import NavHeader from './Components/NavHeader.js'
import { isStillAuthenticated } from "./utils/json-requests";

function App() {



  return (
    <div className="App">
      {(!true) ?
        // sign in page
        <Login />
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

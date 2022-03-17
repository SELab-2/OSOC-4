import logo from './logo.svg';
import './App.css';
import Login from './Components/Login'
import { BrowserRouter, Route, Routes, useLocation, Switch } from 'react-router-dom'
import HomeHeader from './Components/HomeHeader'

function App() {


  return (
    <div className="App">
      {false ?
        // sign in page
        <Login />
        : (
          <Routes>
            <Route path="/" element={<HomeHeader />} >
              <Route index element={<HomeHeader />} />
            </Route>
          </Routes>

        )}
    </div>
  );
}

export default App;

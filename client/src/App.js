import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignIn from "./pages/signInPage";
import MainPage from "./pages/MainPage";
import SignUp from "./pages/signUpPage";

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route exact path="/main" element={<MainPage />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signin" element={<SignIn />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;

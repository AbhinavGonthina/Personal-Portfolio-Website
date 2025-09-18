import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./components/utilities/Navbar";
import Layout from "./components/layout/Layout";

function App() {
  return (
    <Router>
      <div>
        <Navbar />
        <Routes>
          <Route path="/" element={<Layout />}>
            {" "}
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;

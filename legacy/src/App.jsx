import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./components/utilities/Navbar";
import Layout from "./components/layout/Layout";

function App() {
  return (
    // Vite fills BASE_URL from `base` in vite.config.js, so this stays
    // correct whether the app is served at /legacy/ or standalone at /.
    <Router basename={import.meta.env.BASE_URL}>
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

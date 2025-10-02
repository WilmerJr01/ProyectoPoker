import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "./components/loginPage";
import HomePage from "./components/home";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/home" element={<HomePage />} />
                <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
        </Router>
    );
}

export default App;
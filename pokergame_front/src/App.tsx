import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "./components/loginPage/loginPage";
import HomePage from "./components/homePage/home";
import TablePage from "./components/tablePage/table";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/home" element={<HomePage />} />
                <Route path="*" element={<Navigate to="/login" />} />
                <Route path="/table/:id" element={<TablePage />} />
            </Routes>
        </Router>
    );
}

export default App;
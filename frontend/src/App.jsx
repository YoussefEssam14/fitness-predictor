import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import PredictPage from "./pages/PredictPage";
import LogPage from "./pages/LogPage";
import DashboardPage from "./pages/DashboardPage";
import ModelPage from "./pages/ModelPage";
const linkStyle = ({ isActive }) => ({
  marginRight: 16,
  fontWeight: isActive ? "bold" : "normal",
});

export default function App() {
  return (
    <BrowserRouter>
      <nav style={{ padding: 16, borderBottom: "1px solid #ddd" }}>
        <NavLink to="/" style={linkStyle}>Predict</NavLink>
        <NavLink to="/log" style={linkStyle}>Log</NavLink>
        <NavLink to="/dashboard" style={linkStyle}>Dashboard</NavLink>
        <NavLink to="/model" style={linkStyle}>Model</NavLink>
      </nav>

      <Routes>
        <Route path="/" element={<PredictPage />} />
        <Route path="/log" element={<LogPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/model" element={<ModelPage />} />
      </Routes>
    </BrowserRouter>
  );
}
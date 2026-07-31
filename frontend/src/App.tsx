import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegistrationPage from './pages/RegistrationPage';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/register" element={<RegistrationPage />} />
          <Route path="/dashboard/host" element={<div className="p-10 text-center text-gray-500">Host Dashboard</div>} />
          <Route path="/dashboard/visitor" element={<div className="p-10 text-center text-gray-500">Visitor Dashboard</div>} />
          <Route path="/dashboard/checker" element={<div className="p-10 text-center text-gray-500">Checker Dashboard</div>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

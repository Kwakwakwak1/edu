import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import CardGame from './components/CardGame/CardGame';

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={
            <div className="welcome">
              <h1>Welcome to the Course Platform</h1>
              <p>Select a course to begin learning</p>
              <div className="course-links">
                <Link to="/courses/sample-course" className="start-button">
                  Start Sample Course
                </Link>
                <Link to="/components/CardGame" className="start-button">
                  Memory Match Card Game
                </Link>
              </div>
            </div>
          } />
          <Route path="/components/CardGame" element={<CardGame />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

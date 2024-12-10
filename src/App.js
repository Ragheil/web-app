// import React from 'react';
// import { Routes, Route } from 'react-router-dom';
// import SignIn from './screen/SignIn';
// import Home from './screen/Home';
// import Record from './screen/Record'; // Adjust path as necessary


// function App() {
//   return (
//     <Routes>
//       <Route path="/" element={<SignIn />} />
//       <Route path="/home" element={<Home />} />
//       <Route path="/record" component={<Record/>} />
//     </Routes>
//   );
// }

// export default App;

// App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SignIn from './screen/SignIn';
// import Home from './screen/Home'; // Adjust path if necessary
import Record from './screen/Record'; // Adjust path if necessary
import Section from './screen/Section'; // Import the Section component
import Calendar from './screen/Calendar'; // Adjust path if necessary
import Attendance from './screen/Attendance'; // Import the Attendance component
import Student from './screen/Student'; // Import the Student component
import Profile from './screen/Profile'; // Import the Profile component

const App = () => {
  return (
    <Router>
      <Routes>
        {/* <Route path="/home" element={<Home />} /> */}
        <Route path="/" element={<SignIn />} />
        <Route path="/record" element={<Record />} />
        <Route path="/section" element={<Section />} />
        <Route path="/calendar/:month" element={<Calendar />} /> {/* Handle month parameter */}
        <Route path="/attendance" element={<Attendance />} /> {/* Add the attendance route */}
        <Route path="/student" element={<Student />} /> {/* Add the student route */}
        <Route path="/profile" element={<Profile />} /> {/* Add the profile route */}
      </Routes>
    </Router>
  );
};

export default App;


import React, { useState, useEffect } from 'react';
import { useParams,  useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import '../styles/YourCalendarPage.css';

// Map month names to corresponding month index
const monthMapping = {
  January: 0,
  February: 1,
  March: 2,
  April: 3,
  May: 4,
  June: 5,
  July: 6,
  August: 7,
  September: 8,
  October: 9,
  November: 10,
  December: 11,
};

const CalendarPage = () => {
  const { month } = useParams();
  const [date, setDate] = useState(new Date());
  const navigate = useNavigate();

  // Update the calendar date when the month parameter changes
  useEffect(() => {
    if (month && monthMapping.hasOwnProperty(month)) {
      setDate((prevDate) => new Date(prevDate.getFullYear(), monthMapping[month], 1));
    }
  }, [month]);

  // Function to handle date selection changes in the calendar
  const handleDateChange = (selectedDate) => {
    setDate(selectedDate);
    const formattedDate = selectedDate.toISOString().split('T')[0]; // Format date for comparison
    navigate(`/attendance?date=${formattedDate}`); // Navigate to Attendance page with selected date
  };

  return (
    <div className="calendar-page-container">
      <header className="calendar-header">
        <h1>Calendar for {month}</h1>
      </header>

      <Calendar
        onChange={handleDateChange}
        value={date}
      />
    </div>
  );
};

export default CalendarPage;

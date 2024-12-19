import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient'; // Adjust according to your setup
import '../styles/Attendance.css'; // Import the CSS file

const Attendance = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');

  const location = useLocation(); // Hook to access the location object, which contains query parameters

  // Fetch attendance data from Supabase
  const fetchAttendanceData = async () => {
    try {
      const { data, error } = await supabase
        .from('attendance_log')
        .select(`
          attendance_id,
          date,
          status,
          student_assign_id,
          student_assign (
            student_assign_id,
            students!inner(last_name, first_name)
          ),
          teacher_assign_id,
          teacher_assign (
            teacher_assign_id,
            teachers!inner(teacher)
          )
        `);

      if (error) {
        throw error;
      }

      setAttendanceData(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching data:', err.message);
    }
  };

  // Get the date from query params
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const date = queryParams.get('date');
    if (date) {
      setSelectedDate(date);
    }
    fetchAttendanceData();
  }, [location.search]);

  // Filter the attendance data based on selected date
  const filteredData = selectedDate
    ? attendanceData.filter((entry) => entry.date === selectedDate)
    : attendanceData;

  // Sort the data by attendance_id in ascending order
  const sortedData = filteredData.sort((a, b) => a.attendance_id - b.attendance_id);

  // Function to toggle attendance status
  const toggleAttendanceStatus = async (attendanceId, currentStatus) => {
    const newStatus = currentStatus === 'present' ? 'absent' : 'present';

    try {
      const { error } = await supabase
        .from('attendance_log')
        .update({ status: newStatus })
        .eq('attendance_id', attendanceId);

      if (error) {
        throw error;
      }

      // Log the action and the new status
      console.log(`Attendance ID ${attendanceId} marked as ${newStatus}`);

      // Re-fetch the data to update the UI
      fetchAttendanceData();
    } catch (err) {
      setError('Error updating attendance status');
      console.error('Error updating status:', err);
    }
  };

  return (
    <div>
      <h1>Attendance Data</h1>
      {error && <p className="error-message">Error: {error}</p>}

      <div>
        <h3>Attendance for {selectedDate ? selectedDate : 'All Dates'}</h3>
      </div>

      <table>
        <thead>
          <tr>
            <th>Attendance ID</th>
            <th>Full Name</th>
            <th>Attendance Status</th>
            <th>Attendance Date</th>
          </tr>
        </thead>
        <tbody>
          {sortedData.length > 0 ? (
            sortedData.map((entry) => (
              <tr key={entry.attendance_id}>
                <td>{entry.attendance_id}</td>
                <td>
                  {entry.student_assign?.students?.last_name}, {' '}
                  {entry.student_assign?.students?.first_name}
                </td>
                <td>
                  <div
                    className={`attendance-status ${
                      entry.status === 'present' ? 'present' : 'absent'
                    }`}
                    onClick={() =>
                      toggleAttendanceStatus(entry.attendance_id, entry.status)
                    }
                  >
                    {entry.status === 'present' ? '✔' : '✘'}
                  </div>
                </td>
                <td>{entry.date || 'N/A'}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4">No attendance data found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Attendance;

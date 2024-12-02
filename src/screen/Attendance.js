import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import '../styles/Attendance.css';

const Attendance = () => {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  
  // Get the date from the URL query parameters
  const queryParams = new URLSearchParams(location.search);
  const selectedDate = queryParams.get('date') || new Date().toISOString().split('T')[0]; // Default to today

  useEffect(() => {
    fetchAttendanceRecords(selectedDate);
  }, [selectedDate]);

  const fetchAttendanceRecords = async (date) => {
    try {
      const startOfDay = new Date(date);
      startOfDay.setUTCHours(0, 0, 0, 0); // Set to UTC
      const endOfDay = new Date(date);
      endOfDay.setUTCHours(23, 59, 59, 999); // Set to UTC

      const { data, error } = await supabase
        .from('attendance')
        .select(`student_lrn, date, status, evaluation, students (first_name, middle_name, last_name)`)
        .gte('date', startOfDay.toISOString())
        .lte('date', endOfDay.toISOString());

      if (error) {
        console.error('Error fetching attendance records:', error.message);
        return;
      }

      setAttendanceRecords(data);
    } catch (err) {
      console.error('Unexpected error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="attendance-container">
      <header className="attendance-header">
        <h1>Attendance Logs </h1>
      </header>
      <div className="attendance-content">
        {attendanceRecords.length === 0 ? (
          <p>No attendance records found for this date.</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Evaluation</th>
                </tr>
              </thead>
              <tbody>
                {attendanceRecords.map((record, index) => (
                  <tr key={index}>
                    <td>
                      {`${record.students.first_name} ${record.students.middle_name || ''} ${record.students.last_name}`}
                    </td>
                    <td>{new Date(record.date).toLocaleString()}</td>
                    <td>{record.status}</td>
                    <td>{record.evaluation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Attendance;

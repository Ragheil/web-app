import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import '../styles/Attendance.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';

const Attendance = () => {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [attendance, setAttendance] = useState({});
  const location = useLocation();
  
  // Set the app element for accessibility
  useEffect(() => {
  }, []);

  // Get the date from the URL query parameters
  const queryParams = new URLSearchParams(location.search);
  const selectedDate = queryParams.get('date') || new Date().toISOString().split('T')[0]; // Default to today

  useEffect(() => {
    fetchAttendanceRecords(selectedDate);
    const interval = setInterval(() => {
      fetchAttendanceRecords(selectedDate);
    }, 2000); // Refresh every 30 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, [selectedDate]);

  const fetchAttendanceRecords = async (date) => {
    try {
      const startOfDay = new Date(date);
      startOfDay.setUTCHours(0, 0, 0, 0); // Set to UTC
      const endOfDay = new Date(date);
      endOfDay.setUTCHours(23, 59, 59, 999); // Set to UTC

      const { data: records, error } = await supabase
        .from('attendance')
        .select(`student_lrn, date, status, evaluation, students (first_name, middle_name, last_name)`)
        .gte('date', startOfDay.toISOString())
        .lte('date', endOfDay.toISOString());

      if (error) {
        console.error('Error fetching attendance records:', error.message);
        return;
      }

      setAttendanceRecords(records);

      // Fetch existing attendance status for the day
      const { data: attendanceData, error: attendanceError } = await supabase
        .from('attendance')
        .select('student_lrn, subject, is_present')
        .eq('date', date);

      if (attendanceError) {
        console.error('Error fetching attendance status:', attendanceError);
        return;
      }

      // Create an object to store attendance status
      const attendanceStatus = {};
      // First set all combinations to true (✓)
      records.forEach(record => {
        ['TVL', 'PE', 'HISTORY', 'MATH', 'AP', 'SCIENCE'].forEach(subject => {
          attendanceStatus[`${record.student_lrn}-${subject}`] = true;
        });
      });
      
      // Then override with any existing false (X) values from the database
      attendanceData?.forEach(record => {
        if (record.is_present === false) { // Only override if explicitly marked as false
          attendanceStatus[`${record.student_lrn}-${record.subject}`] = false;
        }
      });

      setAttendance(attendanceStatus);
    } catch (err) {
      console.error('Unexpected error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleIconClick = async (studentLrn, subject) => {
    try {
      // Get current value, default to true if not set
      const currentValue = attendance[`${studentLrn}-${subject}`] ?? true;
      const newValue = !currentValue;
      
      setAttendance(prev => ({
        ...prev,
        [`${studentLrn}-${subject}`]: newValue
      }));

      // Only save to database if marking as absent (X)
      if (!newValue) {
        const { error } = await supabase
          .from('attendance')
          .upsert({
            student_lrn: studentLrn,
            subject: subject,
            is_present: false,
            date: selectedDate
          });

        if (error) {
          console.error('Error updating attendance:', error);
          // Revert the state if there's an error
          setAttendance(prev => ({
            ...prev,
            [`${studentLrn}-${subject}`]: currentValue
          }));
        }
      } else {
        // If marking as present (✓), remove the record if it exists
        const { error } = await supabase
          .from('attendance')
          .delete()
          .match({ 
            student_lrn: studentLrn, 
            subject: subject,
            date: selectedDate 
          });

        if (error) {
          console.error('Error removing attendance record:', error);
          setAttendance(prev => ({
            ...prev,
            [`${studentLrn}-${subject}`]: currentValue
          }));
        }
      }
    } catch (err) {
      console.error('Unexpected error:', err);
    }
  };

  const renderSubjectCell = (studentLrn, subject) => {
    // Default to true (✓ icon) if no attendance record exists
    const isPresent = attendance[`${studentLrn}-${subject}`] ?? true;
    return (
      <td 
        className="check-cell" 
        onClick={() => handleIconClick(studentLrn, subject)}
        style={{ cursor: 'pointer' }}
      >
        <FontAwesomeIcon 
          icon={isPresent ? faCheck : faTimes} 
          className={`status-icon ${isPresent ? 'present' : 'absent'}`}
        />
      </td>
    );
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  const subjects = ['TVL', 'PE', 'HISTORY', 'MATH', 'AP', 'SCIENCE'];

  return (
    <div className="attendance-container">
      <header className="attendance-header">
        <h1>Attendance Logs</h1>
      </header>
      <div className="attendance-content">
        {attendanceRecords.length === 0 ? (
          <p>No attendance records found for this date.</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>STUDENT NAME</th>
                  {subjects.map(subject => (
                    <th key={subject}>{subject}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {attendanceRecords.map((record) => (
                  <tr key={record.student_lrn}>
                    <td>
                      {`${record.students.first_name} ${record.students.middle_name || ''} ${record.students.last_name}`}
                    </td>
                    {subjects.map(subject => renderSubjectCell(record.student_lrn, subject))}
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

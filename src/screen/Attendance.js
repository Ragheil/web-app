import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient'; // Adjust according to your setup
import '../styles/Attendance.css';

const Attendance = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [error, setError] = useState(null);

  const fetchAttendanceData = async () => {
    try {
      const { data, error } = await supabase
        .from('student_assign')
        .select(`
          student_assign_id,
          students!inner(last_name, first_name),
          attendance_log!left(status, date)
        `);

      if (error) {
        throw error;
      }

      // Transform the data to match your SQL query
      const formattedData = data.map(entry => {
        const fullName = `${entry.students.last_name}, ${entry.students.first_name}`;
        const attendanceStatus = entry.attendance_log?.status || 'present'; // Default to 'present'
        const attendanceDate = entry.attendance_log?.date || 'N/A';

        return {
          student_assign_id: entry.student_assign_id,
          full_name: fullName,
          attendance_status: attendanceStatus,
          attendance_date: attendanceDate,
        };
      });

      setAttendanceData(formattedData);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching data:', err.message);
    }
  };

  const toggleAttendanceStatus = async (studentAssignId, currentStatus) => {
    const newStatus = currentStatus === 'present' ? 'absent' : 'present';

    try {
      // Check if attendance log exists for the student_assign_id
      const { data, error: fetchError } = await supabase
        .from('attendance_log')
        .select('attendance_id, status')
        .eq('student_assign_id', studentAssignId) // Match the student_assign_id
        .single(); // Ensure only one row is returned

      if (fetchError) {
        if (fetchError.code === 'PGRST001') {
          // Handle no rows found scenario (insert new attendance log)
          console.log('No attendance record found, inserting a new one');
        } else {
          throw fetchError;
        }
      }

      // If attendance log exists, update the status
      if (data) {
        const { error: updateError } = await supabase
          .from('attendance_log')
          .update({ status: newStatus })
          .match({ attendance_id: data.attendance_id }); // Update using the attendance_id

        if (updateError) {
          throw updateError;
        }
      } else {
        // If no attendance log exists, insert a new one
        const { error: insertError } = await supabase
          .from('attendance_log')
          .insert([
            { student_assign_id: studentAssignId, status: newStatus, date: new Date().toISOString() }
          ]);

        if (insertError) {
          throw insertError;
        }
      }

      // Update the local state to reflect the new status
      setAttendanceData(prevData =>
        prevData.map(entry =>
          entry.student_assign_id === studentAssignId
            ? { ...entry, attendance_status: newStatus }
            : entry
        )
      );
    } catch (err) {
      console.error('Error updating attendance:', err.message);
    }
  };

  useEffect(() => {
    fetchAttendanceData();
  }, []);

  return (
    <div>
      <h1>Attendance Data</h1>
      {error && <p className="error-message">Error: {error}</p>}
      <table>
        <thead>
          <tr>
            <th>Student Assign ID</th>
            <th>Full Name</th>
            <th>Attendance Status</th>
          </tr>
        </thead>
        <tbody>
          {attendanceData.length > 0 ? (
            attendanceData.map((entry) => (
              <tr key={entry.student_assign_id}>
                <td>{entry.student_assign_id}</td>
                <td>{entry.full_name}</td>
                <td>
                  <div
                    className={`attendance-status ${entry.attendance_status === 'present' ? 'present' : 'absent'}`}
                    onClick={() => toggleAttendanceStatus(entry.student_assign_id, entry.attendance_status)}
                  >
                    {entry.attendance_status === 'present' ? '✔' : '✘'}
                  </div>
                </td>
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

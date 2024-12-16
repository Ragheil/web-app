import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import '../styles/Attendance.css';
import Modal from 'react-modal';

const Attendance = () => {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const location = useLocation();
  
  // Set the app element for accessibility
  useEffect(() => {
    Modal.setAppElement('#root'); // Replace '#root' with your app's main element ID
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

  const handleEdit = (record) => {
    setSelectedRecord(record);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedRecord(null);
  };

  // Define the handleUpdate function
  const handleUpdate = async () => {
    try {
      const currentDateTime = new Date();
      const formattedDateTime = currentDateTime.toISOString().slice(0, 19).replace('T', ' '); // Format to "YYYY-MM-DD HH:MM:SS"

      // Check if teacher is defined
      if (!selectedTeacher) {
        console.error('Teacher value is required.');
        return; // Exit if teacher is not set
      }

      const { error } = await supabase
        .from('logs')
        .insert({
          activity: selectedRecord.activity,
          teacher: parseInt(selectedTeacher, 10), // Ensure this is an integer
          student: selectedRecord.student_lrn,
          reason: selectedRecord.reason,
          comment: selectedRecord.comment,
          datetime: formattedDateTime, // Use the formatted date
        });

      if (error) {
        console.error('Error inserting log record:', error.message);
        return;
      }

      fetchAttendanceRecords(selectedDate);
      closeModal();
    } catch (err) {
      console.error('Unexpected error:', err);
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
                  <th>Actions</th>
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
                    <td>
                      <button onClick={() => handleEdit(record)}
                       style={{ color: 'white', backgroundColor: '#333' }}>Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={modalIsOpen} onRequestClose={closeModal} contentLabel="Edit Record">
        <h2>Edit Record</h2>
        {selectedRecord && (
          <form>
            <table>
              <thead>
                <tr>
                  <th>Activity</th>
                  <th>Teacher</th>
                  <th>Student</th>
                  <th>Reason</th>
                  <th>Comment</th>
                  <th>Date/Time</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <input
                      type="text"
                      value={selectedRecord.activity || ''}
                      onChange={(e) => setSelectedRecord({ ...selectedRecord, activity: e.target.value })}
                      style={{ color: 'black', backgroundColor: 'white' }}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={selectedTeacher || ''}
                      onChange={(e) => setSelectedTeacher(e.target.value)}
                      style={{ color: 'black', backgroundColor: 'white' }}
                    />
                  </td>
                  <td>
                    {`${selectedRecord.students.first_name || ''} ${selectedRecord.students.middle_name || ''} ${selectedRecord.students.last_name || ''}`}
                  </td>
                  <td>
                    <input
                      type="text"
                      value={selectedRecord.reason || ''}
                      onChange={(e) => setSelectedRecord({ ...selectedRecord, reason: e.target.value })}
                      style={{ color: 'black', backgroundColor: 'white' }}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={selectedRecord.comment || ''}
                      onChange={(e) => setSelectedRecord({ ...selectedRecord, comment: e.target.value })}
                      style={{ color: 'black', backgroundColor: 'white' }}
                    />
                  </td>
                  <td>{new Date(selectedRecord.date).toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
            <button 
              type="button" 
              onClick={closeModal} 
              style={{ color: 'white', backgroundColor: '#333', width: '100px' }}
            >
              Close
            </button>
            <button 
              type="button" 
              onClick={handleUpdate} 
              style={{ color: 'white', backgroundColor: '#333', width: '100px' }}
            >
              Confirm
            </button>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default Attendance;

import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import '../styles/Student.css';

const Student = () => {
  const [logs, setLogs] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
    fetchAttendanceRecords();
    fetchTeachers();
  }, []);

  const fetchLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('logs')
        .select('*')
        .order('datetime', { ascending: false });

      if (error) throw error;

      console.log('Fetched logs:', data);
      setLogs(data);
    } catch (error) {
      console.error('Error fetching logs:', error.message);
    }
  };

  const fetchAttendanceRecords = async () => {
    try {
      const { data, error } = await supabase
        .from('attendance')
        .select(`student_lrn, date, status, evaluation, students (first_name, middle_name, last_name)`);

      if (error) throw error;

      console.log('Fetched attendance records:', data);
      setAttendanceRecords(data);
    } catch (error) {
      console.error('Error fetching attendance records:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const { data, error } = await supabase
        .from('teachers')
        .select('*');

      if (error) throw error;

      console.log('Fetched teachers:', data);
      setTeachers(data);
    } catch (error) {
      console.error('Error fetching teachers:', error.message);
    }
  };

  const getTeacherName = (teacherId) => {
    const teacher = teachers.find(t => t.teacher_id === teacherId);
    return teacher ? teacher.teacher : 'Unknown Teacher';
  };

  return (
    <div className="logs-container">
      <h1>Activity Logs</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
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
            {logs.map(log => {
              const attendanceRecord = attendanceRecords.find(att => att.student_lrn === log.student);
              const studentName = attendanceRecord 
                ? `${attendanceRecord.students.first_name} ${attendanceRecord.students.middle_name || ''} ${attendanceRecord.students.last_name}` 
                : log.student;

              return (
                <tr key={log.log_id}>
                  <td>{log.activity}</td>
                  <td>{getTeacherName(log.teacher)}</td>
                  <td>{studentName}</td>
                  <td>{log.reason}</td>
                  <td>{log.comment}</td>
                  <td>{log.datetime}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Student;

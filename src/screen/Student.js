import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import '../styles/Student.css';
import Modal from 'react-modal';

const Student = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [currentStudent, setCurrentStudent] = useState(null);

  useEffect(() => {
    Modal.setAppElement('body');

    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('students')
        .select(`
          lrn,
          first_name,
          middle_name,
          last_name,
          contact_number,
          parent_name,
          active_status,
          address
        `)
        .order('last_name', { ascending: true });

      if (error) throw error;

      console.log('Fetched data:', data);
      const validStudents = data.filter(student => student.lrn !== undefined);
      setStudents(validStudents);
    } catch (error) {
      console.error('Error fetching students:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (student = null) => {
    setCurrentStudent(student);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setCurrentStudent(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const { first_name, last_name, middle_name, contact_number, parent_name, active_status, address, lrn } = e.target.elements;

    const studentData = {
      lrn: lrn.value,
      first_name: first_name.value,
      last_name: last_name.value,
      middle_name: middle_name.value,
      contact_number: contact_number.value,
      parent_name: parent_name.value,
      active_status: active_status.checked,
      address: address.value,
    };

    console.log('Student Data:', studentData);

    try {
      if (currentStudent) {
        // Update existing student
        const { error } = await supabase
          .from('students')
          .update(studentData)
          .eq('lrn', currentStudent.lrn);
        if (error) throw error;
      } else {
        // Create new student
        const { error } = await supabase
          .from('students')
          .insert([studentData]);
        if (error) throw error;
      }

      fetchStudents();
      closeModal();
    } catch (error) {
      console.error('Error adding/updating student:', error.message);
    }
  };

  const handleDelete = async (lrn) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this student?");
    if (confirmDelete) {
      try {
        const { error } = await supabase
          .from('students')
          .delete()
          .eq('lrn', lrn);

        if (error) throw error;

        fetchStudents();
      } catch (error) {
        console.error('Error deleting student:', error.message);
      }
    }
  };

  console.log('Fetched students:', students);

  const lrnSet = new Set();
  students.forEach(student => {
    if (lrnSet.has(student.lrn)) {
      console.warn(`Duplicate lrn found: ${student.lrn}`);
    } else {
      lrnSet.add(student.lrn);
    }
  });

  return (
    <div className="student-container">
      <header className="student-header">
        <h1>Student List</h1>
        <button onClick={() => openModal()}>Add New Student</button>
      </header>
      <div className="student-content">
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>First Name</th>
                  <th>Middle Name</th>
                  <th>Last Name</th>
                  <th>Contact Number</th>
                  <th>Parent Name</th>
                  <th>Active Status</th>
                  <th>Address</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.lrn}>
                    <td>{student.first_name}</td>
                    <td>{student.middle_name || ''}</td>
                    <td>{student.last_name}</td>
                    <td>{student.contact_number}</td>
                    <td>{student.parent_name}</td>
                    <td>{student.active_status ? 'Active' : 'Inactive'}</td>
                    <td>{student.address}</td>
                    <td>
                      <button onClick={() => openModal(student)}>Edit</button>
                      <button onClick={() => handleDelete(student.lrn)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal for Add/Edit Student */}
      <Modal isOpen={modalIsOpen} onRequestClose={closeModal}>
        <h2>{currentStudent ? 'Edit Student' : 'Add Student'}</h2>
        <form onSubmit={handleSave}>
          <input type="text" name="lrn" placeholder="LRN" defaultValue={currentStudent?.lrn} required />
          <input type="text" name="first_name" placeholder="First Name" defaultValue={currentStudent?.first_name} required />
          <input type="text" name="middle_name" placeholder="Middle Name" defaultValue={currentStudent?.middle_name} />
          <input type="text" name="last_name" placeholder="Last Name" defaultValue={currentStudent?.last_name} required />
          <input type="text" name="contact_number" placeholder="Contact Number" defaultValue={currentStudent?.contact_number} required />
          <input type="text" name="parent_name" placeholder="Parent Name" defaultValue={currentStudent?.parent_name} required />
          <label>
            Active Status
            <input type="checkbox" name="active_status" defaultChecked={currentStudent?.active_status} />
          </label>
          <input type="text" name="address" placeholder="Address" defaultValue={currentStudent?.address} required />
          <button type="submit" className="modal-button">Save</button>
          <button type="button" className="modal-button" onClick={closeModal}>Cancel</button>
        </form>
      </Modal>
    </div>
  );
};

export default Student;

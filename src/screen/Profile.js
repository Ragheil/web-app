import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import '../styles/Profile.css';

const TeacherProfile = () => {
  const [teacherData, setTeacherData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeacherProfile = async () => {
      try {
        // Get current user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;

        if (user) {
          // Fetch teacher data from teachers table
          const { data: teacher, error: teacherError } = await supabase
            .from('teachers')
            .select('*')
            .eq('email', user.email)
            .single();

          if (teacherError) {
            console.error('Error fetching teacher profile:', teacherError.message);
            throw teacherError;
          }

          setTeacherData(teacher);
          console.log('Teacher data:', teacher); // Debug log
        }
      } catch (error) {
        console.error('Error:', error);
        setTeacherData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherProfile();
  }, []);

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) return <div>Loading...</div>;

  if (!teacherData) {
    return (
      <div className="error-container">
        <p>No teacher profile data found. Please ensure your profile exists.</p>
        <p>Check the browser console for more details.</p>
      </div>
    );
  }

  return (
    <div className="teacher-profile-container">
      <div className="teacher-profile-header">
        <h1>Teacher Profile</h1>
        <div className="teacher-profile-details">
          <p><strong>Name:</strong> {teacherData.teacher}</p>
          <p><strong>Email:</strong> {teacherData.email}</p>
          <p><strong>Username:</strong> {teacherData.username}</p>
        </div>
        <button 
          className="sign-out-button" 
          onClick={handleSignOut}
        >
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default TeacherProfile;

import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import '../styles/Profile.css';

const TeacherProfile = () => {
  const [teacherData, setTeacherData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeacherProfile = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;

        if (user) {
          const { data: teacher, error: teacherError } = await supabase
            .from('teachers')
            .select(`
              *,
              subjects (subject_name)
            `)
            .eq('email', user.email)
            .single();

          if (teacherError) {
            console.error('Error fetching teacher profile:', teacherError.message);
            throw teacherError;
          }

          setTeacherData(teacher);
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
      <div>
        <p>No teacher profile data found. Please ensure your profile exists.</p>
        <p>Check the browser console for more details.</p>
      </div>
    );
  }

  return (
    <div className="teacher-profile-container">
      <div className="teacher-profile-header">
        <h2>{teacherData.teacher || 'Teacher Name Not Found'}</h2>
        <div className="teacher-profile-details">
          <p><span>📧</span> {teacherData.email}</p>
          <p><span>📚</span> Subject: {teacherData.subjects?.subject_name || 'No subject assigned'}</p>
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

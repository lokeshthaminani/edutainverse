import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, User, Award, Clock } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useEnrollmentStore } from '../store/enrollmentStore';
import Layout from '../components/layout/Layout';
import Certificate from '../utils/Certificate';

const ProfilePage: React.FC = () => {
  const { user } = useAuthStore();
  const { enrollments, fetchUserEnrollments, isLoading } = useEnrollmentStore();
  const [activeTab, setActiveTab] = useState('enrolled');
  
  useEffect(() => {
    if (user) {
      fetchUserEnrollments(user.id);
    }
  }, [user, fetchUserEnrollments]);
  
  const completedCourses = enrollments.filter((enrollment: any) => enrollment.completed_at);
  const inProgressCourses = enrollments.filter((enrollment: any) => !enrollment.completed_at);
  
  const displayCourses = activeTab === 'enrolled' 
    ? enrollments 
    : activeTab === 'in-progress' 
      ? inProgressCourses 
      : completedCourses;
  
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };
  
  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  if (!user) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
          <p className="mt-2 text-gray-600">Please log in to view your profile.</p>
          <Link
            to="/login"
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Log In
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="bg-white shadow rounded-lg overflow-hidden mb-8"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <div className="px-4 py-5 sm:px-6 bg-gradient-to-r from-indigo-600 to-purple-600">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between">
              <div className="flex items-center mb-4 sm:mb-0">
                <div className="h-16 w-16 rounded-full bg-white flex items-center justify-center text-indigo-600 mr-4">
                  <User size={32} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{user.username}</h2>
                  <p className="text-indigo-100">{user.email}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-4">
                <div className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg text-white">
                  <div className="font-bold text-2xl">{enrollments.length}</div>
                  <div className="text-xs">Enrolled Courses</div>
                </div>
                <div className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg text-white">
                  <div className="font-bold text-2xl">{completedCourses.length}</div>
                  <div className="text-xs">Completed</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('enrolled')}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'enrolled'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                All Enrolled
                <span className="ml-2 py-0.5 px-2.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                  {enrollments.length}
                </span>
              </button>
              
              <button
                onClick={() => setActiveTab('in-progress')}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'in-progress'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                In Progress
                <span className="ml-2 py-0.5 px-2.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  {inProgressCourses.length}
                </span>
              </button>
              
              <button
                onClick={() => setActiveTab('completed')}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'completed'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Completed
                <span className="ml-2 py-0.5 px-2.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {completedCourses.length}
                </span>
              </button>
            </nav>
          </div>
        </motion.div>
        
        {isLoading ? (
          <div className="flex justify-center my-12">
            <svg className="animate-spin h-10 w-10 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : displayCourses.length > 0 ? (
          <motion.div
            className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            {displayCourses.map((enrollment: any) => (
              <motion.div 
                key={enrollment.id}
                className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow"
                variants={fadeIn}
                whileHover={{ scale: 1.02 }}
              >
                <div className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {enrollment.courses.title}
                    </h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      enrollment.courses.category === 'Beginner' ? 'bg-green-100 text-green-800' :
                      enrollment.courses.category === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {enrollment.courses.category}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-500 mb-4 line-clamp-3">
                    {enrollment.courses.description}
                  </p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock size={16} className="mr-1" />
                      {enrollment.completed_at ? 'Completed' : 'In Progress'}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <BookOpen size={16} className="mr-1" />
                      {enrollment.courses.modules?.length || 0} modules
                    </div>
                  </div>
                  
                  {enrollment.completed_at && (
                    <Certificate 
                      username={user.username}
                      courseName={enrollment.courses.title}
                      completionDate={new Date(enrollment.completed_at)}
                    />
                  )}
                  
                  <Link
                    to={`/courses/${enrollment.courses.id}`}
                    className="mt-2 w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    {enrollment.completed_at ? (
                      <>
                        <Award size={16} className="mr-2" />
                        Review Course
                      </>
                    ) : (
                      <>
                        <BookOpen size={16} className="mr-2" />
                        Continue Learning
                      </>
                    )}
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No courses yet</h3>
            <p className="text-gray-500 mb-4">
              {activeTab === 'enrolled' 
                ? "You haven't enrolled in any courses yet." 
                : activeTab === 'in-progress'
                  ? "You don't have any courses in progress."
                  : "You haven't completed any courses yet."}
            </p>
            {activeTab !== 'enrolled' && (
              <button
                onClick={() => setActiveTab('enrolled')}
                className="text-indigo-600 hover:text-indigo-500"
              >
                View all enrolled courses
              </button>
            )}
            <div className="mt-4">
              <Link
                to="/courses"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Browse Courses
              </Link>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ProfilePage;
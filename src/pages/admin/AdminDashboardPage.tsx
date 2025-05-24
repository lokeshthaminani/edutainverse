import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Users, PlusCircle, ChevronRight, BarChart2 } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useCourseStore } from '../../store/courseStore';
import Layout from '../../components/layout/Layout';

const AdminDashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const { courses, fetchCourses, isLoading } = useCourseStore();
  const [stats, setStats] = useState({
    totalCourses: 0,
    publishedCourses: 0,
    draftCourses: 0,
  });
  
  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);
  
  useEffect(() => {
    if (courses.length > 0) {
      const publishedCourses = courses.filter(course => course.published);
      setStats({
        totalCourses: courses.length,
        publishedCourses: publishedCourses.length,
        draftCourses: courses.length - publishedCourses.length,
      });
    }
  }, [courses]);
  
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
  
  if (!user || user.role !== 'admin') {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
          <p className="mt-2 text-gray-600">You don't have permission to access the admin dashboard.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="mt-1 text-gray-500">Manage your courses and content</p>
          </motion.div>
          
          <motion.div
            className="mt-4 md:mt-0"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <Link
              to="/admin/courses/new"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <PlusCircle size={16} className="mr-2" />
              New Course
            </Link>
          </motion.div>
        </div>
        
        {/* Stats Cards */}
        <motion.div
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.div 
            className="bg-white overflow-hidden shadow rounded-lg"
            variants={fadeIn}
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BookOpen className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Courses</dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">{stats.totalCourses}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <Link to="/admin/courses" className="font-medium text-indigo-600 hover:text-indigo-500">
                  View all
                </Link>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            className="bg-white overflow-hidden shadow rounded-lg"
            variants={fadeIn}
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BarChart2 className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Published Courses</dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">{stats.publishedCourses}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <Link to="/admin/courses?filter=published" className="font-medium text-indigo-600 hover:text-indigo-500">
                  View published
                </Link>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            className="bg-white overflow-hidden shadow rounded-lg"
            variants={fadeIn}
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Draft Courses</dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">{stats.draftCourses}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <Link to="/admin/courses?filter=drafts" className="font-medium text-indigo-600 hover:text-indigo-500">
                  View drafts
                </Link>
              </div>
            </div>
          </motion.div>
        </motion.div>
        
        {/* Recent Courses */}
        <motion.div
          className="bg-white shadow rounded-lg overflow-hidden mb-8"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Courses</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Your most recently created courses</p>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-6">
              <svg className="animate-spin h-6 w-6 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : courses.length > 0 ? (
            <div className="overflow-hidden">
              <ul className="divide-y divide-gray-200">
                {courses.slice(0, 5).map((course) => (
                  <li key={course.id}>
                    <Link to={`/admin/courses/${course.id}`} className="block hover:bg-gray-50">
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <p className="text-sm font-medium text-indigo-600 truncate">{course.title}</p>
                            <div className="ml-2 flex-shrink-0 flex">
                              <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                course.published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {course.published ? 'Published' : 'Draft'}
                              </p>
                            </div>
                          </div>
                          <div className="ml-2 flex-shrink-0 flex">
                            <ChevronRight size={16} className="text-gray-400" />
                          </div>
                        </div>
                        <div className="mt-2 sm:flex sm:justify-between">
                          <div className="sm:flex">
                            <p className="flex items-center text-sm text-gray-500">
                              <BookOpen className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                              {course.category}
                            </p>
                          </div>
                          <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                            <p>
                              Created on {new Date(course.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-sm text-gray-500">No courses yet. Create your first course to get started.</p>
            </div>
          )}
          
          <div className="bg-gray-50 px-4 py-4 sm:px-6 border-t border-gray-200">
            <div className="flex justify-center">
              <Link
                to="/admin/courses"
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                View All Courses
              </Link>
            </div>
          </div>
        </motion.div>
        
        {/* Quick Links */}
        <motion.div
          className="bg-white shadow rounded-lg overflow-hidden"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Quick Actions</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Access frequently used actions</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            <Link
              to="/admin/courses/new"
              className="flex items-center p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100"
            >
              <div className="flex-shrink-0 p-3 rounded-md bg-indigo-500 text-white">
                <PlusCircle size={20} />
              </div>
              <div className="ml-4">
                <p className="text-base font-medium text-gray-900">Create New Course</p>
                <p className="text-sm text-gray-500">Add a new course to your catalog</p>
              </div>
            </Link>
            
            <Link
              to="/admin/courses"
              className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100"
            >
              <div className="flex-shrink-0 p-3 rounded-md bg-purple-500 text-white">
                <BookOpen size={20} />
              </div>
              <div className="ml-4">
                <p className="text-base font-medium text-gray-900">Manage Courses</p>
                <p className="text-sm text-gray-500">Edit and update your existing courses</p>
              </div>
            </Link>
            
            <Link
              to="/courses"
              className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100"
            >
              <div className="flex-shrink-0 p-3 rounded-md bg-green-500 text-white">
                <Users size={20} />
              </div>
              <div className="ml-4">
                <p className="text-base font-medium text-gray-900">View as Learner</p>
                <p className="text-sm text-gray-500">See what your learners experience</p>
              </div>
            </Link>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default AdminDashboardPage;
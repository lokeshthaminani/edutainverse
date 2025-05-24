import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PlusCircle, Search, Edit2, Trash2, Eye, CheckCircle, XCircle } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useCourseStore } from '../../store/courseStore';
import Layout from '../../components/layout/Layout';

const CoursesListPage: React.FC = () => {
  const { user } = useAuthStore();
  const { courses, fetchCourses, deleteCourse, publishCourse, isLoading } = useCourseStore();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCourses, setFilteredCourses] = useState<any[]>([]);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState<string | null>(null);
  
  const filter = searchParams.get('filter') || 'all';
  
  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);
  
  useEffect(() => {
    if (courses.length > 0) {
      let filtered = [...courses];
      
      // Apply filter
      if (filter === 'published') {
        filtered = filtered.filter(course => course.published);
      } else if (filter === 'drafts') {
        filtered = filtered.filter(course => !course.published);
      }
      
      // Apply search
      if (searchTerm) {
        const lowerSearchTerm = searchTerm.toLowerCase();
        filtered = filtered.filter(
          course => 
            course.title.toLowerCase().includes(lowerSearchTerm) ||
            course.description.toLowerCase().includes(lowerSearchTerm) ||
            course.category.toLowerCase().includes(lowerSearchTerm)
        );
      }
      
      setFilteredCourses(filtered);
    }
  }, [courses, filter, searchTerm]);
  
  const handleDeleteCourse = async (courseId: string) => {
    if (!window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return;
    }
    
    setIsDeleting(courseId);
    try {
      await deleteCourse(courseId);
    } catch (error) {
      console.error('Error deleting course:', error);
    } finally {
      setIsDeleting(null);
    }
  };
  
  const handlePublishToggle = async (courseId: string, currentStatus: boolean) => {
    setIsPublishing(courseId);
    try {
      await publishCourse(courseId, !currentStatus);
    } catch (error) {
      console.error('Error toggling publish status:', error);
    } finally {
      setIsPublishing(null);
    }
  };
  
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };
  
  if (!user || user.role !== 'admin') {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
          <p className="mt-2 text-gray-600">You don't have permission to access this page.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="flex flex-col md:flex-row md:items-center md:justify-between mb-8"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Courses Management</h1>
            <p className="mt-1 text-gray-500">Create, edit and manage your courses</p>
          </div>
          
          <div className="mt-4 md:mt-0">
            <Link
              to="/admin/courses/new"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <PlusCircle size={16} className="mr-2" />
              New Course
            </Link>
          </div>
        </motion.div>
        
        <motion.div 
          className="bg-white shadow rounded-lg overflow-hidden mb-8"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <div className="px-4 py-5 sm:p-6">
            {/* Filters and Search */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <div className="flex space-x-4 mb-4 md:mb-0">
                <Link
                  to="/admin/courses"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    filter === 'all' || !filter
                      ? 'bg-indigo-100 text-indigo-800'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  All Courses
                </Link>
                <Link
                  to="/admin/courses?filter=published"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    filter === 'published'
                      ? 'bg-green-100 text-green-800'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Published
                </Link>
                <Link
                  to="/admin/courses?filter=drafts"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    filter === 'drafts'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Drafts
                </Link>
              </div>
              
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={16} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            {/* Courses Table */}
            {isLoading ? (
              <div className="flex justify-center py-12">
                <svg className="animate-spin h-10 w-10 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            ) : filteredCourses.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Course
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredCourses.map((course) => (
                      <tr key={course.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <img
                                className="h-10 w-10 rounded-full object-cover"
                                src={course.thumbnail_url || "https://images.pexels.com/photos/3769714/pexels-photo-3769714.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"}
                                alt={course.title}
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{course.title}</div>
                              <div className="text-sm text-gray-500 truncate max-w-xs">{course.description}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            course.category === 'Beginner' ? 'bg-green-100 text-green-800' :
                            course.category === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {course.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handlePublishToggle(course.id, course.published)}
                            disabled={isPublishing === course.id}
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              course.published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {isPublishing === course.id ? (
                              <svg className="animate-spin -ml-1 mr-1 h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            ) : course.published ? (
                              <CheckCircle size={12} className="mr-1" />
                            ) : (
                              <XCircle size={12} className="mr-1" />
                            )}
                            {course.published ? 'Published' : 'Draft'}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(course.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-3">
                            <Link
                              to={`/courses/${course.id}`}
                              className="text-indigo-600 hover:text-indigo-900"
                              title="View"
                            >
                              <Eye size={16} />
                            </Link>
                            <Link
                              to={`/admin/courses/${course.id}`}
                              className="text-blue-600 hover:text-blue-900"
                              title="Edit"
                            >
                              <Edit2 size={16} />
                            </Link>
                            <button
                              onClick={() => handleDeleteCourse(course.id)}
                              disabled={isDeleting === course.id}
                              className="text-red-600 hover:text-red-900"
                              title="Delete"
                            >
                              {isDeleting === course.id ? (
                                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                              ) : (
                                <Trash2 size={16} />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                {searchTerm ? (
                  <div>
                    <p className="text-gray-500 mb-4">No courses found matching "{searchTerm}"</p>
                    <button
                      onClick={() => setSearchTerm('')}
                      className="text-indigo-600 hover:text-indigo-500"
                    >
                      Clear search
                    </button>
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-500 mb-4">No courses available. Create your first course to get started.</p>
                    <Link
                      to="/admin/courses/new"
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                      <PlusCircle size={16} className="mr-2" />
                      Create Course
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default CoursesListPage;
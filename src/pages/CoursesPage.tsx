import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCourseStore } from '../store/courseStore';
import { useAuthStore } from '../store/authStore';
import Layout from '../components/layout/Layout';

const CoursesPage: React.FC = () => {
  const { filteredCourses, fetchCourses, fetchCoursesByCategory, isLoading } = useCourseStore();
  const { user } = useAuthStore();
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);
  
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    if (category === 'All') {
      fetchCourses();
    } else {
      fetchCoursesByCategory(category);
    }
  };
  
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

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-6">
            Explore Our Courses
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-gray-500 mb-10">
            Browse through our library of courses and find the perfect one for your learning journey.
          </p>
        </motion.div>
        
        {/* Category Filter */}
        <motion.div 
          className="mb-10"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <div className="flex flex-wrap justify-center gap-3">
            {['All', 'Beginner', 'Intermediate', 'Advanced'].map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </motion.div>
        
        {/* Course List */}
        {isLoading ? (
          <div className="flex justify-center my-12">
            <svg className="animate-spin h-10 w-10 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            {filteredCourses.length > 0 ? (
              filteredCourses
                .filter(course => course.published || user?.role === 'admin')
                .map((course) => (
                  <motion.div
                    key={course.id}
                    className="flex flex-col rounded-lg shadow-lg overflow-hidden transition-transform duration-300 hover:shadow-xl"
                    whileHover={{ scale: 1.02 }}
                    variants={fadeIn}
                  >
                    <div className="flex-shrink-0 relative">
                      <img
                        className="h-48 w-full object-cover"
                        src={course.thumbnail_url || "https://images.pexels.com/photos/4145153/pexels-photo-4145153.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"}
                        alt={course.title}
                      />
                      {!course.published && (
                        <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded">
                          Unpublished
                        </div>
                      )}
                    </div>
                    <div className="flex-1 bg-white p-6 flex flex-col justify-between">
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium ${
                            course.category === 'Beginner' ? 'bg-green-100 text-green-800' :
                            course.category === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {course.category}
                          </span>
                        </div>
                        <Link to={`/courses/${course.id}`} className="block mt-2">
                          <p className="text-xl font-semibold text-gray-900">{course.title}</p>
                          <p className="mt-3 text-base text-gray-500 line-clamp-3">{course.description}</p>
                        </Link>
                      </div>
                      <div className="mt-6 flex justify-between items-center">
                        <Link
                          to={`/courses/${course.id}`}
                          className="text-base font-semibold text-indigo-600 hover:text-indigo-500"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))
            ) : (
              <div className="col-span-3 text-center py-12">
                <p className="text-gray-500 text-lg">No courses found in this category.</p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </Layout>
  );
};

export default CoursesPage;
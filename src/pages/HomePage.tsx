import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { GraduationCap, BookOpen, Video, Users, CheckCircle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useCourseStore } from '../store/courseStore';
import Layout from '../components/layout/Layout';

const HomePage: React.FC = () => {
  const { user, isLoading: isUserLoading } = useAuthStore();
  const { courses, fetchCourses, isLoading: isCoursesLoading } = useCourseStore();
  const [featuredCourses, setFeaturedCourses] = useState<any[]>([]);
  
  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);
  
  useEffect(() => {
    // Filter published courses and get the latest 3
    const published = courses.filter(course => course.published);
    setFeaturedCourses(published.slice(0, 3));
  }, [courses]);
  
  const features = [
    {
      icon: <BookOpen size={24} className="text-indigo-600" />,
      title: 'Diverse Course Catalog',
      description: 'Access a wide range of courses from beginner to advanced levels across various topics.'
    },
    {
      icon: <Video size={24} className="text-indigo-600" />,
      title: 'HD Video Content',
      description: 'Learn with high-quality video content from expert instructors.'
    },
    {
      icon: <CheckCircle size={24} className="text-indigo-600" />,
      title: 'Progress Tracking',
      description: 'Monitor your learning progress and pick up where you left off.'
    },
    {
      icon: <Users size={24} className="text-indigo-600" />,
      title: 'Community Learning',
      description: 'Join a community of learners and share your knowledge and experiences.'
    }
  ];
  
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
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
      {/* Hero Section */}
      <motion.section
        className="text-center py-16 px-4 sm:py-24 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl mb-12"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        <motion.h1 
          className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl"
          variants={fadeIn}
        >
          <span className="block">Learn at your own pace</span>
          <span className="block text-indigo-600">Anytime, Anywhere</span>
        </motion.h1>
        <motion.p
          className="mt-6 max-w-lg mx-auto text-xl text-gray-500 sm:max-w-3xl"
          variants={fadeIn}
        >
          Access high-quality courses designed to help you advance your skills and knowledge in various fields.
        </motion.p>
        <motion.div 
          className="mt-10 max-w-sm mx-auto sm:max-w-none sm:flex sm:justify-center"
          variants={fadeIn}
        >
          <div className="space-y-4 sm:space-y-0 sm:mx-auto sm:inline-grid sm:grid-cols-2 sm:gap-5">
            <Link
              to="/courses"
              className="flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 sm:px-8"
            >
              Browse Courses
            </Link>
            {!user && (
              <Link
                to="/register"
                className="flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-indigo-600 bg-white hover:bg-gray-50 sm:px-8"
              >
                Sign Up
              </Link>
            )}
          </div>
        </motion.div>
      </motion.section>
      
      {/* Featured Courses */}
      <motion.section
        className="py-12"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        <div className="px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center"
            variants={fadeIn}
          >
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Featured Courses
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
              Explore our most popular courses across various categories
            </p>
          </motion.div>
          
          {isCoursesLoading ? (
            <div className="flex justify-center mt-12">
              <svg className="animate-spin h-10 w-10 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : featuredCourses.length > 0 ? (
            <motion.div 
              className="mt-12 max-w-lg mx-auto grid gap-8 md:grid-cols-2 lg:grid-cols-3 lg:max-w-none"
              variants={staggerContainer}
            >
              {featuredCourses.map((course) => (
                <motion.div
                  key={course.id}
                  className="flex flex-col rounded-lg shadow-lg overflow-hidden transition-transform duration-300 hover:shadow-xl hover:-translate-y-1"
                  whileHover={{ scale: 1.02 }}
                  variants={fadeIn}
                >
                  <div className="flex-shrink-0">
                    <img
                      className="h-48 w-full object-cover"
                      src={course.thumbnail_url || "https://images.pexels.com/photos/3769714/pexels-photo-3769714.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"}
                      alt={course.title}
                    />
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
                    <div className="mt-6">
                      <Link
                        to={`/courses/${course.id}`}
                        className="text-base font-semibold text-indigo-600 hover:text-indigo-500"
                      >
                        View Course →
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              className="text-center mt-12"
              variants={fadeIn}
            >
              <p className="text-lg text-gray-500">No courses available yet.</p>
            </motion.div>
          )}
          
          <motion.div 
            className="text-center mt-12"
            variants={fadeIn}
          >
            <Link
              to="/courses"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              View All Courses
            </Link>
          </motion.div>
        </div>
      </motion.section>
      
      {/* Features Section */}
      <motion.section
        className="py-12 bg-white rounded-3xl shadow-sm my-12"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center"
            variants={fadeIn}
          >
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Why Choose Our Platform
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
              Features designed to enhance your learning experience
            </p>
          </motion.div>
          
          <motion.div 
            className="mt-12"
            variants={staggerContainer}
          >
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, index) => (
                <motion.div 
                  key={index}
                  className="pt-6"
                  variants={fadeIn}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="flow-root bg-gray-50 rounded-lg px-6 pb-8 h-full">
                    <div className="-mt-6">
                      <div>
                        <span className="inline-flex items-center justify-center p-3 bg-indigo-500 rounded-md shadow-lg">
                          {feature.icon}
                        </span>
                      </div>
                      <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">
                        {feature.title}
                      </h3>
                      <p className="mt-5 text-base text-gray-500">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.section>
      
      {/* CTA Section */}
      <motion.section
        className="bg-indigo-700 rounded-3xl shadow-lg"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            <span className="block">Ready to start learning?</span>
            <span className="block">Join thousands of learners today.</span>
          </h2>
          <p className="mt-4 text-lg leading-6 text-indigo-200">
            Unlock your potential with our comprehensive course library and start your learning journey today.
          </p>
          <div className="mt-8 flex justify-center">
            {user ? (
              <Link
                to="/courses"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50 sm:w-auto"
              >
                Browse Courses
              </Link>
            ) : (
              <div className="space-x-4">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50 sm:w-auto"
                >
                  Sign Up
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-800 hover:bg-indigo-900 sm:w-auto"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      </motion.section>
    </Layout>
  );
};

export default HomePage;
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Clock, Users, CheckCircle, AlertCircle, ChevronDown, ChevronRight } from 'lucide-react';
import { useCourseStore } from '../store/courseStore';
import { useAuthStore } from '../store/authStore';
import { useEnrollmentStore } from '../store/enrollmentStore';
import Layout from '../components/layout/Layout';
import YouTubeEmbed from '../utils/YoutubeEmbed';
import Certificate from '../utils/Certificate';

const CourseDetailPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { selectedCourse, selectedCourseModules, fetchCourseDetails, isLoading } = useCourseStore();
  const { user } = useAuthStore();
  const { enrollInCourse, fetchCourseProgress, updateVideoProgress, courseProgress } = useEnrollmentStore();
  
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  const [activeVideo, setActiveVideo] = useState<any>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrollmentLoading, setEnrollmentLoading] = useState(false);
  
  useEffect(() => {
    if (courseId) {
      fetchCourseDetails(courseId);
    }
  }, [courseId, fetchCourseDetails]);
  
  useEffect(() => {
    if (user && courseId) {
      // Check if user is enrolled
      const checkEnrollment = async () => {
        try {
          await fetchCourseProgress(user.id, courseId);
          setIsEnrolled(true);
        } catch (error) {
          setIsEnrolled(false);
        }
      };
      
      checkEnrollment();
    }
  }, [user, courseId, fetchCourseProgress]);
  
  const handleEnroll = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    setEnrollmentLoading(true);
    try {
      await enrollInCourse(user.id, courseId!);
      await fetchCourseProgress(user.id, courseId!);
      setIsEnrolled(true);
    } catch (error) {
      console.error('Error enrolling in course:', error);
    } finally {
      setEnrollmentLoading(false);
    }
  };
  
  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };
  
  const handleVideoSelect = (video: any) => {
    setActiveVideo(video);
  };
  
  const handleVideoProgress = (percentage: number) => {
    if (user && activeVideo) {
      updateVideoProgress(user.id, activeVideo.id, percentage);
    }
  };
  
  const handleVideoEnd = () => {
    if (user && activeVideo) {
      updateVideoProgress(user.id, activeVideo.id, 100);
    }
  };
  
  const extractYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };
  
  const courseProgressData = courseId ? courseProgress[courseId] : null;
  const isCompleted = courseProgressData?.isCompleted || false;
  
  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };
  
  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <svg className="animate-spin h-10 w-10 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      </Layout>
    );
  }
  
  if (!selectedCourse) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900">Course not found</h2>
          <p className="mt-2 text-gray-600">The course you're looking for doesn't exist or has been removed.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          {/* Main Content */}
          <motion.div 
            className="lg:col-span-2"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            {/* Course Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{selectedCourse.title}</h1>
              <div className="flex flex-wrap gap-4 mb-6">
                <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium ${
                  selectedCourse.category === 'Beginner' ? 'bg-green-100 text-green-800' :
                  selectedCourse.category === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {selectedCourse.category}
                </span>
                {!selectedCourse.published && (
                  <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                    Unpublished
                  </span>
                )}
              </div>
              
              {activeVideo ? (
                <div className="mb-6">
                  <YouTubeEmbed
                    videoId={extractYouTubeId(activeVideo.youtube_url) || ''}
                    title={activeVideo.title}
                    onVideoProgress={handleVideoProgress}
                    onVideoEnd={handleVideoEnd}
                    className="mb-4"
                  />
                  <h2 className="text-xl font-semibold mb-2">{activeVideo.title}</h2>
                </div>
              ) : (
                <div className="aspect-w-16 aspect-h-9 mb-6 bg-gray-100 rounded-lg flex items-center justify-center">
                  <img
                    src={selectedCourse.thumbnail_url || "https://images.pexels.com/photos/4050312/pexels-photo-4050312.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"}
                    alt={selectedCourse.title}
                    className="rounded-lg object-cover w-full h-full"
                  />
                </div>
              )}
              
              <div className="prose max-w-none">
                <h2 className="text-2xl font-bold mb-4">About this Course</h2>
                <p className="text-gray-700 mb-6">{selectedCourse.description}</p>
                
                {isCompleted && user && (
                  <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h3 className="text-lg font-medium text-green-800 flex items-center">
                      <CheckCircle size={20} className="mr-2" />
                      Congratulations! You've completed this course.
                    </h3>
                    <p className="mt-2 text-green-700">
                      You have successfully watched all videos in this course.
                    </p>
                    <Certificate 
                      username={user.username}
                      courseName={selectedCourse.title}
                      completionDate={new Date()}
                    />
                  </div>
                )}
                
                {courseProgressData && !isCompleted && (
                  <div className="mb-8">
                    <h3 className="text-lg font-medium mb-2">Your Progress</h3>
                    <div className="bg-gray-200 rounded-full h-4 mb-2">
                      <div 
                        className="bg-indigo-600 h-4 rounded-full" 
                        style={{ width: `${courseProgressData.percentComplete}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600">
                      {courseProgressData.watchedVideos} of {courseProgressData.totalVideos} videos completed ({Math.round(courseProgressData.percentComplete)}%)
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
          
          {/* Sidebar */}
          <motion.div 
            className="lg:col-span-1 mt-10 lg:mt-0"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <div className="bg-white shadow rounded-lg overflow-hidden sticky top-6">
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold mb-4">Course Content</h2>
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <span className="flex items-center">
                    <BookOpen size={16} className="mr-1" />
                    {selectedCourseModules.length} modules
                  </span>
                  <span className="flex items-center">
                    <Clock size={16} className="mr-1" />
                    {selectedCourseModules.reduce((acc, module) => acc + (module.videos?.length || 0), 0)} videos
                  </span>
                </div>
                
                {!isEnrolled && (
                  <button
                    onClick={handleEnroll}
                    disabled={enrollmentLoading}
                    className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 mb-4"
                  >
                    {enrollmentLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Enrolling...
                      </>
                    ) : (
                      <>
                        <Users size={16} className="mr-2" />
                        Enroll Now
                      </>
                    )}
                  </button>
                )}
              </div>
              
              {/* Module List */}
              <div className="divide-y divide-gray-200">
                {selectedCourseModules.map((module) => (
                  <div key={module.id} className="border-b last:border-b-0">
                    <button
                      onClick={() => toggleModule(module.id)}
                      className="w-full flex justify-between items-center p-4 text-left hover:bg-gray-50 transition-colors"
                    >
                      <span className="font-medium">{module.title}</span>
                      {expandedModules[module.id] ? (
                        <ChevronDown size={20} />
                      ) : (
                        <ChevronRight size={20} />
                      )}
                    </button>
                    
                    {expandedModules[module.id] && module.videos && (
                      <div className="pl-4 pr-4 pb-4">
                        <ul className="space-y-2">
                          {module.videos.map((video: any) => (
                            <li key={video.id}>
                              <button
                                onClick={() => handleVideoSelect(video)}
                                className={`w-full flex items-center p-2 rounded-md text-left text-sm ${
                                  activeVideo?.id === video.id
                                    ? 'bg-indigo-50 text-indigo-700'
                                    : 'hover:bg-gray-50'
                                }`}
                                disabled={!isEnrolled}
                              >
                                <span className="flex-shrink-0 mr-2">
                                  {activeVideo?.id === video.id ? (
                                    <AlertCircle size={16} className="text-indigo-600" />
                                  ) : (
                                    <video.icon size={16} className="text-gray-400" />
                                  )}
                                </span>
                                <span className="truncate">{video.title}</span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default CourseDetailPage;
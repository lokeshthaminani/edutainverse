import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Save, ArrowLeft, Check, X, PlusCircle, Trash2, Edit2 } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useCourseStore } from '../../store/courseStore';
import { useModuleStore } from '../../store/moduleStore';
import { useVideoStore } from '../../store/videoStore';
import Layout from '../../components/layout/Layout';

const CourseFormPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { selectedCourse, fetchCourseDetails, createCourse, updateCourse, publishCourse, isLoading: isCourseLoading } = useCourseStore();
  const { modules, fetchModules, createModule, updateModule, deleteModule, isLoading: isModulesLoading } = useModuleStore();
  const { videos, fetchVideos, createVideo, updateVideo, deleteVideo, isLoading: isVideosLoading } = useVideoStore();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Beginner',
    thumbnail_url: '',
    published: false,
  });
  
  const [currentModule, setCurrentModule] = useState<string | null>(null);
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [newVideoData, setNewVideoData] = useState({ title: '', youtube_url: '' });
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [editingModuleTitle, setEditingModuleTitle] = useState('');
  const [editingVideoId, setEditingVideoId] = useState<string | null>(null);
  const [editingVideoData, setEditingVideoData] = useState({ title: '', youtube_url: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [isCreatingVideo, setIsCreatingVideo] = useState(false);
  
  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);
  
  useEffect(() => {
    if (courseId && courseId !== 'new') {
      fetchCourseDetails(courseId);
    }
  }, [courseId, fetchCourseDetails]);
  
  useEffect(() => {
    if (selectedCourse && courseId !== 'new') {
      setFormData({
        title: selectedCourse.title,
        description: selectedCourse.description,
        category: selectedCourse.category,
        thumbnail_url: selectedCourse.thumbnail_url || '',
        published: selectedCourse.published,
      });
      
      fetchModules(selectedCourse.id);
    }
  }, [selectedCourse, fetchModules, courseId]);
  
  useEffect(() => {
    if (currentModule) {
      fetchVideos(currentModule);
    }
  }, [currentModule, fetchVideos]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      if (courseId === 'new') {
        if (!user) return;
        
        const newCourseId = await createCourse({
          ...formData,
          created_by: user.id,
        });
        
        navigate(`/admin/courses/${newCourseId}`);
      } else if (courseId) {
        await updateCourse(courseId, formData);
      }
    } catch (error) {
      console.error('Error saving course:', error);
    } finally {
      setIsSaving(false);
    }
  };
  
  const handlePublishToggle = async () => {
    if (!courseId || courseId === 'new') return;
    
    setIsSaving(true);
    try {
      await publishCourse(courseId, !formData.published);
      setFormData(prev => ({ ...prev, published: !prev.published }));
    } catch (error) {
      console.error('Error toggling publish status:', error);
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleAddModule = async () => {
    if (!courseId || courseId === 'new' || !newModuleTitle.trim()) return;
    
    try {
      await createModule({
        title: newModuleTitle,
        course_id: courseId,
      });
      
      setNewModuleTitle('');
      await fetchModules(courseId);
    } catch (error) {
      console.error('Error adding module:', error);
    }
  };
  
  const handleEditModule = async () => {
    if (!editingModuleId || !editingModuleTitle.trim()) return;
    
    try {
      await updateModule(editingModuleId, { title: editingModuleTitle });
      setEditingModuleId(null);
      setEditingModuleTitle('');
      
      if (courseId && courseId !== 'new') {
        await fetchModules(courseId);
      }
    } catch (error) {
      console.error('Error updating module:', error);
    }
  };
  
  const handleDeleteModule = async (moduleId: string) => {
    if (!window.confirm('Are you sure you want to delete this module? This will also delete all videos in this module.')) {
      return;
    }
    
    try {
      await deleteModule(moduleId);
      
      if (currentModule === moduleId) {
        setCurrentModule(null);
      }
      
      if (courseId && courseId !== 'new') {
        await fetchModules(courseId);
      }
    } catch (error) {
      console.error('Error deleting module:', error);
    }
  };
  
  const handleAddVideo = async () => {
    if (!currentModule || !newVideoData.title.trim() || !newVideoData.youtube_url.trim()) return;
    
    try {
      await createVideo({
        ...newVideoData,
        module_id: currentModule,
      });
      
      setNewVideoData({ title: '', youtube_url: '' });
      setIsCreatingVideo(false);
      await fetchVideos(currentModule);
    } catch (error) {
      console.error('Error adding video:', error);
    }
  };
  
  const handleEditVideo = async () => {
    if (!editingVideoId || !editingVideoData.title.trim() || !editingVideoData.youtube_url.trim()) return;
    
    try {
      await updateVideo(editingVideoId, editingVideoData);
      setEditingVideoId(null);
      setEditingVideoData({ title: '', youtube_url: '' });
      
      if (currentModule) {
        await fetchVideos(currentModule);
      }
    } catch (error) {
      console.error('Error updating video:', error);
    }
  };
  
  const handleDeleteVideo = async (videoId: string) => {
    if (!window.confirm('Are you sure you want to delete this video?')) {
      return;
    }
    
    try {
      await deleteVideo(videoId);
      
      if (currentModule) {
        await fetchVideos(currentModule);
      }
    } catch (error) {
      console.error('Error deleting video:', error);
    }
  };
  
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };
  
  const isLoading = isCourseLoading || isModulesLoading || isVideosLoading;
  
  if (isLoading && courseId !== 'new') {
    return (
      <Layout>
        <div className="flex justify-center items-center py-12">
          <svg className="animate-spin h-10 w-10 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="mb-6 flex items-center justify-between"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <div className="flex items-center">
            <button
              onClick={() => navigate('/admin/courses')}
              className="mr-4 flex items-center text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft size={16} className="mr-1" />
              Back to Courses
            </button>
            <h1 className="text-2xl font-bold text-gray-900">
              {courseId === 'new' ? 'Create New Course' : 'Edit Course'}
            </h1>
          </div>
          
          {courseId !== 'new' && (
            <button
              onClick={handlePublishToggle}
              disabled={isSaving}
              className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium ${
                formData.published
                  ? 'text-white bg-green-600 hover:bg-green-700'
                  : 'text-white bg-yellow-500 hover:bg-yellow-600'
              }`}
            >
              {formData.published ? (
                <>
                  <Check size={16} className="mr-2" />
                  Published
                </>
              ) : (
                <>
                  <X size={16} className="mr-2" />
                  Draft
                </>
              )}
            </button>
          )}
        </motion.div>
        
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Course Form */}
          <motion.div 
            className="md:col-span-2"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:p-6">
                <form onSubmit={handleSubmit}>
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                        Course Title
                      </label>
                      <input
                        type="text"
                        name="title"
                        id="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="Enter course title"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                        Description
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        rows={5}
                        value={formData.description}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="Enter course description"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                        Category
                      </label>
                      <select
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="thumbnail_url" className="block text-sm font-medium text-gray-700">
                        Thumbnail URL (optional)
                      </label>
                      <input
                        type="url"
                        name="thumbnail_url"
                        id="thumbnail_url"
                        value={formData.thumbnail_url}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="https://example.com/image.jpg"
                      />
                      {formData.thumbnail_url && (
                        <div className="mt-2">
                          <img
                            src={formData.thumbnail_url}
                            alt="Thumbnail preview"
                            className="h-24 w-auto object-cover rounded"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "https://images.pexels.com/photos/3769714/pexels-photo-3769714.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1";
                            }}
                          />
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        {isSaving ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save size={16} className="mr-2" />
                            Save Course
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
            
            {/* Video Management (only shown when a module is selected) */}
            {currentModule && (
              <motion.div 
                className="bg-white shadow rounded-lg overflow-hidden mt-8"
                initial="hidden"
                animate="visible"
                variants={fadeIn}
              >
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Videos for {modules.find(m => m.id === currentModule)?.title}
                    </h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                      Add and manage videos for this module
                    </p>
                  </div>
                  <button
                    onClick={() => setIsCreatingVideo(!isCreatingVideo)}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                  >
                    {isCreatingVideo ? (
                      <>
                        <X size={16} className="mr-1" />
                        Cancel
                      </>
                    ) : (
                      <>
                        <PlusCircle size={16} className="mr-1" />
                        Add Video
                      </>
                    )}
                  </button>
                </div>
                
                {isCreatingVideo && (
                  <div className="px-4 py-5 sm:p-6 border-b border-gray-200 bg-gray-50">
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="new-video-title" className="block text-sm font-medium text-gray-700">
                          Video Title
                        </label>
                        <input
                          type="text"
                          id="new-video-title"
                          value={newVideoData.title}
                          onChange={(e) => setNewVideoData(prev => ({ ...prev, title: e.target.value }))}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          placeholder="Enter video title"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="new-video-url" className="block text-sm font-medium text-gray-700">
                          YouTube URL
                        </label>
                        <input
                          type="url"
                          id="new-video-url"
                          value={newVideoData.youtube_url}
                          onChange={(e) => setNewVideoData(prev => ({ ...prev, youtube_url: e.target.value }))}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          placeholder="https://www.youtube.com/watch?v=..."
                        />
                      </div>
                      
                      <div className="flex justify-end">
                        <button
                          onClick={handleAddVideo}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                        >
                          Add Video
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="divide-y divide-gray-200">
                  {videos.length > 0 ? (
                    videos.map((video) => (
                      <div key={video.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                        {editingVideoId === video.id ? (
                          <div className="space-y-3">
                            <div>
                              <label htmlFor={`edit-video-title-${video.id}`} className="block text-sm font-medium text-gray-700">
                                Video Title
                              </label>
                              <input
                                type="text"
                                id={`edit-video-title-${video.id}`}
                                value={editingVideoData.title}
                                onChange={(e) => setEditingVideoData(prev => ({ ...prev, title: e.target.value }))}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                              />
                            </div>
                            
                            <div>
                              <label htmlFor={`edit-video-url-${video.id}`} className="block text-sm font-medium text-gray-700">
                                YouTube URL
                              </label>
                              <input
                                type="url"
                                id={`edit-video-url-${video.id}`}
                                value={editingVideoData.youtube_url}
                                onChange={(e) => setEditingVideoData(prev => ({ ...prev, youtube_url: e.target.value }))}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                              />
                            </div>
                            
                            <div className="flex justify-end space-x-3">
                              <button
                                onClick={() => {
                                  setEditingVideoId(null);
                                  setEditingVideoData({ title: '', youtube_url: '' });
                                }}
                                className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={handleEditVideo}
                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="text-sm font-semibold text-gray-900">{video.title}</h4>
                              <p className="mt-1 text-xs text-gray-500 truncate">{video.youtube_url}</p>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => {
                                  setEditingVideoId(video.id);
                                  setEditingVideoData({
                                    title: video.title,
                                    youtube_url: video.youtube_url,
                                  });
                                }}
                                className="inline-flex items-center p-1.5 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteVideo(video.id)}
                                className="inline-flex items-center p-1.5 border border-gray-300 rounded-md text-red-700 bg-white hover:bg-gray-50"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-5 sm:p-6 text-center">
                      <p className="text-gray-500">No videos added yet. Click "Add Video" to get started.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </motion.div>
          
          {/* Module Management Sidebar */}
          {courseId !== 'new' && (
            <motion.div 
              className="md:col-span-1"
              initial="hidden"
              animate="visible"
              variants={fadeIn}
            >
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Course Modules</h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">Add and manage modules</p>
                </div>
                
                <div className="px-4 py-5 sm:p-6 border-b border-gray-200">
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="new-module-title" className="block text-sm font-medium text-gray-700">
                        New Module Title
                      </label>
                      <div className="mt-1 flex rounded-md shadow-sm">
                        <input
                          type="text"
                          id="new-module-title"
                          value={newModuleTitle}
                          onChange={(e) => setNewModuleTitle(e.target.value)}
                          className="flex-1 min-w-0 block w-full border border-gray-300 rounded-md rounded-r-none shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          placeholder="Enter module title"
                        />
                        <button
                          onClick={handleAddModule}
                          className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 sm:text-sm hover:bg-gray-100"
                        >
                          <PlusCircle size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="divide-y divide-gray-200">
                  {modules.length > 0 ? (
                    modules.map((module) => (
                      <div
                        key={module.id}
                        className={`px-4 py-4 sm:px-6 ${
                          currentModule === module.id ? 'bg-indigo-50' : 'hover:bg-gray-50'
                        }`}
                      >
                        {editingModuleId === module.id ? (
                          <div className="flex items-center space-x-3">
                            <input
                              type="text"
                              value={editingModuleTitle}
                              onChange={(e) => setEditingModuleTitle(e.target.value)}
                              className="block w-full border border-gray-300 rounded-md shadow-sm py-1.5 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                            <button
                              onClick={handleEditModule}
                              className="inline-flex items-center p-1.5 border border-transparent rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                            >
                              <Check size={14} />
                            </button>
                            <button
                              onClick={() => {
                                setEditingModuleId(null);
                                setEditingModuleTitle('');
                              }}
                              className="inline-flex items-center p-1.5 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <button
                              onClick={() => setCurrentModule(module.id)}
                              className="flex-1 text-left font-medium text-gray-900 hover:text-indigo-600"
                            >
                              {module.title}
                            </button>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => {
                                  setEditingModuleId(module.id);
                                  setEditingModuleTitle(module.title);
                                }}
                                className="inline-flex items-center p-1.5 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteModule(module.id)}
                                className="inline-flex items-center p-1.5 border border-gray-300 rounded-md text-red-700 bg-white hover:bg-gray-50"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-5 sm:p-6 text-center">
                      <p className="text-gray-500">No modules added yet. Add your first module above.</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default CourseFormPage;
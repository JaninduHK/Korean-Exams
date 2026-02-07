import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  BookOpen,
  Headphones,
  Filter,
  Upload,
  X,
  Loader as LoaderIcon
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Loader from '../../components/common/Loader';
import { adminService } from '../../services/adminService';

const emptyQuestion = {
  type: 'reading',
  questionNumber: 1,
  difficulty: 'medium',
  questionText: '',
  questionImage: '',
  optionsDisplayMode: 'text',
  options: [
    { label: 'A', text: '', image: '', audio: '' },
    { label: 'B', text: '', image: '', audio: '' },
    { label: 'C', text: '', image: '', audio: '' },
    { label: 'D', text: '', image: '', audio: '' }
  ],
  correctAnswer: 'A',
  explanation: '',
  topic: 'other',
  audioFile: '',
  questionDuration: 60
};

const topics = [
  'workplace-safety', 'workplace-communication', 'daily-life', 'transportation',
  'shopping', 'health', 'grammar', 'vocabulary', 'reading-comprehension',
  'listening-comprehension', 'culture', 'numbers-dates', 'directions', 'weather', 'food', 'housing', 'other'
];

export default function AdminQuestions() {
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [topicFilter, setTopicFilter] = useState('');
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [form, setForm] = useState(emptyQuestion);
  const [isSaving, setIsSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [audioPreview, setAudioPreview] = useState('');
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);
  const [optionImagePreviews, setOptionImagePreviews] = useState({});
  const [uploadingOptionIndex, setUploadingOptionIndex] = useState(null);
  const [optionAudioPreviews, setOptionAudioPreviews] = useState({});
  const [uploadingAudioOptionIndex, setUploadingAudioOptionIndex] = useState(null);

  const fetchQuestions = async (page = 1) => {
    setIsLoading(true);
    try {
      const data = await adminService.getQuestions({
        page,
        search: search || undefined,
        type: typeFilter || undefined,
        difficulty: difficultyFilter || undefined,
        topic: topicFilter || undefined
      });
      setQuestions(data.data);
      setPagination(data.pagination);
    } catch (error) {
      toast.error('Failed to fetch questions');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [search, typeFilter, difficultyFilter, topicFilter]);

  const handleCreate = () => {
    setSelectedQuestion(null);
    setForm(emptyQuestion);
    setImagePreview('');
    setAudioPreview('');
    setOptionImagePreviews({});
    setOptionAudioPreviews({});
    setShowModal(true);
  };

  const handleEdit = (question) => {
    setSelectedQuestion(question);
    setForm({
      ...question,
      options: question.options || emptyQuestion.options,
      optionsDisplayMode: question.optionsDisplayMode || 'text'
    });
    setImagePreview(question.questionImage || '');
    setAudioPreview(question.audioFile || '');

    // Load option image previews
    const imagePreviews = {};
    if (question.options) {
      question.options.forEach((opt, idx) => {
        if (opt.image) imagePreviews[idx] = opt.image;
      });
    }
    setOptionImagePreviews(imagePreviews);

    // Load option audio previews
    const audioPreviews = {};
    if (question.options) {
      question.options.forEach((opt, idx) => {
        if (opt.audio) audioPreviews[idx] = opt.audio;
      });
    }
    setOptionAudioPreviews(audioPreviews);

    setShowModal(true);
  };

  const handleSave = async () => {
    // Validate based on display mode
    if (form.optionsDisplayMode === 'image') {
      const missingImages = form.options.filter(opt => !opt.image);
      if (missingImages.length > 0) {
        toast.error(`Upload images for all options: ${missingImages.map(o => o.label).join(', ')}`);
        return;
      }
    }

    if (form.optionsDisplayMode === 'audio') {
      const missingAudios = form.options.filter(opt => !opt.audio);
      if (missingAudios.length > 0) {
        toast.error(`Upload audio files for all options: ${missingAudios.map(o => o.label).join(', ')}`);
        return;
      }
    }

    setIsSaving(true);
    try {
      if (selectedQuestion) {
        await adminService.updateQuestion(selectedQuestion._id, form);
        toast.success('Question updated');
      } else {
        await adminService.createQuestion(form);
        toast.success('Question created');
      }
      setShowModal(false);
      fetchQuestions(pagination.page);
    } catch (error) {
      toast.error(error.message || 'Failed to save question');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (question) => {
    setSelectedQuestion(question);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await adminService.deleteQuestion(selectedQuestion._id);
      toast.success('Question deleted');
      setShowDeleteModal(false);
      fetchQuestions(pagination.page);
    } catch (error) {
      toast.error('Failed to delete question');
    }
  };

  const updateOption = (index, field, value) => {
    const newOptions = [...form.options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setForm({ ...form, options: newOptions });
  };

  const handleOptionImageUpload = async (index, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image too large (max 5MB)');
      return;
    }

    setUploadingOptionIndex(index);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await adminService.uploadImage(formData);

      const newOptions = [...form.options];
      newOptions[index] = {
        ...newOptions[index],
        image: response.data.url
      };
      setForm({ ...form, options: newOptions });

      setOptionImagePreviews({
        ...optionImagePreviews,
        [index]: response.data.url
      });

      toast.success(`Option ${form.options[index].label} image uploaded`);
    } catch (error) {
      toast.error('Failed to upload image');
      console.error('Image upload error:', error);
    } finally {
      setUploadingOptionIndex(null);
    }
  };

  const handleClearOptionImage = (index) => {
    const newOptions = [...form.options];
    newOptions[index] = {
      ...newOptions[index],
      image: ''
    };
    setForm({ ...form, options: newOptions });

    const newPreviews = { ...optionImagePreviews };
    delete newPreviews[index];
    setOptionImagePreviews(newPreviews);
  };

  const handleOptionAudioUpload = async (index, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/')) {
      toast.error('Please select an audio file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Audio file too large (max 10MB)');
      return;
    }

    setUploadingAudioOptionIndex(index);

    try {
      const formData = new FormData();
      formData.append('audioFile', file);

      const response = await adminService.uploadAudio(formData);

      const newOptions = [...form.options];
      newOptions[index] = {
        ...newOptions[index],
        audio: response.data.url
      };
      setForm({ ...form, options: newOptions });

      setOptionAudioPreviews({
        ...optionAudioPreviews,
        [index]: response.data.url
      });

      toast.success(`Option ${form.options[index].label} audio uploaded`);
    } catch (error) {
      toast.error('Failed to upload audio');
    } finally {
      setUploadingAudioOptionIndex(null);
    }
  };

  const handleClearOptionAudio = (index) => {
    const newOptions = [...form.options];
    newOptions[index] = {
      ...newOptions[index],
      audio: ''
    };
    setForm({ ...form, options: newOptions });

    const newPreviews = { ...optionAudioPreviews };
    delete newPreviews[index];
    setOptionAudioPreviews(newPreviews);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image too large (max 2MB)');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result;
      setForm({ ...form, questionImage: base64 });
      setImagePreview(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleImageUrlChange = (url) => {
    setForm({ ...form, questionImage: url });
    setImagePreview(url);
  };

  const handleAudioUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/')) {
      toast.error('Please select an audio file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Audio file too large (max 10MB)');
      return;
    }

    setIsUploadingAudio(true);

    try {
      const formData = new FormData();
      formData.append('audioFile', file);

      const response = await adminService.uploadAudio(formData);

      setForm({
        ...form,
        audioFile: response.data.url,
        audioDuration: response.data.duration
      });
      setAudioPreview(response.data.url);
      toast.success('Audio uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload audio');
      console.error('Audio upload error:', error);
    } finally {
      setIsUploadingAudio(false);
    }
  };

  const handleClearAudio = () => {
    setForm({ ...form, audioFile: '', audioDuration: null });
    setAudioPreview('');
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Questions</h1>
            <p className="text-gray-500">Manage exam questions ({pagination.total} total)</p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Add Question
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search questions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">All Types</option>
              <option value="reading">Reading</option>
              <option value="listening">Listening</option>
            </select>
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
            <select
              value={topicFilter}
              onChange={(e) => setTopicFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">All Topics</option>
              {topics.map(t => (
                <option key={t} value={t}>{t.replace(/-/g, ' ')}</option>
              ))}
            </select>
          </div>
        </Card>

        {/* Questions List */}
        <Card padding="p-0">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader size="lg" />
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {questions.map((question) => (
                <div key={question._id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {question.type === 'listening' ? (
                          <Headphones className="w-4 h-4 text-purple-500" />
                        ) : (
                          <BookOpen className="w-4 h-4 text-green-500" />
                        )}
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          question.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                          question.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {question.difficulty}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-600 text-xs capitalize">
                          {question.topic?.replace(/-/g, ' ')}
                        </span>
                      </div>
                      <p className="text-gray-900 font-korean line-clamp-2">{question.questionText}</p>
                      <div className="flex gap-4 mt-2 text-sm text-gray-500">
                        <span>Answer: {question.correctAnswer}</span>
                        <span>Attempts: {question.timesAnswered || 0}</span>
                        <span>Success: {question.timesAnswered > 0 ? Math.round((question.timesCorrect / question.timesAnswered) * 100) : 0}%</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(question)}
                        className="p-2 text-gray-500 hover:text-primary-600 hover:bg-gray-100 rounded-lg"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(question)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {pagination.pages > 1 && (
            <div className="flex justify-center gap-2 p-4 border-t border-gray-200">
              {[...Array(Math.min(pagination.pages, 10))].map((_, i) => (
                <button
                  key={i}
                  onClick={() => fetchQuestions(i + 1)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium ${
                    pagination.page === i + 1
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Question Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={selectedQuestion ? 'Edit Question' : 'Add Question'}
        size="lg"
      >
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="reading">Reading</option>
                <option value="listening">Listening</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
              <select
                value={form.difficulty}
                onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
              <select
                value={form.topic}
                onChange={(e) => setForm({ ...form, topic: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                {topics.map(t => (
                  <option key={t} value={t}>{t.replace(/-/g, ' ')}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Question Text</label>
            <textarea
              value={form.questionText}
              onChange={(e) => setForm({ ...form, questionText: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg font-korean"
              placeholder="Enter question text..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Question Image (optional)</label>
            <div className="flex items-center gap-3">
              <label className="inline-flex items-center gap-2 px-3 py-2 border border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <span className="text-sm text-gray-700">Upload</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
              <input
                type="text"
                value={form.questionImage || ''}
                onChange={(e) => handleImageUrlChange(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="https://link-to-image or leave blank"
              />
              {imagePreview && (
                <button
                  type="button"
                  onClick={() => { setForm({ ...form, questionImage: '' }); setImagePreview(''); }}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Clear
                </button>
              )}
            </div>
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Preview"
                className="mt-3 max-h-40 rounded-lg border object-contain"
              />
            )}
          </div>

          {form.type === 'listening' && (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Audio File</label>

              {/* Upload Button */}
              <div className="flex gap-2">
                <label className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                  isUploadingAudio ? 'border-gray-300 bg-gray-50' : 'border-gray-300 hover:border-primary-500 hover:bg-primary-50'
                }`}>
                  {isUploadingAudio ? (
                    <>
                      <LoaderIcon className="w-5 h-5 animate-spin text-gray-400" />
                      <span className="text-sm text-gray-600">Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5 text-gray-400" />
                      <span className="text-sm text-gray-600">Upload MP3 audio file</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleAudioUpload}
                    className="hidden"
                    disabled={isUploadingAudio}
                  />
                </label>

                {audioPreview && (
                  <button
                    type="button"
                    onClick={handleClearAudio}
                    className="px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    title="Clear audio"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Audio Preview */}
              {audioPreview && (
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <audio controls className="w-full" src={audioPreview}>
                    Your browser does not support the audio element.
                  </audio>
                  {form.audioDuration && (
                    <p className="text-xs text-gray-500 mt-2">
                      Duration: {Math.round(form.audioDuration)}s
                    </p>
                  )}
                </div>
              )}

              {/* URL Input as fallback */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">Or enter audio URL directly:</label>
                <input
                  type="text"
                  value={form.audioFile || ''}
                  onChange={(e) => {
                    setForm({ ...form, audioFile: e.target.value });
                    setAudioPreview(e.target.value);
                  }}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                  placeholder="https://example.com/audio.mp3"
                />
              </div>

              {/* Question Duration */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Question Duration (seconds)
                  <span className="text-xs text-gray-500 ml-2">
                    Total time including audio and answer time
                  </span>
                </label>
                <input
                  type="number"
                  min="10"
                  max="300"
                  value={form.questionDuration || 60}
                  onChange={(e) => setForm({ ...form, questionDuration: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="60"
                />
                <p className="text-xs text-gray-500">
                  Recommended: Audio duration + 15-20 seconds for answer time
                </p>
              </div>
            </div>
          )}

          {/* Options Display Mode Toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Answer Options Display Mode
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="optionsDisplayMode"
                  value="text"
                  checked={form.optionsDisplayMode === 'text'}
                  onChange={(e) => setForm({ ...form, optionsDisplayMode: e.target.value })}
                  className="w-4 h-4 text-primary-600"
                />
                <span className="text-sm">Text Mode</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="optionsDisplayMode"
                  value="image"
                  checked={form.optionsDisplayMode === 'image'}
                  onChange={(e) => setForm({ ...form, optionsDisplayMode: e.target.value })}
                  className="w-4 h-4 text-primary-600"
                />
                <span className="text-sm">Image Mode</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="optionsDisplayMode"
                  value="audio"
                  checked={form.optionsDisplayMode === 'audio'}
                  onChange={(e) => setForm({ ...form, optionsDisplayMode: e.target.value })}
                  className="w-4 h-4 text-primary-600"
                />
                <span className="text-sm">Audio Mode</span>
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {form.optionsDisplayMode === 'text'
                ? 'Options will display as text only'
                : form.optionsDisplayMode === 'image'
                ? 'Options will display as images (text will be used as alt text)'
                : 'Options will display as audio players (text will be used as labels)'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Options</label>
            <div className="space-y-3">
              {['A', 'B', 'C', 'D'].map((label, index) => (
                <div key={label} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    {/* Label Badge */}
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-medium ${
                      form.correctAnswer === label
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}>
                      {label}
                    </span>

                    {/* Text Mode Input */}
                    {form.optionsDisplayMode === 'text' && (
                      <input
                        type="text"
                        value={form.options[index]?.text || ''}
                        onChange={(e) => updateOption(index, 'text', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg font-korean"
                        placeholder={`Option ${label}`}
                      />
                    )}

                    {/* Image Mode Input */}
                    {form.optionsDisplayMode === 'image' && (
                      <div className="flex-1 space-y-2">
                        {/* Text for alt text */}
                        <input
                          type="text"
                          value={form.options[index]?.text || ''}
                          onChange={(e) => updateOption(index, 'text', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-korean"
                          placeholder={`Alt text for option ${label}`}
                        />

                        {/* Image Upload */}
                        <div className="flex gap-2">
                          <label className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                            uploadingOptionIndex === index
                              ? 'border-gray-300 bg-gray-50'
                              : 'border-gray-300 hover:border-primary-500 hover:bg-primary-50'
                          }`}>
                            {uploadingOptionIndex === index ? (
                              <>
                                <LoaderIcon className="w-4 h-4 animate-spin text-gray-400" />
                                <span className="text-xs text-gray-600">Uploading...</span>
                              </>
                            ) : optionImagePreviews[index] ? (
                              <>
                                <Upload className="w-4 h-4 text-green-600" />
                                <span className="text-xs text-green-600">Change image</span>
                              </>
                            ) : (
                              <>
                                <Upload className="w-4 h-4 text-gray-400" />
                                <span className="text-xs text-gray-600">Upload image</span>
                              </>
                            )}
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleOptionImageUpload(index, e)}
                              className="hidden"
                              disabled={uploadingOptionIndex !== null}
                            />
                          </label>

                          {optionImagePreviews[index] && (
                            <button
                              type="button"
                              onClick={() => handleClearOptionImage(index)}
                              className="px-2 py-1 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 text-xs"
                              title="Clear image"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        {/* Image Preview */}
                        {optionImagePreviews[index] && (
                          <img
                            src={optionImagePreviews[index]}
                            alt={`Option ${label}`}
                            className="w-full h-32 object-contain border border-gray-200 rounded-lg bg-gray-50"
                          />
                        )}
                      </div>
                    )}

                    {/* Audio Mode Input */}
                    {form.optionsDisplayMode === 'audio' && (
                      <div className="flex-1 space-y-2">
                        {/* Text for label */}
                        <input
                          type="text"
                          value={form.options[index]?.text || ''}
                          onChange={(e) => updateOption(index, 'text', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-korean"
                          placeholder={`Label for option ${label}`}
                        />

                        {/* Audio Upload */}
                        <div className="flex gap-2">
                          <label className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                            uploadingAudioOptionIndex === index
                              ? 'border-gray-300 bg-gray-50'
                              : 'border-gray-300 hover:border-primary-500 hover:bg-primary-50'
                          }`}>
                            {uploadingAudioOptionIndex === index ? (
                              <>
                                <LoaderIcon className="w-4 h-4 animate-spin text-gray-400" />
                                <span className="text-xs text-gray-600">Uploading...</span>
                              </>
                            ) : optionAudioPreviews[index] ? (
                              <>
                                <Upload className="w-4 h-4 text-green-600" />
                                <span className="text-xs text-green-600">Change audio</span>
                              </>
                            ) : (
                              <>
                                <Upload className="w-4 h-4 text-gray-400" />
                                <span className="text-xs text-gray-600">Upload audio (MP3)</span>
                              </>
                            )}
                            <input
                              type="file"
                              accept="audio/*"
                              onChange={(e) => handleOptionAudioUpload(index, e)}
                              className="hidden"
                              disabled={uploadingAudioOptionIndex !== null}
                            />
                          </label>

                          {optionAudioPreviews[index] && (
                            <button
                              type="button"
                              onClick={() => handleClearOptionAudio(index)}
                              className="px-2 py-1 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 text-xs"
                              title="Clear audio"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        {/* Audio Preview */}
                        {optionAudioPreviews[index] && (
                          <audio controls className="w-full h-10" src={optionAudioPreviews[index]}>
                            Your browser does not support the audio element.
                          </audio>
                        )}
                      </div>
                    )}

                    {/* Correct Answer Button */}
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, correctAnswer: label })}
                      className={`px-3 py-2 rounded-lg text-sm whitespace-nowrap ${
                        form.correctAnswer === label
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Correct
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Explanation</label>
            <textarea
              value={form.explanation || ''}
              onChange={(e) => setForm({ ...form, explanation: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="Explain why this is the correct answer..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="secondary" fullWidth onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button fullWidth onClick={handleSave} isLoading={isSaving}>
              {selectedQuestion ? 'Update' : 'Create'} Question
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Question">
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete this question? This will also remove it from all exams.
          </p>
          <div className="flex gap-3">
            <Button variant="secondary" fullWidth onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" fullWidth onClick={confirmDelete}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
}

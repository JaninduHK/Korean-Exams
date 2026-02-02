import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  BookOpen,
  Headphones,
  Filter
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
  options: [
    { label: 'A', text: '' },
    { label: 'B', text: '' },
    { label: 'C', text: '' },
    { label: 'D', text: '' }
  ],
  correctAnswer: 'A',
  explanation: '',
  topic: 'other',
  audioFile: ''
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
    setShowModal(true);
  };

  const handleEdit = (question) => {
    setSelectedQuestion(question);
    setForm({
      ...question,
      options: question.options || emptyQuestion.options
    });
    setImagePreview(question.questionImage || '');
    setShowModal(true);
  };

  const handleSave = async () => {
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

  const updateOption = (index, value) => {
    const newOptions = [...form.options];
    newOptions[index] = { ...newOptions[index], text: value };
    setForm({ ...form, options: newOptions });
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Audio File URL</label>
              <input
                type="text"
                value={form.audioFile || ''}
                onChange={(e) => setForm({ ...form, audioFile: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="/audio/question-1.mp3"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Options</label>
            <div className="space-y-2">
              {['A', 'B', 'C', 'D'].map((label, index) => (
                <div key={label} className="flex items-center gap-2">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    form.correctAnswer === label
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}>
                    {label}
                  </span>
                  <input
                    type="text"
                    value={form.options[index]?.text || ''}
                    onChange={(e) => updateOption(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg font-korean"
                    placeholder={`Option ${label}`}
                  />
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, correctAnswer: label })}
                    className={`px-3 py-2 rounded-lg text-sm ${
                      form.correctAnswer === label
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Correct
                  </button>
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

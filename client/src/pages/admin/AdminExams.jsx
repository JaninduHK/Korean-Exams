import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Star,
  StarOff,
  Upload,
  X
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Loader from '../../components/common/Loader';
import { adminService } from '../../services/adminService';

const emptyExam = {
  title: '',
  description: '',
  difficulty: 'mixed',
  examType: 'full',
  duration: { reading: 25, listening: 25, total: 50 },
  totalQuestions: 40,
  passScore: 60,
  isActive: true,
  isFeatured: false,
  isPremium: false,
  order: 0,
  readingQuestions: [],
  listeningQuestions: [],
  questionsPerSection: { reading: 20, listening: 20 },
  listeningAudioFile: null,
  listeningAudioDuration: null
};

const FULL_EXAM_RULES = {
  readingQuestions: 20,
  listeningQuestions: 20,
  duration: { reading: 25, listening: 25, total: 50 },
  totalQuestions: 40
};

export default function AdminExams() {
  const [exams, setExams] = useState([]);
  const [questions, setQuestions] = useState({ reading: [], listening: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [selectedExam, setSelectedExam] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [form, setForm] = useState(emptyExam);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingLongAudio, setUploadingLongAudio] = useState(false);

  const fetchExams = async (page = 1) => {
    setIsLoading(true);
    try {
      const data = await adminService.getExams({ page });
      setExams(data.data);
      setPagination(data.pagination);
    } catch (error) {
      toast.error('Failed to fetch exams');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchQuestions = async () => {
    try {
      const [reading, listening] = await Promise.all([
        adminService.getQuestions({ type: 'reading', limit: 100 }),
        adminService.getQuestions({ type: 'listening', limit: 100 })
      ]);
      setQuestions({
        reading: reading.data,
        listening: listening.data
      });
    } catch (error) {
      console.error('Failed to fetch questions');
    }
  };

  useEffect(() => {
    fetchExams();
    fetchQuestions();
  }, []);

  const handleCreate = () => {
    setSelectedExam(null);
    setForm(emptyExam);
    setShowModal(true);
  };

  const handleEdit = async (exam) => {
    try {
      const data = await adminService.getExam(exam._id);
      setSelectedExam(data.data);
      setForm({
        ...data.data,
        readingQuestions: data.data.readingQuestions?.map(q => q._id) || [],
        listeningQuestions: data.data.listeningQuestions?.map(q => q._id) || []
      });
      setShowModal(true);
    } catch (error) {
      toast.error('Failed to load exam details');
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const examData = {
        ...form,
        totalQuestions: form.readingQuestions.length + form.listeningQuestions.length,
        questionsPerSection: {
          reading: form.readingQuestions.length,
          listening: form.listeningQuestions.length
        }
      };

      if (examData.examType === 'full') {
        if (
          examData.questionsPerSection.reading !== FULL_EXAM_RULES.readingQuestions ||
          examData.questionsPerSection.listening !== FULL_EXAM_RULES.listeningQuestions
        ) {
          toast.error('Full exams must have 20 reading and 20 listening questions.');
          setIsSaving(false);
          return;
        }
        examData.duration = FULL_EXAM_RULES.duration;
        examData.totalQuestions = FULL_EXAM_RULES.totalQuestions;
      } else if (examData.duration?.reading && examData.duration?.listening) {
        examData.duration.total = examData.duration.reading + examData.duration.listening;
      }

      // Validate listening audio
      if (examData.examType === 'full' || examData.examType === 'listening-only') {
        if (!examData.listeningAudioFile) {
          toast.error('Please upload listening section audio');
          setIsSaving(false);
          return;
        }
      }

      if (selectedExam) {
        await adminService.updateExam(selectedExam._id, examData);
        toast.success('Exam updated');
      } else {
        await adminService.createExam(examData);
        toast.success('Exam created');
      }
      setShowModal(false);
      fetchExams(pagination.page);
    } catch (error) {
      toast.error(error.message || 'Failed to save exam');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (exam) => {
    setSelectedExam(exam);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await adminService.deleteExam(selectedExam._id);
      toast.success('Exam deleted');
      setShowDeleteModal(false);
      fetchExams(pagination.page);
    } catch (error) {
      toast.error('Failed to delete exam');
    }
  };

  const toggleActive = async (exam) => {
    try {
      await adminService.updateExam(exam._id, { isActive: !exam.isActive });
      fetchExams(pagination.page);
    } catch (error) {
      toast.error('Failed to update exam');
    }
  };

  const toggleFeatured = async (exam) => {
    try {
      await adminService.updateExam(exam._id, { isFeatured: !exam.isFeatured });
      fetchExams(pagination.page);
    } catch (error) {
      toast.error('Failed to update exam');
    }
  };

  const handleLongAudioUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/')) {
      toast.error('Please select an audio file');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error('File size must be less than 50MB');
      return;
    }

    setUploadingLongAudio(true);
    const formData = new FormData();
    formData.append('audioFile', file);

    try {
      const response = await adminService.uploadLongAudio(formData);
      setForm({
        ...form,
        listeningAudioFile: response.data.url,
        listeningAudioDuration: response.data.duration
      });
      toast.success('Listening audio uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload audio');
    } finally {
      setUploadingLongAudio(false);
    }
  };

  const handleClearLongAudio = () => {
    setForm({
      ...form,
      listeningAudioFile: null,
      listeningAudioDuration: null
    });
  };

  const toggleQuestion = (type, questionId) => {
    const key = type === 'reading' ? 'readingQuestions' : 'listeningQuestions';
    const current = form[key] || [];
    const newList = current.includes(questionId)
      ? current.filter(id => id !== questionId)
      : [...current, questionId];
    setForm({ ...form, [key]: newList });
  };

  const summary = {
    total: exams.length,
    active: exams.filter(e => e.isActive).length,
    featured: exams.filter(e => e.isFeatured).length
  };

  return (
    <AdminLayout>
      <div className="space-y-3">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Exams</h1>
            <p className="text-gray-500">Manage practice exams</p>
          </div>
          <Button onClick={handleCreate} className="self-start sm:self-auto">
            <Plus className="w-4 h-4 mr-2" />
            Create Exam
          </Button>
        </div>

        {!isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total exams</p>
                <p className="text-2xl font-bold text-gray-900">{summary.total}</p>
              </div>
              <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-700">
                All
              </span>
            </Card>
            <Card className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active</p>
                <p className="text-2xl font-bold text-gray-900">{summary.active}</p>
              </div>
              <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-50 text-green-700">
                Live
              </span>
            </Card>
            <Card className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Featured</p>
                <p className="text-2xl font-bold text-gray-900">{summary.featured}</p>
              </div>
              <span className="px-3 py-1 text-xs font-medium rounded-full bg-yellow-50 text-yellow-700">
                Highlighted
              </span>
            </Card>
          </div>
        )}

        {/* Exams List */}
        <Card padding="p-0" className="shadow-sm">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader size="lg" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Exam</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Questions</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Attempts</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {exams.map((exam) => (
                    <tr key={exam._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{exam.title}</p>
                          <p className="text-sm text-gray-500 truncate max-w-xs">{exam.description}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          exam.examType === 'full' ? 'bg-purple-100 text-purple-700' :
                          exam.examType === 'reading-only' ? 'bg-green-100 text-green-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {exam.examType}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {exam.totalQuestions} ({exam.questionsPerSection?.reading || 0}R / {exam.questionsPerSection?.listening || 0}L)
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {exam.stats?.totalAttempts || 0}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${exam.isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
                          <span className="text-sm text-gray-600">
                            {exam.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => toggleFeatured(exam)}
                            className={`p-2 rounded-lg ${exam.isFeatured ? 'text-yellow-500' : 'text-gray-400'} hover:bg-gray-100`}
                            title={exam.isFeatured ? 'Remove from featured' : 'Add to featured'}
                          >
                            {exam.isFeatured ? <Star className="w-4 h-4 fill-current" /> : <StarOff className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => toggleActive(exam)}
                            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                            title={exam.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {exam.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => handleEdit(exam)}
                            className="p-2 text-gray-500 hover:text-primary-600 hover:bg-gray-100 rounded-lg"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(exam)}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* Exam Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={selectedExam ? 'Edit Exam' : 'Create Exam'}
        size="xl"
      >
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
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
                <option value="mixed">Mixed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={form.examType}
                onChange={(e) => {
                  const newType = e.target.value;
                  let newDuration = form.duration;

                  // Set default durations based on exam type
                  if (newType === 'full') {
                    newDuration = { reading: 25, listening: 25, total: 50 };
                  } else if (newType === 'reading-only') {
                    newDuration = { ...form.duration, total: 25 };
                  } else if (newType === 'listening-only') {
                    newDuration = { ...form.duration, total: 25 };
                  }

                  setForm({ ...form, examType: newType, duration: newDuration });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="full">Full Exam</option>
                <option value="reading-only">Reading Only</option>
                <option value="listening-only">Listening Only</option>
                <option value="practice">Practice</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration (minutes)
              </label>
              {form.examType === 'full' ? (
                <div className="p-3 border border-gray-200 rounded-lg bg-gray-50 text-sm text-gray-700 space-y-1">
                  <div className="flex items-center justify-between">
                    <span>Reading</span>
                    <span className="font-semibold">{FULL_EXAM_RULES.duration.reading} mins</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Listening</span>
                    <span className="font-semibold">{FULL_EXAM_RULES.duration.listening} mins</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-dashed border-gray-200 pt-2 mt-1">
                    <span>Total</span>
                    <span className="font-bold text-gray-900">{FULL_EXAM_RULES.duration.total} mins</span>
                  </div>
                </div>
              ) : (
                <input
                  type="number"
                  value={form.duration?.total || 25}
                  onChange={(e) => setForm({ ...form, duration: { ...form.duration, total: parseInt(e.target.value) } })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder={form.examType === 'reading-only' || form.examType === 'listening-only' ? '25' : '50'}
                />
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pass Score (%)</label>
              <input
                type="number"
                value={form.passScore}
                onChange={(e) => setForm({ ...form, passScore: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-sm">Active</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-sm">Featured</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.isPremium}
                onChange={(e) => setForm({ ...form, isPremium: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-sm">Premium Only</span>
            </label>
          </div>

          {/* Long Listening Audio */}
          {(form.examType === 'full' || form.examType === 'listening-only') && (
            <div className="space-y-4 border-t pt-4">
              <h3 className="text-lg font-medium">Listening Section Audio</h3>
              <p className="text-sm text-gray-600">
                Upload a single audio file containing all {form.listeningQuestions?.length || 20} listening questions.
              </p>

              {!form.listeningAudioFile ? (
                <label
                  htmlFor="long-audio-upload"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {uploadingLongAudio ? (
                      <>
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        <p className="mt-2 text-sm text-gray-500">Uploading...</p>
                      </>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 mb-2 text-gray-400" />
                        <p className="text-sm text-gray-500">Click to upload listening audio</p>
                        <p className="text-xs text-gray-400">MP3, WAV (MAX 50MB)</p>
                      </>
                    )}
                  </div>
                  <input
                    id="long-audio-upload"
                    type="file"
                    className="hidden"
                    accept="audio/*"
                    onChange={handleLongAudioUpload}
                    disabled={uploadingLongAudio}
                  />
                </label>
              ) : (
                <div className="p-4 border border-gray-300 rounded-lg bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Listening Audio Uploaded</span>
                    <button
                      type="button"
                      onClick={handleClearLongAudio}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <audio controls className="w-full" src={form.listeningAudioFile}>
                    Your browser does not support the audio element.
                  </audio>
                  {form.listeningAudioDuration && (
                    <p className="mt-2 text-xs text-gray-500">
                      Duration: {Math.floor(form.listeningAudioDuration / 60)}:
                      {String(Math.floor(form.listeningAudioDuration % 60)).padStart(2, '0')}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Question Selection */}
          <div className="border-t pt-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
              <h4 className="font-medium text-gray-900">
                Select Questions ({form.readingQuestions?.length + form.listeningQuestions?.length} selected)
              </h4>
              {form.examType === 'full' && (
                <p className="text-xs text-gray-600">
                  Full exam must include exactly 20 Reading + 20 Listening (EPS-TOPIK format).
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Reading Questions */}
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-2">
                  Reading ({form.readingQuestions?.length || 0})
                </h5>
                <div className="border rounded-lg max-h-48 overflow-y-auto p-2 space-y-1">
                  {questions.reading.map((q) => (
                    <label key={q._id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.readingQuestions?.includes(q._id)}
                        onChange={() => toggleQuestion('reading', q._id)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-gray-600 truncate">{q.questionText?.substring(0, 50)}...</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Listening Questions */}
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-2">
                  Listening ({form.listeningQuestions?.length || 0})
                </h5>
                <div className="border rounded-lg max-h-48 overflow-y-auto p-2 space-y-1">
                  {questions.listening.map((q) => (
                    <label key={q._id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.listeningQuestions?.includes(q._id)}
                        onChange={() => toggleQuestion('listening', q._id)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-gray-600 truncate">{q.questionText?.substring(0, 50)}...</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="secondary" fullWidth onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button fullWidth onClick={handleSave} isLoading={isSaving}>
              {selectedExam ? 'Update' : 'Create'} Exam
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Exam">
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete <strong>{selectedExam?.title}</strong>?
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

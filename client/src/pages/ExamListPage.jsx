import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  Clock,
  FileText,
  Headphones,
  Star,
  ChevronDown
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import useExamStore from '../store/examStore';

export default function ExamListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);

  const { exams, isLoading, fetchExams, pagination } = useExamStore();

  const difficulty = searchParams.get('difficulty') || 'all';
  const examType = searchParams.get('type') || 'all';

  useEffect(() => {
    fetchExams({
      difficulty: difficulty !== 'all' ? difficulty : undefined,
      examType: examType !== 'all' ? examType : undefined,
      search: searchTerm || undefined
    });
  }, [fetchExams, difficulty, examType, searchTerm]);

  const handleFilterChange = (key, value) => {
    if (value === 'all') {
      searchParams.delete(key);
    } else {
      searchParams.set(key, value);
    }
    setSearchParams(searchParams);
  };

  const getDifficultyBadge = (diff) => {
    const styles = {
      easy: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      hard: 'bg-red-100 text-red-800',
      mixed: 'bg-purple-100 text-purple-800'
    };
    return styles[diff] || styles.mixed;
  };

  const getExamTypeIcon = (type) => {
    if (type === 'listening-only') return <Headphones className="w-5 h-5" />;
    if (type === 'reading-only') return <FileText className="w-5 h-5" />;
    return <FileText className="w-5 h-5" />;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Practice Exams</h1>
        <p className="text-gray-600 mt-1">Choose an exam to start practicing</p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search exams..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-3">
          {/* Difficulty Filter */}
          <div className="relative">
            <select
              value={difficulty}
              onChange={(e) => handleFilterChange('difficulty', e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2.5 pr-10 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Type Filter */}
          <div className="relative">
            <select
              value={examType}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2.5 pr-10 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Types</option>
              <option value="full">Full Exam</option>
              <option value="reading-only">Reading Only</option>
              <option value="listening-only">Listening Only</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Exam List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader size="lg" />
        </div>
      ) : exams.length === 0 ? (
        <Card className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No exams found</h3>
          <p className="text-gray-500">Try adjusting your search or filters</p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map((exam) => (
            <Card key={exam._id} hover className="flex flex-col">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    exam.examType === 'listening-only' ? 'bg-purple-100 text-purple-600' :
                    exam.examType === 'reading-only' ? 'bg-green-100 text-green-600' :
                    'bg-primary-100 text-primary-600'
                  }`}>
                    {getExamTypeIcon(exam.examType)}
                  </div>
                  {exam.isFeatured && (
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  )}
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getDifficultyBadge(exam.difficulty)}`}>
                  {exam.difficulty}
                </span>
              </div>

              {/* Content */}
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{exam.title}</h3>
              <p className="text-sm text-gray-500 mb-4 flex-1">{exam.description}</p>

              {/* Stats */}
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <span className="flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  {exam.totalQuestions} questions
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {exam.duration?.total || 50} min
                </span>
              </div>

              {/* Exam Stats */}
              {exam.stats?.completedAttempts > 0 && (
                <div className="flex items-center gap-4 text-xs text-gray-400 mb-4 pt-4 border-t border-gray-100">
                  <span>{exam.stats.completedAttempts} attempts</span>
                  <span>Avg: {Math.round(exam.stats.averageScore)}%</span>
                  <span>Pass rate: {Math.round(exam.stats.passRate)}%</span>
                </div>
              )}

              {/* Action */}
              <Link to={`/exam/${exam._id}`}>
                <Button fullWidth>Start Exam</Button>
              </Link>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {[...Array(pagination.pages)].map((_, i) => (
            <button
              key={i}
              onClick={() => fetchExams({ page: i + 1, difficulty, examType, search: searchTerm })}
              className={`w-10 h-10 rounded-lg font-medium ${
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
    </div>
  );
}

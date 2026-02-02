import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Trophy,
  XCircle,
  Clock,
  Target,
  BookOpen,
  Headphones,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Download,
  Share2,
  ArrowRight,
  BarChart3
} from 'lucide-react';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import Card, { CardHeader, CardTitle, CardContent } from '../components/common/Card';
import Button from '../components/common/Button';
import { FullScreenLoader } from '../components/common/Loader';
import AnswerOptions from '../components/exam/AnswerOptions';
import { examService } from '../services/examService';

// Register ChartJS
ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function ResultsPage() {
  const { attemptId } = useParams();
  const [attempt, setAttempt] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [expandedQuestions, setExpandedQuestions] = useState({});

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const data = await examService.getAttemptReview(attemptId);
        setAttempt(data.data);
      } catch (error) {
        console.error('Error fetching results:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchResults();
  }, [attemptId]);

  if (isLoading) {
    return <FullScreenLoader message="Loading results..." />;
  }

  if (!attempt) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="text-center p-8">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Results not found</h2>
          <p className="text-gray-500 mb-4">The exam results you're looking for don't exist.</p>
          <Link to="/exams">
            <Button>Browse Exams</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const { score, passed, timeSpent, topicPerformance, answers, examId } = attempt;
  const exam = examId;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  // Score chart data
  const scoreChartData = {
    labels: ['Correct', 'Incorrect'],
    datasets: [{
      data: [score.total.correct, score.total.total - score.total.correct],
      backgroundColor: ['#22c55e', '#ef4444'],
      borderWidth: 0
    }]
  };

  const scoreChartOptions = {
    cutout: '70%',
    plugins: {
      legend: { display: false }
    }
  };

  // Section comparison chart
  const sectionChartData = {
    labels: ['Reading', 'Listening'],
    datasets: [{
      label: 'Score %',
      data: [score.reading.percentage, score.listening.percentage],
      backgroundColor: ['#22c55e', '#8b5cf6']
    }]
  };

  const sectionChartOptions = {
    indexAxis: 'y',
    scales: {
      x: { beginAtZero: true, max: 100 }
    },
    plugins: {
      legend: { display: false }
    }
  };

  // Topic performance chart
  const topicChartData = {
    labels: topicPerformance?.map(t => t.topic.replace(/-/g, ' ')) || [],
    datasets: [{
      label: 'Score %',
      data: topicPerformance?.map(t => t.percentage) || [],
      backgroundColor: topicPerformance?.map(t =>
        t.percentage >= 70 ? '#22c55e' :
        t.percentage >= 50 ? '#eab308' : '#ef4444'
      ) || []
    }]
  };

  // Filter answers for tabs
  const filteredAnswers = answers.filter(a => {
    if (activeTab === 'correct') return a.isCorrect;
    if (activeTab === 'incorrect') return !a.isCorrect && a.selectedAnswer;
    if (activeTab === 'unanswered') return !a.selectedAnswer;
    return true;
  });

  const toggleQuestion = (index) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Score Card */}
      <Card className="mb-8 overflow-hidden">
        <div className={`p-8 ${passed ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-red-500 to-rose-600'}`}>
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Score Circle */}
            <div className="relative w-40 h-40">
              <Doughnut data={scoreChartData} options={scoreChartOptions} />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                <span className="text-4xl font-bold">{score.total.percentage}%</span>
                <span className="text-sm opacity-80">Score</span>
              </div>
            </div>

            {/* Result Info */}
            <div className="text-center md:text-left text-white flex-1">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                {passed ? (
                  <Trophy className="w-8 h-8" />
                ) : (
                  <XCircle className="w-8 h-8" />
                )}
                <span className="text-3xl font-bold">
                  {passed ? 'PASSED!' : 'NOT PASSED'}
                </span>
              </div>
              <h2 className="text-xl opacity-90 mb-4">{exam?.title}</h2>
              <div className="flex flex-wrap justify-center md:justify-start gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  <span>{score.total.correct}/{score.total.total} correct</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{formatTime(timeSpent)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Pass mark: {exam?.passScore || 60}%</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <Button variant="secondary" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button variant="secondary" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <Card className="text-center">
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-left">
              <div className="text-2xl font-bold text-gray-900">{score.reading.percentage}%</div>
              <div className="text-sm text-gray-500">Reading</div>
            </div>
          </div>
        </Card>
        <Card className="text-center">
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Headphones className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-left">
              <div className="text-2xl font-bold text-gray-900">{score.listening.percentage}%</div>
              <div className="text-sm text-gray-500">Listening</div>
            </div>
          </div>
        </Card>
        <Card className="text-center">
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-left">
              <div className="text-2xl font-bold text-gray-900">{score.total.correct}</div>
              <div className="text-sm text-gray-500">Correct</div>
            </div>
          </div>
        </Card>
        <Card className="text-center">
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <div className="text-left">
              <div className="text-2xl font-bold text-gray-900">{score.total.total - score.total.correct}</div>
              <div className="text-sm text-gray-500">Incorrect</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        {/* Section Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Section Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <Bar data={sectionChartData} options={sectionChartOptions} />
            </div>
          </CardContent>
        </Card>

        {/* Topic Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Performance by Topic</CardTitle>
          </CardHeader>
          <CardContent>
            {topicPerformance?.length > 0 ? (
              <div className="space-y-3">
                {topicPerformance.map((topic, index) => (
                  <div key={index}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600 capitalize">{topic.topic.replace(/-/g, ' ')}</span>
                      <span className="font-medium">{topic.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          topic.percentage >= 70 ? 'bg-green-500' :
                          topic.percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${topic.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <BarChart3 className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>No topic data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Question Review */}
      <Card>
        <CardHeader>
          <CardTitle>Question Review</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-gray-200">
            {[
              { id: 'all', label: 'All', count: answers.length },
              { id: 'correct', label: 'Correct', count: answers.filter(a => a.isCorrect).length },
              { id: 'incorrect', label: 'Incorrect', count: answers.filter(a => !a.isCorrect && a.selectedAnswer).length },
              { id: 'unanswered', label: 'Unanswered', count: answers.filter(a => !a.selectedAnswer).length }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          {/* Questions List */}
          <div className="space-y-4">
            {filteredAnswers.map((answer, index) => {
              const question = answer.questionId;
              const isExpanded = expandedQuestions[index];

              return (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg overflow-hidden"
                >
                  {/* Question Header */}
                  <button
                    onClick={() => toggleQuestion(index)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-4">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        answer.isCorrect
                          ? 'bg-green-100 text-green-700'
                          : answer.selectedAnswer
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-700'
                      }`}>
                        {answer.questionNumber || index + 1}
                      </span>
                      <div>
                        <span className="font-medium text-gray-900 line-clamp-1">
                          {question?.questionText?.substring(0, 80)}...
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          {question?.type === 'listening' ? (
                            <Headphones className="w-3 h-3 text-purple-500" />
                          ) : (
                            <BookOpen className="w-3 h-3 text-green-500" />
                          )}
                          <span className="text-xs text-gray-500 capitalize">
                            {question?.topic?.replace(/-/g, ' ')}
                          </span>
                        </div>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </button>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="p-4 pt-0 border-t border-gray-100">
                      {/* Full Question */}
                      <p className="font-korean text-gray-900 mb-4">
                        {question?.questionText}
                      </p>

                      {/* Options with correct/incorrect highlighting */}
                      {question?.options && (
                        <AnswerOptions
                          options={question.options}
                          selectedAnswer={answer.selectedAnswer}
                          showCorrect={true}
                          correctAnswer={question.correctAnswer}
                          disabled={true}
                        />
                      )}

                      {/* Explanation */}
                      {question?.explanation && (
                        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                          <h4 className="font-medium text-blue-900 mb-1">Explanation</h4>
                          <p className="text-sm text-blue-800">{question.explanation}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center">
        <Link to="/exams">
          <Button variant="outline" size="lg">
            Take Another Exam
          </Button>
        </Link>
        <Link to="/dashboard">
          <Button size="lg">
            Go to Dashboard
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

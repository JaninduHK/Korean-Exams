import { useEffect, useState, useRef } from 'react';
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
  BarChart3,
  X,
  Copy,
  Check
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
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import Card, { CardHeader, CardTitle, CardContent } from '../components/common/Card';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import { FullScreenLoader } from '../components/common/Loader';
import AnswerOptions from '../components/exam/AnswerOptions';
import { examService } from '../services/examService';
import { toast } from 'react-toastify';

// Register ChartJS
ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function ResultsPage() {
  const { attemptId } = useParams();
  const [attempt, setAttempt] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [expandedQuestions, setExpandedQuestions] = useState({});
  const [showShareModal, setShowShareModal] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const reportRef = useRef(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const data = await examService.getAttemptReview(attemptId);
        setAttempt(data.data);
      } catch (error) {
        console.error('Error fetching results:', error);
        // Capture the actual error message
        const errorMessage = error?.response?.data?.message || error?.message || 'Unable to load results';
        const isSubscriptionError = errorMessage.includes('Basic or higher plan') || errorMessage.includes('Review access');
        setError({
          message: errorMessage,
          isSubscriptionError
        });
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
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="text-center p-8 max-w-md">
          {error?.isSubscriptionError ? (
            <>
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-8 h-8 text-amber-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Upgrade to View Results</h2>
              <p className="text-gray-600 mb-4">{error.message}</p>
              <p className="text-sm text-gray-500 mb-6">
                Unlock detailed exam results, answer reviews, and performance analytics with a Basic plan or higher.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/pricing">
                  <Button className="w-full sm:w-auto">Upgrade Now</Button>
                </Link>
                <Link to="/exams">
                  <Button variant="outline" className="w-full sm:w-auto">Browse Exams</Button>
                </Link>
              </div>
            </>
          ) : (
            <>
              <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Results not found</h2>
              <p className="text-gray-500 mb-4">
                {error?.message || "The exam results you're looking for don't exist."}
              </p>
              <Link to="/exams">
                <Button>Browse Exams</Button>
              </Link>
            </>
          )}
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

  // Download report as PDF
  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      // Create a temporary container for the report
      const reportElement = document.createElement('div');
      reportElement.style.position = 'absolute';
      reportElement.style.left = '-9999px';
      reportElement.style.width = '800px';
      reportElement.style.background = 'white';
      reportElement.style.padding = '40px';
      document.body.appendChild(reportElement);

      // Build report content (without questions)
      reportElement.innerHTML = `
        <div style="font-family: Arial, sans-serif;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1f2937; margin-bottom: 10px;">Exam Results Report</h1>
            <h2 style="color: #6b7280; font-weight: normal;">${exam?.title || 'Exam'}</h2>
          </div>

          <div style="background: ${passed ? '#10b981' : '#ef4444'}; color: white; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
            <div style="font-size: 48px; font-weight: bold; margin-bottom: 10px;">${score.total.percentage}%</div>
            <div style="font-size: 24px; font-weight: bold;">${passed ? 'PASSED' : 'NOT PASSED'}</div>
          </div>

          <div style="margin-bottom: 30px;">
            <h3 style="color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; margin-bottom: 20px;">Overall Performance</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
              <div style="padding: 15px; background: #f3f4f6; border-radius: 8px;">
                <div style="color: #6b7280; font-size: 14px;">Total Score</div>
                <div style="color: #1f2937; font-size: 24px; font-weight: bold;">${score.total.correct}/${score.total.total}</div>
              </div>
              <div style="padding: 15px; background: #f3f4f6; border-radius: 8px;">
                <div style="color: #6b7280; font-size: 14px;">Time Spent</div>
                <div style="color: #1f2937; font-size: 24px; font-weight: bold;">${formatTime(timeSpent)}</div>
              </div>
              <div style="padding: 15px; background: #f3f4f6; border-radius: 8px;">
                <div style="color: #6b7280; font-size: 14px;">Pass Mark</div>
                <div style="color: #1f2937; font-size: 24px; font-weight: bold;">${exam?.passScore || 60}%</div>
              </div>
              <div style="padding: 15px; background: #f3f4f6; border-radius: 8px;">
                <div style="color: #6b7280; font-size: 14px;">Result</div>
                <div style="color: ${passed ? '#10b981' : '#ef4444'}; font-size: 24px; font-weight: bold;">${passed ? 'Pass' : 'Fail'}</div>
              </div>
            </div>
          </div>

          <div style="margin-bottom: 30px;">
            <h3 style="color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; margin-bottom: 20px;">Section Performance</h3>
            <div style="margin-bottom: 15px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                <span style="color: #1f2937; font-weight: 500;">Reading</span>
                <span style="color: #1f2937; font-weight: bold;">${score.reading.percentage}%</span>
              </div>
              <div style="background: #e5e7eb; height: 10px; border-radius: 5px;">
                <div style="background: #10b981; width: ${score.reading.percentage}%; height: 100%; border-radius: 5px;"></div>
              </div>
              <div style="color: #6b7280; font-size: 12px; margin-top: 5px;">${score.reading.correct}/${score.reading.total} correct</div>
            </div>
            <div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                <span style="color: #1f2937; font-weight: 500;">Listening</span>
                <span style="color: #1f2937; font-weight: bold;">${score.listening.percentage}%</span>
              </div>
              <div style="background: #e5e7eb; height: 10px; border-radius: 5px;">
                <div style="background: #8b5cf6; width: ${score.listening.percentage}%; height: 100%; border-radius: 5px;"></div>
              </div>
              <div style="color: #6b7280; font-size: 12px; margin-top: 5px;">${score.listening.correct}/${score.listening.total} correct</div>
            </div>
          </div>

          ${topicPerformance?.length > 0 ? `
          <div style="margin-bottom: 30px;">
            <h3 style="color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; margin-bottom: 20px;">Topic Performance</h3>
            ${topicPerformance.map(topic => `
              <div style="margin-bottom: 15px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                  <span style="color: #1f2937; font-weight: 500; text-transform: capitalize;">${topic.topic.replace(/-/g, ' ')}</span>
                  <span style="color: #1f2937; font-weight: bold;">${topic.percentage}%</span>
                </div>
                <div style="background: #e5e7eb; height: 8px; border-radius: 4px;">
                  <div style="background: ${topic.percentage >= 70 ? '#10b981' : topic.percentage >= 50 ? '#eab308' : '#ef4444'}; width: ${topic.percentage}%; height: 100%; border-radius: 4px;"></div>
                </div>
                <div style="color: #6b7280; font-size: 12px; margin-top: 5px;">${topic.correct}/${topic.total} correct</div>
              </div>
            `).join('')}
          </div>
          ` : ''}

          <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px;">
            <p>Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p>KoreanExams.com</p>
          </div>
        </div>
      `;

      // Wait for content to render
      await new Promise(resolve => setTimeout(resolve, 100));

      // Generate canvas from HTML
      const canvas = await html2canvas(reportElement, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false
      });

      // Remove temporary element
      document.body.removeChild(reportElement);

      // Create PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`exam-results-${exam?.title || 'report'}-${new Date().toISOString().split('T')[0]}.pdf`);

      toast.success('Report downloaded successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to download report');
    } finally {
      setIsDownloading(false);
    }
  };

  // Generate share text
  const getShareText = () => {
    const emoji = passed ? '🎉' : '💪';
    return `${emoji} I scored ${score.total.percentage}% on ${exam?.title || 'EPS-TOPIK Exam'}!\n\n📊 Reading: ${score.reading.percentage}%\n🎧 Listening: ${score.listening.percentage}%\n✅ ${score.total.correct}/${score.total.total} correct\n\nResult: ${passed ? 'PASSED ✓' : 'Keep practicing!'}\n\nPractice at KoreanExams.com\n#EPSTOPIK #KoreanExam #LanguageLearning`;
  };

  // Copy share link
  const handleCopyLink = () => {
    const shareUrl = window.location.href;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success('Link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  // Share handlers
  const handleShareTwitter = () => {
    const text = getShareText();
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'width=550,height=420');
  };

  const handleShareFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
    window.open(url, '_blank', 'width=550,height=420');
  };

  const handleShareLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`;
    window.open(url, '_blank', 'width=550,height=420');
  };

  const handleShareWhatsApp = () => {
    const text = getShareText();
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
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
              <Button
                variant="secondary"
                size="sm"
                onClick={handleDownload}
                isLoading={isDownloading}
                disabled={isDownloading}
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowShareModal(true)}
              >
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

      {/* Share Modal */}
      <Modal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        title="Share Your Results"
        size="md"
      >
        <div className="space-y-4">
          {/* Share Preview */}
          <div className="bg-gradient-to-br from-primary-50 to-primary-100 p-6 rounded-lg border border-primary-200">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-900 mb-2">
                {score.total.percentage}%
              </div>
              <div className="text-lg font-semibold text-primary-800 mb-3">
                {passed ? '✓ PASSED' : 'Keep Practicing!'}
              </div>
              <div className="text-sm text-primary-700 space-y-1">
                <div>📊 Reading: {score.reading.percentage}%</div>
                <div>🎧 Listening: {score.listening.percentage}%</div>
                <div>✅ {score.total.correct}/{score.total.total} correct</div>
              </div>
            </div>
          </div>

          {/* Copy Link */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Share Link
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={window.location.href}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50"
              />
              <Button
                variant="outline"
                onClick={handleCopyLink}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Social Media Buttons */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Share on Social Media
            </label>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                fullWidth
                onClick={handleShareTwitter}
                className="!justify-start"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                Twitter / X
              </Button>
              <Button
                variant="outline"
                fullWidth
                onClick={handleShareFacebook}
                className="!justify-start"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </Button>
              <Button
                variant="outline"
                fullWidth
                onClick={handleShareLinkedIn}
                className="!justify-start"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                LinkedIn
              </Button>
              <Button
                variant="outline"
                fullWidth
                onClick={handleShareWhatsApp}
                className="!justify-start"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp
              </Button>
            </div>
          </div>

          {/* Close Button */}
          <div className="pt-4">
            <Button
              variant="outline"
              fullWidth
              onClick={() => setShowShareModal(false)}
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

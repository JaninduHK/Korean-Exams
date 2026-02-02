import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Clock,
  Target,
  TrendingUp,
  Play,
  FileText,
  Headphones,
  ChevronRight,
  Award,
  Calendar
} from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import Card, { CardHeader, CardTitle, CardContent } from '../components/common/Card';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import useAuthStore from '../store/authStore';
import useExamStore from '../store/examStore';
import { userService } from '../services/userService';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { fetchFeaturedExams, featuredExams } = useExamStore();
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [statsData] = await Promise.all([
          userService.getStats(),
          fetchFeaturedExams()
        ]);
        setStats(statsData.data);
      } catch (error) {
        console.error('Error loading dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [fetchFeaturedExams]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const chartData = {
    labels: stats?.recentScores?.map((_, i) => `Exam ${i + 1}`).reverse() || [],
    datasets: [
      {
        label: 'Score %',
        data: stats?.recentScores?.map(s => s.score).reverse() || [],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'white',
        titleColor: '#1f2937',
        bodyColor: '#6b7280',
        borderColor: '#e5e7eb',
        borderWidth: 1
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        grid: { color: '#f3f4f6' }
      },
      x: {
        grid: { display: false }
      }
    }
  };

  const statCards = [
    {
      icon: BookOpen,
      label: 'Exams Completed',
      value: stats?.stats?.totalExams || 0,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      icon: Target,
      label: 'Average Score',
      value: `${Math.round(stats?.stats?.averageScore || 0)}%`,
      color: 'bg-green-100 text-green-600'
    },
    {
      icon: Clock,
      label: 'Study Time',
      value: formatTime(stats?.stats?.totalStudyTime || 0),
      color: 'bg-purple-100 text-purple-600'
    },
    {
      icon: TrendingUp,
      label: 'Current Streak',
      value: `${stats?.stats?.currentStreak || 0} days`,
      color: 'bg-orange-100 text-orange-600'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Welcome back, {user?.fullName?.split(' ')[0]}!
        </h1>
        <p className="text-gray-600 mt-1">
          Here's your learning progress overview
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Link to="/exams">
          <Card hover className="flex items-center gap-4 cursor-pointer">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
              <Play className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <div className="font-semibold text-gray-900">Start Full Exam</div>
              <div className="text-sm text-gray-500">40 questions, 50 min</div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 ml-auto" />
          </Card>
        </Link>

        <Link to="/exams?type=reading-only">
          <Card hover className="flex items-center gap-4 cursor-pointer">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="font-semibold text-gray-900">Reading Only</div>
              <div className="text-sm text-gray-500">20 questions, 25 min</div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 ml-auto" />
          </Card>
        </Link>

        <Link to="/exams?type=listening-only">
          <Card hover className="flex items-center gap-4 cursor-pointer">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Headphones className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <div className="font-semibold text-gray-900">Listening Only</div>
              <div className="text-sm text-gray-500">20 questions, 25 min</div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 ml-auto" />
          </Card>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat, index) => (
          <Card key={index}>
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Progress Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Your Progress</CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.recentScores?.length > 0 ? (
              <div className="h-64">
                <Line data={chartData} options={chartOptions} />
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>Complete exams to see your progress</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Weak Areas */}
        <Card>
          <CardHeader>
            <CardTitle>Areas to Improve</CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.weakTopics?.length > 0 ? (
              <div className="space-y-4">
                {stats.weakTopics.map((topic, index) => (
                  <div key={index}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600 capitalize">
                        {topic.topic.replace(/-/g, ' ')}
                      </span>
                      <span className="font-medium">{topic.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-red-500 h-2 rounded-full transition-all"
                        style={{ width: `${topic.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <Target className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>Complete more exams to see weak areas</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      {stats?.recentScores?.length > 0 && (
        <Card className="mt-8">
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Recent Exams</CardTitle>
            <Link to="/profile" className="text-sm text-primary-600 hover:text-primary-700">
              View all
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentScores.slice(0, 5).map((exam, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      exam.passed ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {exam.passed ? (
                        <Award className="w-5 h-5 text-green-600" />
                      ) : (
                        <FileText className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{exam.examTitle || 'Practice Exam'}</div>
                      <div className="text-sm text-gray-500 flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        {new Date(exam.date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold ${exam.passed ? 'text-green-600' : 'text-red-600'}`}>
                      {exam.score}%
                    </div>
                    <div className={`text-xs ${exam.passed ? 'text-green-600' : 'text-red-600'}`}>
                      {exam.passed ? 'PASSED' : 'FAILED'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommended Exams */}
      {featuredExams.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Recommended for You</h2>
            <Link to="/exams" className="text-sm text-primary-600 hover:text-primary-700">
              View all exams
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredExams.slice(0, 3).map((exam) => (
              <Card key={exam._id} hover>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">{exam.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{exam.description}</p>
                  </div>
                  <span className={`badge ${
                    exam.difficulty === 'easy' ? 'badge-success' :
                    exam.difficulty === 'medium' ? 'badge-warning' : 'badge-danger'
                  }`}>
                    {exam.difficulty}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <span className="flex items-center gap-1">
                    <FileText className="w-4 h-4" />
                    {exam.totalQuestions} questions
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {exam.duration?.total} min
                  </span>
                </div>
                <Link to={`/exam/${exam._id}`}>
                  <Button fullWidth>Start Exam</Button>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Import BarChart3 for the empty state
import { BarChart3 } from 'lucide-react';

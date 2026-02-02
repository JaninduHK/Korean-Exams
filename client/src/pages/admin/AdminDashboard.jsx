import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  FileText,
  HelpCircle,
  CreditCard,
  DollarSign,
  Activity,
  ArrowRight,
  Sparkles,
  BarChart3
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
  Legend,
  Filler
} from 'chart.js';
import AdminLayout from '../../components/admin/AdminLayout';
import Card from '../../components/common/Card';
import Loader from '../../components/common/Loader';
import { adminService } from '../../services/adminService';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const formatNumber = (num = 0) => Number(num || 0).toLocaleString();
  const formatCurrency = (num = 0) => `Rs. ${Number(num || 0).toLocaleString()}`;
  const formatDate = (date) => new Date(date).toLocaleDateString();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, analyticsData] = await Promise.all([
          adminService.getDashboardStats(),
          adminService.getAnalytics(30)
        ]);
        setStats(statsData.data);
        setAnalytics(analyticsData.data);
      } catch (error) {
        console.error('Error fetching dashboard:', error);
        setError('Unable to load dashboard data. Please check your connection or API status.');
        // Fallback empty structures so UI still renders
        setStats({
          stats: {},
          recentUsers: [],
          recentPayments: [],
          recentAttempts: [],
          subscriptionBreakdown: []
        });
        setAnalytics({
          usersByDay: [],
          attemptsByDay: []
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const safeStats = stats || {
    stats: {},
    recentUsers: [],
    recentPayments: [],
    recentAttempts: [],
    subscriptionBreakdown: []
  };
  const safeAnalytics = analytics || {
    usersByDay: [],
    attemptsByDay: []
  };

  const statCards = [
    {
      name: 'Total Users',
      value: formatNumber(safeStats?.stats?.totalUsers),
      change: formatNumber(safeStats?.stats?.newUsersThisMonth),
      changeLabel: 'new this month',
      icon: Users,
      color: 'bg-blue-500/10 text-blue-700',
      href: '/admin/users'
    },
    {
      name: 'Active Subscriptions',
      value: formatNumber(safeStats?.stats?.activeSubscriptions),
      icon: CreditCard,
      color: 'bg-orange-500/10 text-orange-700',
      href: '/admin/plans'
    },
    {
      name: 'Revenue This Month',
      value: formatCurrency(safeStats?.stats?.revenueThisMonth),
      icon: DollarSign,
      color: 'bg-emerald-500/10 text-emerald-700',
      href: '/admin/payments'
    },
    {
      name: 'Exam Attempts',
      value: formatNumber(safeStats?.stats?.totalAttempts),
      change: formatNumber(safeStats?.stats?.attemptsThisMonth),
      changeLabel: 'this month',
      icon: Activity,
      color: 'bg-pink-500/10 text-pink-700'
    },
    {
      name: 'Total Questions',
      value: formatNumber(safeStats?.stats?.totalQuestions),
      icon: HelpCircle,
      color: 'bg-green-500/10 text-green-700',
      href: '/admin/questions'
    },
    {
      name: 'Total Exams',
      value: formatNumber(safeStats?.stats?.totalExams),
      icon: FileText,
      color: 'bg-purple-500/10 text-purple-700',
      href: '/admin/exams'
    }
  ];

  const usersChartData = {
    labels: safeAnalytics?.usersByDay?.map(d => d._id) || [],
    datasets: [
      {
        label: 'New Users',
        data: safeAnalytics?.usersByDay?.map(d => d.count) || [],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const attemptsChartData = {
    labels: safeAnalytics?.attemptsByDay?.map(d => d._id) || [],
    datasets: [
      {
        label: 'Exam Attempts',
        data: safeAnalytics?.attemptsByDay?.map(d => d.count) || [],
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: { beginAtZero: true, grid: { color: '#f3f4f6' } },
      x: { grid: { display: false } }
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-3">
        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Hero */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 text-white p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="flex items-center gap-2 text-sm text-slate-200">
                <Sparkles className="w-4 h-4" />
                Admin Overview
              </p>
              <h1 className="text-2xl font-semibold mt-1">Welcome back</h1>
              <p className="text-slate-300 mt-1">All key platform signals in one place.</p>
            </div>
            <Link
              to="/admin/payments"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm font-medium"
            >
              View payments
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {statCards.map((stat) => (
            <Card key={stat.name} className="relative overflow-hidden">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  {stat.change !== undefined && (
                    <p className="text-xs text-green-600">
                      +{stat.change} {stat.changeLabel}
                    </p>
                  )}
                </div>
                {stat.href && (
                  <Link to={stat.href} className="text-gray-400 hover:text-gray-600">
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                )}
              </div>
            </Card>
          ))}
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">User Registrations (30 days)</h3>
            <div className="h-64">
              {safeAnalytics?.usersByDay?.length ? (
                <Line data={usersChartData} options={chartOptions} />
              ) : (
                <EmptyChartState />
              )}
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Exam Attempts (30 days)</h3>
            <div className="h-64">
              {safeAnalytics?.attemptsByDay?.length ? (
                <Line data={attemptsChartData} options={chartOptions} />
              ) : (
                <EmptyChartState />
              )}
            </div>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Users */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Users</h3>
              <Link to="/admin/users" className="text-sm text-primary-600 hover:text-primary-700">
                View all
              </Link>
            </div>
            <div className="space-y-3">
              {stats?.recentUsers?.length ? (
                stats.recentUsers.map((user) => (
                  <div key={user._id} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium">
                      {user.fullName?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{user.fullName}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No users yet</p>
              )}
            </div>
          </Card>

          {/* Recent Payments */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Payments</h3>
              <Link to="/admin/payments" className="text-sm text-primary-600 hover:text-primary-700">
                View all
              </Link>
            </div>
            <div className="space-y-3">
              {stats?.recentPayments?.length > 0 ? (
                stats.recentPayments.map((payment) => (
                  <div key={payment._id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {payment.userId?.fullName}
                      </p>
                      <p className="text-xs text-gray-500">{payment.planName}</p>
                    </div>
                    <span className="text-sm font-medium text-green-600">
                      {formatCurrency(payment.amount)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No payments yet</p>
              )}
            </div>
          </Card>

          {/* Recent Attempts */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Attempts</h3>
            </div>
            <div className="space-y-3">
              {stats?.recentAttempts?.length ? (
                stats.recentAttempts.map((attempt) => (
                  <div key={attempt._id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {attempt.userId?.fullName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{attempt.examId?.title}</p>
                    </div>
                    <span className={`text-sm font-medium ${
                      attempt.passed ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {attempt.score?.total?.percentage}%
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No attempts yet</p>
              )}
            </div>
          </Card>
        </div>

        {/* Subscription Breakdown */}
        {stats?.subscriptionBreakdown?.length > 0 && (
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Subscription Breakdown</h3>
            <div className="flex gap-3 flex-wrap">
              {stats.subscriptionBreakdown.map((sub) => (
                <div
                  key={sub._id}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 text-sm"
                >
                  <span className="capitalize text-gray-700">{sub._id}</span>
                  <span className="font-semibold text-gray-900">{sub.count}</span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}

function EmptyChartState() {
  return (
    <div className="h-full flex flex-col items-center justify-center text-gray-500">
      <BarChart3 className="w-10 h-10 mb-2 text-gray-300" />
      <p className="text-sm">Not enough data yet</p>
    </div>
  );
}

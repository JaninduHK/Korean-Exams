import { Link } from 'react-router-dom';
import {
  Clock,
  Headphones,
  FileText,
  BarChart3,
  Users,
  Shield,
  Star,
  ArrowRight
} from 'lucide-react';
import Button from '../components/common/Button';
import Card from '../components/common/Card';

export default function LandingPage() {
  const features = [
    {
      icon: FileText,
      title: 'Authentic Questions',
      description: 'Practice with questions that match the real EPS-TOPIK exam format and difficulty.'
    },
    {
      icon: Headphones,
      title: 'Listening Section',
      description: 'Improve your Korean listening skills with audio questions and native speakers.'
    },
    {
      icon: Clock,
      title: 'Timed Practice',
      description: 'Get familiar with exam time pressure using our realistic timer system.'
    },
    {
      icon: BarChart3,
      title: 'Performance Analytics',
      description: 'Track your progress with detailed insights and identify weak areas.'
    },
    {
      icon: Users,
      title: 'Community Support',
      description: 'Join thousands of Sri Lankan students preparing for EPS-TOPIK together.'
    },
    {
      icon: Shield,
      title: 'Quality Content',
      description: 'All questions are curated and verified by Korean language experts.'
    }
  ];

  const stats = [
    { value: '500+', label: 'Practice Questions' },
    { value: '10K+', label: 'Students Enrolled' },
    { value: '85%', label: 'Pass Rate' },
    { value: '24/7', label: 'Access' }
  ];

  const testimonials = [
    {
      name: 'Kasun Perera',
      role: 'Passed EPS-TOPIK 2024',
      content: 'This platform helped me understand my weak areas. The listening practice was exactly like the real exam!',
      avatar: 'K'
    },
    {
      name: 'Nimali Fernando',
      role: 'Scored 180/200',
      content: 'The detailed analytics showed me where to focus. I improved my score by 40 points in just one month.',
      avatar: 'N'
    },
    {
      name: 'Saman Jayawardena',
      role: 'First Attempt Pass',
      content: 'Best EPS-TOPIK preparation platform I\'ve used. The questions are very similar to the actual exam.',
      avatar: 'S'
    }
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-korean opacity-5" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 rounded-full text-primary-700 text-sm font-medium mb-6">
              <Star className="w-4 h-4" />
              Trusted by 10,000+ students
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Master Your <span className="text-primary-600">EPS-TOPIK</span> Exam
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
              Practice with authentic Korean proficiency test questions. Track your progress, identify weak areas, and boost your confidence for exam day.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/signup">
                <Button size="lg">
                  Start Free Practice
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-primary-600">{stat.value}</div>
                <div className="mt-1 text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Everything You Need to Succeed
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Our comprehensive platform provides all the tools you need to prepare for the EPS-TOPIK exam.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} hover className="text-center">
                <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-7 h-7 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              How It Works
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Get started in just a few simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Create Your Account',
                description: 'Sign up for free and get instant access to practice exams.'
              },
              {
                step: '2',
                title: 'Take Practice Exams',
                description: 'Practice with reading and listening questions in real exam conditions.'
              },
              {
                step: '3',
                title: 'Track & Improve',
                description: 'Review your results, identify weak areas, and improve your score.'
              }
            ].map((item, index) => (
              <div key={index} className="relative text-center">
                <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold text-white">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Success Stories
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Hear from students who achieved their EPS-TOPIK goals
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-lg font-semibold text-primary-600">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.role}</div>
                  </div>
                </div>
                <p className="text-gray-600 italic">"{testimonial.content}"</p>
                <div className="flex gap-1 mt-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 sm:p-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to Start Practicing?
            </h2>
            <p className="text-lg text-primary-100 mb-8 max-w-2xl mx-auto">
              Join thousands of students who are already preparing for their EPS-TOPIK exam. Start your free practice today!
            </p>
            <Link to="/signup">
              <Button variant="secondary" size="lg">
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center">
              <img src="/logo-white.png" alt="Korean Exams" className="h-10" />
            </div>
            <div className="flex gap-6 text-sm">
              <Link to="/privacy" className="hover:text-white">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-white">Terms of Service</Link>
              <Link to="/contact" className="hover:text-white">Contact</Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm">
            &copy; {new Date().getFullYear()} EPS-TOPIK Practice Platform. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

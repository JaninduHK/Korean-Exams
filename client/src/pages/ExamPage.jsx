import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  ChevronLeft,
  ChevronRight,
  Flag,
  Send,
  X,
  AlertTriangle,
  BookOpen,
  Headphones,
  Crown,
  Clock
} from 'lucide-react';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import Card from '../components/common/Card';
import { FullScreenLoader } from '../components/common/Loader';
import ExamTimer from '../components/exam/ExamTimer';
import QuestionNavigator from '../components/exam/QuestionNavigator';
import AudioPlayer from '../components/exam/AudioPlayer';
import AnswerOptions from '../components/exam/AnswerOptions';
import useExamStore from '../store/examStore';

export default function ExamPage() {
  const { examId } = useParams();
  const navigate = useNavigate();

  const {
    currentExam,
    attempt,
    answers,
    markedQuestions,
    audioReplays,
    currentQuestionIndex,
    timeRemaining,
    isLoading,
    isSubmitting,
    errorData,
    examPhase,
    currentQuestionTimer,
    startExam,
    setAnswer,
    setAudioReplay,
    toggleMarked,
    goToQuestion,
    nextQuestion,
    prevQuestion,
    setTimeRemaining,
    saveProgress,
    submitExam,
    resetExamState,
    startListeningPhase,
    decrementQuestionTimer
  } = useExamStore();

  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showNavigator, setShowNavigator] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const autoSaveRef = useRef(null);
  const audioRef = useRef(null);

  // Start exam on mount
  useEffect(() => {
    const initExam = async () => {
      const result = await startExam(examId);
      if (!result) {
        // Check if it's an exam limit error
        const storeState = useExamStore.getState();
        if (storeState.errorData?.examsLimit !== undefined ||
            (storeState.error && storeState.error.toLowerCase().includes('limit'))) {
          setShowUpgradeModal(true);
        } else {
          toast.error(storeState.error || 'Failed to start exam');
          navigate('/exams');
        }
      }
    };
    initExam();

    return () => {
      resetExamState();
    };
  }, [examId, startExam, navigate, resetExamState]);

  // Auto-save every 30 seconds
  useEffect(() => {
    autoSaveRef.current = setInterval(() => {
      saveProgress();
    }, 30000);

    return () => {
      if (autoSaveRef.current) {
        clearInterval(autoSaveRef.current);
      }
    };
  }, [saveProgress]);

  // Prevent accidental page close
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // Keyboard navigation (only in reading phase)
  useEffect(() => {
    const isReadingPhase = examPhase === 'reading';
    if (!isReadingPhase) return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        nextQuestion();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        prevQuestion();
      } else if (e.key >= '1' && e.key <= '4') {
        const labels = ['A', 'B', 'C', 'D'];
        const currentQ = getCurrentQuestion();
        if (currentQ) {
          handleAnswerSelect(labels[parseInt(e.key) - 1]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextQuestion, prevQuestion, currentQuestionIndex, examPhase]);

  // Question timer for listening phase
  useEffect(() => {
    const isListeningPhase = examPhase === 'listening';
    if (!isListeningPhase) return;

    const timer = setInterval(() => {
      decrementQuestionTimer();
    }, 1000);

    return () => clearInterval(timer);
  }, [examPhase, decrementQuestionTimer]);

  // Auto-play listening audio when entering listening phase
  useEffect(() => {
    const isListeningPhase = examPhase === 'listening';
    if (isListeningPhase && currentExam?.listeningAudioFile && audioRef.current) {
      audioRef.current.play().catch(err => {
        console.error('Auto-play failed:', err);
        toast.info('Click the play button to start the listening audio');
      });
    }
  }, [examPhase, currentExam]);

  // Get all questions combined
  const getAllQuestions = useCallback(() => {
    if (!currentExam) return [];
    return [
      ...(currentExam.readingQuestions || []),
      ...(currentExam.listeningQuestions || [])
    ];
  }, [currentExam]);

  const getCurrentQuestion = useCallback(() => {
    const questions = getAllQuestions();
    return questions[currentQuestionIndex];
  }, [getAllQuestions, currentQuestionIndex]);

  const handleAnswerSelect = (answer) => {
    const currentQuestion = getCurrentQuestion();
    if (currentQuestion) {
      setAnswer(currentQuestion._id, answer);
    }
  };

  const handleAudioReplayChange = (replayCount) => {
    const currentQuestion = getCurrentQuestion();
    if (currentQuestion) {
      setAudioReplay(currentQuestion._id, replayCount);
    }
  };

  const handleTimeUp = async () => {
    toast.warning('Time is up! Submitting your exam...');
    const result = await submitExam(true);
    if (result) {
      navigate(`/results/${result._id}`);
    }
  };

  const handleSubmit = async () => {
    setShowSubmitModal(false);
    const result = await submitExam(false);
    if (result) {
      toast.success('Exam submitted successfully!');
      navigate(`/results/${result._id}`);
    } else {
      toast.error('Failed to submit exam');
    }
  };

  const handleExit = () => {
    saveProgress();
    navigate('/exams');
  };

  // Show upgrade modal if exam limit reached
  if (showUpgradeModal) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Modal
          isOpen={true}
          onClose={() => navigate('/exams')}
          title="Exam Limit Reached"
          size="md"
        >
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Crown className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Monthly Exam Limit Reached
              </h3>
              <p className="text-gray-600">
                You have used all your free exams for this month.
                {errorData && (
                  <span className="block mt-2 text-sm">
                    Used: <strong>{errorData.examsUsed}</strong> / {errorData.examsLimit} exams
                  </span>
                )}
              </p>
            </div>

            <Card className="bg-gradient-to-r from-primary-50 to-primary-100 border-primary-200">
              <div className="text-center">
                <h4 className="font-semibold text-primary-900 mb-2">Upgrade Your Plan</h4>
                <p className="text-sm text-primary-700 mb-4">
                  Get unlimited access to all exams, detailed reviews, analytics, and more!
                </p>
                <ul className="text-sm text-primary-800 space-y-1 mb-4">
                  <li>✓ Unlimited exam attempts</li>
                  <li>✓ Detailed answer explanations</li>
                  <li>✓ Performance analytics</li>
                  <li>✓ Priority support</li>
                </ul>
              </div>
            </Card>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="secondary"
                fullWidth
                onClick={() => navigate('/exams')}
              >
                Back to Exams
              </Button>
              <Link to="/pricing" className="w-full">
                <Button variant="primary" fullWidth>
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade Now
                </Button>
              </Link>
            </div>
          </div>
        </Modal>
      </div>
    );
  }

  if (isLoading || !currentExam || !attempt) {
    return <FullScreenLoader message="Loading exam..." />;
  }

  const allQuestions = getAllQuestions();
  const currentQuestion = getCurrentQuestion();
  const totalQuestions = allQuestions.length;
  const readingCount = currentExam.readingQuestions?.length || 0;
  const listeningCount = currentExam.listeningQuestions?.length || 0;
  const isListeningSection = currentQuestionIndex >= readingCount;
  const isReadingPhase = examPhase === 'reading';
  const isListeningPhase = examPhase === 'listening';

  // Navigation controls
  const canGoNext = isReadingPhase && currentQuestionIndex < readingCount - 1;
  const canGoPrev = isReadingPhase && currentQuestionIndex > 0;

  const answeredCount = Object.values(answers).filter(a => a !== null && a !== undefined).length;
  const unansweredCount = totalQuestions - answeredCount;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-2 sm:py-3">
          {/* Mobile Layout */}
          <div className="flex sm:hidden items-center justify-between gap-2">
            <button
              onClick={() => setShowExitModal(true)}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 flex-shrink-0"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex-1 min-w-0 text-center">
              <h1 className="font-semibold text-gray-900 text-sm truncate">{currentExam.title}</h1>
              <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
                {isListeningSection ? (
                  <>
                    <Headphones className="w-3 h-3 text-purple-600" />
                    <span>Listening</span>
                  </>
                ) : (
                  <>
                    <BookOpen className="w-3 h-3 text-green-600" />
                    <span>Reading</span>
                  </>
                )}
              </div>
            </div>

            <ExamTimer
              initialTime={timeRemaining}
              onTimeUp={handleTimeUp}
              onTick={setTimeRemaining}
              examPhase={examPhase}
              compact
            />

            <Button
              onClick={() => setShowSubmitModal(true)}
              variant="primary"
              size="sm"
              className="flex-shrink-0 !px-2"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>

          {/* Desktop Layout */}
          <div className="hidden sm:flex items-center justify-between">
            {/* Left: Exam info */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowExitModal(true)}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
              <div>
                <h1 className="font-semibold text-gray-900">{currentExam.title}</h1>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  {isListeningSection ? (
                    <>
                      <Headphones className="w-4 h-4 text-purple-600" />
                      <span>Listening Section</span>
                    </>
                  ) : (
                    <>
                      <BookOpen className="w-4 h-4 text-green-600" />
                      <span>Reading Section</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Center: Timer */}
            <ExamTimer
              initialTime={timeRemaining}
              onTimeUp={handleTimeUp}
              onTick={setTimeRemaining}
              examPhase={examPhase}
            />

            {/* Right: Submit */}
            <Button
              onClick={() => setShowSubmitModal(true)}
              variant="primary"
            >
              <Send className="w-4 h-4 mr-2" />
              Submit Exam
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Question Navigator - Desktop Sidebar */}
        <aside className={`
          hidden lg:block w-72 bg-white border-r border-gray-200 p-4 overflow-y-auto
          ${showNavigator ? '' : 'lg:hidden'}
        `}>
          {isReadingPhase ? (
            <QuestionNavigator
              totalQuestions={totalQuestions}
              readingCount={readingCount}
              listeningCount={listeningCount}
              currentIndex={currentQuestionIndex}
              answers={answers}
              markedQuestions={markedQuestions}
              onNavigate={goToQuestion}
              questions={allQuestions}
            />
          ) : (
            <div className="p-4 bg-gray-50 rounded-lg text-center text-sm text-gray-600">
              <Headphones className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p>Navigation disabled during listening section</p>
              <p className="text-xs mt-2">Questions will auto-advance</p>
            </div>
          )}
        </aside>

        {/* Question Area */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-4 py-6">
            {/* Question Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                {/* Only show question count in listening section */}
                {isListeningPhase && (
                  <span className="text-sm text-gray-500">
                    Question {currentQuestionIndex + 1} of {totalQuestions}
                  </span>
                )}
                <div className="flex items-center gap-2 mt-1">
                  {currentQuestion?.difficulty && (
                    <span className={`badge ${
                      currentQuestion.difficulty === 'easy' ? 'badge-success' :
                      currentQuestion.difficulty === 'medium' ? 'badge-warning' : 'badge-danger'
                    }`}>
                      {currentQuestion.difficulty}
                    </span>
                  )}
                  {currentQuestion?.topic && (
                    <span className="badge badge-info capitalize">
                      {currentQuestion.topic.replace(/-/g, ' ')}
                    </span>
                  )}
                </div>
              </div>

              {/* Per-Question Timer for Listening Section */}
              {isListeningPhase && currentQuestionTimer > 0 && (
                <div className="flex items-center gap-2 bg-primary-50 px-4 py-2 rounded-lg">
                  <Clock className="w-5 h-5 text-primary-600" />
                  <div>
                    <div className="text-xs text-gray-600">Time Remaining</div>
                    <div className={`text-lg font-semibold ${
                      currentQuestionTimer <= 10 ? 'text-red-600' : 'text-primary-600'
                    }`}>
                      {Math.floor(currentQuestionTimer / 60)}:{String(currentQuestionTimer % 60).padStart(2, '0')}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Reading Question Audio - Individual audio for reading questions */}
            {isReadingPhase && currentQuestion?.audioFile && (
              <div className="mb-6">
                <AudioPlayer
                  src={currentQuestion.audioFile}
                  maxReplays={currentQuestion.maxReplays || 2}
                  onReplayCountChange={handleAudioReplayChange}
                />
              </div>
            )}

            {isListeningPhase && currentExam?.listeningAudioFile && (
              <Card className="mb-6">
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <Headphones className="w-5 h-5 text-primary" />
                    Listening Section Audio (Continuous)
                  </h3>
                  <audio
                    ref={audioRef}
                    src={currentExam.listeningAudioFile}
                    controls
                    className="w-full"
                  />
                  <p className="mt-2 text-xs text-gray-500">
                    The audio will play continuously through all listening questions. Questions will auto-advance.
                  </p>
                </div>
              </Card>
            )}

            {/* Backward compatibility: Individual audio for old questions */}
            {isListeningSection && !currentExam?.listeningAudioFile && currentQuestion?.audioFile && (
              <div className="mb-6">
                <AudioPlayer
                  src={currentQuestion.audioFile}
                  maxReplays={currentQuestion.maxReplays || 2}
                  onReplayCountChange={handleAudioReplayChange}
                />
              </div>
            )}

            {/* Start Listening Section Button */}
            {isReadingPhase && currentQuestionIndex === readingCount - 1 && (
              <div className="mt-6 mb-6">
                <Card>
                  <div className="p-6 text-center">
                    <h3 className="text-lg font-medium mb-2">Ready to start listening section?</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      You have completed all reading questions. Click below to start the listening section.
                      <br />
                      <strong>Note:</strong> You cannot return to reading questions once you start listening.
                    </p>
                    <Button
                      onClick={startListeningPhase}
                      className="bg-primary text-white px-6 py-3"
                    >
                      <Headphones className="w-5 h-5 mr-2" />
                      Start Listening Section
                    </Button>
                  </div>
                </Card>
              </div>
            )}

            {/* Question Content */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
              {/* Question Image */}
              {currentQuestion?.questionImage && (
                <div className="mb-4">
                  <img
                    src={currentQuestion.questionImage}
                    alt="Question illustration"
                    className="max-w-full h-auto rounded-lg mx-auto"
                  />
                </div>
              )}

              {/* Question Text */}
              <div className="mb-6">
                <p className="text-lg font-korean leading-relaxed text-gray-900">
                  {currentQuestion?.questionText}
                </p>
                {currentQuestion?.questionTextKorean && (
                  <p className="text-lg font-korean leading-relaxed text-gray-700 mt-2">
                    {currentQuestion.questionTextKorean}
                  </p>
                )}
              </div>

              {/* Answer Options */}
              {currentQuestion?.options && (
                <AnswerOptions
                  options={currentQuestion.options}
                  selectedAnswer={answers[currentQuestion._id]}
                  onSelect={handleAnswerSelect}
                  displayMode={currentQuestion.optionsDisplayMode || 'text'}
                />
              )}
            </div>

            {/* Navigation Footer */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                {answeredCount} answered | {markedQuestions.length} marked | {unansweredCount} remaining
              </div>
              <div className="flex items-center gap-3">
                {/* Previous Button - Only in reading phase */}
                {isReadingPhase && (
                  <Button
                    variant="secondary"
                    onClick={prevQuestion}
                    disabled={!canGoPrev}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </Button>
                )}

                {/* Next Button - Only in reading phase */}
                {isReadingPhase && (
                  <Button
                    variant="primary"
                    onClick={nextQuestion}
                    disabled={!canGoNext}
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                )}

                {/* In listening phase, show disabled message */}
                {isListeningPhase && (
                  <div className="text-sm text-gray-500 italic">
                    Questions will auto-advance
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>

        {/* Mobile Question Navigator - Only in reading phase */}
        {isReadingPhase && (
          <button
            onClick={() => setShowNavigator(!showNavigator)}
            className="lg:hidden fixed bottom-4 right-4 w-14 h-14 bg-primary-600 text-white rounded-full shadow-lg flex items-center justify-center z-20"
          >
            <span className="text-sm font-bold">{currentQuestionIndex + 1}/{totalQuestions}</span>
          </button>
        )}
      </div>

      {/* Submit Confirmation Modal */}
      <Modal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        title="Submit Exam"
        size="md"
      >
        <div className="space-y-4">
          {unansweredCount > 0 && (
            <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-800">
                  You have {unansweredCount} unanswered question{unansweredCount > 1 ? 's' : ''}
                </p>
                <p className="text-sm text-yellow-700 mt-1">
                  Are you sure you want to submit without answering all questions?
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{answeredCount}</div>
              <div className="text-sm text-green-700">Answered</div>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{markedQuestions.length}</div>
              <div className="text-sm text-yellow-700">Marked</div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">{unansweredCount}</div>
              <div className="text-sm text-gray-700">Unanswered</div>
            </div>
          </div>

          <p className="text-gray-600">
            Once submitted, you cannot change your answers. Are you sure you want to submit?
          </p>

          <div className="flex gap-3 pt-2">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => setShowSubmitModal(false)}
            >
              Continue Exam
            </Button>
            <Button
              variant="primary"
              fullWidth
              onClick={handleSubmit}
              isLoading={isSubmitting}
            >
              Submit Exam
            </Button>
          </div>
        </div>
      </Modal>

      {/* Exit Confirmation Modal */}
      <Modal
        isOpen={showExitModal}
        onClose={() => setShowExitModal(false)}
        title="Exit Exam"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Your progress will be saved and you can resume later. Are you sure you want to exit?
          </p>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => setShowExitModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              fullWidth
              onClick={handleExit}
            >
              Exit Exam
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

import { BookOpen, Headphones } from 'lucide-react';

export default function QuestionNavigator({
  totalQuestions,
  readingCount,
  listeningCount,
  currentIndex,
  answers,
  markedQuestions,
  onNavigate,
  questions: allQuestions = []
}) {
  // Generate question numbers with their types and IDs
  const questions = allQuestions.map((q, i) => ({
    number: i + 1,
    type: i < readingCount ? 'reading' : 'listening',
    questionIndex: i,
    questionId: q._id
  }));

  const getQuestionStatus = (index, questionId) => {
    const isAnswered = answers[questionId] !== null && answers[questionId] !== undefined;
    const isMarked = markedQuestions.includes(questionId);
    const isCurrent = index === currentIndex;

    if (isCurrent) return 'current';
    if (isMarked) return 'marked';
    if (isAnswered) return 'answered';
    return 'unanswered';
  };

  const statusStyles = {
    current: 'bg-primary-600 text-white border-primary-600 ring-2 ring-primary-300',
    answered: 'bg-green-500 text-white border-green-500',
    marked: 'bg-yellow-400 text-yellow-900 border-yellow-400',
    unanswered: 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
  };

  // Count answered, marked, and remaining
  const questionIds = questions.map(q => q.questionId);
  const answeredCount = questionIds.filter(id => answers[id] !== null && answers[id] !== undefined).length;
  const markedCount = markedQuestions.length;
  const remainingCount = totalQuestions - answeredCount;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      {/* Header */}
      <div className="mb-4">
        <h3 className="font-semibold text-gray-900">Questions</h3>
        <p className="text-sm text-gray-500">Click to navigate</p>
      </div>

      {/* Reading Section */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="w-4 h-4 text-green-600" />
          <span className="text-sm font-medium text-gray-700">Reading (1-{readingCount})</span>
        </div>
        <div className="question-grid">
          {questions.slice(0, readingCount).map((q) => (
            <button
              key={q.number}
              onClick={() => onNavigate(q.questionIndex)}
              className={`
                w-9 h-9 rounded-lg border text-sm font-medium
                transition-all duration-200
                ${statusStyles[getQuestionStatus(q.questionIndex, q.questionId)]}
              `}
            >
              {q.number}
            </button>
          ))}
        </div>
      </div>

      {/* Listening Section */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Headphones className="w-4 h-4 text-purple-600" />
          <span className="text-sm font-medium text-gray-700">Listening ({readingCount + 1}-{totalQuestions})</span>
        </div>
        <div className="question-grid">
          {questions.slice(readingCount).map((q) => (
            <button
              key={q.number}
              onClick={() => onNavigate(q.questionIndex)}
              className={`
                w-9 h-9 rounded-lg border text-sm font-medium
                transition-all duration-200
                ${statusStyles[getQuestionStatus(q.questionIndex, q.questionId)]}
              `}
            >
              {q.number}
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="pt-4 border-t border-gray-100">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-primary-600"></div>
            <span className="text-gray-600">Current</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500"></div>
            <span className="text-gray-600">Answered</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-yellow-400"></div>
            <span className="text-gray-600">Marked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border border-gray-300 bg-white"></div>
            <span className="text-gray-600">Unanswered</span>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-4 pt-4 border-t border-gray-100 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>Answered:</span>
          <span className="font-medium text-green-600">{answeredCount}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Marked:</span>
          <span className="font-medium text-yellow-600">{markedCount}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Remaining:</span>
          <span className="font-medium text-gray-900">{remainingCount}</span>
        </div>
      </div>
    </div>
  );
}

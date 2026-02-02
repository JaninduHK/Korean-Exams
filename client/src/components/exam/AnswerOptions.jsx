export default function AnswerOptions({
  options,
  selectedAnswer,
  onSelect,
  disabled = false,
  showCorrect = false,
  correctAnswer = null
}) {
  // Map traditional labels to circled numbers
  const labelMap = {
    'A': '①',
    'B': '②',
    'C': '③',
    'D': '④',
    '①': '①',
    '②': '②',
    '③': '③',
    '④': '④'
  };

  const getOptionStyle = (label) => {
    const isSelected = selectedAnswer === label;
    const isCorrect = showCorrect && correctAnswer === label;
    const isWrong = showCorrect && selectedAnswer === label && correctAnswer !== label;

    if (isCorrect) {
      return 'border-green-500 bg-green-50 ring-2 ring-green-500';
    }
    if (isWrong) {
      return 'border-red-500 bg-red-50 ring-2 ring-red-500';
    }
    if (isSelected) {
      return 'border-primary-500 bg-primary-50 ring-2 ring-primary-500';
    }
    return 'border-gray-200 hover:border-gray-300 hover:bg-gray-50';
  };

  const getCircleStyle = (label) => {
    const isSelected = selectedAnswer === label;
    const isCorrect = showCorrect && correctAnswer === label;
    const isWrong = showCorrect && selectedAnswer === label && correctAnswer !== label;

    if (isCorrect) {
      return 'bg-green-500 border-green-500 text-white';
    }
    if (isWrong) {
      return 'bg-red-500 border-red-500 text-white';
    }
    if (isSelected) {
      return 'bg-primary-600 border-primary-600 text-white';
    }
    return 'border-gray-300 text-gray-600';
  };

  return (
    <div className="space-y-3">
      {options.map((option) => (
        <button
          key={option.label}
          onClick={() => !disabled && onSelect(option.label)}
          disabled={disabled}
          className={`
            w-full flex items-start gap-4 p-4 rounded-xl border-2 text-left
            transition-all duration-200
            ${disabled ? 'cursor-default' : 'cursor-pointer'}
            ${getOptionStyle(option.label)}
          `}
        >
          {/* Circle with number */}
          <span className={`
            inline-flex items-center justify-center w-8 h-8 rounded-full border-2
            text-lg font-semibold flex-shrink-0
            ${getCircleStyle(option.label)}
          `}>
            {labelMap[option.label] || option.label}
          </span>

          {/* Option text */}
          <span className="font-korean text-base leading-relaxed flex-1">
            {option.text}
          </span>

          {/* Correct/Wrong indicator for review mode */}
          {showCorrect && correctAnswer === option.label && (
            <span className="text-green-600 text-sm font-medium">Correct</span>
          )}
          {showCorrect && selectedAnswer === option.label && correctAnswer !== option.label && (
            <span className="text-red-600 text-sm font-medium">Your answer</span>
          )}
        </button>
      ))}
    </div>
  );
}

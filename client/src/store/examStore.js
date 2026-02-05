import { create } from 'zustand';
import { examService } from '../services/examService';

const useExamStore = create((set, get) => ({
  // Exam list state
  exams: [],
  featuredExams: [],
  currentExam: null,
  isLoading: false,
  error: null,
  errorData: null,
  pagination: null,

  // Active attempt state
  attempt: null,
  answers: {},
  markedQuestions: [],
  audioReplays: {},
  currentQuestionIndex: 0,
  timeRemaining: 0,
  isSubmitting: false,

  // Fetch exams
  fetchExams: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const data = await examService.getExams(params);
      set({
        exams: data.data,
        pagination: data.pagination,
        isLoading: false
      });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  // Fetch featured exams
  fetchFeaturedExams: async () => {
    try {
      const data = await examService.getFeaturedExams();
      set({ featuredExams: data.data });
    } catch (error) {
      console.error('Error fetching featured exams:', error);
    }
  },

  // Fetch single exam
  fetchExam: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const data = await examService.getExam(id);
      set({ currentExam: data.data, isLoading: false });
      return data.data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return null;
    }
  },

  // Start exam attempt
  startExam: async (examId) => {
    set({ isLoading: true, error: null, errorData: null });
    try {
      // Get exam data for taking (without answers)
      const examData = await examService.getExamForTaking(examId);
      const exam = examData.data;

      // Start or resume attempt
      const attemptData = await examService.startAttempt(examId);
      const attempt = attemptData.data;

      // Initialize answers from attempt or empty
      const initialAnswers = {};
      const initialReplays = {};
      attempt.answers.forEach(a => {
        initialAnswers[a.questionId] = a.selectedAnswer;
        if (a.audioReplays !== undefined) {
          initialReplays[a.questionId] = a.audioReplays;
        }
      });

      set({
        currentExam: exam,
        attempt: attempt,
        answers: initialAnswers,
        audioReplays: initialReplays,
        markedQuestions: attempt.markedQuestions || [],
        currentQuestionIndex: attempt.currentQuestionIndex || 0,
        timeRemaining: attempt.timeRemaining || (exam.duration.total * 60),
        isLoading: false
      });

      return { exam, attempt };
    } catch (error) {
      // Store both error message and additional data (for exam limit info)
      set({
        error: error.message,
        errorData: error.data || null,
        isLoading: false
      });
      return null;
    }
  },

  // Set answer for question
  setAnswer: (questionId, answer) => {
    set(state => ({
      answers: { ...state.answers, [questionId]: answer }
    }));
  },

  // Set audio replay count for question
  setAudioReplay: (questionId, replayCount) => {
    set(state => ({
      audioReplays: { ...state.audioReplays, [questionId]: replayCount }
    }));
  },

  // Toggle marked question
  toggleMarked: async (questionId) => {
    const { attempt, markedQuestions } = get();
    const isMarked = markedQuestions.includes(questionId);
    const newMarked = isMarked
      ? markedQuestions.filter(id => id !== questionId)
      : [...markedQuestions, questionId];

    set({ markedQuestions: newMarked });

    // Save to server
    if (attempt) {
      try {
        await examService.markQuestion(attempt._id, questionId, !isMarked);
      } catch (error) {
        console.error('Error saving marked question:', error);
      }
    }
  },

  // Navigate to question
  goToQuestion: (index) => {
    set({ currentQuestionIndex: index });
  },

  // Next question
  nextQuestion: () => {
    const { currentQuestionIndex, currentExam } = get();
    const totalQuestions = (currentExam?.readingQuestions?.length || 0) +
                          (currentExam?.listeningQuestions?.length || 0);
    if (currentQuestionIndex < totalQuestions - 1) {
      set({ currentQuestionIndex: currentQuestionIndex + 1 });
    }
  },

  // Previous question
  prevQuestion: () => {
    const { currentQuestionIndex } = get();
    if (currentQuestionIndex > 0) {
      set({ currentQuestionIndex: currentQuestionIndex - 1 });
    }
  },

  // Update time remaining
  setTimeRemaining: (time) => {
    set({ timeRemaining: time });
  },

  // Save progress (auto-save)
  saveProgress: async () => {
    const { attempt, answers, audioReplays, currentQuestionIndex, timeRemaining, markedQuestions } = get();
    if (!attempt) return;

    try {
      const answersArray = Object.entries(answers).map(([questionId, selectedAnswer]) => ({
        questionId,
        selectedAnswer,
        audioReplays: audioReplays[questionId] || 0
      }));

      await examService.saveAnswers(attempt._id, {
        answers: answersArray,
        currentQuestionIndex,
        timeRemaining
      });
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  },

  // Submit exam
  submitExam: async (timedOut = false) => {
    const { attempt, answers, audioReplays, timeRemaining } = get();
    if (!attempt) return null;

    set({ isSubmitting: true });

    try {
      // First save all answers
      const answersArray = Object.entries(answers).map(([questionId, selectedAnswer]) => ({
        questionId,
        selectedAnswer,
        audioReplays: audioReplays[questionId] || 0
      }));

      await examService.saveAnswers(attempt._id, {
        answers: answersArray,
        timeRemaining: 0
      });

      // Then submit
      const initialTime = attempt.timeRemaining || 3000; // fallback
      const timeSpent = initialTime - timeRemaining;

      const result = await examService.submitAttempt(attempt._id, {
        timeSpent,
        timedOut
      });

      set({ isSubmitting: false });
      return result.data;
    } catch (error) {
      set({ isSubmitting: false, error: error.message });
      return null;
    }
  },

  // Reset exam state
  resetExamState: () => {
    set({
      attempt: null,
      answers: {},
      markedQuestions: [],
      audioReplays: {},
      currentQuestionIndex: 0,
      timeRemaining: 0,
      currentExam: null,
      error: null,
      errorData: null
    });
  },

  // Clear error
  clearError: () => set({ error: null, errorData: null })
}));

export default useExamStore;

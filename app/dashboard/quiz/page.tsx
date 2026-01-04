'use client'

import { useState, useEffect } from 'react';
import { useQuizState, useQuizAPI } from './hooks/hooks';
import { useQuizJobs } from './hooks/useQuizJobs';
import QuizFormModal from './components/quizForm';
import QuizView from './components/quizView';
import QuizList from './components/quizList';
import QuizResultsModal from './components/quizResults';
import JobStatusModal from './components/JobStatusModal';
import { getThemeStyles, colors } from './components/constants';
import { QuizJob } from './components/types';
import { Plus, List, Brain, Home, ArrowLeft } from 'lucide-react';

type View = 'dashboard' | 'quiz-list' | 'quiz-view';

export default function QuizGenerator() {
  // View state
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showResultsModal, setShowResultsModal] = useState<boolean>(false);
  
  // Add loading state for individual quiz loading
  const [loadingQuizId, setLoadingQuizId] = useState<string | null>(null); // Add this line

  // State
  const [title, setTitle] = useState<string>(''); // Add title state
  const [inputText, setInputText] = useState<string>('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [numberOfQuestions, setNumberOfQuestions] = useState<number>(10);
  const [difficulty, setDifficulty] = useState<string>('medium');
  const [questionTypes, setQuestionTypes] = useState<string>('MULTIPLE_CHOICE,TRUE_FALSE');

  // Custom hooks
  const {
    quiz,
    quizList,
    userAnswers,
    quizResult,
    detailedResults,
    isGenerating,
    isSubmitting,
    isLoadingQuizzes,
    error,
    setQuiz,
    setQuizList,
    setQuizResult,
    setDetailedResults,
    setIsGenerating,
    setIsSubmitting,
    setIsLoadingQuizzes,
    setError,
    handleAnswer,
    resetQuizState,
  } = useQuizState();

  const {
    fetchQuizList,
    loadQuiz,
    generateQuiz: apiGenerateQuiz,
    submitQuiz: apiSubmitQuiz,
  } = useQuizAPI();

  const {
    activeJobs,
    showJobModal,
    jobDetails,
    startJobMonitoring,
    closeJobModal,
    addNewJob,
  } = useQuizJobs();

  const styles = getThemeStyles();

  // Scroll to top when view changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentView]);

  // Fetch quiz list on component mount
  useEffect(() => {
    loadQuizList();
  }, []);

  const loadQuizList = async () => {
    setIsLoadingQuizzes(true);
    try {
      const quizzes = await fetchQuizList();
      setQuizList(quizzes);
    } catch (err) {
      console.error('Error fetching quizzes:', err);
    } finally {
      setIsLoadingQuizzes(false);
    }
  };

  const handleGenerateQuiz = async () => {
    // Add title validation
    if (!title.trim()) {
      setError('Please enter a title for your quiz');
      return;
    }

    if (!inputText.trim() && !pdfFile) {
      setError('Please provide text or upload a PDF file');
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      const jobData = await apiGenerateQuiz(
        title,
        inputText,
        pdfFile,
        numberOfQuestions,
        difficulty,
        questionTypes
      );

      // Create job object for monitoring
      const newJob = {
        id: jobData.jobId,
        title: title, // Use the actual title
        difficulty,
        numberOfQuestions: numberOfQuestions.toString(),
        questionType: questionTypes,
        status: 'PENDING' as const,
        createdAt: new Date().toISOString(),
        progress: 0,
      };

      addNewJob(newJob);
      startJobMonitoring(jobData.jobId, loadQuizList);

      // Reset form and close modal
      setTitle(''); // Clear title
      setInputText('');
      setPdfFile(null);
      setShowCreateModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate quiz');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmitQuiz = async () => {
    if (!quiz) return;

    setIsSubmitting(true);
    setError('');

    try {
      const answers = Object.entries(userAnswers).map(([questionId, answer]) => ({
        questionId,
        answer
      }));

      const result = await apiSubmitQuiz(quiz.id, answers);
      setQuizResult(result.result);
      setDetailedResults(result.detailedResults);
      setShowResultsModal(true);
      loadQuizList();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit quiz');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectQuiz = async (quizId: string) => {
    setLoadingQuizId(quizId); // Set loading state
    try {
      const loadedQuiz = await loadQuiz(quizId);
      setQuiz(loadedQuiz);
      setCurrentView('quiz-view');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load quiz');
    } finally {
      // Clear loading state after a timeout (safety measure)
      setTimeout(() => {
        setLoadingQuizId(null);
      }, 2000);
    }
  };

  const handleViewQuiz = (job: QuizJob) => {
    if (job.quiz) {
      setQuiz(job.quiz);
      closeJobModal();
      setCurrentView('quiz-view');
    }
  };

  const handleStartNewQuiz = () => {
    resetQuizState();
    setTitle(''); // Clear title
    setInputText('');
    setPdfFile(null);
    setShowResultsModal(false);
    setCurrentView('dashboard');
    setShowCreateModal(true);
  };

  const handleClearAll = () => {
    setTitle(''); // Clear title
    setInputText('');
    setPdfFile(null);
    setError('');
  };

  const renderHeader = () => {
    if (currentView === 'dashboard') {
      return (
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: styles.text.primary }}>
              Quiz Generator
            </h1>
            <p className="text-sm mt-1" style={{ color: styles.text.secondary }}>
              AI-powered quiz generation
            </p>
          </div>
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white"
            style={{ background: colors.primary[500] }}
          >
            <Brain size={20} />
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center space-x-4 mb-8">
        <button
          onClick={() => setCurrentView('dashboard')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          style={{ backgroundColor: 'transparent' }}
        >
          <ArrowLeft size={20} style={{ color: styles.text.secondary }} />
        </button>
        <div>
          <h1 className="text-xl font-bold" style={{ color: styles.text.primary }}>
            {currentView === 'quiz-list' ? 'All Quizzes' : quiz?.title || 'Quiz'}
          </h1>
          <p className="text-sm mt-0.5" style={{ color: styles.text.secondary }}>
            {currentView === 'quiz-list' ? `${quizList.length} quizzes available` : `Question ${Object.keys(userAnswers).length}/${quiz?.questions.length || 0} answered`}
          </p>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (currentView) {
      case 'quiz-list':
        return (
          <QuizList
            quizList={quizList}
            isLoadingQuizzes={isLoadingQuizzes}
            onSelectQuiz={handleSelectQuiz}
            onRefreshQuizzes={loadQuizList}
            onCreateNewQuiz={() => setShowCreateModal(true)}
            loadingQuizId={loadingQuizId} // Pass loadingQuizId to QuizList
          />
        );

      case 'quiz-view':
        return quiz ? (
          <QuizView
            quiz={quiz}
            userAnswers={userAnswers}
            isSubmitting={isSubmitting}
            onAnswer={handleAnswer}
            onSubmit={handleSubmitQuiz}
            onStartNewQuiz={handleStartNewQuiz}
            onBack={() => setCurrentView('quiz-list')}
          />
        ) : (
          <div className="text-center py-12">
            <p style={{ color: styles.text.secondary }}>No quiz loaded</p>
            <button
              onClick={() => setCurrentView('quiz-list')}
              className="text-sm font-medium mt-2 hover:underline"
              style={{ color: colors.primary[500] }}
            >
              Browse quizzes →
            </button>
          </div>
        );

      default:
        return (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-2 gap-4 mb-8">
              <div className="border rounded-lg p-4">
                <div className="text-sm" style={{ color: styles.text.secondary }}>Quizzes</div>
                <div className="text-2xl font-bold mt-1" style={{ color: styles.text.primary }}>
                  {quizList.length}
                </div>
              </div>
              <div className="border rounded-lg p-4">
                <div className="text-sm" style={{ color: styles.text.secondary }}>Continue</div>
                <div className="text-2xl font-bold mt-1" style={{ color: styles.text.primary }}>
                  {quiz ? 1 : 0}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setShowCreateModal(true)}
                className="border rounded-lg p-6 text-left hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: colors.primary[50] }}
                  >
                    <Plus style={{ color: colors.primary[500] }} size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold" style={{ color: styles.text.primary }}>
                      Create Quiz
                    </h3>
                    <p className="text-sm" style={{ color: styles.text.secondary }}>
                      From text or PDF
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setCurrentView('quiz-list')}
                className="border rounded-lg p-6 text-left hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: colors.secondary[50] }}
                  >
                    <List style={{ color: colors.secondary[500] }} size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold" style={{ color: styles.text.primary }}>
                      Browse Quizzes
                    </h3>
                    <p className="text-sm" style={{ color: styles.text.secondary }}>
                      Take existing quizzes
                    </p>
                  </div>
                </div>
              </button>
            </div>

            {/* Recent Quizzes */}
            {quizList.length > 0 && (
              <div className="mt-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold" style={{ color: styles.text.primary }}>
                    Recent Quizzes
                  </h2>
                  <button
                    onClick={() => setCurrentView('quiz-list')}
                    className="text-sm hover:underline"
                    style={{ color: colors.primary[500] }}
                  >
                    View all
                  </button>
                </div>
                <div className="space-y-2">
                  {quizList.slice(0, 3).map((quizItem) => {
                    const isLoading = loadingQuizId === quizItem.id;

                    return (
                      <div
                        key={quizItem.id}
                        onClick={() => !isLoading && handleSelectQuiz(quizItem.id)}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors relative ${isLoading ? 'opacity-70 cursor-wait bg-blue-50' : 'hover:bg-gray-50'
                          }`}
                      >
                        {/* Loading overlay */}
                        {isLoading && (
                          <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-lg">
                            <div
                              className="w-4 h-4 border-2 rounded-full animate-spin"
                              style={{
                                borderColor: colors.primary[400],
                                borderTopColor: 'transparent'
                              }}
                            ></div>
                            <span className="ml-2 text-xs" style={{ color: colors.primary[500] }}>
                              Opening...
                            </span>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <span className="text-sm flex items-center" style={{ color: styles.text.primary }}>
                            {quizItem.title}
                            {isLoading && (
                              <span className="ml-2 text-xs" style={{ color: colors.primary[500] }}>
                                (Opening...)
                              </span>
                            )}
                          </span>
                          <span className="text-xs" style={{ color: styles.text.secondary }}>
                            {quizItem._count.questions} questions
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        );
    }
  };

  return (
    <div style={{ backgroundColor: styles.background.main, minHeight: '100vh' }} className="p-2 sm:p-4">
      <div className="max-w-3xl mx-auto">
        {renderHeader()}
        {renderContent()}
      </div>

      {/* Modals */}
      <QuizFormModal
        show={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title={title} // Add this
        inputText={inputText}
        pdfFile={pdfFile}
        numberOfQuestions={numberOfQuestions}
        difficulty={difficulty}
        questionTypes={questionTypes}
        isGenerating={isGenerating}
        error={error}
        onTitleChange={setTitle} // Add this
        onInputTextChange={setInputText}
        onPdfFileChange={setPdfFile}
        onNumberOfQuestionsChange={setNumberOfQuestions}
        onDifficultyChange={setDifficulty}
        onQuestionTypesChange={setQuestionTypes}
        onGenerateQuiz={handleGenerateQuiz}
        onClearAll={handleClearAll}
      />

      {quizResult && detailedResults && (
        <QuizResultsModal
          show={showResultsModal}
          onClose={() => setShowResultsModal(false)}
          quizResult={quizResult}
          detailedResults={detailedResults}
          onStartNewQuiz={handleStartNewQuiz}
          onReviewAgain={() => {
            setShowResultsModal(false);
            setCurrentView('quiz-view');
          }}
        />
      )}

      {/* Job Status Modal */}
      <JobStatusModal
        show={showJobModal}
        jobDetails={jobDetails}
        onClose={closeJobModal}
        onViewQuiz={handleViewQuiz}
      />
    </div>
  );
}
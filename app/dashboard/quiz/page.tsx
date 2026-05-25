'use client'

import { useState, useEffect } from 'react';
import { useQuizState, useQuizAPI } from './hooks/hooks';
import { useQuizJobs } from './hooks/useQuizJobs';
import QuizFormModal from './components/quizForm';
import QuizView from './components/quizView';
import QuizList from './components/quizList';
import QuizResultsModal from './components/quizResults';
import JobStatusModal from './components/JobStatusModal';
import { QuizJob } from './components/types';
import { Plus, List, Brain, ArrowLeft, Sparkles } from 'lucide-react';

type View = 'dashboard' | 'quiz-list' | 'quiz-view';

export default function QuizGenerator() {
  // View state
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showResultsModal, setShowResultsModal] = useState<boolean>(false);

  // Add loading state for individual quiz loading
  const [loadingQuizId, setLoadingQuizId] = useState<string | null>(null);

  // State
  const [title, setTitle] = useState<string>('');
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

      const newJob = {
        id: jobData.jobId,
        title: title,
        difficulty,
        numberOfQuestions: numberOfQuestions.toString(),
        questionType: questionTypes,
        status: 'PENDING' as const,
        createdAt: new Date().toISOString(),
        progress: 0,
      };

      addNewJob(newJob);
      startJobMonitoring(jobData.jobId, loadQuizList);

      setTitle('');
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
    setLoadingQuizId(quizId);
    try {
      const loadedQuiz = await loadQuiz(quizId);
      setQuiz(loadedQuiz);
      setCurrentView('quiz-view');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load quiz');
    } finally {
      setTimeout(() => setLoadingQuizId(null), 2000);
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
    setTitle('');
    setInputText('');
    setPdfFile(null);
    setShowResultsModal(false);
    setCurrentView('dashboard');
    setShowCreateModal(true);
  };

  const handleClearAll = () => {
    setTitle('');
    setInputText('');
    setPdfFile(null);
    setError('');
  };

  const renderHeader = () => {
    if (currentView === 'dashboard') {
      return (
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl font-heading font-semibold text-neutral-800">
                Quiz Generator
              </h1>
              <p className="text-sm text-neutral-500 mt-0.5">
                AI-powered quiz generation from your content
              </p>
            </div>
            <button onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-white transition-all hover:shadow-md active:scale-[0.98]"
              style={{ backgroundColor: '#ff5252' }}>
              <Plus size={18} />
              <span>Create</span>
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => setCurrentView('dashboard')}
          className="w-9 h-9 rounded-xl flex items-center justify-center bg-white border border-neutral-200 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50 transition-all">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-lg font-heading font-semibold text-neutral-800">
            {currentView === 'quiz-list' ? 'All Quizzes' : quiz?.title || 'Quiz'}
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
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
            loadingQuizId={loadingQuizId}
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
          <div className="text-center py-12 bg-white rounded-xl shadow-md">
            <Brain className="w-8 h-8 text-neutral-300 mx-auto mb-3" />
            <p className="text-sm text-neutral-500 mb-2">No quiz loaded</p>
            <button onClick={() => setCurrentView('quiz-list')}
              className="text-sm font-medium text-[#ff5252] hover:underline">
              Browse quizzes →
            </button>
          </div>
        );

      default:
        return (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white rounded-xl shadow-md p-4">
                <p className="text-xs text-neutral-500 font-medium">Quizzes</p>
                <p className="text-2xl font-bold text-neutral-800 mt-1">{quizList.length}</p>
              </div>
              <div className="bg-white rounded-xl shadow-md p-4">
                <p className="text-xs text-neutral-500 font-medium">Continue</p>
                <p className="text-2xl font-bold text-neutral-800 mt-1">{quiz ? 1 : 0}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <button onClick={() => setCurrentView('quiz-list')}
                className="bg-white rounded-xl shadow-md p-5 text-left hover:shadow-lg transition-all group">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-[#ff5252]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <List className="w-5 h-5 text-[#ff5252]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-neutral-800">Browse Quizzes</h3>
                    <p className="text-xs text-neutral-500">Take existing quizzes</p>
                  </div>
                </div>
              </button>
            </div>

            {/* Recent Quizzes */}
            {quizList.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-neutral-800">Recent Quizzes</h2>
                  <button onClick={() => setCurrentView('quiz-list')}
                    className="text-xs font-medium text-[#ff5252] hover:underline">
                    View all
                  </button>
                </div>
                <div className="space-y-2">
                  {quizList.slice(0, 3).map((quizItem) => {
                    const isLoading = loadingQuizId === quizItem.id;
                    return (
                      <div key={quizItem.id}
                        onClick={() => !isLoading && handleSelectQuiz(quizItem.id)}
                        className={`p-3 rounded-lg border border-neutral-200 cursor-pointer transition-all relative ${
                          isLoading ? 'opacity-70 cursor-wait' : 'hover:bg-neutral-50 hover:border-[#193827]/20'
                        }`}>
                        {isLoading && (
                          <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-lg z-10">
                            <div className="w-4 h-4 border-2 border-[#193827]/30 border-t-[#193827] rounded-full animate-spin" />
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-[#ff5252]" />
                            <span className="text-sm text-neutral-800">{quizItem.title}</span>
                          </div>
                          <span className="text-xs text-neutral-400">{quizItem._count.questions} questions</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Active Jobs */}
            {activeJobs.length > 0 && (
              <div className="mt-6">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-[#ff5252]" />
                  <span className="text-sm font-medium text-neutral-600">{activeJobs.length} active job{activeJobs.length > 1 ? 's' : ''}</span>
                </div>
              </div>
            )}
          </>
        );
    }
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-3xl mx-auto">
        {renderHeader()}
        {renderContent()}
      </div>

      <QuizFormModal
        show={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title={title}
        inputText={inputText}
        pdfFile={pdfFile}
        numberOfQuestions={numberOfQuestions}
        difficulty={difficulty}
        questionTypes={questionTypes}
        isGenerating={isGenerating}
        error={error}
        onTitleChange={setTitle}
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

      <JobStatusModal
        show={showJobModal}
        jobDetails={jobDetails}
        onClose={closeJobModal}
        onViewQuiz={handleViewQuiz}
      />
    </div>
  );
}

'use client'

import { useState, useEffect, use } from 'react';
import { useQuizState, useQuizAPI } from './hooks/hooks';
import { useQuizJobs } from './hooks/useQuizJobs';
import { useSubscription } from '@/app/hooks/useSubscription';
import QuizFormModal from './components/quizForm';
import QuizView from './components/quizView';
import QuizList from './components/quizList';
import QuizResults from './components/quizResults';
import JobStatusModal from './components/JobStatusModal';
import { QuizJob } from './components/types';
import { Plus, List, Brain, ArrowLeft, Sparkles, BarChart3 } from 'lucide-react';
import PageHeader from '@/app/dashboard/components/PageHeader';
import StatBlock from '@/app/dashboard/components/StatBlock';
import Card from '@/app/dashboard/components/Card';
import AnimatedSection from '@/app/dashboard/components/AnimatedSection';
import { ShimmerBlock, ShimmerStatBlock } from '@/app/dashboard/components/Shimmer';

type View = 'dashboard' | 'quiz-list' | 'quiz-view' | 'results';

export default function QuizGenerator(props: { searchParams?: Promise<{ create?: string }> }) {
  const searchParams = props.searchParams ? use(props.searchParams) : undefined
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  // results are now inline, managed by currentView
  const [loadingQuizId, setLoadingQuizId] = useState<string | null>(null);

  const [title, setTitle] = useState<string>('');
  const [inputText, setInputText] = useState<string>('');
  const [retrying, setRetrying] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [numberOfQuestions, setNumberOfQuestions] = useState<number>(10);
  const [difficulty, setDifficulty] = useState<string>('medium');
  const [questionTypes, setQuestionTypes] = useState<string>('MULTIPLE_CHOICE,TRUE_FALSE');

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

  const { usage, isLoading: isLoadingSubscription } = useSubscription()
  const maxQuestions = usage?.limits?.maxQuestionsPerQuiz ?? 20

  const {
    activeJobs,
    showJobModal,
    jobDetails,
    startJobMonitoring,
    retryJob,
    closeJobModal,
    addNewJob,
  } = useQuizJobs();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentView]);

  useEffect(() => {
    loadQuizList();
  }, []);

  // Auto-open create modal when ?create=true
  useEffect(() => {
    if (searchParams?.create === 'true') {
      setShowCreateModal(true)
    }
  }, [searchParams])

  /* ─── Shimmer Loading State ─── */
  if (isLoadingQuizzes && quizList.length === 0) {
    return (
      <div className="min-h-screen max-w-3xl mx-auto space-y-6" role="status" aria-label="Loading quizzes">
        {/* Header Shimmer */}
        <div className="flex items-center gap-4">
          <ShimmerBlock className="w-10 h-10 rounded-xl" />
          <div className="space-y-1.5 flex-1">
            <ShimmerBlock className="h-6 w-36" />
            <ShimmerBlock className="h-3 w-24" />
          </div>
        </div>

        {/* Stats Shimmer */}
        <div className="grid grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <ShimmerStatBlock key={i} />
          ))}
        </div>

        {/* Quick Action Card Shimmer */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center gap-4">
            <ShimmerBlock className="w-12 h-12 rounded-xl" />
            <div className="flex-1 space-y-2">
              <ShimmerBlock className="h-4 w-28" />
              <ShimmerBlock className="h-3 w-44" />
            </div>
          </div>
        </div>

        {/* Recent Quizzes Shimmer */}
        <div className="space-y-3">
          <ShimmerBlock className="h-5 w-28" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ShimmerBlock className="w-2 h-2 rounded-full" />
                  <ShimmerBlock className="h-4 w-36" />
                </div>
                <ShimmerBlock className="h-3 w-20" />
              </div>
            </div>
          ))}
        </div>

        <span className="sr-only">Loading quizzes...</span>
      </div>
    )
  }

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
      const jobData = await apiGenerateQuiz(title, inputText, pdfFile, numberOfQuestions, difficulty, questionTypes);
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
      const answers = Object.entries(userAnswers).map(([questionId, answer]) => ({ questionId, answer }));
      const result = await apiSubmitQuiz(quiz.id, answers);
      setQuizResult(result.result);
      setDetailedResults(result.detailedResults);
      setCurrentView('results');
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

  const handleRetryJob = async (job: QuizJob) => {
    setRetrying(true);
    try {
      await retryJob(job.id, loadQuizList);
    } catch {
      // Error is already logged in the hook
    } finally {
      setRetrying(false);
    }
  };

  const handleStartNewQuiz = () => {
    resetQuizState();
    setTitle('');
    setInputText('');
    setPdfFile(null);
    setCurrentView('dashboard');
    setShowCreateModal(true);
  };

  const handleReviewAgain = () => {
    setCurrentView('quiz-view');
  };

  const handleBackFromQuizView = () => {
    if (quizResult) {
      setCurrentView('results');
    } else {
      setCurrentView('quiz-list');
    }
  };

  const handleClearAll = () => {
    setTitle('');
    setInputText('');
    setPdfFile(null);
    setError('');
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        {currentView === 'dashboard' ? (
          <AnimatedSection>
            <PageHeader
              title="Quiz Generator"
              subtitle="AI-powered quiz generation from your content"
              action={
                <button onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm text-white bg-primary-500 hover:bg-primary-600 hover:shadow-sm transition-all active:scale-95">
                  <Plus size={18} />
                  <span>Create</span>
                </button>
              }
            />
          </AnimatedSection>
        ) : (
          <AnimatedSection>
            <div className="flex items-center gap-4 mb-8">
              <button onClick={() => currentView === 'results' ? setCurrentView('quiz-list') : setCurrentView('dashboard')}
                className="w-10 h-10 rounded-xl flex items-center justify-center bg-white border border-neutral-200 text-neutral-400 hover:text-neutral-600 hover:border-neutral-300 transition-all active:scale-95">
                <ArrowLeft size={18} />
              </button>
              <div>
                <h1 className="text-lg font-heading font-medium text-neutral-900">
                  {currentView === 'quiz-list' ? 'All Quizzes' : currentView === 'results' ? 'Quiz Results' : quiz?.title || 'Quiz'}
                </h1>
                <p className="text-xs text-neutral-400 mt-0.5">
                  {currentView === 'quiz-list' ? `${quizList.length} quizzes available` : currentView === 'results' ? 'Great effort!' : `Question ${Object.keys(userAnswers).length}/${quiz?.questions.length || 0} answered`}
                </p>
              </div>
            </div>
          </AnimatedSection>
        )}

        {/* Content */}
        {currentView === 'quiz-list' ? (
          <AnimatedSection delay={0.1}>
            <QuizList
              quizList={quizList}
              isLoadingQuizzes={isLoadingQuizzes}
              onSelectQuiz={handleSelectQuiz}
              onRefreshQuizzes={loadQuizList}
              onCreateNewQuiz={() => setShowCreateModal(true)}
              loadingQuizId={loadingQuizId}
            />
          </AnimatedSection>
        ) : currentView === 'quiz-view' ? (
          quiz ? (
            <AnimatedSection delay={0.1}>
              <QuizView
                quiz={quiz}
                userAnswers={userAnswers}
                isSubmitting={isSubmitting}
                onAnswer={handleAnswer}
                onSubmit={handleSubmitQuiz}
                onStartNewQuiz={handleStartNewQuiz}
                onBack={handleBackFromQuizView}
              />
            </AnimatedSection>
          ) : (
            <Card className="text-center py-16">
              <Brain className="w-10 h-10 text-neutral-200 mx-auto mb-4" />
              <p className="text-sm text-neutral-400 mb-3">No quiz loaded</p>
              <button onClick={() => setCurrentView('quiz-list')}
                className="text-sm font-medium text-primary-500 hover:text-primary-600 transition-colors">
                Browse quizzes &rarr;
              </button>
            </Card>
          )
        ) : currentView === 'results' && quizResult && detailedResults ? (
          <AnimatedSection delay={0.1}>
            <QuizResults
              quizResult={quizResult}
              detailedResults={detailedResults}
              onStartNewQuiz={handleStartNewQuiz}
              onReviewAgain={handleReviewAgain}
            />
          </AnimatedSection>
        ) : (
          <>
            {/* Stats */}
            <AnimatedSection delay={0.05}>
              <div className="grid grid-cols-2 gap-4 mb-8">
                <StatBlock
                  label="Quizzes Created"
                  value={quizList.length}
                  icon={BarChart3}
                  color="#2d6b4d"
                />
                <StatBlock
                  label="In Progress"
                  value={quiz ? 1 : 0}
                  icon={Brain}
                  color="#ff5252"
                />
              </div>
            </AnimatedSection>

            {/* Quick Actions */}
            <AnimatedSection delay={0.1}>
              <Card
                className="p-5 cursor-pointer hover:shadow-lg transition-all group active:scale-[0.99]"
                onClick={() => setCurrentView('quiz-list')}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <List className="w-6 h-6 text-primary-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-neutral-900">Browse Quizzes</h3>
                    <p className="text-xs text-neutral-400 mt-0.5">Take existing quizzes and track your progress</p>
                  </div>
                </div>
              </Card>
            </AnimatedSection>

            {/* Recent Quizzes */}
            {quizList.length > 0 && (
              <AnimatedSection delay={0.15}>
                <div className="mt-8">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-medium text-neutral-900">Recent Quizzes</h2>
                    <button onClick={() => setCurrentView('quiz-list')}
                      className="text-xs font-medium text-primary-500 hover:text-primary-600 transition-colors">
                      View all
                    </button>
                  </div>
                  <div className="space-y-2">
                    {quizList.slice(0, 3).map((quizItem) => {
                      const isLoading = loadingQuizId === quizItem.id;
                      return (
                        <Card
                          key={quizItem.id}
                          onClick={() => !isLoading && handleSelectQuiz(quizItem.id)}
                          className={`p-4 cursor-pointer transition-all relative ${
                            isLoading ? 'opacity-60 cursor-wait' : 'hover:shadow-lg active:scale-[0.99]'
                          }`}
                        >
                          {isLoading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-white/60 rounded-xl z-10">
                              <div className="w-5 h-5 border-2 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
                            </div>
                          )}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 rounded-full bg-primary-400" />
                              <span className="text-sm text-neutral-900">{quizItem.title}</span>
                            </div>
                            <span className="text-xs text-neutral-400">{quizItem._count.questions} questions</span>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              </AnimatedSection>
            )}

            {/* Active Jobs */}
            {activeJobs.length > 0 && (
              <AnimatedSection delay={0.2}>
                <div className="mt-8 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary-500" />
                  <span className="text-sm text-neutral-500">{activeJobs.length} active job{activeJobs.length > 1 ? 's' : ''}</span>
                </div>
              </AnimatedSection>
            )}
          </>
        )}
      </div>

      <QuizFormModal
        show={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title={title}
        inputText={inputText}
        pdfFile={pdfFile}
        numberOfQuestions={numberOfQuestions}
        maxQuestions={maxQuestions}
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
      />



      <JobStatusModal
        show={showJobModal}
        jobDetails={jobDetails}
        onClose={closeJobModal}
        onViewQuiz={handleViewQuiz}
        onRetry={handleRetryJob}
        retrying={retrying}
      />
    </div>
  );
}

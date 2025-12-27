'use client'

import { useState, useEffect } from 'react';
import { useQuizState, useQuizAPI } from './hooks/hooks';
import { useQuizJobs } from './hooks/useQuizJobs';
import QuizForm from './components/quizForm';
import QuizList from './components/quizList';
import QuizView from './components/quizView';
import QuizResults from './components/quizResults';
import JobStatusModal from './components/JobStatusModal';
import { getThemeStyles, gradients, colors } from './components/constants';
import { QuizJob } from './components/types';

export default function QuizGenerator() {
  // State
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
    showResults,
    quizResult,
    detailedResults,
    isGenerating,
    isSubmitting,
    isLoadingQuizzes,
    activeTab,
    error,
    setQuiz,
    setQuizList,
    setShowResults,
    setQuizResult,
    setDetailedResults,
    setIsGenerating,
    setIsSubmitting,
    setIsLoadingQuizzes,
    setActiveTab,
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
    currentJobId,
    jobDetails,
    startJobMonitoring,
    closeJobModal,
    addNewJob,
    updateJobInList
  } = useQuizJobs();

  const styles = getThemeStyles();

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
    if (!inputText.trim() && !pdfFile) {
      setError('Please provide text or upload a PDF file');
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      const jobData = await apiGenerateQuiz(
        inputText,
        pdfFile,
        numberOfQuestions,
        difficulty,
        questionTypes
      );

      // Create job object for monitoring
      const newJob = {
        id: jobData.jobId,
        title: pdfFile ? pdfFile.name : 'AI Generated Quiz',
        difficulty,
        numberOfQuestions: numberOfQuestions.toString(),
        questionType: questionTypes,
        status: 'PENDING' as const,
        createdAt: new Date().toISOString(),
        progress: 0,
      };

      addNewJob(newJob);
      startJobMonitoring(jobData.jobId, loadQuizList);

      // Reset form
      setInputText('');
      setPdfFile(null);
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
      setShowResults(true);
      loadQuizList();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit quiz');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectQuiz = async (quizId: string) => {
    try {
      const loadedQuiz = await loadQuiz(quizId);
      setQuiz(loadedQuiz);
      setActiveTab('take');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load quiz');
    }
  };

  const handleViewQuiz = (job: QuizJob) => {
    if (job.quiz) {
      setQuiz(job.quiz);
      setActiveTab('take');
      closeJobModal();
    }
  };

  const handleStartNewQuiz = () => {
    resetQuizState();
    setInputText('');
    setPdfFile(null);
    setActiveTab('create');
  };

  const handleClearAll = () => {
    setInputText('');
    setPdfFile(null);
  };

  // Mobile Tabs Component
  const MobileTabs = () => (
    <div className="lg:hidden mb-6 border p-1 rounded-2xl shadow-sm"
      style={{
        backgroundColor: styles.background.card,
        borderColor: styles.border.light
      }}
    >
      <div className="grid grid-cols-2 gap-1">
        <button
          onClick={() => setActiveTab('create')}
          className={`py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200 ${activeTab === 'create'
              ? 'text-white shadow-md'
              : 'hover:text-gray-900'
            }`}
          style={activeTab === 'create' ?
            { background: gradients.primary, color: styles.text.inverted } :
            {
              color: styles.text.secondary,
              backgroundColor: 'transparent'
            }
          }
        >
          <div className="flex items-center justify-center space-x-2">
            <span>🎨</span>
            <span>Create Quiz</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('take')}
          className={`py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200 ${activeTab === 'take'
              ? 'text-white shadow-md'
              : 'hover:text-gray-900'
            }`}
          style={activeTab === 'take' ?
            { background: gradients.primary, color: styles.text.inverted } :
            {
              color: styles.text.secondary,
              backgroundColor: 'transparent'
            }
          }
        >
          <div className="flex items-center justify-center space-x-2">
            <span>📝</span>
            <span>Take Quiz</span>
          </div>
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ backgroundColor: styles.background.main, minHeight: '100vh' }} className="p-4 sm:p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: styles.text.primary }}>
              QuizMaster AI
            </h1>
            <p className="mt-1" style={{ color: styles.text.secondary }}>
              Generate and take quizzes from your study materials
            </p>
          </div>
          <div className="hidden lg:flex items-center space-x-4">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
              style={{ background: gradients.primary }}
            >
              AI
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Tabs */}
      <MobileTabs />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Create Quiz & Quiz List */}
          <div className={`space-y-6 ${activeTab === 'take' ? 'hidden lg:block' : 'block'}`}>
            {/* Create Quiz Card */}
            <div className="border rounded-2xl shadow-sm overflow-hidden"
              style={{
                backgroundColor: styles.background.card,
                borderColor: styles.border.light,
                boxShadow: styles.shadow.sm
              }}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold" style={{ color: styles.text.primary }}>
                      Create New Quiz
                    </h2>
                    <p className="text-sm mt-1" style={{ color: styles.text.secondary }}>
                      Generate quizzes from text or PDF files
                    </p>
                  </div>
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: colors.primary[50] }}
                  >
                    <span style={{ color: colors.primary[400] }}>✨</span>
                  </div>
                </div>

                <QuizForm
                  inputText={inputText}
                  pdfFile={pdfFile}
                  numberOfQuestions={numberOfQuestions}
                  difficulty={difficulty}
                  questionTypes={questionTypes}
                  isGenerating={isGenerating}
                  error={error}
                  onInputTextChange={setInputText}
                  onPdfFileChange={setPdfFile}
                  onNumberOfQuestionsChange={setNumberOfQuestions}
                  onDifficultyChange={setDifficulty}
                  onQuestionTypesChange={setQuestionTypes}
                  onGenerateQuiz={handleGenerateQuiz}
                  onClearAll={handleClearAll}
                />
              </div>
            </div>

            {/* Quiz List Card */}
            <div className="border rounded-2xl shadow-sm overflow-hidden"
              style={{
                backgroundColor: styles.background.card,
                borderColor: styles.border.light,
                boxShadow: styles.shadow.sm
              }}
            >
              <div className="p-6">
                <QuizList
                  quizList={quizList}
                  isLoadingQuizzes={isLoadingQuizzes}
                  onSelectQuiz={handleSelectQuiz}
                  onRefreshQuizzes={loadQuizList}
                  onCreateNewQuiz={() => setActiveTab('create')}
                />
              </div>
            </div>
          </div>

          {/* Right Column - Take Quiz */}
          <div className={`${activeTab === 'create' ? 'hidden lg:block' : 'block'}`}>
            <div className="border rounded-2xl shadow-sm overflow-hidden h-full"
              style={{
                backgroundColor: styles.background.card,
                borderColor: styles.border.light,
                boxShadow: styles.shadow.sm
              }}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: colors.primary[50] }}
                    >
                      <span style={{ color: colors.primary[400] }}>🧠</span>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold" style={{ color: styles.text.primary }}>
                        {quiz ? quiz.title : 'Quiz Preview'}
                      </h2>
                      {quiz && (
                        <p className="text-sm mt-1" style={{ color: styles.text.secondary }}>
                          {quiz.subject} • {quiz.questions.length} questions
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('create')}
                    className="lg:hidden px-4 py-2 text-sm rounded-lg transition-colors duration-200 font-medium"
                    style={{
                      color: colors.primary[400],
                      backgroundColor: 'transparent'
                    }}
                  >
                    ← Back
                  </button>
                </div>

                {!quiz ? (
                  <div className="h-[calc(100vh-300px)] flex flex-col items-center justify-center p-8 text-center">
                    <div
                      className="w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6"
                      style={{ backgroundColor: colors.primary[50] }}
                    >
                      <span className="text-4xl">🎯</span>
                    </div>
                    <h3 className="text-lg font-semibold mb-2" style={{ color: styles.text.primary }}>
                      No Quiz Selected
                    </h3>
                    <p className="text-sm max-w-sm" style={{ color: styles.text.secondary }}>
                      Generate a new quiz from your study materials or select an existing quiz from your list to begin.
                    </p>
                  </div>
                ) : showResults ? (
                  <QuizResults
                    quizResult={quizResult!}
                    detailedResults={detailedResults}
                    onStartNewQuiz={handleStartNewQuiz}
                    onReviewAgain={() => setShowResults(false)}
                  />
                ) : (
                  <QuizView
                    quiz={quiz}
                    userAnswers={userAnswers}
                    isSubmitting={isSubmitting}
                    onAnswer={handleAnswer}
                    onSubmit={handleSubmitQuiz}
                    onBack={() => setActiveTab('create')}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

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
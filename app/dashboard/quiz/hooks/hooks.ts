import { useState, useEffect, useCallback } from 'react';
import { Quiz, QuizListItem, QuizResult, DetailedResult } from '../components/types';

export const useQuizAPI = () => {
  const getAuthToken = () => localStorage.getItem("token");

  const fetchQuizList = async (limit = 10): Promise<QuizListItem[]> => {
    try {
      const token = getAuthToken();
      const response = await fetch(`/api/quizzes?limit=${limit}`, {
        method: 'GET',
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Failed to fetch quizzes');
      const data = await response.json();
      return data.quizzes || [];
    } catch (err) {
      console.error('Error fetching quizzes:', err);
      throw err;
    }
  };

  const loadQuiz = async (quizId: string): Promise<Quiz> => {
    try {
      const token = getAuthToken();
      const response = await fetch(`/api/quizzes/${quizId}`, {
        method: 'GET',
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Failed to load quiz');
      const data = await response.json();
      return data.quiz;
    } catch (err) {
      console.error('Error loading quiz:', err);
      throw err;
    }
  };

const generateQuiz = async (
  inputText: string,
  pdfFile: File | null,
  numberOfQuestions: number,
  difficulty: string,
  questionTypes: string
) => {
  try {
    const formData = new FormData();
    const token = getAuthToken();
    
    if (pdfFile) {
      formData.append('fileName', pdfFile.name);
      formData.append('contentType', pdfFile.type);
    } else {
      formData.append('text', inputText);
    }
    
    formData.append('numberOfQuestions', numberOfQuestions.toString());
    formData.append('difficulty', difficulty);
    formData.append('questionTypes', questionTypes);

    // Step 1: Create job with PENDING_UPLOAD status
    const jobRes = await fetch("/api/quizzes/upload", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    const jobData = await jobRes.json();
    if (!jobRes.ok) {
      throw new Error(jobData?.error || "Failed to create quiz job");
    }

    // Step 2: Upload PDF to R2 if present
    if (pdfFile && jobData.signedUrl) {
      const r2Res = await fetch(jobData.signedUrl, {
        method: "PUT",
        headers: { "Content-Type": pdfFile.type || "application/pdf" },
        body: pdfFile,
      });

      if (!r2Res.ok) {
        // Cancel job if upload fails
        try {
          await fetch(`/api/quizzes/upload?jobId=${jobData.jobId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          });
        } catch (cancelErr) {
          console.error("Failed to cancel job:", cancelErr);
        }
        
        throw new Error(`Upload failed: ${r2Res.status}`);
      }

      // Step 3: Confirm upload completion - update status to PENDING
      const confirmRes = await fetch(`/api/quizzes/upload?jobId=${jobData.jobId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!confirmRes.ok) {
        throw new Error("Failed to confirm upload completion");
      }
    }

    return jobData;
  } catch (err) {
    console.error('Error generating quiz:', err);
    throw err;
  }
};

  const submitQuiz = async (
    quizId: string,
    answers: { questionId: string; answer: string }[]
  ): Promise<{ result: QuizResult; detailedResults: DetailedResult[] }> => {
    try {
      const token = getAuthToken();
      const response = await fetch(`/api/quizzes/${quizId}/submit`, {
        method: 'POST',
        headers: {
          "Authorization": `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ answers }),
      });

      if (!response.ok) throw new Error('Failed to submit quiz');
      return await response.json();
    } catch (err) {
      console.error('Error submitting quiz:', err);
      throw err;
    }
  };

  return {
    fetchQuizList,
    loadQuiz,
    generateQuiz,
    submitQuiz,
  };
};

export const useQuizState = () => {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [quizList, setQuizList] = useState<QuizListItem[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [detailedResults, setDetailedResults] = useState<DetailedResult[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingQuizzes, setIsLoadingQuizzes] = useState(false);
  const [activeTab, setActiveTab] = useState<'create' | 'take'>('create');
  const [error, setError] = useState('');

  const handleAnswer = useCallback((questionId: string, answer: string) => {
    setUserAnswers(prev => ({ ...prev, [questionId]: answer }));
  }, []);

  const resetQuizState = useCallback(() => {
    setQuiz(null);
    setUserAnswers({});
    setShowResults(false);
    setQuizResult(null);
    setDetailedResults([]);
  }, []);

  return {
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
    setUserAnswers,
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
  };
};
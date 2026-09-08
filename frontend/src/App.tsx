import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.js';
import { ProblemCatalog, ProblemItem } from './components/ProblemCatalog.js';
import { ProblemWorkspace } from './components/ProblemWorkspace.js';
import { EvaluationFeedbackView } from './components/EvaluationFeedbackView.js';
import { AttemptHistoryView } from './components/AttemptHistoryView.js';

export default function App() {
  const [activeTab, setActiveTab] = useState<'catalog' | 'workspace' | 'feedback' | 'history'>('catalog');
  const [problems, setProblems] = useState<ProblemItem[]>([]);
  const [activeProblem, setActiveProblem] = useState<any>(null);
  const [currentAttempt, setCurrentAttempt] = useState<any>(null);
  const [historyData, setHistoryData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Fetch Problem Catalog on Mount
  useEffect(() => {
    fetch('/api/problems')
      .then(res => res.json())
      .then(data => {
        setProblems(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load problems:', err);
        setLoading(false);
      });
  }, []);

  // Handler: Select a problem and start Attempt #1
  const handleSelectProblem = async (problemId: string) => {
    setLoading(true);
    try {
      // 1. Fetch full problem details
      const probRes = await fetch(`/api/problems/${problemId}`);
      const probData = await probRes.json();
      setActiveProblem(probData);

      // 2. Start new attempt
      const attemptRes = await fetch(`/api/problems/${problemId}/attempts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ learnerId: 'learner-candidate' })
      });
      const attemptData = await attemptRes.json();
      setCurrentAttempt(attemptData);

      setActiveTab('workspace');
    } catch (err) {
      console.error('Error starting attempt:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handler: Submit solution for evaluation
  const handleSubmitSolution = async (payload: any) => {
    if (!currentAttempt) return;
    setIsSubmitting(true);

    try {
      // 1. POST submission
      const res = await fetch(`/api/attempts/${currentAttempt.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload })
      });

      if (!res.ok) {
        const errData = await res.json();
        alert(`Submission error: ${errData.error}`);
        setIsSubmitting(false);
        return;
      }

      // 2. Poll for evaluation completion
      pollAttemptStatus(currentAttempt.id);
    } catch (err) {
      console.error('Error submitting solution:', err);
      setIsSubmitting(false);
    }
  };

  // Polling helper
  const pollAttemptStatus = (attemptId: string) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/attempts/${attemptId}`);
        const attempt = await res.json();

        if (attempt.status === 'COMPLETED') {
          clearInterval(interval);
          setCurrentAttempt(attempt);
          setIsSubmitting(false);
          setActiveTab('feedback');
          fetchHistory(attempt.problemId);
        } else if (attempt.status === 'FAILED') {
          clearInterval(interval);
          setCurrentAttempt(attempt);
          setIsSubmitting(false);
          alert(`Evaluation failed: ${attempt.failureReason || 'Please try again.'}`);
        }
      } catch (err) {
        console.error('Polling error:', err);
        clearInterval(interval);
        setIsSubmitting(false);
      }
    }, 400);
  };

  // Fetch Attempt History
  const fetchHistory = async (problemId: string) => {
    try {
      const res = await fetch(`/api/problems/${problemId}/history?learnerId=learner-candidate`);
      const data = await res.json();
      setHistoryData(data);
    } catch (err) {
      console.error('Error fetching history:', err);
    }
  };

  // Handler: Start next iteration / attempt
  const handleStartNextAttempt = async () => {
    if (!activeProblem) return;
    try {
      const attemptRes = await fetch(`/api/problems/${activeProblem.id}/attempts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ learnerId: 'learner-candidate' })
      });
      const attemptData = await attemptRes.json();
      setCurrentAttempt(attemptData);
      setActiveTab('workspace');
    } catch (err) {
      console.error('Error creating next attempt:', err);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar
        activeTab={activeTab === 'feedback' ? 'workspace' : activeTab}
        setActiveTab={(t) => {
          if (t === 'history' && activeProblem) fetchHistory(activeProblem.id);
          setActiveTab(t);
        }}
        hasActiveAttempt={!!currentAttempt}
        activeProblemTitle={activeProblem?.title}
        attemptNumber={currentAttempt?.attemptNumber}
      />

      <main style={{ flex: 1 }}>
        {activeTab === 'catalog' && (
          <ProblemCatalog
            problems={problems}
            onSelectProblem={handleSelectProblem}
            loading={loading}
          />
        )}

        {activeTab === 'workspace' && activeProblem && currentAttempt && (
          <ProblemWorkspace
            problem={activeProblem}
            attemptNumber={currentAttempt.attemptNumber}
            starterTemplate={activeProblem.starterTemplate}
            onSubmit={handleSubmitSolution}
            isSubmitting={isSubmitting}
            status={currentAttempt.status}
          />
        )}

        {activeTab === 'feedback' && currentAttempt?.feedback && (
          <EvaluationFeedbackView
            feedback={currentAttempt.feedback}
            attemptNumber={currentAttempt.attemptNumber}
            onTryAgain={handleStartNextAttempt}
            onViewHistory={() => {
              if (activeProblem) fetchHistory(activeProblem.id);
              setActiveTab('history');
            }}
          />
        )}

        {activeTab === 'history' && activeProblem && (
          <AttemptHistoryView
            problemTitle={activeProblem.title}
            attempts={historyData?.attempts || []}
            scoreDelta={historyData?.scoreDelta || 0}
            improvedCriteria={historyData?.improvedCriteria || []}
            onSelectAttempt={(num) => {
              const matched = historyData?.attempts?.find((a: any) => a.attemptNumber === num);
              if (matched && matched.evaluations) {
                setCurrentAttempt({
                  ...currentAttempt,
                  attemptNumber: num,
                  feedback: {
                    overallScore: matched.overallScore,
                    evaluations: matched.evaluations,
                    summary: 'Historical attempt review.',
                    evaluationDurationMs: 0
                  }
                });
                setActiveTab('feedback');
              }
            }}
            onStartNewAttempt={handleStartNextAttempt}
          />
        )}
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-subtle)',
        padding: '16px 24px',
        textAlign: 'center',
        fontSize: '0.8rem',
        color: 'var(--text-dim)',
        background: 'rgba(10, 15, 29, 0.95)'
      }}>
        CipherSchools Hiring Assignment Prototype — Built with Clean Domain Architecture & Modular Monolith
      </footer>
    </div>
  );
}

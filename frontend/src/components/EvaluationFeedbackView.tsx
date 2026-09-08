import React from 'react';

interface CriterionEval {
  criterionId: string;
  criterionName: string;
  score: number;
  maxScore: number;
  evidence: string;
  concern: string;
  suggestion: string;
  confidence: number;
}

interface FeedbackData {
  id: string;
  overallScore: number;
  evaluations: CriterionEval[];
  summary: string;
  evaluatedAt: string;
  evaluationDurationMs: number;
}

interface EvaluationFeedbackViewProps {
  feedback: FeedbackData;
  attemptNumber: number;
  onTryAgain: () => void;
  onViewHistory: () => void;
}

export const EvaluationFeedbackView: React.FC<EvaluationFeedbackViewProps> = ({
  feedback,
  attemptNumber,
  onTryAgain,
  onViewHistory
}) => {
  const scoreColor = feedback.overallScore >= 80 ? '#10b981' : feedback.overallScore >= 60 ? '#f59e0b' : '#ef4444';

  return (
    <div className="fade-in" style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 16px' }}>
      {/* Top Banner Card */}
      <div className="glass-panel" style={{ padding: '32px', marginBottom: '28px', borderLeft: `6px solid ${scoreColor}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.2)', color: '#a5b4fc' }}>
                ATTEMPT #{attemptNumber} EVALUATION
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                Duration: {feedback.evaluationDurationMs}ms
              </span>
            </div>
            <h2 style={{ fontSize: '1.75rem', color: '#fff', marginBottom: '6px' }}>
              Design Review & Rubric Breakdown
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '560px' }}>
              {feedback.summary}
            </p>
          </div>

          {/* Overall Score Circle */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            background: 'rgba(15, 23, 42, 0.8)',
            border: `3px solid ${scoreColor}`,
            boxShadow: `0 0 20px ${scoreColor}40`
          }}>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#fff', lineHeight: 1 }}>
              {feedback.overallScore}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
              OUT OF 100
            </div>
          </div>
        </div>

        {/* Action CTAs */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '28px', paddingTop: '20px', borderTop: '1px solid var(--border-subtle)' }}>
          <button
            id="btn-try-again"
            onClick={onTryAgain}
            className="btn btn-primary"
            style={{ padding: '10px 20px' }}
          >
            Iterate on Design (Start Attempt #{attemptNumber + 1}) →
          </button>
          <button
            id="btn-view-history"
            onClick={onViewHistory}
            className="btn btn-secondary"
            style={{ padding: '10px 18px' }}
          >
            Compare with Prior Attempts
          </button>
        </div>
      </div>

      {/* Rubric Criteria Breakdown */}
      <h3 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>Detailed Dimension Critiques</span>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 400 }}>
          ({feedback.evaluations.length} evaluated criteria)
        </span>
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {feedback.evaluations.map((evalItem, idx) => {
          const scorePercent = (evalItem.score / evalItem.maxScore) * 100;
          const critColor = scorePercent >= 80 ? '#10b981' : scorePercent >= 60 ? '#f59e0b' : '#ef4444';

          return (
            <div
              key={evalItem.criterionId || idx}
              className="glass-panel"
              style={{ padding: '24px', transition: 'border-color 0.2s ease' }}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h4 style={{ fontSize: '1.05rem', color: '#fff' }}>
                  {evalItem.criterionName}
                </h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    padding: '3px 10px',
                    borderRadius: '6px',
                    background: `${critColor}20`,
                    color: critColor,
                    border: `1px solid ${critColor}40`
                  }}>
                    {evalItem.score} / {evalItem.maxScore}
                  </div>
                </div>
              </div>

              {/* Citations / Evidence Chip */}
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#38bdf8', textTransform: 'uppercase', marginBottom: '4px' }}>
                  🔍 Evidence from your design:
                </div>
                <div style={{
                  background: 'rgba(56, 189, 248, 0.08)',
                  border: '1px solid rgba(56, 189, 248, 0.2)',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  fontSize: '0.85rem',
                  color: '#bae6fd'
                }}>
                  {evalItem.evidence || 'Analyzed candidate design specifications.'}
                </div>
              </div>

              {/* Concern Alert */}
              {evalItem.concern && evalItem.concern !== 'None' && (
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#f87171', textTransform: 'uppercase', marginBottom: '4px' }}>
                    ⚠️ Potential Failure Mode / Smell:
                  </div>
                  <div style={{
                    background: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    fontSize: '0.85rem',
                    color: '#fca5a5'
                  }}>
                    {evalItem.concern}
                  </div>
                </div>
              )}

              {/* Suggestion Card */}
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#34d399', textTransform: 'uppercase', marginBottom: '4px' }}>
                  💡 Actionable Suggestion for Next Attempt:
                </div>
                <div style={{
                  background: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  fontSize: '0.85rem',
                  color: '#a7f3d0'
                }}>
                  {evalItem.suggestion}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

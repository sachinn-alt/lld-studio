import React from 'react';

export interface ProblemItem {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  estimatedTime: string;
  summary: string;
  functionalRequirements: string[];
  nonFunctionalRequirements: string[];
  rubric: {
    criteria: Array<{
      id: string;
      name: string;
      description: string;
      weight: number;
    }>;
  };
}

interface ProblemCatalogProps {
  problems: ProblemItem[];
  onSelectProblem: (problemId: string) => void;
  loading: boolean;
}

export const ProblemCatalog: React.FC<ProblemCatalogProps> = ({
  problems,
  onSelectProblem,
  loading
}) => {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>
      {/* Hero Banner */}
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <div style={{
          display: 'inline-block',
          padding: '4px 14px',
          borderRadius: '9999px',
          background: 'rgba(99, 102, 241, 0.1)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          color: '#a5b4fc',
          fontSize: '0.85rem',
          fontWeight: 600,
          marginBottom: '16px'
        }}>
          DELIBERATE PRACTICE FOR LOW-LEVEL DESIGN
        </div>
        <h1 style={{ fontSize: '2.5rem', color: '#fff', marginBottom: '16px' }}>
          Master Object-Oriented Architecture
        </h1>
        <p style={{ maxWidth: '700px', margin: '0 auto', color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: '1.6' }}>
          Unlike DSA, Low-Level Design has no single binary answer. Practice structured system decomposition, submit your classes and interfaces, and receive <strong>evidence-backed rubric critiques</strong> to iteratively refine your design.
        </p>
      </div>

      {/* Problem Cards Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
          Loading curated LLD problem catalog...
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '24px'
        }}>
          {problems.map((problem) => {
            const diffClass = problem.difficulty === 'Easy' ? 'badge-easy' : problem.difficulty === 'Medium' ? 'badge-medium' : 'badge-hard';

            return (
              <div
                key={problem.id}
                id={`problem-card-${problem.id}`}
                className="glass-panel"
                style={{
                  padding: '28px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'transform 0.2s ease, border-color 0.2s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.5)';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div>
                  {/* Card Meta */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <span className={`badge ${diffClass}`}>
                      {problem.difficulty}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                      ⏱️ {problem.estimatedTime}
                    </span>
                  </div>

                  {/* Title & Summary */}
                  <h3 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '10px' }}>
                    {problem.title}
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: 1.5 }}>
                    {problem.summary}
                  </p>

                  {/* Rubric Criteria Highlights */}
                  <div style={{ marginBottom: '24px' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '8px' }}>
                      Evaluated Dimensions:
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {problem.rubric.criteria.map((c) => (
                        <span
                          key={c.id}
                          style={{
                            fontSize: '0.75rem',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            color: '#cbd5e1',
                            border: '1px solid rgba(255, 255, 255, 0.08)'
                          }}
                        >
                          {c.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  id={`btn-start-${problem.id}`}
                  onClick={() => onSelectProblem(problem.id)}
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                >
                  Start Practice Attempt →
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

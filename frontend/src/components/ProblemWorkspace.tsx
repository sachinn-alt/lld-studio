import React, { useState } from 'react';
import { ProblemItem } from './ProblemCatalog.js';

interface ProblemWorkspaceProps {
  problem: ProblemItem;
  attemptNumber: number;
  starterTemplate?: any;
  onSubmit: (payload: any) => Promise<void>;
  isSubmitting: boolean;
  status: string;
}

export const ProblemWorkspace: React.FC<ProblemWorkspaceProps> = ({
  problem,
  attemptNumber,
  starterTemplate,
  onSubmit,
  isSubmitting,
  status
}) => {
  const [activeTab, setActiveTab] = useState<'entities' | 'interfaces' | 'patterns' | 'tradeoffs' | 'code'>('entities');

  // Form State
  const [entities, setEntities] = useState<Array<{ name: string; responsibility: string }>>([
    { name: '', responsibility: '' }
  ]);
  const [interfaces, setInterfaces] = useState<Array<{ name: string; methods: string }>>([
    { name: '', methods: '' }
  ]);
  const [designPatterns, setDesignPatterns] = useState<Array<{ name: string; justification: string }>>([
    { name: '', justification: '' }
  ]);
  const [tradeOffs, setTradeOffs] = useState<string>('');
  const [codeSnippet, setCodeSnippet] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Auto-fill Starter Template
  const handleLoadTemplate = () => {
    if (!starterTemplate) return;
    setEntities(starterTemplate.entities || []);
    setInterfaces(
      (starterTemplate.interfaces || []).map((i: any) => ({
        name: i.name,
        methods: Array.isArray(i.methods) ? i.methods.join('\n') : i.methods
      }))
    );
    setDesignPatterns(starterTemplate.designPatterns || []);
    setTradeOffs(starterTemplate.tradeOffsAndAssumptions || '');
    setCodeSnippet(
      starterTemplate.codeSnippet ||
        `// High-level execution flow\nclass MainDemo {\n  public static void main(String[] args) {\n    // Setup dependencies\n  }\n}`
    );
    setValidationError(null);
  };

  const handleAddEntity = () => setEntities([...entities, { name: '', responsibility: '' }]);
  const handleRemoveEntity = (index: number) => setEntities(entities.filter((_, i) => i !== index));

  const handleAddInterface = () => setInterfaces([...interfaces, { name: '', methods: '' }]);
  const handleRemoveInterface = (index: number) => setInterfaces(interfaces.filter((_, i) => i !== index));

  const handleAddPattern = () => setDesignPatterns([...designPatterns, { name: '', justification: '' }]);
  const handleRemovePattern = (index: number) => setDesignPatterns(designPatterns.filter((_, i) => i !== index));

  const handleSubmit = async () => {
    setValidationError(null);

    // Basic client-side validation
    const validEntities = entities.filter(e => e.name.trim().length > 0);
    if (validEntities.length === 0) {
      setValidationError('Please define at least one core domain entity.');
      setActiveTab('entities');
      return;
    }

    const validInterfaces = interfaces.filter(i => i.name.trim().length > 0);
    if (validInterfaces.length === 0) {
      setValidationError('Please define at least one interface to demonstrate abstraction.');
      setActiveTab('interfaces');
      return;
    }

    if (tradeOffs.trim().length < 10) {
      setValidationError('Please explain your design trade-offs and assumptions (min 10 characters).');
      setActiveTab('tradeoffs');
      return;
    }

    const payload = {
      entities: validEntities,
      interfaces: validInterfaces.map(i => ({
        name: i.name,
        methods: i.methods.split('\n').map(m => m.trim()).filter(Boolean)
      })),
      designPatterns: designPatterns.filter(p => p.name.trim().length > 0),
      tradeOffsAndAssumptions: tradeOffs,
      codeSnippetOrPseudocode: codeSnippet
    };

    await onSubmit(payload);
  };

  return (
    <div style={{
      maxWidth: '1440px',
      margin: '0 auto',
      padding: '24px',
      display: 'grid',
      gridTemplateColumns: 'minmax(400px, 1fr) minmax(550px, 1.35fr)',
      gap: '24px',
      alignItems: 'start'
    }}>
      {/* Left Panel: Problem Statement & Rubric */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span className="badge badge-medium">
              {problem.difficulty}
            </span>
            <span className="status-pill status-draft">
              ATTEMPT #{attemptNumber} • {status}
            </span>
          </div>

          <h2 style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '8px' }}>
            {problem.title}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px', lineHeight: 1.5 }}>
            {problem.summary}
          </p>

          {/* Functional Requirements */}
          <h4 style={{ fontSize: '0.9rem', color: '#38bdf8', textTransform: 'uppercase', marginBottom: '8px' }}>
            Functional Requirements:
          </h4>
          <ul style={{ paddingLeft: '18px', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {problem.functionalRequirements.map((req, i) => (
              <li key={i}>{req}</li>
            ))}
          </ul>

          {/* Non-Functional Requirements */}
          <h4 style={{ fontSize: '0.9rem', color: '#a78bfa', textTransform: 'uppercase', marginBottom: '8px' }}>
            Non-Functional Invariants:
          </h4>
          <ul style={{ paddingLeft: '18px', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {problem.nonFunctionalRequirements.map((req, i) => (
              <li key={i}>{req}</li>
            ))}
          </ul>
        </div>

        {/* Evaluation Rubric Reference Card */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <h4 style={{ fontSize: '0.9rem', color: '#fff', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>📋 Grading Rubric (How You'll Be Evaluated)</span>
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {problem.rubric.criteria.map((c) => (
              <div key={c.id} style={{
                background: 'rgba(255, 255, 255, 0.03)',
                padding: '10px 12px',
                borderRadius: '6px',
                border: '1px solid var(--border-subtle)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f8fafc' }}>
                    {c.name}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                    Weight: {c.weight}%
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {c.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel: Structured Design Studio */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', color: '#fff' }}>
              Design Workspace
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
              Structured Object-Oriented Decomposition
            </span>
          </div>

          <button
            id="btn-load-template"
            onClick={handleLoadTemplate}
            className="btn btn-outline"
            style={{ fontSize: '0.8rem', padding: '6px 12px' }}
          >
            ⚡ Load Baseline Design
          </button>
        </div>

        {/* Validation Alert */}
        {validationError && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            borderRadius: '8px',
            padding: '10px 14px',
            color: '#fca5a5',
            fontSize: '0.85rem',
            marginBottom: '16px'
          }}>
            ⚠️ {validationError}
          </div>
        )}

        {/* Studio Sub-Tabs */}
        <div style={{
          display: 'flex',
          gap: '6px',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '12px',
          marginBottom: '20px',
          overflowX: 'auto'
        }}>
          {[
            { id: 'entities', label: `Entities (${entities.filter(e => e.name).length})` },
            { id: 'interfaces', label: `Interfaces (${interfaces.filter(i => i.name).length})` },
            { id: 'patterns', label: `Patterns (${designPatterns.filter(p => p.name).length})` },
            { id: 'tradeoffs', label: 'Trade-offs' },
            { id: 'code', label: 'Pseudocode' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className="btn"
              style={{
                padding: '6px 12px',
                fontSize: '0.8rem',
                borderRadius: '6px',
                background: activeTab === tab.id ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                color: activeTab === tab.id ? '#a5b4fc' : 'var(--text-muted)',
                borderColor: activeTab === tab.id ? 'var(--primary)' : 'transparent'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Entities */}
        {activeTab === 'entities' && (
          <div className="fade-in">
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
              Define the core domain classes and assign each class a focused single responsibility (SRP).
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '14px' }}>
              {entities.map((entity, index) => (
                <div key={index} style={{
                  display: 'grid',
                  gridTemplateColumns: '180px 1fr 36px',
                  gap: '10px',
                  alignItems: 'center'
                }}>
                  <input
                    type="text"
                    placeholder="Class name (e.g. ParkingLot)"
                    className="input-field"
                    value={entity.name}
                    onChange={(e) => {
                      const updated = [...entities];
                      updated[index].name = e.target.value;
                      setEntities(updated);
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Single Responsibility (What does it own?)"
                    className="input-field"
                    value={entity.responsibility}
                    onChange={(e) => {
                      const updated = [...entities];
                      updated[index].responsibility = e.target.value;
                      setEntities(updated);
                    }}
                  />
                  <button
                    onClick={() => handleRemoveEntity(index)}
                    className="btn btn-outline"
                    style={{ padding: '8px', color: '#f87171' }}
                    title="Remove entity"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <button onClick={handleAddEntity} className="btn btn-secondary" style={{ fontSize: '0.8rem' }}>
              + Add Another Class
            </button>
          </div>
        )}

        {/* Tab 2: Interfaces */}
        {activeTab === 'interfaces' && (
          <div className="fade-in">
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
              Declare polymorphic interfaces and contracts to decouple high-level coordinators from concrete logic (DIP & OCP).
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '14px' }}>
              {interfaces.map((iface, index) => (
                <div key={index} style={{
                  background: 'rgba(15, 23, 42, 0.4)',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-subtle)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <input
                      type="text"
                      placeholder="Interface name (e.g. IParkingStrategy)"
                      className="input-field"
                      style={{ maxWidth: '280px' }}
                      value={iface.name}
                      onChange={(e) => {
                        const updated = [...interfaces];
                        updated[index].name = e.target.value;
                        setInterfaces(updated);
                      }}
                    />
                    <button
                      onClick={() => handleRemoveInterface(index)}
                      className="btn btn-outline"
                      style={{ padding: '4px 10px', color: '#f87171', fontSize: '0.8rem' }}
                    >
                      Remove
                    </button>
                  </div>
                  <textarea
                    placeholder="Method signatures (one per line, e.g. findSpot(VehicleType type): Optional<ParkingSpot>)"
                    className="textarea-field"
                    rows={3}
                    value={iface.methods}
                    onChange={(e) => {
                      const updated = [...interfaces];
                      updated[index].methods = e.target.value;
                      setInterfaces(updated);
                    }}
                  />
                </div>
              ))}
            </div>
            <button onClick={handleAddInterface} className="btn btn-secondary" style={{ fontSize: '0.8rem' }}>
              + Add Another Interface
            </button>
          </div>
        )}

        {/* Tab 3: Design Patterns */}
        {activeTab === 'patterns' && (
          <div className="fade-in">
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
              Specify design patterns (Strategy, Factory, State, Observer) with clear engineering justification.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '14px' }}>
              {designPatterns.map((pat, index) => (
                <div key={index} style={{
                  display: 'grid',
                  gridTemplateColumns: '180px 1fr 36px',
                  gap: '10px',
                  alignItems: 'center'
                }}>
                  <input
                    type="text"
                    placeholder="Pattern (e.g. Strategy)"
                    className="input-field"
                    value={pat.name}
                    onChange={(e) => {
                      const updated = [...designPatterns];
                      updated[index].name = e.target.value;
                      setDesignPatterns(updated);
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Why this pattern fits (what variation does it encapsulate?)"
                    className="input-field"
                    value={pat.justification}
                    onChange={(e) => {
                      const updated = [...designPatterns];
                      updated[index].justification = e.target.value;
                      setDesignPatterns(updated);
                    }}
                  />
                  <button
                    onClick={() => handleRemovePattern(index)}
                    className="btn btn-outline"
                    style={{ padding: '8px', color: '#f87171' }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <button onClick={handleAddPattern} className="btn btn-secondary" style={{ fontSize: '0.8rem' }}>
              + Add Another Pattern
            </button>
          </div>
        )}

        {/* Tab 4: Trade-offs & Assumptions */}
        {activeTab === 'tradeoffs' && (
          <div className="fade-in">
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
              Detail your concurrency invariants, race condition protections, and why you chose your design over alternatives.
            </p>
            <textarea
              className="textarea-field"
              rows={8}
              placeholder="Explain how your design handles race conditions, edge cases, thread safety, or performance trade-offs..."
              value={tradeOffs}
              onChange={(e) => setTradeOffs(e.target.value)}
            />
          </div>
        )}

        {/* Tab 5: Pseudocode */}
        {activeTab === 'code' && (
          <div className="fade-in">
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
              Optional: Provide code snippets or execution pseudocode showing how classes interact.
            </p>
            <textarea
              className="textarea-field"
              rows={10}
              placeholder="// Write pseudocode or class definitions..."
              value={codeSnippet}
              onChange={(e) => setCodeSnippet(e.target.value)}
            />
          </div>
        )}

        {/* Submission Bottom Actions */}
        <div style={{
          marginTop: '28px',
          paddingTop: '20px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
            Submission triggers two-stage deterministic + rubric evaluation
          </span>

          <button
            id="btn-submit-solution"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="btn btn-primary"
            style={{ padding: '12px 28px', fontSize: '0.95rem' }}
          >
            {isSubmitting ? 'Evaluating Design...' : 'Submit Design for Feedback →'}
          </button>
        </div>
      </div>
    </div>
  );
};

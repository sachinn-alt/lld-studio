import React from 'react';

interface NavbarProps {
  activeTab: 'catalog' | 'workspace' | 'history';
  setActiveTab: (tab: 'catalog' | 'workspace' | 'history') => void;
  hasActiveAttempt: boolean;
  activeProblemTitle?: string;
  attemptNumber?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  hasActiveAttempt,
  activeProblemTitle,
  attemptNumber
}) => {
  return (
    <header style={{
      borderBottom: '1px solid var(--border-subtle)',
      background: 'rgba(10, 15, 29, 0.85)',
      backdropFilter: 'blur(16px)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      padding: '12px 24px'
    }}>
      <div style={{
        maxWidth: '1440px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Logo & Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '1.1rem',
            color: '#fff',
            boxShadow: '0 0 15px rgba(99, 102, 241, 0.5)'
          }}>
            LLD
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.1rem', color: '#fff' }}>
                Studio
              </span>
              <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(99, 102, 241, 0.2)', color: '#a5b4fc', border: '1px solid rgba(99, 102, 241, 0.4)' }}>
                MVP PROTOTYPE
              </span>
            </div>
            {activeProblemTitle && (
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Active: {activeProblemTitle} {attemptNumber ? `(Attempt #${attemptNumber})` : ''}
              </div>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', gap: '8px' }}>
          <button
            id="nav-catalog-btn"
            onClick={() => setActiveTab('catalog')}
            className={`btn ${activeTab === 'catalog' ? 'btn-primary' : 'btn-outline'}`}
            style={{ padding: '8px 14px', fontSize: '0.85rem' }}
          >
            Problem Catalog
          </button>
          
          <button
            id="nav-workspace-btn"
            onClick={() => setActiveTab('workspace')}
            disabled={!hasActiveAttempt}
            className={`btn ${activeTab === 'workspace' ? 'btn-primary' : 'btn-outline'}`}
            style={{ padding: '8px 14px', fontSize: '0.85rem', opacity: hasActiveAttempt ? 1 : 0.5 }}
          >
            Practice Workspace
          </button>

          <button
            id="nav-history-btn"
            onClick={() => setActiveTab('history')}
            disabled={!hasActiveAttempt}
            className={`btn ${activeTab === 'history' ? 'btn-primary' : 'btn-outline'}`}
            style={{ padding: '8px 14px', fontSize: '0.85rem', opacity: hasActiveAttempt ? 1 : 0.5 }}
          >
            Attempt History
          </button>
        </nav>
      </div>
    </header>
  );
};

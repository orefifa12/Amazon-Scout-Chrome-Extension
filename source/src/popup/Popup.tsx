import React, { useState, useEffect } from 'react';
import { Session, Listing } from '../types';
import './Popup.css';

const Popup: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [listings, setListings] = useState<Record<string, Listing>>({});
  const [newSessionName, setNewSessionName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    chrome.storage.local.get(['sessions', 'activeSessionId', 'listings'], (result) => {
      if (result.sessions) setSessions(result.sessions);
      if (result.activeSessionId) setActiveSessionId(result.activeSessionId);
      if (result.listings) setListings(result.listings);
      setIsLoading(false);
    });
  }, []);

  // Listen for real-time updates from content script
  useEffect(() => {
    const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }, namespace: string) => {
      if (namespace === 'local') {
        if (changes.listings) {
          setListings(changes.listings.newValue || {});
        }
        if (changes.activeSessionId) {
          setActiveSessionId(changes.activeSessionId.newValue || null);
        }
        if (changes.sessions) {
          setSessions(changes.sessions.newValue || []);
        }
      }
    };
    chrome.storage.onChanged.addListener(handleStorageChange);
    return () => chrome.storage.onChanged.removeListener(handleStorageChange);
  }, []);

  const handleCreateSession = () => {
    if (!newSessionName.trim()) return;

    const newSession: Session = {
      id: `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: newSessionName.trim(),
      status: 'active',
      createdAt: Date.now()
    };

    const updatedSessions = [...sessions, newSession];
    
    chrome.storage.local.set({
      sessions: updatedSessions,
      activeSessionId: newSession.id
    }, () => {
      setSessions(updatedSessions);
      setActiveSessionId(newSession.id);
      setNewSessionName('');
    });
  };

  const handleSelectSession = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    chrome.storage.local.set({ activeSessionId: id || null }, () => {
      setActiveSessionId(id || null);
    });
  };

  const handleCompleteSession = () => {
    if (!activeSessionId) return;

    const updatedSessions = sessions.map(s => 
      s.id === activeSessionId ? { ...s, status: 'completed' as const } : s
    );

    chrome.storage.local.set({
      sessions: updatedSessions,
      activeSessionId: null
    }, () => {
      setSessions(updatedSessions);
      setActiveSessionId(null);
    });
  };

  const handleDeleteItem = (asin: string) => {
    const updatedListings = { ...listings };
    delete updatedListings[asin];
    chrome.storage.local.set({ listings: updatedListings }, () => {
      setListings(updatedListings);
    });
  };

  const handleExportCSV = () => {
    if (!activeSessionId) return;
    const activeSession = sessions.find(s => s.id === activeSessionId);
    if (!activeSession) return;

    const sessionListings = Object.values(listings).filter(
      item => item.sessionId === activeSessionId
    );

    if (sessionListings.length === 0) {
      alert("No products have been added to this session yet.");
      return;
    }

    // Generate CSV contents
    const headers = ["ASIN", "Product Name", "Status", "Custom Notes", "URL", "Date Tracked"];
    const rows = sessionListings.map(item => {
      const statusText = item.status === 'green' ? 'Considering' : item.status === 'red' ? 'Skip' : 'Undecided';
      const cleanTitle = (item.title || `Product ${item.asin}`).replace(/"/g, '""');
      const cleanNote = (item.note || '').replace(/"/g, '""');
      const cleanUrl = item.url || `https://www.amazon.com/dp/${item.asin}`;
      const dateText = new Date(item.updatedAt).toLocaleString();

      return [
        `"${item.asin}"`,
        `"${cleanTitle}"`,
        `"${statusText}"`,
        `"${cleanNote}"`,
        `"${cleanUrl}"`,
        `"${dateText}"`
      ];
    });

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const sanitizedSessionName = activeSession.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    link.setAttribute("download", `amazon_scout_${sanitizedSessionName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="popup-container flex items-center justify-center h-[550px] bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  const activeSessions = sessions.filter(s => s.status === 'active');
  const activeSession = sessions.find(s => s.id === activeSessionId);
  const activeSessionListings = Object.values(listings).filter(
    item => item.sessionId === activeSessionId
  );

  return (
    <div className="popup-container flex flex-col h-[550px] bg-slate-50 text-slate-800">
      <header className="bg-gradient-to-r from-orange-500 to-orange-400 p-4 shadow-md flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h1 className="text-xl font-bold tracking-tight">Amazon Scout</h1>
          </div>
        </div>
        <p className="text-orange-100 text-sm mt-1 font-medium text-left">Track & Annotate Products</p>
      </header>

      <main className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto">
        {/* Active Session Card */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Session</h2>
            {activeSession && activeSessionListings.length > 0 && (
              <button 
                onClick={handleExportCSV}
                className="text-xs text-orange-600 hover:text-orange-700 font-bold flex items-center gap-1 transition-colors"
                title="Export list to CSV"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                CSV Export
              </button>
            )}
          </div>
          
          <div className="flex flex-col gap-3">
            <select
              className="w-full border border-slate-300 rounded-lg p-2 bg-slate-50 text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
              value={activeSessionId || ''}
              onChange={handleSelectSession}
            >
              <option value="">-- No Active Session Selected --</option>
              {activeSessions.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>

            {activeSession && (
              <button
                onClick={handleCompleteSession}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-1.5 rounded-lg font-medium text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Mark Session as Completed
              </button>
            )}
          </div>
        </section>

        {/* Tracked Items in This Session */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex-1 flex flex-col min-h-[180px] overflow-hidden">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
            Tracked in Session ({activeSessionListings.length})
          </h2>
          
          {!activeSessionId ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4 bg-amber-50/50 rounded-lg border border-dashed border-amber-200">
              <span className="text-xl">⚠️</span>
              <p className="text-xs font-bold text-amber-800 mt-1">Active Session Mandated</p>
              <p className="text-[11px] text-amber-600 mt-0.5 max-w-[240px]">
                You must select or create an active shopping session before items can be added.
              </p>
            </div>
          ) : activeSessionListings.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4 bg-slate-50 rounded-lg border border-dashed border-slate-200">
              <svg className="w-8 h-8 text-slate-300 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <p className="text-xs font-semibold text-slate-400">No items tracked yet</p>
              <p className="text-[10px] text-slate-400 max-w-[200px]">Go to an Amazon product page to track and annotate it!</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {activeSessionListings.map(item => {
                const badgeColor = item.status === 'green' ? 'bg-emerald-500 text-white' : item.status === 'red' ? 'bg-rose-500 text-white' : 'bg-slate-400 text-white';
                const badgeLabel = item.status === 'green' ? 'Consider' : item.status === 'red' ? 'Skip' : 'Undecided';
                return (
                  <div key={item.asin} className="p-2 bg-slate-50 rounded-lg border border-slate-200 flex flex-col gap-1 text-left relative group">
                    <div className="flex items-start justify-between gap-1">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${badgeColor} flex-shrink-0`}>
                        {badgeLabel}
                      </span>
                      <button 
                        onClick={() => handleDeleteItem(item.asin)}
                        className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 transition-opacity absolute right-2 top-2"
                        title="Remove tracker"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                    <a 
                      href={item.url || `https://www.amazon.com/dp/${item.asin}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-xs font-bold text-slate-700 hover:text-orange-500 line-clamp-2 leading-tight pr-5 hover:underline"
                    >
                      {item.title || `Product (${item.asin})`}
                    </a>
                    {item.note && (
                      <p className="text-[11px] text-slate-500 bg-white p-1 rounded border border-slate-100 line-clamp-2">
                        💡 {item.note}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Create Session Card */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mt-auto">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">Create New Session</h2>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. Back-to-school list, Work desk..."
              className="flex-1 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
              value={newSessionName}
              onChange={(e) => setNewSessionName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateSession()}
            />
            <button
              onClick={handleCreateSession}
              disabled={!newSessionName.trim()}
              className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 py-1.5 rounded-lg font-bold text-xs transition-colors shadow-sm"
            >
              Start
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Popup;
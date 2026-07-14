// Amazon Scout Content Script
import { Session, Listing, ListingStatus } from '../types';

console.log('[Amazon Scout] Content script loaded on Amazon.');

let activeSessionId: string | null = null;
let activeSessionName: string = '';
let listings: Record<string, Listing> = {};
let availableSessions: Session[] = [];

// Panel tracking mode: 'compact' or 'edit'
let panelViewMode: Record<string, 'compact' | 'edit'> = {};

// Helper to check if extension context is valid
const isContextValid = (): boolean => typeof chrome !== 'undefined' && chrome.runtime && !!chrome.runtime.id;

// CSS Injection for badges, panels, animations, and toast feedback
const injectStyles = () => {
  if (document.getElementById('amazon-scout-styles')) return;
  const style = document.createElement('style');
  style.id = 'amazon-scout-styles';
  style.textContent = `
    @keyframes scoutFadeIn {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes scoutSuccessPulse {
      0% { box-shadow: 0 0 0 0 rgba(249, 115, 22, 0.4); }
      70% { box-shadow: 0 0 0 8px rgba(249, 115, 22, 0); }
      100% { box-shadow: 0 0 0 0 rgba(249, 115, 22, 0); }
    }
    @keyframes scoutSavedPop {
      0% { transform: scale(0.9); opacity: 0; }
      50% { transform: scale(1.05); opacity: 1; }
      100% { transform: scale(1); opacity: 1; }
    }

    /* Docked side tab: fixed to the right edge, follows scroll, collapsible */
    #amazon-scout-panel-container {
      position: fixed;
      top: 50%;
      right: 0;
      transform: translateY(-50%);
      z-index: 2147483000;
      display: flex;
      align-items: center;
      font-family: system-ui, sans-serif;
      transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
    }
    #amazon-scout-panel-container.collapsed {
      transform: translateY(-50%) translateX(340px);
    }
    #amazon-scout-panel-container .amazon-scout-panel {
      margin: 0;
      width: 340px;
      max-height: 85vh;
      overflow-y: auto;
      border-radius: 12px 0 0 12px;
    }
    .amazon-scout-dock-handle {
      flex-shrink: 0;
      align-self: center;
      background: #f97316;
      color: #fff;
      padding: 14px 7px;
      border-radius: 8px 0 0 8px;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      box-shadow: -2px 2px 12px rgba(0,0,0,0.18);
      user-select: none;
      transition: background 0.2s;
    }
    .amazon-scout-dock-handle:hover { background: #ea580c; }
    .amazon-scout-dock-chevron {
      font-size: 15px;
      font-weight: 800;
      line-height: 1;
    }
    .amazon-scout-dock-label {
      writing-mode: vertical-rl;
      text-orientation: mixed;
      transform: rotate(180deg);
      font-weight: 800;
      font-size: 11px;
      letter-spacing: 1.5px;
    }

    .amazon-scout-panel {
      margin: 16px 0;
      padding: 16px;
      background: #ffffff;
      border: 2px solid #f97316;
      border-radius: 12px;
      font-family: system-ui, sans-serif;
      box-shadow: 0 4px 20px rgba(249, 115, 22, 0.08);
      position: relative;
      animation: scoutFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      box-sizing: border-box;
    }
    .amazon-scout-panel-header {
      font-size: 14px;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }
    .amazon-scout-session-pill {
      background: #ffedd5;
      color: #ea580c;
      padding: 3px 8px;
      border-radius: 6px;
      font-weight: 800;
      font-size: 12px;
    }
    .amazon-scout-panel-buttons {
      display: flex;
      gap: 8px;
      margin-bottom: 12px;
    }
    .amazon-scout-btn {
      flex: 1;
      padding: 10px;
      border: 2px solid transparent;
      border-radius: 8px;
      font-weight: 700;
      font-size: 12px;
      cursor: pointer;
      color: white;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      outline: none;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
    }
    .amazon-scout-btn-green { background-color: #10b981; }
    .amazon-scout-btn-red { background-color: #ef4444; }
    .amazon-scout-btn-gray { background-color: #6b7280; }
    .amazon-scout-btn:hover { opacity: 0.9; transform: translateY(-1px); }
    .amazon-scout-btn.active { 
      border-color: #1e293b !important;
      box-shadow: 0 0 0 3px rgba(30, 41, 59, 0.3) !important;
    }
    .amazon-scout-textarea {
      width: 100%;
      padding: 10px;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      font-size: 13px;
      resize: vertical;
      min-height: 70px;
      box-sizing: border-box;
      outline: none;
      font-family: inherit;
      margin-bottom: 10px;
      transition: border-color 0.2s;
    }
    .amazon-scout-textarea:focus {
      border-color: #f97316;
    }
    .amazon-scout-save-bar {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 10px;
    }
    .amazon-scout-save-lock-btn {
      background: #ea580c;
      color: white;
      font-weight: bold;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      font-size: 12px;
      cursor: pointer;
      transition: background 0.2s;
    }
    .amazon-scout-save-lock-btn:hover {
      background: #c2410c;
    }
    
    /* Compact mode elements */
    .amazon-scout-compact-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 12px;
      margin-top: 4px;
    }
    .amazon-scout-status-indicator {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 9999px;
    }
    .amazon-scout-status-indicator.status-green { background: #d1fae5; color: #065f46; }
    .amazon-scout-status-indicator.status-red { background: #fee2e2; color: #991b1b; }
    .amazon-scout-status-indicator.status-gray { background: #f1f5f9; color: #334155; }
    
    .amazon-scout-note-preview {
      margin-top: 8px;
      padding: 8px;
      background: #ffffff;
      border-left: 3px solid #cbd5e1;
      font-size: 12px;
      color: #475569;
      border-radius: 0 4px 4px 0;
      line-height: 1.4;
    }
    .amazon-scout-edit-trigger {
      background: none;
      border: none;
      color: #ea580c;
      font-size: 11px;
      font-weight: 700;
      cursor: pointer;
      padding: 4px 8px;
      border-radius: 4px;
      transition: background 0.2s;
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
    .amazon-scout-edit-trigger:hover {
      background: #ffedd5;
    }

    /* Embedded session selector styles */
    .amazon-scout-inline-setup {
      background: #fffbeb;
      border: 1px solid #fef3c7;
      border-radius: 8px;
      padding: 12px;
      margin-top: 8px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .amazon-scout-inline-select {
      width: 100%;
      padding: 8px;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
      background: white;
    }
    .amazon-scout-inline-create {
      display: flex;
      gap: 6px;
    }
    .amazon-scout-inline-input {
      flex: 1;
      padding: 6px 10px;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      font-size: 12px;
    }
    .amazon-scout-inline-btn {
      background: #f97316;
      color: white;
      border: none;
      padding: 6px 12px;
      border-radius: 6px;
      font-weight: bold;
      font-size: 11px;
      cursor: pointer;
    }
    .amazon-scout-inline-btn:hover {
      background: #ea580c;
    }

    /* Feedback Toast */
    .amazon-scout-feedback-toast {
      position: absolute;
      top: 10px;
      right: 10px;
      background: #1e293b;
      color: #10b981;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 800;
      display: flex;
      align-items: center;
      gap: 4px;
      box-shadow: 0 4px 10px rgba(0,0,0,0.15);
      animation: scoutSavedPop 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
      pointer-events: none;
      z-index: 100;
    }
  `;
  document.head.appendChild(style);
};

// Show temporary saved toast message inside the panel container
const triggerSaveFeedback = (container: HTMLElement) => {
  // Remove existing toast if any
  const existing = container.querySelector('.amazon-scout-feedback-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'amazon-scout-feedback-toast';
  toast.innerHTML = `
    <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="3">
      <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path>
    </svg>
    Saved Successfully!
  `;
  container.appendChild(toast);

  // Add momentary green glow animation to the panel itself
  const panel = container.querySelector('.amazon-scout-panel');
  if (panel) {
    (panel as HTMLElement).style.animation = 'scoutSuccessPulse 0.6s ease-out';
    setTimeout(() => {
      (panel as HTMLElement).style.animation = '';
    }, 600);
  }

  setTimeout(() => {
    toast.remove();
  }, 2200);
};

// Save listing data and automatically sync state
const saveListing = (asin: string, status: ListingStatus, note: string, triggerFeedback: boolean = true) => {
  if (!isContextValid() || !activeSessionId) return;

  let title = '';
  const titleEl = document.getElementById('productTitle') || document.getElementById('title');
  if (titleEl) {
    title = titleEl.textContent?.trim() || '';
  }
  
  const url = window.location.href;

  chrome.storage.local.get(['listings'], (result) => {
    const currentListings = result.listings || {};
    const existingListing = currentListings[asin];
    const finalTitle = title || existingListing?.title || `Product (${asin})`;
    const finalUrl = url.includes(asin) ? url : existingListing?.url || `https://www.amazon.com/dp/${asin}`;

    const updatedListings = {
      ...currentListings,
      [asin]: {
        asin,
        sessionId: activeSessionId!,
        status,
        note,
        updatedAt: Date.now(),
        title: finalTitle,
        url: finalUrl
      }
    };

    // Keep the listing in memory with active session mapping
    chrome.storage.local.set({ listings: updatedListings }, () => {
      console.log(`[Amazon Scout] Updated decision for ASIN ${asin}: ${status}`);
      listings = updatedListings;
      
      const container = document.getElementById('amazon-scout-panel-container');
      if (container) {
        if (triggerFeedback) {
          triggerSaveFeedback(container);
        }
        renderPanel(container, asin);
      }
    });
  });
};

// Inject Product Page Panel
const injectProductPanel = () => {
  if (document.getElementById('amazon-scout-panel-container')) return;
  
  const asinInput = document.getElementById('ASIN') as HTMLInputElement;
  const asin = asinInput ? asinInput.value : null;
  if (!asin) return;

  console.log(`[Amazon Scout] Injecting interactive workspace for ASIN: ${asin}`);

  // Dock to the page body so it stays fixed on the right edge and follows scroll,
  // instead of pushing Amazon's own content around.
  const container = document.createElement('div');
  container.id = 'amazon-scout-panel-container';
  document.body.appendChild(container);

  renderPanel(container, asin);
};

// Persisted (per page load) collapsed state of the docked panel
let dockCollapsed = false;

// Build the vertical tab handle used to expand/collapse the docked panel
const buildDockHandle = (container: HTMLElement) => {
  const handle = document.createElement('div');
  handle.className = 'amazon-scout-dock-handle';
  handle.title = 'Toggle Amazon Scout panel';

  const chevron = document.createElement('span');
  chevron.className = 'amazon-scout-dock-chevron';
  chevron.textContent = dockCollapsed ? '\u2039' : '\u203A';

  const label = document.createElement('span');
  label.className = 'amazon-scout-dock-label';
  label.textContent = 'SCOUT';

  handle.appendChild(chevron);
  handle.appendChild(label);

  handle.addEventListener('click', () => {
    dockCollapsed = !dockCollapsed;
    container.classList.toggle('collapsed', dockCollapsed);
    chevron.textContent = dockCollapsed ? '\u2039' : '\u203A';
  });

  container.appendChild(handle);
};

const renderPanel = (container: HTMLElement, asin: string) => {
  container.innerHTML = '';
  container.classList.toggle('collapsed', dockCollapsed);
  buildDockHandle(container);
  
  // 1. NO ACTIVE SESSION STATE: Provide on-page Session Creator & Selector
  if (!activeSessionId) {
    const panel = document.createElement('div');
    panel.className = 'amazon-scout-panel';
    panel.style.border = '2px dashed #d97706';
    panel.style.background = '#fffbeb';

    const header = document.createElement('div');
    header.className = 'amazon-scout-panel-header';
    header.innerHTML = `
      <div style="display:flex; align-items:center; gap:6px; color:#b45309; font-weight:800;">
        <span style="font-size: 16px;">💡</span> Choose Shopping Session
      </div>
    `;

    const body = document.createElement('div');
    body.className = 'amazon-scout-inline-setup';
    body.innerHTML = `
      <p style="margin: 0 0 6px 0; font-size: 12px; font-weight:600; color: #92400e; line-height: 1.4;">
        To start tracking items on this page, choose an active session below or create a new session instantly!
      </p>
    `;

    // Dropdown to select existing session
    const select = document.createElement('select');
    select.className = 'amazon-scout-inline-select';
    
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = '-- Select Active Session --';
    select.appendChild(defaultOption);

    const activeSessions = availableSessions.filter(s => s.status === 'active');
    activeSessions.forEach(sess => {
      const option = document.createElement('option');
      option.value = sess.id;
      option.textContent = sess.name;
      select.appendChild(option);
    });

    select.addEventListener('change', (e) => {
      const chosenId = (e.target as HTMLSelectElement).value;
      if (chosenId) {
        chrome.storage.local.set({ activeSessionId: chosenId }, () => {
          activeSessionId = chosenId;
          const matched = availableSessions.find(s => s.id === chosenId);
          activeSessionName = matched ? matched.name : '';
          renderPanel(container, asin);
        });
      }
    });

    body.appendChild(select);

    // Or create a new session
    const createContainer = document.createElement('div');
    createContainer.className = 'amazon-scout-inline-create';
    
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Or quick start session name...';
    input.className = 'amazon-scout-inline-input';

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = 'Start';
    btn.className = 'amazon-scout-inline-btn';

    btn.addEventListener('click', () => {
      const val = input.value.trim();
      if (!val) return;

      const newSession: Session = {
        id: `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: val,
        status: 'active',
        createdAt: Date.now()
      };

      chrome.storage.local.get(['sessions'], (res) => {
        const currentSessions = res.sessions || [];
        const nextSessions = [...currentSessions, newSession];
        chrome.storage.local.set({
          sessions: nextSessions,
          activeSessionId: newSession.id
        }, () => {
          activeSessionId = newSession.id;
          activeSessionName = newSession.name;
          availableSessions = nextSessions;
          renderPanel(container, asin);
        });
      });
    });

    createContainer.appendChild(input);
    createContainer.appendChild(btn);
    body.appendChild(createContainer);

    panel.appendChild(header);
    panel.appendChild(body);
    container.appendChild(panel);
    return;
  }

  // 2. SESSION ACTIVE STATE
  const listing = listings[asin] && listings[asin].sessionId === activeSessionId ? listings[asin] : null;
  const currentStatus = listing?.status || null;
  const currentNote = listing?.note || '';
  const isCurrentlyTracked = currentStatus !== null || currentNote.trim() !== '';

  // Get view mode (default to compact if tracked and view mode is not already set)
  if (!panelViewMode[asin]) {
    panelViewMode[asin] = isCurrentlyTracked ? 'compact' : 'edit';
  }
  const currentMode = panelViewMode[asin];

  const panel = document.createElement('div');
  panel.className = 'amazon-scout-panel';

  const header = document.createElement('div');
  header.className = 'amazon-scout-panel-header';
  header.innerHTML = `
    <div style="display:flex; align-items:center; gap:6px;">
      <svg width="16" height="16" fill="none" stroke="#ea580c" viewBox="0 0 24 24" stroke-width="2.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path>
      </svg>
      <span style="font-weight: 700; color:#475569; font-size:13px;">Scout Workspace:</span>
      <span class="amazon-scout-session-pill">${activeSessionName}</span>
    </div>
  `;

  if (currentMode === 'compact') {
    // A: COMPACT MODE - Clean, highlights decision, hides complex inputs
    const compactCard = document.createElement('div');
    compactCard.className = 'amazon-scout-compact-card';

    // Choice pill
    let label = 'Undecided';
    let statusClass = 'status-gray';
    if (currentStatus === 'green') {
      label = 'Considering';
      statusClass = 'status-green';
    } else if (currentStatus === 'red') {
      label = 'Skip / Don\'t Want';
      statusClass = 'status-red';
    }

    const itemStatusRow = document.createElement('div');
    itemStatusRow.style.display = 'flex';
    itemStatusRow.style.justifyContent = 'space-between';
    itemStatusRow.style.alignItems = 'center';
    itemStatusRow.innerHTML = `
      <div class="amazon-scout-status-indicator ${statusClass}">
        <span style="width:8px; height:8px; border-radius:50%; background:currentColor;"></span>
        ${label}
      </div>
    `;

    // Edit decision & notes trigger
    const editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.className = 'amazon-scout-edit-trigger';
    editBtn.innerHTML = `
      <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
      </svg>
      Adjust Decision & Notes
    `;
    editBtn.addEventListener('click', (e) => {
      e.preventDefault();
      panelViewMode[asin] = 'edit';
      renderPanel(container, asin);
    });
    itemStatusRow.appendChild(editBtn);
    compactCard.appendChild(itemStatusRow);

    // Render Note if exists
    if (currentNote.trim()) {
      const notePreview = document.createElement('div');
      notePreview.className = 'amazon-scout-note-preview';
      notePreview.innerHTML = `<strong>Annotation:</strong> ${currentNote}`;
      compactCard.appendChild(notePreview);
    }

    panel.appendChild(header);
    panel.appendChild(compactCard);
  } else {
    // B: FULL EDIT MODE - Status selection and live notes
    const buttonsRow = document.createElement('div');
    buttonsRow.className = 'amazon-scout-panel-buttons';

    const btnGreen = document.createElement('button');
    btnGreen.type = 'button';
    btnGreen.className = `amazon-scout-btn amazon-scout-btn-green ${currentStatus === 'green' ? 'active' : ''}`;
    btnGreen.innerHTML = `👍 Considering`;

    const btnRed = document.createElement('button');
    btnRed.type = 'button';
    btnRed.className = `amazon-scout-btn amazon-scout-btn-red ${currentStatus === 'red' ? 'active' : ''}`;
    btnRed.innerHTML = `👎 Skip`;

    const btnGray = document.createElement('button');
    btnGray.type = 'button';
    btnGray.className = `amazon-scout-btn amazon-scout-btn-gray ${currentStatus === 'gray' ? 'active' : ''}`;
    btnGray.innerHTML = `❔ Undecided`;

    buttonsRow.append(btnGreen, btnRed, btnGray);

    const textArea = document.createElement('textarea');
    textArea.className = 'amazon-scout-textarea';
    textArea.placeholder = 'Add key notes, budget limits, comparison details, etc...';
    textArea.value = currentNote;

    // Interactive button listeners with persistent active session check
    let selectedStatus = currentStatus;

    btnGreen.addEventListener('click', (e) => {
      e.preventDefault();
      // If clicking already selected status, reset to undecided/gray or keep it (user toggle feedback)
      selectedStatus = selectedStatus === 'green' ? null : 'green';
      updateActiveButtons();
      saveListing(asin, selectedStatus, textArea.value, true);
    });

    btnRed.addEventListener('click', (e) => {
      e.preventDefault();
      selectedStatus = selectedStatus === 'red' ? null : 'red';
      updateActiveButtons();
      saveListing(asin, selectedStatus, textArea.value, true);
    });

    btnGray.addEventListener('click', (e) => {
      e.preventDefault();
      selectedStatus = selectedStatus === 'gray' ? null : 'gray';
      updateActiveButtons();
      saveListing(asin, selectedStatus, textArea.value, true);
    });

    const updateActiveButtons = () => {
      btnGreen.classList.toggle('active', selectedStatus === 'green');
      btnRed.classList.toggle('active', selectedStatus === 'red');
      btnGray.classList.toggle('active', selectedStatus === 'gray');
    };

    // Save and Lock button to go back to compact mode
    const saveBar = document.createElement('div');
    saveBar.className = 'amazon-scout-save-bar';

    // Show cancel option only if it has already been saved before
    if (isCurrentlyTracked) {
      const cancelBtn = document.createElement('button');
      cancelBtn.type = 'button';
      cancelBtn.textContent = 'Minimize';
      cancelBtn.style.background = 'transparent';
      cancelBtn.style.color = '#64748b';
      cancelBtn.style.border = 'none';
      cancelBtn.style.fontSize = '12px';
      cancelBtn.style.cursor = 'pointer';
      cancelBtn.style.fontWeight = 'bold';
      cancelBtn.addEventListener('click', () => {
        panelViewMode[asin] = 'compact';
        renderPanel(container, asin);
      });
      saveBar.appendChild(cancelBtn);
    }

    const saveLockBtn = document.createElement('button');
    saveLockBtn.type = 'button';
    saveLockBtn.className = 'amazon-scout-save-lock-btn';
    saveLockBtn.textContent = 'Save & Lock';
    saveLockBtn.addEventListener('click', () => {
      saveListing(asin, selectedStatus, textArea.value, true);
      // After saving, lock back into compact view mode
      panelViewMode[asin] = 'compact';
      renderPanel(container, asin);
    });
    saveBar.appendChild(saveLockBtn);

    panel.appendChild(header);
    panel.appendChild(buttonsRow);
    panel.appendChild(textArea);
    panel.appendChild(saveBar);
  }

  container.appendChild(panel);
};

// Process DOM Elements for the product page (search-result badges disabled)
const processDOM = () => {
  // Clean up any leftover search-result badges from earlier versions.
  document.querySelectorAll('.amazon-scout-badge').forEach(b => b.remove());

  // Inject the product-page workspace panel when on a product page.
  if (document.getElementById('ASIN') && (document.getElementById('productTitle') || document.getElementById('title'))) {
    injectProductPanel();
  }
};

// Coalesce bursts of DOM mutations into a single scan so we don't re-scan the
// entire page on every one of Amazon's frequent DOM changes.
let scanTimer: number | null = null;
const scheduleProcessDOM = () => {
  if (scanTimer !== null) return;
  scanTimer = window.setTimeout(() => {
    scanTimer = null;
    processDOM();
  }, 300);
};

const refreshUI = () => {
  // Render the panel right away for instant feedback on clicks...
  const panelContainer = document.getElementById('amazon-scout-panel-container');
  const asinInput = document.getElementById('ASIN') as HTMLInputElement;
  if (panelContainer && asinInput && asinInput.value) {
    renderPanel(panelContainer, asinInput.value);
  }
  // ...but keep the heavy full-page badge scan off the click path.
  scheduleProcessDOM();
};

const init = (): void => {
  if (!isContextValid()) return;
  injectStyles();

  // Load initial active state and list of all active sessions
  chrome.storage.local.get(['activeSessionId', 'sessions', 'listings'], (result) => {
    activeSessionId = result.activeSessionId || null;
    listings = result.listings || {};
    availableSessions = result.sessions || [];
    
    if (activeSessionId && result.sessions) {
      const s = result.sessions.find((sess: Session) => sess.id === activeSessionId);
      activeSessionName = s ? s.name : '';
    }
    
    processDOM();
  });

  // Listen for changes across the popup and content workspace
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local') {
      let shouldRefresh = false;
      
      if (changes.listings) {
        listings = changes.listings.newValue || {};
        shouldRefresh = true;
      }
      
      if (changes.activeSessionId) {
        activeSessionId = changes.activeSessionId.newValue || null;
        shouldRefresh = true;
      }

      if (changes.sessions) {
        availableSessions = changes.sessions.newValue || [];
        const activeId = activeSessionId || (changes.activeSessionId ? changes.activeSessionId.newValue : null);
        const s = (changes.sessions.newValue || []).find((sess: Session) => sess.id === activeId);
        activeSessionName = s ? s.name : '';
        shouldRefresh = true;
      }

      if (shouldRefresh) refreshUI();
    }
  });

  // Observe DOM for infinite scrolling/lazy loading. Debounced so a burst of
  // Amazon's mutations triggers at most one scan every 300ms instead of
  // thousands of synchronous scans that freeze the tab.
  const observer = new MutationObserver(() => {
    scheduleProcessDOM();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

export {};
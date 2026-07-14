"use strict";(()=>{console.log("[Amazon Scout] Content script loaded on Amazon.");var g=null,S="",E={},C=[],k={},A=()=>typeof chrome<"u"&&chrome.runtime&&!!chrome.runtime.id,$=()=>{if(document.getElementById("amazon-scout-styles"))return;let t=document.createElement("style");t.id="amazon-scout-styles",t.textContent=`
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
  `,document.head.appendChild(t)},j=t=>{let e=t.querySelector(".amazon-scout-feedback-toast");e&&e.remove();let n=document.createElement("div");n.className="amazon-scout-feedback-toast",n.innerHTML=`
    <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="3">
      <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path>
    </svg>
    Saved Successfully!
  `,t.appendChild(n);let a=t.querySelector(".amazon-scout-panel");a&&(a.style.animation="scoutSuccessPulse 0.6s ease-out",setTimeout(()=>{a.style.animation=""},600)),setTimeout(()=>{n.remove()},2200)},I=(t,e,n,a=!0)=>{var p;if(!A()||!g)return;let b="",x=document.getElementById("productTitle")||document.getElementById("title");x&&(b=((p=x.textContent)==null?void 0:p.trim())||"");let z=window.location.href;chrome.storage.local.get(["listings"],y=>{let l=y.listings||{},i=l[t],d=b||(i==null?void 0:i.title)||`Product (${t})`,c=z.includes(t)?z:(i==null?void 0:i.url)||`https://www.amazon.com/dp/${t}`,r={...l,[t]:{asin:t,sessionId:g,status:e,note:n,updatedAt:Date.now(),title:d,url:c}};chrome.storage.local.set({listings:r},()=>{console.log(`[Amazon Scout] Updated decision for ASIN ${t}: ${e}`),E=r;let s=document.getElementById("amazon-scout-panel-container");s&&(a&&j(s),v(s,t))})})},P=()=>{if(document.getElementById("amazon-scout-panel-container"))return;let t=document.getElementById("ASIN"),e=t?t.value:null;if(!e)return;console.log(`[Amazon Scout] Injecting interactive workspace for ASIN: ${e}`);let n=document.createElement("div");n.id="amazon-scout-panel-container",document.body.appendChild(n),v(n,e)},w=!1,O=t=>{let e=document.createElement("div");e.className="amazon-scout-dock-handle",e.title="Toggle Amazon Scout panel";let n=document.createElement("span");n.className="amazon-scout-dock-chevron",n.textContent=w?"\u2039":"\u203A";let a=document.createElement("span");a.className="amazon-scout-dock-label",a.textContent="SCOUT",e.appendChild(n),e.appendChild(a),e.addEventListener("click",()=>{w=!w,t.classList.toggle("collapsed",w),n.textContent=w?"\u2039":"\u203A"}),t.appendChild(e)},v=(t,e)=>{if(t.innerHTML="",t.classList.toggle("collapsed",w),O(t),!g){let l=document.createElement("div");l.className="amazon-scout-panel",l.style.border="2px dashed #d97706",l.style.background="#fffbeb";let i=document.createElement("div");i.className="amazon-scout-panel-header",i.innerHTML=`
      <div style="display:flex; align-items:center; gap:6px; color:#b45309; font-weight:800;">
        <span style="font-size: 16px;">\u{1F4A1}</span> Choose Shopping Session
      </div>
    `;let d=document.createElement("div");d.className="amazon-scout-inline-setup",d.innerHTML=`
      <p style="margin: 0 0 6px 0; font-size: 12px; font-weight:600; color: #92400e; line-height: 1.4;">
        To start tracking items on this page, choose an active session below or create a new session instantly!
      </p>
    `;let c=document.createElement("select");c.className="amazon-scout-inline-select";let r=document.createElement("option");r.value="",r.textContent="-- Select Active Session --",c.appendChild(r),C.filter(o=>o.status==="active").forEach(o=>{let u=document.createElement("option");u.value=o.id,u.textContent=o.name,c.appendChild(u)}),c.addEventListener("change",o=>{let u=o.target.value;u&&chrome.storage.local.set({activeSessionId:u},()=>{g=u;let L=C.find(N=>N.id===u);S=L?L.name:"",v(t,e)})}),d.appendChild(c);let h=document.createElement("div");h.className="amazon-scout-inline-create";let f=document.createElement("input");f.type="text",f.placeholder="Or quick start session name...",f.className="amazon-scout-inline-input";let m=document.createElement("button");m.type="button",m.textContent="Start",m.className="amazon-scout-inline-btn",m.addEventListener("click",()=>{let o=f.value.trim();if(!o)return;let u={id:`sess_${Date.now()}_${Math.random().toString(36).substr(2,9)}`,name:o,status:"active",createdAt:Date.now()};chrome.storage.local.get(["sessions"],L=>{let T=[...L.sessions||[],u];chrome.storage.local.set({sessions:T,activeSessionId:u.id},()=>{g=u.id,S=u.name,C=T,v(t,e)})})}),h.appendChild(f),h.appendChild(m),d.appendChild(h),l.appendChild(i),l.appendChild(d),t.appendChild(l);return}let n=E[e]&&E[e].sessionId===g?E[e]:null,a=(n==null?void 0:n.status)||null,b=(n==null?void 0:n.note)||"",x=a!==null||b.trim()!=="";k[e]||(k[e]=x?"compact":"edit");let z=k[e],p=document.createElement("div");p.className="amazon-scout-panel";let y=document.createElement("div");if(y.className="amazon-scout-panel-header",y.innerHTML=`
    <div style="display:flex; align-items:center; gap:6px;">
      <svg width="16" height="16" fill="none" stroke="#ea580c" viewBox="0 0 24 24" stroke-width="2.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path>
      </svg>
      <span style="font-weight: 700; color:#475569; font-size:13px;">Scout Workspace:</span>
      <span class="amazon-scout-session-pill">${S}</span>
    </div>
  `,z==="compact"){let l=document.createElement("div");l.className="amazon-scout-compact-card";let i="Undecided",d="status-gray";a==="green"?(i="Considering",d="status-green"):a==="red"&&(i="Skip / Don't Want",d="status-red");let c=document.createElement("div");c.style.display="flex",c.style.justifyContent="space-between",c.style.alignItems="center",c.innerHTML=`
      <div class="amazon-scout-status-indicator ${d}">
        <span style="width:8px; height:8px; border-radius:50%; background:currentColor;"></span>
        ${i}
      </div>
    `;let r=document.createElement("button");if(r.type="button",r.className="amazon-scout-edit-trigger",r.innerHTML=`
      <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
      </svg>
      Adjust Decision & Notes
    `,r.addEventListener("click",s=>{s.preventDefault(),k[e]="edit",v(t,e)}),c.appendChild(r),l.appendChild(c),b.trim()){let s=document.createElement("div");s.className="amazon-scout-note-preview",s.innerHTML=`<strong>Annotation:</strong> ${b}`,l.appendChild(s)}p.appendChild(y),p.appendChild(l)}else{let l=document.createElement("div");l.className="amazon-scout-panel-buttons";let i=document.createElement("button");i.type="button",i.className=`amazon-scout-btn amazon-scout-btn-green ${a==="green"?"active":""}`,i.innerHTML="\u{1F44D} Considering";let d=document.createElement("button");d.type="button",d.className=`amazon-scout-btn amazon-scout-btn-red ${a==="red"?"active":""}`,d.innerHTML="\u{1F44E} Skip";let c=document.createElement("button");c.type="button",c.className=`amazon-scout-btn amazon-scout-btn-gray ${a==="gray"?"active":""}`,c.innerHTML="\u2754 Undecided",l.append(i,d,c);let r=document.createElement("textarea");r.className="amazon-scout-textarea",r.placeholder="Add key notes, budget limits, comparison details, etc...",r.value=b;let s=a;i.addEventListener("click",o=>{o.preventDefault(),s=s==="green"?null:"green",h(),I(e,s,r.value,!0)}),d.addEventListener("click",o=>{o.preventDefault(),s=s==="red"?null:"red",h(),I(e,s,r.value,!0)}),c.addEventListener("click",o=>{o.preventDefault(),s=s==="gray"?null:"gray",h(),I(e,s,r.value,!0)});let h=()=>{i.classList.toggle("active",s==="green"),d.classList.toggle("active",s==="red"),c.classList.toggle("active",s==="gray")},f=document.createElement("div");if(f.className="amazon-scout-save-bar",x){let o=document.createElement("button");o.type="button",o.textContent="Minimize",o.style.background="transparent",o.style.color="#64748b",o.style.border="none",o.style.fontSize="12px",o.style.cursor="pointer",o.style.fontWeight="bold",o.addEventListener("click",()=>{k[e]="compact",v(t,e)}),f.appendChild(o)}let m=document.createElement("button");m.type="button",m.className="amazon-scout-save-lock-btn",m.textContent="Save & Lock",m.addEventListener("click",()=>{I(e,s,r.value,!0),k[e]="compact",v(t,e)}),f.appendChild(m),p.appendChild(y),p.appendChild(l),p.appendChild(r),p.appendChild(f)}t.appendChild(p)},B=()=>{document.querySelectorAll(".amazon-scout-badge").forEach(t=>t.remove()),document.getElementById("ASIN")&&(document.getElementById("productTitle")||document.getElementById("title"))&&P()},M=null,D=()=>{M===null&&(M=window.setTimeout(()=>{M=null,B()},300))},V=()=>{let t=document.getElementById("amazon-scout-panel-container"),e=document.getElementById("ASIN");t&&e&&e.value&&v(t,e.value),D()},H=()=>{if(!A())return;$(),chrome.storage.local.get(["activeSessionId","sessions","listings"],e=>{if(g=e.activeSessionId||null,E=e.listings||{},C=e.sessions||[],g&&e.sessions){let n=e.sessions.find(a=>a.id===g);S=n?n.name:""}B()}),chrome.storage.onChanged.addListener((e,n)=>{if(n==="local"){let a=!1;if(e.listings&&(E=e.listings.newValue||{},a=!0),e.activeSessionId&&(g=e.activeSessionId.newValue||null,a=!0),e.sessions){C=e.sessions.newValue||[];let b=g||(e.activeSessionId?e.activeSessionId.newValue:null),x=(e.sessions.newValue||[]).find(z=>z.id===b);S=x?x.name:"",a=!0}a&&V()}}),new MutationObserver(()=>{D()}).observe(document.body,{childList:!0,subtree:!0})};document.readyState==="loading"?document.addEventListener("DOMContentLoaded",H):H();})();

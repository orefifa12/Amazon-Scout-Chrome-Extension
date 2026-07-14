"use strict";(()=>{console.log("[Amazon Scout] Content script loaded on Amazon.");var m=null,E="",y={},C=[],w={},H=()=>typeof chrome<"u"&&chrome.runtime&&!!chrome.runtime.id,D=()=>{if(document.getElementById("amazon-scout-styles"))return;let t=document.createElement("style");t.id="amazon-scout-styles",t.textContent=`
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

    .amazon-scout-badge {
      position: absolute;
      top: 6px;
      left: 6px;
      padding: 4px 8px;
      border-radius: 4px;
      font-weight: bold;
      font-size: 11px;
      color: white;
      z-index: 99;
      box-shadow: 0 2px 5px rgba(0,0,0,0.25);
      font-family: system-ui, sans-serif;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      animation: scoutFadeIn 0.3s ease-out;
    }
    .amazon-scout-badge.status-green { background-color: #10b981 !important; }
    .amazon-scout-badge.status-red { background-color: #ef4444 !important; }
    .amazon-scout-badge.status-gray { background-color: #6b7280 !important; }
    
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
  `,document.head.appendChild(t)},j=t=>{if(!m)return null;let e=y[t];return e&&e.sessionId===m?e.status:null},P=(t,e)=>{var h;let n=j(e),o=t.querySelector(".amazon-scout-badge");if(!n){o&&o.remove();return}if(!o){o=document.createElement("div"),o.className="amazon-scout-badge";let u=((h=t.querySelector(".s-image"))==null?void 0:h.closest("div"))||t;u&&(u.style.position="relative",u.appendChild(o))}let g=`amazon-scout-badge status-${n}`,f=n==="green"?"Considering":n==="red"?"Skip":"Undecided";o.className!==g&&(o.className=g),o.textContent!==f&&(o.textContent=f)},O=t=>{let e=t.querySelector(".amazon-scout-feedback-toast");e&&e.remove();let n=document.createElement("div");n.className="amazon-scout-feedback-toast",n.innerHTML=`
    <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="3">
      <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path>
    </svg>
    Saved Successfully!
  `,t.appendChild(n);let o=t.querySelector(".amazon-scout-panel");o&&(o.style.animation="scoutSuccessPulse 0.6s ease-out",setTimeout(()=>{o.style.animation=""},600)),setTimeout(()=>{n.remove()},2200)},I=(t,e,n,o=!0)=>{var u;if(!H()||!m)return;let g="",f=document.getElementById("productTitle")||document.getElementById("title");f&&(g=((u=f.textContent)==null?void 0:u.trim())||"");let h=window.location.href;chrome.storage.local.get(["listings"],k=>{let d=k.listings||{},i=d[t],l=g||(i==null?void 0:i.title)||`Product (${t})`,r=h.includes(t)?h:(i==null?void 0:i.url)||`https://www.amazon.com/dp/${t}`,c={...d,[t]:{asin:t,sessionId:m,status:e,note:n,updatedAt:Date.now(),title:l,url:r}};chrome.storage.local.set({listings:c},()=>{console.log(`[Amazon Scout] Updated decision for ASIN ${t}: ${e}`),y=c;let s=document.getElementById("amazon-scout-panel-container");s&&(o&&O(s),z(s,t))})})},U=()=>{if(document.getElementById("amazon-scout-panel-container"))return;let t=document.getElementById("ASIN"),e=t?t.value:null;if(!e)return;console.log(`[Amazon Scout] Injecting interactive workspace for ASIN: ${e}`);let n=document.createElement("div");n.id="amazon-scout-panel-container",document.body.appendChild(n),z(n,e)},S=!1,V=t=>{let e=document.createElement("div");e.className="amazon-scout-dock-handle",e.title="Toggle Amazon Scout panel";let n=document.createElement("span");n.className="amazon-scout-dock-chevron",n.textContent=S?"\u2039":"\u203A";let o=document.createElement("span");o.className="amazon-scout-dock-label",o.textContent="SCOUT",e.appendChild(n),e.appendChild(o),e.addEventListener("click",()=>{S=!S,t.classList.toggle("collapsed",S),n.textContent=S?"\u2039":"\u203A"}),t.appendChild(e)},z=(t,e)=>{if(t.innerHTML="",t.classList.toggle("collapsed",S),V(t),!m){let d=document.createElement("div");d.className="amazon-scout-panel",d.style.border="2px dashed #d97706",d.style.background="#fffbeb";let i=document.createElement("div");i.className="amazon-scout-panel-header",i.innerHTML=`
      <div style="display:flex; align-items:center; gap:6px; color:#b45309; font-weight:800;">
        <span style="font-size: 16px;">\u{1F4A1}</span> Choose Shopping Session
      </div>
    `;let l=document.createElement("div");l.className="amazon-scout-inline-setup",l.innerHTML=`
      <p style="margin: 0 0 6px 0; font-size: 12px; font-weight:600; color: #92400e; line-height: 1.4;">
        To start tracking items on this page, choose an active session below or create a new session instantly!
      </p>
    `;let r=document.createElement("select");r.className="amazon-scout-inline-select";let c=document.createElement("option");c.value="",c.textContent="-- Select Active Session --",r.appendChild(c),C.filter(a=>a.status==="active").forEach(a=>{let p=document.createElement("option");p.value=a.id,p.textContent=a.name,r.appendChild(p)}),r.addEventListener("change",a=>{let p=a.target.value;p&&chrome.storage.local.set({activeSessionId:p},()=>{m=p;let L=C.find(T=>T.id===p);E=L?L.name:"",z(t,e)})}),l.appendChild(r);let v=document.createElement("div");v.className="amazon-scout-inline-create";let x=document.createElement("input");x.type="text",x.placeholder="Or quick start session name...",x.className="amazon-scout-inline-input";let b=document.createElement("button");b.type="button",b.textContent="Start",b.className="amazon-scout-inline-btn",b.addEventListener("click",()=>{let a=x.value.trim();if(!a)return;let p={id:`sess_${Date.now()}_${Math.random().toString(36).substr(2,9)}`,name:a,status:"active",createdAt:Date.now()};chrome.storage.local.get(["sessions"],L=>{let M=[...L.sessions||[],p];chrome.storage.local.set({sessions:M,activeSessionId:p.id},()=>{m=p.id,E=p.name,C=M,z(t,e)})})}),v.appendChild(x),v.appendChild(b),l.appendChild(v),d.appendChild(i),d.appendChild(l),t.appendChild(d);return}let n=y[e]&&y[e].sessionId===m?y[e]:null,o=(n==null?void 0:n.status)||null,g=(n==null?void 0:n.note)||"",f=o!==null||g.trim()!=="";w[e]||(w[e]=f?"compact":"edit");let h=w[e],u=document.createElement("div");u.className="amazon-scout-panel";let k=document.createElement("div");if(k.className="amazon-scout-panel-header",k.innerHTML=`
    <div style="display:flex; align-items:center; gap:6px;">
      <svg width="16" height="16" fill="none" stroke="#ea580c" viewBox="0 0 24 24" stroke-width="2.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path>
      </svg>
      <span style="font-weight: 700; color:#475569; font-size:13px;">Scout Workspace:</span>
      <span class="amazon-scout-session-pill">${E}</span>
    </div>
  `,h==="compact"){let d=document.createElement("div");d.className="amazon-scout-compact-card";let i="Undecided",l="status-gray";o==="green"?(i="Considering",l="status-green"):o==="red"&&(i="Skip / Don't Want",l="status-red");let r=document.createElement("div");r.style.display="flex",r.style.justifyContent="space-between",r.style.alignItems="center",r.innerHTML=`
      <div class="amazon-scout-status-indicator ${l}">
        <span style="width:8px; height:8px; border-radius:50%; background:currentColor;"></span>
        ${i}
      </div>
    `;let c=document.createElement("button");if(c.type="button",c.className="amazon-scout-edit-trigger",c.innerHTML=`
      <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
      </svg>
      Adjust Decision & Notes
    `,c.addEventListener("click",s=>{s.preventDefault(),w[e]="edit",z(t,e)}),r.appendChild(c),d.appendChild(r),g.trim()){let s=document.createElement("div");s.className="amazon-scout-note-preview",s.innerHTML=`<strong>Annotation:</strong> ${g}`,d.appendChild(s)}u.appendChild(k),u.appendChild(d)}else{let d=document.createElement("div");d.className="amazon-scout-panel-buttons";let i=document.createElement("button");i.type="button",i.className=`amazon-scout-btn amazon-scout-btn-green ${o==="green"?"active":""}`,i.innerHTML="\u{1F44D} Considering";let l=document.createElement("button");l.type="button",l.className=`amazon-scout-btn amazon-scout-btn-red ${o==="red"?"active":""}`,l.innerHTML="\u{1F44E} Skip";let r=document.createElement("button");r.type="button",r.className=`amazon-scout-btn amazon-scout-btn-gray ${o==="gray"?"active":""}`,r.innerHTML="\u2754 Undecided",d.append(i,l,r);let c=document.createElement("textarea");c.className="amazon-scout-textarea",c.placeholder="Add key notes, budget limits, comparison details, etc...",c.value=g;let s=o;i.addEventListener("click",a=>{a.preventDefault(),s=s==="green"?null:"green",v(),I(e,s,c.value,!0)}),l.addEventListener("click",a=>{a.preventDefault(),s=s==="red"?null:"red",v(),I(e,s,c.value,!0)}),r.addEventListener("click",a=>{a.preventDefault(),s=s==="gray"?null:"gray",v(),I(e,s,c.value,!0)});let v=()=>{i.classList.toggle("active",s==="green"),l.classList.toggle("active",s==="red"),r.classList.toggle("active",s==="gray")},x=document.createElement("div");if(x.className="amazon-scout-save-bar",f){let a=document.createElement("button");a.type="button",a.textContent="Minimize",a.style.background="transparent",a.style.color="#64748b",a.style.border="none",a.style.fontSize="12px",a.style.cursor="pointer",a.style.fontWeight="bold",a.addEventListener("click",()=>{w[e]="compact",z(t,e)}),x.appendChild(a)}let b=document.createElement("button");b.type="button",b.className="amazon-scout-save-lock-btn",b.textContent="Save & Lock",b.addEventListener("click",()=>{I(e,s,c.value,!0),w[e]="compact",z(t,e)}),x.appendChild(b),u.appendChild(k),u.appendChild(d),u.appendChild(c),u.appendChild(x)}t.appendChild(u)},B=()=>{document.querySelectorAll('[data-asin]:not([data-asin=""])').forEach(e=>{let n=e.getAttribute("data-asin");n&&(e.hasAttribute("data-plugthis-processed")||e.setAttribute("data-plugthis-processed","true"),P(e,n))}),document.getElementById("ASIN")&&(document.getElementById("productTitle")||document.getElementById("title"))&&U()},N=null,$=()=>{N===null&&(N=window.setTimeout(()=>{N=null,B()},300))},q=()=>{let t=document.getElementById("amazon-scout-panel-container"),e=document.getElementById("ASIN");t&&e&&e.value&&z(t,e.value),$()},A=()=>{if(!H())return;D(),chrome.storage.local.get(["activeSessionId","sessions","listings"],e=>{if(m=e.activeSessionId||null,y=e.listings||{},C=e.sessions||[],m&&e.sessions){let n=e.sessions.find(o=>o.id===m);E=n?n.name:""}B()}),chrome.storage.onChanged.addListener((e,n)=>{if(n==="local"){let o=!1;if(e.listings&&(y=e.listings.newValue||{},o=!0),e.activeSessionId&&(m=e.activeSessionId.newValue||null,o=!0),e.sessions){C=e.sessions.newValue||[];let g=m||(e.activeSessionId?e.activeSessionId.newValue:null),f=(e.sessions.newValue||[]).find(h=>h.id===g);E=f?f.name:"",o=!0}o&&q()}}),new MutationObserver(()=>{$()}).observe(document.body,{childList:!0,subtree:!0})};document.readyState==="loading"?document.addEventListener("DOMContentLoaded",A):A();})();

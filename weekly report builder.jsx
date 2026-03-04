import { useState, useEffect, useCallback, useRef } from "react";

// ─── RESPONSIVE HOOK ──────────────────────────────────────────────────────────
function useIsMobile(breakpoint = 640) {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < breakpoint : false
  );
  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < breakpoint);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, [breakpoint]);
  return isMobile;
}

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const MOCK_USER = { id: "user_nero", name: "Nero", email: "nero@example.com" };
const SAMPLE_REPORTS = [
  { id: "r1", title: "PHILRADS Internship", updatedAt: "2026-02-27", weekCount: 2, totalHours: 80, weeks: [], ownerId: "user_nero", shareId: "share_abc123" },
  { id: "r2", title: "Freelance Project — Client A", updatedAt: "2026-02-20", weekCount: 1, totalHours: 32, weeks: [], ownerId: "user_nero", shareId: "share_xyz789" },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const uid = () => Math.random().toString(36).slice(2, 10);
const formatDate = (s) => { if (!s) return ""; const d = new Date(s+"T00:00:00"); return d.toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}); };
const getDayName = (s) => { if (!s) return ""; const d = new Date(s+"T00:00:00"); return DAYS[d.getDay()===0?6:d.getDay()-1]; };
const weekHours = (w) => w.days.reduce((s,d)=>s+(d.isHoliday?0:Number(d.hoursWorked)||0),0);
const totalHours = (weeks) => weeks.reduce((s,w)=>s+weekHours(w),0);
const timeAgo = (ds) => { const diff=Math.floor((Date.now()-new Date(ds))/60000); if(diff<1)return"just now"; if(diff<60)return`${diff}m ago`; if(diff<1440)return`${Math.floor(diff/60)}h ago`; return`${Math.floor(diff/1440)}d ago`; };

const DEFAULT_DAY = () => ({ id:uid(), date:"", isHoliday:false, holidayName:"", tasks:[""], experiences:"", hoursWorked:8 });
const DEFAULT_WEEK = (n=1) => ({ id:uid(), weekNumber:n, startDate:"", endDate:"", days:[DEFAULT_DAY()], summary:"", challenges:"", skills:"", lessons:"" });
const DEFAULT_REPORT = () => ({ id:uid(), title:"Untitled Report", updatedAt:new Date().toISOString().slice(0,10), weeks:[DEFAULT_WEEK(1)], shareId:uid(), ownerId:MOCK_USER.id });

// ─── TOKENS ───────────────────────────────────────────────────────────────────
const T = {
  bg:"#f8f9fb", surface:"#ffffff", surfaceHover:"#f4f5f7", border:"#e4e7ec",
  accent:"#6366f1", accentSoft:"#eef2ff", accentText:"#4338ca",
  green:"#10b981", greenSoft:"#ecfdf5",
  red:"#ef4444", redSoft:"#fef2f2",
  yellow:"#f59e0b", yellowSoft:"#fffbeb",
  text:"#111827", textSub:"#6b7280", textMuted:"#9ca3af",
  radius:"10px", radiusLg:"14px",
  shadow:"0 1px 3px rgba(0,0,0,0.08)",
  shadowMd:"0 4px 16px rgba(0,0,0,0.08)",
  shadowLg:"0 20px 40px rgba(0,0,0,0.12)",
};

const gs = {
  input:{ width:"100%", padding:"10px 13px", background:T.surface, border:`1.5px solid ${T.border}`, borderRadius:T.radius, fontSize:"15px", color:T.text, outline:"none", fontFamily:"'Plus Jakarta Sans',sans-serif", boxSizing:"border-box", transition:"border-color 0.15s,box-shadow 0.15s", WebkitAppearance:"none" },
  textarea:{ width:"100%", padding:"10px 13px", background:T.surface, border:`1.5px solid ${T.border}`, borderRadius:T.radius, fontSize:"15px", color:T.text, outline:"none", resize:"vertical", fontFamily:"'Plus Jakarta Sans',sans-serif", lineHeight:1.6, boxSizing:"border-box", minHeight:"80px" },
  label:{ display:"block", fontSize:"12px", fontWeight:600, color:T.textSub, marginBottom:"5px", fontFamily:"'Plus Jakarta Sans',sans-serif" },
  btn:{ padding:"10px 16px", borderRadius:T.radius, fontSize:"14px", fontWeight:600, cursor:"pointer", border:"none", fontFamily:"'Plus Jakarta Sans',sans-serif", transition:"all 0.15s", display:"inline-flex", alignItems:"center", justifyContent:"center", gap:"6px", WebkitTapHighlightColor:"transparent" },
};

// ─── ATOMS ────────────────────────────────────────────────────────────────────
function Badge({ children, color=T.accent }) {
  return <span style={{ padding:"2px 10px", background:color+"18", color, border:`1px solid ${color}28`, borderRadius:"999px", fontSize:"11px", fontWeight:600, fontFamily:"'Plus Jakarta Sans',sans-serif", whiteSpace:"nowrap" }}>{children}</span>;
}

function Avatar({ name, size=32 }) {
  const colors=["#6366f1","#8b5cf6","#06b6d4","#10b981","#f59e0b"];
  const color=colors[name.charCodeAt(0)%colors.length];
  return <div style={{ width:size, height:size, borderRadius:"50%", background:color, color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:size*0.4, fontWeight:700, fontFamily:"'Plus Jakarta Sans',sans-serif", flexShrink:0 }}>{name[0].toUpperCase()}</div>;
}

function Spinner() {
  return <div style={{ width:16, height:16, border:`2px solid ${T.border}`, borderTop:`2px solid ${T.accent}`, borderRadius:"50%", animation:"spin 0.6s linear infinite", flexShrink:0 }} />;
}

function SaveStatus({ status }) {
  const map = { saving:{icon:<Spinner/>,text:"Saving…",color:T.textMuted}, saved:{icon:"✓",text:"Saved",color:T.green}, error:{icon:"✕",text:"Error",color:T.red}, idle:{icon:null,text:null} };
  const s = map[status];
  if (!s.text) return null;
  return <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:"12px", color:s.color, fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:500 }}>{s.icon}{s.text}</div>;
}

function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", zIndex:1000, display:"flex", alignItems:"flex-end", justifyContent:"center", backdropFilter:"blur(4px)" }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:T.surface, borderRadius:"18px 18px 0 0", width:"100%", maxWidth:520, boxShadow:T.shadowLg, overflow:"hidden", animation:"slideUp 0.25s ease" }}>
        <div style={{ padding:"16px 20px", borderBottom:`1px solid ${T.border}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ fontWeight:700, fontSize:"16px", fontFamily:"'Plus Jakarta Sans',sans-serif", color:T.text }}>{title}</span>
          <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", color:T.textMuted, fontSize:24, lineHeight:1, padding:"4px 8px" }}>×</button>
        </div>
        <div style={{ padding:"20px" }}>{children}</div>
      </div>
    </div>
  );
}

// ─── AI SUMMARY ───────────────────────────────────────────────────────────────
function AISummaryPanel({ report, targetWeek }) {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState("");
  const [error, setError] = useState("");
  const [scope, setScope] = useState("overall");

  const generate = async () => {
    setLoading(true); setError(""); setSummary("");
    try {
      const weeks = scope==="overall" ? report.weeks : [report.weeks[targetWeek]].filter(Boolean);
      const context = weeks.map(w => {
        const days = w.days.map(d => d.isHoliday ? `- Holiday: ${d.holidayName||"No work"}` : `- ${getDayName(d.date)||"Day"} (${d.hoursWorked}h): ${d.tasks.filter(t=>t.trim()).join("; ")}. ${d.experiences||""}`).join("\n");
        return `Week #${w.weekNumber} (${formatDate(w.startDate)} – ${formatDate(w.endDate)}, ${weekHours(w)}h):\n${days}\nSummary: ${w.summary}\nChallenges: ${w.challenges}\nSkills: ${w.skills}\nLessons: ${w.lessons}`;
      }).join("\n\n");
      const prompt = scope==="overall"
        ? `You are a professional report writer. Based on this internship/work log, write a polished, concise overall summary paragraph (3–5 sentences) highlighting key accomplishments, growth areas, and overall contribution. Be specific and professional.\n\n${context}`
        : `You are a professional report writer. Based on this single week's log, write a clear weekly summary (2–4 sentences) covering what was accomplished, what was learned, and any challenges. Be specific.\n\n${context}`;
      const res = await fetch("https://api.anthropic.com/v1/messages", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:1000, messages:[{role:"user",content:prompt}] }) });
      const data = await res.json();
      setSummary(data.content?.[0]?.text || "No response.");
    } catch { setError("Failed to generate. Check your connection."); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ background:"linear-gradient(135deg,#eef2ff 0%,#f0fdf4 100%)", border:`1px solid ${T.border}`, borderRadius:T.radiusLg, padding:"18px", marginBottom:16 }}>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
        <div style={{ width:32, height:32, background:T.accent, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>✦</div>
        <div>
          <div style={{ fontWeight:700, fontSize:14, color:T.text, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>AI Summary Generator</div>
          <div style={{ fontSize:12, color:T.textSub, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>Generate a polished summary from your logs</div>
        </div>
      </div>
      <div style={{ display:"flex", gap:8, marginBottom:14 }}>
        {["overall","weekly"].map(opt=>(
          <button key={opt} onClick={()=>setScope(opt)} style={{ ...gs.btn, padding:"8px 14px", background:scope===opt?T.accent:T.surface, color:scope===opt?"#fff":T.textSub, border:`1.5px solid ${scope===opt?T.accent:T.border}`, fontSize:13, flex:1 }}>
            {opt==="overall"?"🗂 Overall":"📅 This Week"}
          </button>
        ))}
      </div>
      <button onClick={generate} disabled={loading} style={{ ...gs.btn, background:loading?T.border:T.accent, color:loading?T.textSub:"#fff", width:"100%", padding:"12px" }}>
        {loading ? <><Spinner/> Generating…</> : "✦ Generate Summary"}
      </button>
      {error && <p style={{ marginTop:12, fontSize:13, color:T.red, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>{error}</p>}
      {summary && (
        <div style={{ marginTop:14, padding:"14px", background:T.surface, borderRadius:T.radius, border:`1px solid ${T.border}` }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8, flexWrap:"wrap", gap:8 }}>
            <span style={{ fontSize:11, fontWeight:600, color:T.accent, textTransform:"uppercase", letterSpacing:"0.08em", fontFamily:"'Plus Jakarta Sans',sans-serif" }}>Generated Summary</span>
            <button onClick={()=>navigator.clipboard?.writeText(summary)} style={{ ...gs.btn, padding:"5px 12px", background:T.accentSoft, color:T.accentText, fontSize:12 }}>Copy</button>
          </div>
          <p style={{ margin:0, fontSize:14, lineHeight:1.7, color:T.text, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>{summary}</p>
        </div>
      )}
    </div>
  );
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────
function LoginPage({ onLogin }) {
  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(135deg,#667eea15 0%,#764ba215 50%,#f093fb10 100%)", display:"flex", alignItems:"center", justifyContent:"center", padding:"20px", fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
        *{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
        input:focus,textarea:focus{border-color:${T.accent}!important;box-shadow:0 0 0 3px ${T.accent}18!important}
      `}</style>
      <div style={{ width:"100%", maxWidth:420, animation:"fadeUp 0.5s ease" }}>
        <div style={{ textAlign:"center", marginBottom:28 }}>
          <div style={{ width:52, height:52, background:T.accent, borderRadius:14, display:"inline-flex", alignItems:"center", justifyContent:"center", fontSize:24, marginBottom:14, boxShadow:`0 8px 24px ${T.accent}40` }}>📋</div>
          <h1 style={{ margin:"0 0 6px", fontSize:26, fontWeight:800, color:T.text }}>Reportly</h1>
          <p style={{ margin:0, fontSize:14, color:T.textSub }}>Your weekly narrative report, beautifully organized.</p>
        </div>
        <div style={{ background:T.surface, borderRadius:18, padding:"28px 24px", boxShadow:T.shadowLg, border:`1px solid ${T.border}` }}>
          <h2 style={{ margin:"0 0 4px", fontSize:20, fontWeight:700, color:T.text }}>Welcome back</h2>
          <p style={{ margin:"0 0 22px", fontSize:14, color:T.textSub }}>Sign in to access your reports</p>
          <button onClick={()=>onLogin(MOCK_USER)} style={{ ...gs.btn, width:"100%", padding:"13px", background:T.surface, border:`1.5px solid ${T.border}`, color:T.text, fontSize:14, borderRadius:T.radius, boxShadow:T.shadow, marginBottom:14 }}>
            <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/><path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/><path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/><path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/></svg>
            Continue with Google
          </button>
          <div style={{ display:"flex", alignItems:"center", gap:10, margin:"14px 0" }}>
            <div style={{ flex:1, height:1, background:T.border }}/><span style={{ fontSize:12, color:T.textMuted }}>or</span><div style={{ flex:1, height:1, background:T.border }}/>
          </div>
          <div style={{ marginBottom:12 }}><label style={gs.label}>Email</label><input placeholder="you@example.com" style={gs.input}/></div>
          <div style={{ marginBottom:18 }}><label style={gs.label}>Password</label><input type="password" placeholder="••••••••" style={gs.input}/></div>
          <button onClick={()=>onLogin(MOCK_USER)} style={{ ...gs.btn, width:"100%", padding:"13px", background:T.accent, color:"#fff", fontSize:14, borderRadius:T.radius }}>Sign In</button>
        </div>
        <p style={{ textAlign:"center", marginTop:18, fontSize:13, color:T.textMuted }}>
          No account? <span style={{ color:T.accent, cursor:"pointer", fontWeight:600 }} onClick={()=>onLogin(MOCK_USER)}>Sign up free</span>
        </p>
      </div>
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({ user, reports, onOpen, onCreate, onDelete, onRename }) {
  const isMobile = useIsMobile();
  const [renaming, setRenaming] = useState(null);
  const [renameVal, setRenameVal] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [shareModal, setShareModal] = useState(null);
  const [copied, setCopied] = useState(false);

  const total = reports.reduce((s,r)=>s+r.totalHours,0);
  const totalWeeks = reports.reduce((s,r)=>s+r.weekCount,0);

  return (
    <div style={{ minHeight:"100vh", background:T.bg, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
      <nav style={{ background:T.surface, borderBottom:`1px solid ${T.border}`, padding:`0 ${isMobile?"16px":"28px"}`, height:56, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:100 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:28, height:28, background:T.accent, borderRadius:7, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>📋</div>
          <span style={{ fontWeight:800, fontSize:16, color:T.text }}>Reportly</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <Avatar name={user.name} size={30}/>
          {!isMobile && <div><div style={{ fontSize:13, fontWeight:600, color:T.text }}>{user.name}</div><div style={{ fontSize:11, color:T.textMuted }}>{user.email}</div></div>}
        </div>
      </nav>

      <div style={{ maxWidth:960, margin:"0 auto", padding:isMobile?"18px 14px":"36px 24px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:22, gap:12 }}>
          <div>
            <h1 style={{ margin:"0 0 2px", fontSize:isMobile?21:26, fontWeight:800, color:T.text }}>My Reports</h1>
            <p style={{ margin:0, fontSize:13, color:T.textSub }}>All your weekly narrative reports</p>
          </div>
          <button onClick={onCreate} style={{ ...gs.btn, background:T.accent, color:"#fff", padding:"10px 16px", fontSize:14, boxShadow:`0 4px 12px ${T.accent}40`, whiteSpace:"nowrap", flexShrink:0 }}>+ New</button>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:isMobile?10:14, marginBottom:26 }}>
          {[["Reports",reports.length,"📁"],["Weeks",totalWeeks,"📅"],["Hours",`${total}h`,"⏱"]].map(([l,v,icon])=>(
            <div key={l} style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:T.radiusLg, padding:isMobile?"12px 10px":"18px 20px", boxShadow:T.shadow }}>
              <div style={{ fontSize:isMobile?16:20, marginBottom:5 }}>{icon}</div>
              <div style={{ fontSize:isMobile?20:26, fontWeight:800, color:T.text, lineHeight:1 }}>{v}</div>
              <div style={{ fontSize:11, color:T.textSub, marginTop:3 }}>{l}</div>
            </div>
          ))}
        </div>

        {reports.length===0 ? (
          <div style={{ textAlign:"center", padding:"60px 20px", background:T.surface, borderRadius:T.radiusLg, border:`2px dashed ${T.border}` }}>
            <div style={{ fontSize:40, marginBottom:14 }}>📋</div>
            <h3 style={{ margin:"0 0 8px", color:T.text }}>No reports yet</h3>
            <p style={{ margin:"0 0 18px", color:T.textSub, fontSize:14 }}>Create your first report to get started</p>
            <button onClick={onCreate} style={{ ...gs.btn, background:T.accent, color:"#fff", padding:"11px 24px" }}>Create Report</button>
          </div>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns:isMobile?"1fr":"repeat(auto-fill,minmax(280px,1fr))", gap:12 }}>
            {reports.map((r,i)=>(
              <div key={r.id} onClick={()=>onOpen(r.id)} style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:T.radiusLg, padding:"18px", cursor:"pointer", transition:"all 0.15s", boxShadow:T.shadow }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
                  <div style={{ width:36, height:36, background:T.accentSoft, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>📄</div>
                  <div style={{ display:"flex", gap:6 }} onClick={e=>e.stopPropagation()}>
                    <button onClick={()=>setShareModal(r)} style={{ ...gs.btn, padding:"6px 10px", background:T.surfaceHover, color:T.textSub, border:`1px solid ${T.border}`, fontSize:13 }}>↗</button>
                    <button onClick={()=>{setRenaming(r.id);setRenameVal(r.title);}} style={{ ...gs.btn, padding:"6px 10px", background:T.surfaceHover, color:T.textSub, border:`1px solid ${T.border}`, fontSize:13 }}>✏️</button>
                    <button onClick={()=>setDeleteConfirm(r)} style={{ ...gs.btn, padding:"6px 10px", background:T.redSoft, color:T.red, border:`1px solid ${T.red}20`, fontSize:13 }}>🗑</button>
                  </div>
                </div>
                {renaming===r.id ? (
                  <input autoFocus value={renameVal} onChange={e=>setRenameVal(e.target.value)}
                    onBlur={()=>{onRename(r.id,renameVal);setRenaming(null);}}
                    onKeyDown={e=>{if(e.key==="Enter"){onRename(r.id,renameVal);setRenaming(null);}if(e.key==="Escape")setRenaming(null);}}
                    style={{ ...gs.input, marginBottom:8, fontWeight:700 }} onClick={e=>e.stopPropagation()}/>
                ) : (
                  <h3 style={{ margin:"0 0 10px", fontSize:15, fontWeight:700, color:T.text, lineHeight:1.3 }}>{r.title}</h3>
                )}
                <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:10 }}>
                  <Badge color={T.accent}>{r.weekCount} weeks</Badge>
                  <Badge color={T.green}>{r.totalHours}h logged</Badge>
                </div>
                <div style={{ fontSize:12, color:T.textMuted }}>Updated {timeAgo(r.updatedAt)}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal open={!!deleteConfirm} onClose={()=>setDeleteConfirm(null)} title="Delete Report">
        <p style={{ margin:"0 0 18px", fontSize:14, color:T.textSub }}>Delete <strong>"{deleteConfirm?.title}"</strong>? This can't be undone.</p>
        <div style={{ display:"flex", gap:8 }}>
          <button onClick={()=>setDeleteConfirm(null)} style={{ ...gs.btn, flex:1, background:T.surfaceHover, color:T.textSub, border:`1px solid ${T.border}` }}>Cancel</button>
          <button onClick={()=>{onDelete(deleteConfirm.id);setDeleteConfirm(null);}} style={{ ...gs.btn, flex:1, background:T.red, color:"#fff" }}>Delete</button>
        </div>
      </Modal>

      <Modal open={!!shareModal} onClose={()=>{setShareModal(null);setCopied(false);}} title="Share Report">
        <p style={{ margin:"0 0 12px", fontSize:14, color:T.textSub }}>Anyone with this link can view your report.</p>
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          <input readOnly value={`https://reportly.app/share/${shareModal?.shareId}`} style={{ ...gs.input, background:T.bg, color:T.textSub, fontSize:13 }}/>
          <button onClick={()=>{navigator.clipboard?.writeText(`https://reportly.app/share/${shareModal?.shareId}`);setCopied(true);setTimeout(()=>setCopied(false),2000);}}
            style={{ ...gs.btn, background:copied?T.greenSoft:T.accent, color:copied?T.green:"#fff", width:"100%", padding:"13px" }}>
            {copied?"✓ Link Copied!":"Copy Share Link"}
          </button>
        </div>
        <p style={{ margin:"10px 0 0", fontSize:12, color:T.textMuted }}>🔒 Viewers cannot edit your report.</p>
      </Modal>
    </div>
  );
}

// ─── DAY EDITOR ───────────────────────────────────────────────────────────────
function DayEditor({ day, dayIndex, onChange, onRemove }) {
  const isMobile = useIsMobile();
  const u = (f,v) => onChange({...day,[f]:v});
  const dayName = getDayName(day.date) || `Day ${dayIndex+1}`;

  return (
    <div style={{ border:`1.5px solid ${day.isHoliday?T.yellow+"80":T.border}`, borderLeft:`4px solid ${day.isHoliday?T.yellow:T.accent}`, borderRadius:T.radius, padding:"16px", marginBottom:10, background:day.isHoliday?T.yellowSoft:T.surface }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14, gap:8 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap", flex:1, minWidth:0 }}>
          <span style={{ fontWeight:700, fontSize:14, color:T.text }}>{dayName}</span>
          {day.date && !isMobile && <span style={{ fontSize:12, color:T.textSub }}>{formatDate(day.date)}</span>}
          {day.isHoliday && <Badge color={T.yellow}>Holiday</Badge>}
        </div>
        <div style={{ display:"flex", gap:6, alignItems:"center", flexShrink:0 }}>
          <label style={{ display:"flex", alignItems:"center", gap:5, fontSize:12, color:T.textSub, cursor:"pointer", whiteSpace:"nowrap" }}>
            <input type="checkbox" checked={day.isHoliday} onChange={e=>u("isHoliday",e.target.checked)} style={{ accentColor:T.yellow, width:16, height:16 }}/>{isMobile?"":"Holiday"}
          </label>
          <button onClick={onRemove} style={{ ...gs.btn, padding:"6px 10px", background:T.redSoft, color:T.red, border:`1px solid ${T.red}20`, fontSize:13 }}>✕</button>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:isMobile?"1fr":"1fr 1fr", gap:10, marginBottom:12 }}>
        <div><label style={gs.label}>Date</label><input type="date" value={day.date} onChange={e=>u("date",e.target.value)} style={gs.input}/></div>
        <div><label style={gs.label}>Hours Worked</label>
          <input type="number" min={0} max={24} step={0.5} value={day.isHoliday?0:day.hoursWorked} disabled={day.isHoliday} onChange={e=>u("hoursWorked",e.target.value)} style={{ ...gs.input, background:day.isHoliday?T.bg:T.surface }}/>
        </div>
      </div>

      {day.isHoliday ? (
        <div><label style={gs.label}>Holiday Name</label><input value={day.holidayName} onChange={e=>u("holidayName",e.target.value)} placeholder="e.g. Chinese New Year" style={gs.input}/></div>
      ) : (
        <>
          <div style={{ marginBottom:12 }}>
            <label style={gs.label}>Key Tasks & Responsibilities</label>
            {day.tasks.map((task,i)=>(
              <div key={i} style={{ display:"flex", gap:6, marginBottom:6 }}>
                <input value={task} onChange={e=>{const t=[...day.tasks];t[i]=e.target.value;onChange({...day,tasks:t});}} placeholder={`Task ${i+1}…`} style={{ ...gs.input, marginBottom:0 }}/>
                {day.tasks.length>1 && <button onClick={()=>onChange({...day,tasks:day.tasks.filter((_,j)=>j!==i)})} style={{ ...gs.btn, padding:"8px 12px", background:T.redSoft, color:T.red, border:"none", flexShrink:0 }}>✕</button>}
              </div>
            ))}
            <button onClick={()=>onChange({...day,tasks:[...day.tasks,""]})} style={{ ...gs.btn, background:T.accentSoft, color:T.accentText, marginTop:4, fontSize:13, padding:"8px 14px" }}>+ Task</button>
          </div>
          <div><label style={gs.label}>Experiences & Reflections</label>
            <textarea value={day.experiences} onChange={e=>u("experiences",e.target.value)} placeholder="What did you learn today?" style={{ ...gs.textarea, minHeight:72 }} rows={3}/>
          </div>
        </>
      )}
    </div>
  );
}

// ─── WEEK EDITOR ──────────────────────────────────────────────────────────────
function WeekEditor({ week, onChange, onRemove }) {
  const isMobile = useIsMobile();
  const u = (f,v) => onChange({...week,[f]:v});
  const updateDay = (i,d) => { const days=[...week.days]; days[i]=d; onChange({...week,days}); };
  const wh = weekHours(week);

  return (
    <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:T.radiusLg, padding:isMobile?"14px":"22px", marginBottom:14, boxShadow:T.shadow }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16, gap:8 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, flex:1, minWidth:0 }}>
          <div style={{ width:34, height:34, background:T.accentSoft, borderRadius:9, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:13, color:T.accentText, flexShrink:0 }}>W{week.weekNumber}</div>
          <div style={{ minWidth:0 }}>
            <div style={{ fontWeight:700, fontSize:14, color:T.text }}>Week #{week.weekNumber}</div>
            <div style={{ fontSize:12, color:T.textSub }}>
              {week.startDate&&week.endDate?`${formatDate(week.startDate)} – ${formatDate(week.endDate)}`:"Set dates"} · <span style={{ color:T.accent, fontWeight:600 }}>{wh}h</span>
            </div>
          </div>
        </div>
        <button onClick={onRemove} style={{ ...gs.btn, background:T.redSoft, color:T.red, border:`1px solid ${T.red}20`, fontSize:12, padding:"7px 12px", flexShrink:0 }}>✕</button>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:isMobile?"1fr":"1fr 1fr 1fr", gap:10, marginBottom:16 }}>
        <div><label style={gs.label}>Week #</label><input type="number" min={1} value={week.weekNumber} onChange={e=>u("weekNumber",e.target.value)} style={gs.input}/></div>
        <div><label style={gs.label}>Start Date</label><input type="date" value={week.startDate} onChange={e=>u("startDate",e.target.value)} style={gs.input}/></div>
        <div><label style={gs.label}>End Date</label><input type="date" value={week.endDate} onChange={e=>u("endDate",e.target.value)} style={gs.input}/></div>
      </div>

      <div style={{ marginBottom:16 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
          <span style={{ fontSize:12, fontWeight:600, color:T.textSub, textTransform:"uppercase", letterSpacing:"0.08em" }}>Daily Log</span>
          <button onClick={()=>onChange({...week,days:[...week.days,DEFAULT_DAY()]})} style={{ ...gs.btn, background:T.accent, color:"#fff", fontSize:13, padding:"7px 14px" }}>+ Day</button>
        </div>
        {week.days.map((day,i)=><DayEditor key={day.id||i} day={day} dayIndex={i} onChange={d=>updateDay(i,d)} onRemove={()=>onChange({...week,days:week.days.filter((_,j)=>j!==i)})}/>)}
      </div>

      <div style={{ borderTop:`1px solid ${T.border}`, paddingTop:16 }}>
        <div style={{ fontSize:12, fontWeight:600, color:T.textSub, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:12 }}>Weekly Summary</div>
        <div style={{ display:"grid", gridTemplateColumns:isMobile?"1fr":"1fr 1fr", gap:12 }}>
          {[["summary","Summary","Overall accomplishment?"],["challenges","Challenges","What was hard?"],["skills","Skills Improved","What did you develop?"],["lessons","Lessons Learned","What will you carry forward?"]].map(([f,l,ph])=>(
            <div key={f}><label style={gs.label}>{l}</label><textarea value={week[f]} onChange={e=>u(f,e.target.value)} placeholder={ph} style={{ ...gs.textarea, minHeight:70 }} rows={3}/></div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── REPORT EDITOR ────────────────────────────────────────────────────────────
function ReportEditor({ report, onBack, onUpdate, user }) {
  const isMobile = useIsMobile();
  const [saveStatus, setSaveStatus] = useState("idle");
  const [showAI, setShowAI] = useState(false);
  const [shareModal, setShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const saveTimer = useRef(null);

  const autoSave = useCallback((updated) => {
    setSaveStatus("saving");
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(()=>{ onUpdate(updated); setSaveStatus("saved"); setTimeout(()=>setSaveStatus("idle"),2500); },900);
  },[onUpdate]);

  const updateReport = (changes) => {
    const updated = {...report,...changes,updatedAt:new Date().toISOString().slice(0,10)};
    onUpdate(updated); autoSave(updated);
  };

  const updateWeek = (i,w) => { const weeks=[...report.weeks]; weeks[i]=w; updateReport({weeks}); };
  const addWeek = () => updateReport({weeks:[...report.weeks,DEFAULT_WEEK(report.weeks.length+1)]});
  const removeWeek = (i) => updateReport({weeks:report.weeks.filter((_,j)=>j!==i)});
  const total = totalHours(report.weeks);
  const totalDays = report.weeks.reduce((s,w)=>s+w.days.filter(d=>!d.isHoliday).length,0);

  const exportPDF = () => {
    if (!window.jspdf) return;
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({unit:"pt",format:"a4"});
    const W=doc.internal.pageSize.getWidth(), H=doc.internal.pageSize.getHeight();
    const ML=50, pageW=W-100; let y=50;
    const checkPage=(n=40)=>{if(y+n>H-50){doc.addPage();y=50;}};
    doc.setFillColor(99,102,241); doc.rect(0,0,W,90,"F");
    doc.setFont("helvetica","bold"); doc.setFontSize(20); doc.setTextColor(255,255,255);
    doc.text(report.title,ML,40);
    doc.setFont("helvetica","normal"); doc.setFontSize(11); doc.setTextColor(200,200,255);
    doc.text(`${user.name}  ·  ${report.weeks.length} weeks  ·  ${total} total hrs`,ML,60);
    doc.setFontSize(9); doc.setTextColor(180,180,255);
    doc.text(`Generated ${new Date().toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"})}`,ML,76);
    y=110;
    report.weeks.forEach((week,wi)=>{
      if(wi>0){doc.addPage();y=50;}
      const wh=weekHours(week);
      doc.setFillColor(238,242,255); doc.rect(ML,y-14,pageW,26,"F");
      doc.setFont("helvetica","bold"); doc.setFontSize(13); doc.setTextColor(67,56,202);
      doc.text(`Week #${week.weekNumber}`,ML+10,y+5);
      if(week.startDate&&week.endDate){doc.setFont("helvetica","normal");doc.setFontSize(9);doc.setTextColor(107,114,128);doc.text(`${formatDate(week.startDate)} – ${formatDate(week.endDate)}`,ML+10,y+17);}
      doc.setFont("helvetica","bold"); doc.setFontSize(12); doc.setTextColor(99,102,241);
      doc.text(`${wh} hrs`,W-50,y+5,{align:"right"});
      y+=32;
      week.days.forEach((day,di)=>{
        checkPage(50);
        const dn=getDayName(day.date);
        doc.setFont("helvetica","bold");doc.setFontSize(11);doc.setTextColor(17,24,39);
        doc.text(`Day ${di+1}${dn?" ("+dn+")":""} — ${formatDate(day.date)||"No date"}:`,ML,y);
        if(!day.isHoliday){doc.setFont("helvetica","normal");doc.setFontSize(9);doc.setTextColor(156,163,175);doc.text(`${day.hoursWorked}h`,W-50,y,{align:"right"});}
        y+=15;
        if(day.isHoliday){doc.setFont("helvetica","italic");doc.setFontSize(10);doc.setTextColor(107,114,128);doc.text(`Holiday${day.holidayName?" — "+day.holidayName:""}`,ML+10,y);y+=18;}
        else{
          const tasks=day.tasks.filter(t=>t.trim());
          if(tasks.length){doc.setFont("helvetica","bold");doc.setFontSize(8);doc.setTextColor(107,114,128);doc.text("TASKS:",ML,y);y+=12;tasks.forEach(t=>{const lines=doc.splitTextToSize("• "+t,pageW-20);checkPage(lines.length*13+4);doc.setFont("helvetica","normal");doc.setFontSize(10);doc.setTextColor(17,24,39);doc.text(lines,ML+10,y);y+=lines.length*13;});}
          if(day.experiences?.trim()){checkPage(30);doc.setFont("helvetica","bold");doc.setFontSize(8);doc.setTextColor(107,114,128);doc.text("EXPERIENCES:",ML,y);y+=12;const lines=doc.splitTextToSize(day.experiences,pageW-20);checkPage(lines.length*13+4);doc.setFont("helvetica","normal");doc.setFontSize(10);doc.setTextColor(17,24,39);doc.text(lines,ML+10,y);y+=lines.length*13;}
        }
        doc.setDrawColor(228,231,236);doc.line(ML,y+4,W-50,y+4);y+=16;
      });
      const sf=[["SUMMARY",week.summary],["CHALLENGES",week.challenges],["SKILLS",week.skills],["LESSONS",week.lessons]].filter(([,v])=>v?.trim());
      if(sf.length){checkPage(30);doc.setFillColor(248,249,251);doc.rect(ML,y-10,pageW,20,"F");doc.setFont("helvetica","bold");doc.setFontSize(10);doc.setTextColor(99,102,241);doc.text("WEEKLY SUMMARY",ML+10,y+4);y+=22;sf.forEach(([label,val])=>{const lines=doc.splitTextToSize(val,pageW-20);checkPage(lines.length*13+28);doc.setFont("helvetica","bold");doc.setFontSize(8);doc.setTextColor(107,114,128);doc.text(label+":",ML,y);y+=12;doc.setFont("helvetica","normal");doc.setFontSize(10);doc.setTextColor(17,24,39);doc.text(lines,ML+10,y);y+=lines.length*13+8;});}
    });
    const pc=doc.internal.getNumberOfPages();
    for(let i=1;i<=pc;i++){doc.setPage(i);doc.setFont("helvetica","normal");doc.setFontSize(8);doc.setTextColor(156,163,175);doc.text(`${report.title} — ${user.name}`,ML,H-20);doc.text(`${i}/${pc}`,W-50,H-20,{align:"right"});}
    doc.save(`${report.title.replace(/\s+/g,"_")}.pdf`);
  };

  return (
    <div style={{ minHeight:"100vh", background:T.bg, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
      {/* Topbar */}
      <div style={{ background:T.surface, borderBottom:`1px solid ${T.border}`, padding:`0 ${isMobile?"14px":"24px"}`, height:56, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:100, gap:8 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, flex:1, minWidth:0 }}>
          <button onClick={onBack} style={{ ...gs.btn, background:T.surfaceHover, color:T.textSub, border:`1px solid ${T.border}`, padding:"7px 11px", fontSize:16, flexShrink:0 }}>←</button>
          <input value={report.title} onChange={e=>updateReport({title:e.target.value})}
            style={{ border:"none", outline:"none", fontWeight:700, fontSize:isMobile?13:15, color:T.text, background:"transparent", fontFamily:"'Plus Jakarta Sans',sans-serif", width:"100%", minWidth:0 }}/>
          {!isMobile && <SaveStatus status={saveStatus}/>}
        </div>

        {!isMobile && (
          <div style={{ display:"flex", gap:8, alignItems:"center", flexShrink:0 }}>
            <button onClick={()=>setShowAI(v=>!v)} style={{ ...gs.btn, background:showAI?T.accentSoft:T.surfaceHover, color:showAI?T.accentText:T.textSub, border:`1px solid ${showAI?T.accent+"40":T.border}`, fontSize:13 }}>✦ AI</button>
            <button onClick={()=>setShareModal(true)} style={{ ...gs.btn, background:T.surfaceHover, color:T.textSub, border:`1px solid ${T.border}`, fontSize:13 }}>↗ Share</button>
            <button onClick={exportPDF} style={{ ...gs.btn, background:T.accent, color:"#fff", fontSize:13, boxShadow:`0 2px 8px ${T.accent}40` }}>📄 Export PDF</button>
          </div>
        )}

        {isMobile && (
          <div style={{ position:"relative", flexShrink:0 }}>
            <button onClick={()=>setMenuOpen(v=>!v)} style={{ ...gs.btn, background:T.surfaceHover, color:T.text, border:`1px solid ${T.border}`, padding:"8px 13px", fontSize:18 }}>⋯</button>
            {menuOpen && (
              <>
                <div onClick={()=>setMenuOpen(false)} style={{ position:"fixed", inset:0, zIndex:150 }}/>
                <div style={{ position:"absolute", right:0, top:"110%", background:T.surface, border:`1px solid ${T.border}`, borderRadius:T.radiusLg, boxShadow:T.shadowMd, zIndex:200, minWidth:180, overflow:"hidden" }}>
                  {[{label:"✦ AI Summary",action:()=>setShowAI(v=>!v)},{label:"↗ Share",action:()=>setShareModal(true)},{label:"📄 Export PDF",action:exportPDF}].map((item,i,arr)=>(
                    <button key={item.label} onClick={()=>{item.action();setMenuOpen(false);}} style={{ ...gs.btn, width:"100%", justifyContent:"flex-start", borderRadius:0, background:"transparent", color:T.text, padding:"13px 18px", fontSize:14, border:"none", borderBottom:i<arr.length-1?`1px solid ${T.border}`:"none" }}>
                      {item.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <div style={{ maxWidth:900, margin:"0 auto", padding:isMobile?"14px 14px 100px":"28px 24px" }}>
        {/* Save status on mobile */}
        {isMobile && saveStatus!=="idle" && (
          <div style={{ marginBottom:12, display:"flex", justifyContent:"center" }}>
            <SaveStatus status={saveStatus}/>
          </div>
        )}

        {/* Stats */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:isMobile?8:10, marginBottom:18 }}>
          {[["Hours",`${total}h`],["Days",totalDays],["Weeks",report.weeks.length],["Avg",report.weeks.length?`${Math.round(total/report.weeks.length)}h`:"—"]].map(([l,v])=>(
            <div key={l} style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:T.radius, padding:isMobile?"10px 8px":"12px 16px", boxShadow:T.shadow, textAlign:"center" }}>
              <div style={{ fontSize:10, color:T.textMuted, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:3 }}>{l}</div>
              <div style={{ fontSize:isMobile?18:22, fontWeight:800, color:T.accent }}>{v}</div>
            </div>
          ))}
        </div>

        {showAI && <AISummaryPanel report={report} targetWeek={report.weeks.length-1}/>}

        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
          <h2 style={{ margin:0, fontSize:16, fontWeight:700, color:T.text }}>Weekly Log</h2>
          <button onClick={addWeek} style={{ ...gs.btn, background:T.accent, color:"#fff", fontSize:13, padding:"8px 14px" }}>+ Week</button>
        </div>

        {report.weeks.map((week,i)=>(
          <WeekEditor key={week.id||i} week={week} weekIndex={i} onChange={w=>updateWeek(i,w)} onRemove={()=>removeWeek(i)}/>
        ))}
      </div>

      {/* Mobile sticky bottom bar */}
      {isMobile && (
        <div style={{ position:"fixed", bottom:0, left:0, right:0, background:T.surface, borderTop:`1px solid ${T.border}`, padding:"10px 14px", display:"flex", gap:8, zIndex:99, paddingBottom:"max(10px, env(safe-area-inset-bottom))" }}>
          <button onClick={()=>setShowAI(v=>!v)} style={{ ...gs.btn, flex:1, background:showAI?T.accentSoft:T.surfaceHover, color:showAI?T.accentText:T.textSub, border:`1px solid ${showAI?T.accent+"40":T.border}`, fontSize:13, padding:"12px" }}>✦ AI</button>
          <button onClick={exportPDF} style={{ ...gs.btn, flex:2, background:T.accent, color:"#fff", padding:"12px", fontSize:14 }}>📄 Export PDF</button>
          <button onClick={()=>setShareModal(true)} style={{ ...gs.btn, flex:1, background:T.surfaceHover, color:T.text, border:`1px solid ${T.border}`, padding:"12px", fontSize:13 }}>↗</button>
        </div>
      )}

      <Modal open={shareModal} onClose={()=>{setShareModal(false);setCopied(false);}} title="Share Report">
        <p style={{ margin:"0 0 12px", fontSize:14, color:T.textSub }}>Share a read-only link to this report.</p>
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          <input readOnly value={`https://reportly.app/share/${report.shareId}`} style={{ ...gs.input, background:T.bg, fontSize:13 }}/>
          <button onClick={()=>{navigator.clipboard?.writeText(`https://reportly.app/share/${report.shareId}`);setCopied(true);setTimeout(()=>setCopied(false),2000);}}
            style={{ ...gs.btn, background:copied?T.greenSoft:T.accent, color:copied?T.green:"#fff", width:"100%", padding:"13px" }}>
            {copied?"✓ Link Copied!":"Copy Share Link"}
          </button>
        </div>
        <p style={{ margin:"10px 0 0", fontSize:12, color:T.textMuted }}>🔒 Viewers cannot edit your report.</p>
      </Modal>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [reports, setReports] = useState(SAMPLE_REPORTS);
  const [activeReportId, setActiveReportId] = useState(null);

  useEffect(()=>{
    if(window.jspdf) return;
    const s=document.createElement("script");
    s.src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
    document.head.appendChild(s);
  },[]);

  const activeReport = reports.find(r=>r.id===activeReportId);
  const handleOpen = (id) => { setReports(prev=>prev.map(r=>r.id===id&&!r.weeks?.length?{...r,weeks:[DEFAULT_WEEK(1)]}:r)); setActiveReportId(id); };
  const handleCreate = () => { const r=DEFAULT_REPORT(); setReports(prev=>[r,...prev]); setActiveReportId(r.id); };
  const handleUpdate = (updated) => setReports(prev=>prev.map(r=>r.id===updated.id?{...updated,weekCount:updated.weeks.length,totalHours:totalHours(updated.weeks)}:r));
  const handleDelete = (id) => setReports(prev=>prev.filter(r=>r.id!==id));
  const handleRename = (id,title) => setReports(prev=>prev.map(r=>r.id===id?{...r,title}:r));

  if (!user) return <LoginPage onLogin={setUser}/>;
  if (activeReport) return <ReportEditor report={activeReport} onBack={()=>setActiveReportId(null)} onUpdate={handleUpdate} user={user}/>;
  return <Dashboard user={user} reports={reports} onOpen={handleOpen} onCreate={handleCreate} onDelete={handleDelete} onRename={handleRename}/>;
}
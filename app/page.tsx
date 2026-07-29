"use client";

import { useEffect, useMemo, useState } from "react";

type Perspective = { id: string; icon: string; title: string; desc: string; question: string; tint: string };
type Section = { id: string; title: string; prompt: string; body: string };

const perspectives: Perspective[] = [
  { id: "premise", icon: "?", title: "전제", desc: "당연하게 깔고 가는 가정 드러내기", question: "이 주장은 무엇을 전제로 할까?", tint: "lavender" },
  { id: "definition", icon: "≡", title: "정의", desc: "개념을 자기 언어로 다시 세우기", question: "이 말을 쉽게 다시 정의하면 무엇일까?", tint: "mint" },
  { id: "depth", icon: "↓", title: "층위", desc: "표면 뒤의 구조와 원리 내려다보기", question: "겉으로 보이는 현상 뒤에는 무엇이 있을까?", tint: "peach" },
  { id: "unit", icon: "▦", title: "단위", desc: "무엇을 하나로 볼지 바꾸어 보기", question: "개인·집단·전체 중 무엇을 하나로 볼까?", tint: "sky" },
  { id: "scale", icon: "⌁", title: "척도", desc: "측정하고 평가하는 기준 점검하기", question: "어떤 기준으로 재면 결과가 달라질까?", tint: "yellow" },
  { id: "scope", icon: "◌", title: "범위", desc: "이론과 규칙이 통하는 경계 찾기", question: "이 설명은 어디까지 적용될까?", tint: "rose" },
  { id: "opposition", icon: "⇄", title: "대립", desc: "반대 입장을 함께 세워 긴장 보기", question: "반대편에서는 이 문제를 어떻게 볼까?", tint: "blue" },
  { id: "difference", icon: "≠", title: "차이", desc: "비슷해 보이는 대상의 다름 변별하기", question: "비슷하지만 결정적으로 다른 점은 무엇일까?", tint: "purple" },
  { id: "similarity", icon: "≈", title: "유사성", desc: "서로 다른 대상의 공통 구조 찾기", question: "다른 영역에서도 같은 구조가 반복될까?", tint: "green" },
  { id: "hierarchy", icon: "△", title: "위계", desc: "기초·상위·응용의 구조 세우기", question: "무엇이 무엇의 기초 또는 상위에 있을까?", tint: "orange" },
];

const paths = [
  { id: "observe", icon: "◉", title: "관찰형", desc: "직접 보고, 기록하고, 패턴을 찾아요.", time: "1~2주" },
  { id: "data", icon: "▤", title: "자료 분석형", desc: "통계와 자료를 모아 근거를 비교해요.", time: "2~3주" },
  { id: "experiment", icon: "⚗", title: "실험·검증형", desc: "가설을 세우고 직접 검증해요.", time: "3~4주" },
  { id: "project", icon: "⌘", title: "문제 해결형", desc: "해결안을 설계하고 결과물을 만들어요.", time: "3~5주" },
];

const defaultSections: Section[] = [
  { id: "intro", title: "1. 탐구 동기와 질문", prompt: "왜 이 주제를 탐구하게 되었나요?", body: "평소 학교 주변의 일회용품 사용량이 많다는 점에 관심이 생겼다.\n우리 학교에서 일회용품 사용을 줄이려면 어떤 방법이 효과적일까?" },
  { id: "background", title: "2. 배경 지식과 자료 조사", prompt: "주제를 이해하기 위해 어떤 자료를 찾아보았나요?", body: "일회용품의 종류와 분해 기간, 학교 구성원의 사용 습관에 관한 자료를 조사한다." },
  { id: "method", title: "3. 탐구 방법", prompt: "어떤 순서와 방법으로 탐구했나요?", body: "일주일 동안 학급별 사용 현황을 관찰하고, 학생 설문을 실시한 뒤 결과를 비교한다." },
  { id: "result", title: "4. 탐구 결과와 해석", prompt: "자료에서 어떤 결과를 발견했나요?", body: "관찰 기록과 설문 결과를 표와 그래프로 정리하고, 반복해서 나타나는 특징을 해석한다." },
  { id: "conclusion", title: "5. 결론과 제안", prompt: "탐구를 통해 무엇을 알게 되었고 무엇을 제안하나요?", body: "탐구 결과를 바탕으로 실천 가능한 개선 방법을 제안하고, 후속 탐구 질문을 정리한다." },
];

export default function Home() {
  const [studentNo, setStudentNo] = useState("20417");
  const [studentName, setStudentName] = useState("김민서");
  const [interest, setInterest] = useState("학교 일회용품 사용");
  const [step, setStep] = useState(1);
  const [selectedPerspectives, setSelectedPerspectives] = useState<string[]>(["premise", "definition"]);
  const [selectedPath, setSelectedPath] = useState("data");
  const [activeDepth, setActiveDepth] = useState<"basic" | "advanced">("basic");
  const [sections, setSections] = useState(defaultSections);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [toast, setToast] = useState("");
  const [sessionTitle, setSessionTitle] = useState("학교 일회용품 사용을 줄이는 방법");
  const [sessions, setSessions] = useState<{ title: string; date: string }[]>([]);

  useEffect(() => {
    const raw = localStorage.getItem("inquiry-studio-draft");
    if (raw) {
      try { const draft = JSON.parse(raw); const savedPerspectives = (draft.selectedPerspectives || []).filter((id: string) => perspectives.some((p) => p.id === id)); setStudentNo(draft.studentNo || "20417"); setStudentName(draft.studentName || "김민서"); setInterest(draft.interest || "학교 일회용품 사용"); setSelectedPerspectives(savedPerspectives.length ? savedPerspectives : ["premise", "definition"]); setSelectedPath(draft.selectedPath || "data"); setSections(draft.sections || defaultSections); setSessionTitle(draft.sessionTitle || "학교 일회용품 사용을 줄이는 방법"); } catch { /* use defaults */ }
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem("inquiry-studio-draft", JSON.stringify({ studentNo, studentName, interest, selectedPerspectives, selectedPath, sections, sessionTitle }));
      setSavedAt(new Date());
    }, 700);
    return () => clearTimeout(timer);
  }, [studentNo, studentName, interest, selectedPerspectives, selectedPath, sections, sessionTitle]);

  const selectedNames = useMemo(() => perspectives.filter((p) => selectedPerspectives.includes(p.id)).map((p) => p.title), [selectedPerspectives]);
  const togglePerspective = (id: string) => setSelectedPerspectives((current) => current.includes(id) ? current.filter((x) => x !== id) : current.length < 3 ? [...current, id] : current);
  const updateSection = (id: string, body: string) => setSections((current) => current.map((section) => section.id === id ? { ...section, body } : section));
  const notify = (message: string) => { setToast(message); setTimeout(() => setToast(""), 2400); };
  const saveSession = () => { setSessions((current) => [{ title: sessionTitle, date: new Date().toLocaleString("ko-KR", { dateStyle: "medium", timeStyle: "short" }) }, ...current]); notify("탐구 세션을 저장했어요"); };

  return <main className="inquiry-app">
    <aside className="inquiry-sidebar">
      <div className="inquiry-brand"><span className="brand-mark">탐</span><div><strong>탐구 주제 잡기</strong><small>Inquiry Studio</small></div></div>
      <div className="student-chip"><span className="student-avatar">{studentName.slice(0, 1)}</span><div><strong>{studentName}</strong><small>{studentNo} · 고등학교 2학년</small></div><span className="chevron">⌄</span></div>
      <div className="progress-label"><span>탐구 만들기</span><b>{step}/6</b></div>
      <nav className="step-nav">{[[1, "기본 정보", "학번·이름"], [2, "관점 선택", "10가지 관점 카드"], [3, "탐구 경로", "탐구 방식 고르기"], [4, "탐구 내용", "기본·심화 확인"], [5, "보고서 편집", "목차와 내용"], [6, "완성", "저장 및 확인"]].map(([number, label, sub]) => <button key={number as number} className={step === number ? "step-link active" : step > (number as number) ? "step-link complete" : "step-link"} onClick={() => setStep(number as number)}><span className="step-number">{step > (number as number) ? "✓" : number}</span><span><strong>{label}</strong><small>{sub}</small></span></button>)}</nav>
      <div className="sidebar-note"><span>✦</span><p><strong>좋은 탐구의 시작</strong><br />궁금한 것을 작게 쪼개고,<br />직접 확인할 방법을 찾아보세요.</p></div>
      <button className="session-list-button" onClick={() => notify(`${sessions.length}개의 저장 세션이 있어요`)}>▣ 저장한 세션 <em>{sessions.length}</em></button>
    </aside>
    <section className="inquiry-content">
      <header className="inquiry-header"><div><span className="kicker">2026학년도 · 탐구 활동 설계</span><h1>나만의 탐구 주제 만들기</h1><p>생각의 방향을 고르고, 질문을 구체적인 탐구 계획으로 바꿔보세요.</p></div><div className="header-status"><span className="status-dot" />{savedAt ? `${savedAt.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })} 저장됨` : "저장 준비 중"}<button onClick={saveSession}>세션 저장</button></div></header>
      <div className="step-heading"><div><span className="large-step">0{step}</span><div><span className="kicker">STEP {step} OF 6</span><h2>{step === 1 ? "탐구자 정보를 알려주세요" : step === 2 ? "어떤 관점으로 바라볼까요?" : step === 3 ? "탐구 방법을 골라보세요" : step === 4 ? "탐구 내용을 확인해보세요" : step === 5 ? "보고서의 뼈대를 다듬어보세요" : "탐구 설계가 완성되었어요"}</h2></div></div><span className="step-help">{step === 2 ? "최대 3개까지 선택" : "진행하면서 언제든 수정할 수 있어요"}</span></div>
      {step === 1 && <section className="step-panel profile-panel"><div className="panel-intro"><span className="intro-icon">✎</span><div><h3>탐구를 시작하는 사람</h3><p>학번·이름과 함께 지금 궁금한 주제나 개념을 적어 탐구의 출발점을 제시해 주세요.</p></div></div><div className="profile-form"><label>학번 <i>*</i><input value={studentNo} onChange={(e) => setStudentNo(e.target.value)} placeholder="예: 20417" /></label><label>이름 <i>*</i><input value={studentName} onChange={(e) => setStudentName(e.target.value)} placeholder="예: 김민서" /></label></div><label className="interest-field">나의 관심 주제 또는 개념 <i>*</i><input value={interest} onChange={(e) => setInterest(e.target.value)} placeholder="예: 기후 변화, 인공지능의 편향, 학교 일회용품 사용" /><small>아직 질문이 아니어도 괜찮아요. 관심 있는 현상·개념·불편함을 자유롭게 적어보세요.</small></label><div className="example-callout"><span>☼</span><div><strong>탐구는 관심에서 시작해 질문으로 자라나요</strong><p>입력한 관심 주제를 바탕으로 다음 단계에서 사고 형식과 탐구 경로를 골라 구체적인 질문으로 발전시킬 수 있어요.</p></div></div></section>}
      {step === 2 && <section className="step-panel"><div className="selection-summary"><span>선택한 사고 형식</span><strong>{selectedNames.length ? selectedNames.join(" · ") : "아직 선택하지 않았어요"}</strong></div><div className="perspective-grid">{perspectives.map((p) => <button key={p.id} className={`perspective-card ${p.tint} ${selectedPerspectives.includes(p.id) ? "selected" : ""}`} onClick={() => togglePerspective(p.id)}><span className="perspective-icon">{p.icon}</span><span className="card-check">{selectedPerspectives.includes(p.id) ? "✓" : ""}</span><strong>{p.title}</strong><small>{p.desc}</small><em>{p.question}</em></button>)}</div></section>}
      {step === 3 && <section className="step-panel"><div className="path-list">{paths.map((path) => <button key={path.id} className={`path-card ${selectedPath === path.id ? "selected" : ""}`} onClick={() => setSelectedPath(path.id)}><span className="path-icon">{path.icon}</span><span className="path-copy"><strong>{path.title}</strong><small>{path.desc}</small></span><span className="path-time">예상 {path.time}</span><span className="radio">{selectedPath === path.id ? "✓" : ""}</span></button>)}</div><div className="path-preview"><div><span className="preview-label">선택한 경로</span><h3>{paths.find((p) => p.id === selectedPath)?.title}</h3><p>{paths.find((p) => p.id === selectedPath)?.desc}</p></div><span className="preview-arrow">→</span></div></section>}
      {step === 4 && <section className="step-panel content-panel"><div className="topic-banner"><span className="topic-spark">✦</span><div><small>관심 출발점: {interest}</small><h3>{sessionTitle}</h3><div className="topic-tags">{selectedNames.map((name) => <span key={name}>{name}</span>)}<span>{paths.find((p) => p.id === selectedPath)?.title}</span></div></div><button onClick={() => setStep(5)}>주제 수정</button></div><div className="depth-tabs"><button className={activeDepth === "basic" ? "active" : ""} onClick={() => setActiveDepth("basic")}>기본 탐구 <small>핵심 질문과 관찰</small></button><button className={activeDepth === "advanced" ? "active" : ""} onClick={() => setActiveDepth("advanced")}>심화 탐구 <small>분석과 확장 질문</small></button></div><div className="content-check"><span className="check-badge">✓</span><div><strong>{activeDepth === "basic" ? "먼저 이 정도로 시작해보세요" : "여기서 한 단계 더 깊게"}</strong><p>{activeDepth === "basic" ? "학교 안에서 일회용품이 얼마나 사용되는지 관찰하고, 사용이 많은 상황과 이유를 찾아봅니다." : "학급별·시간대별 차이를 비교하고, 비용과 환경 영향을 함께 고려해 실천 가능한 대안을 설계합니다."}</p></div></div><div className="question-grid"><div><span>핵심 질문</span><strong>{activeDepth === "basic" ? "우리 학교에서 일회용품 사용이 많은 상황은 언제일까?" : "사용량을 줄이는 방법 중 가장 지속 가능한 방법은 무엇일까?"}</strong></div><div><span>추천 자료</span><strong>{activeDepth === "basic" ? "관찰 기록 · 학생 인터뷰 · 사용량 체크표" : "설문 통계 · 사례 비교 · 비용 계산표"}</strong></div></div></section>}
      {step === 5 && <section className="step-panel editor-panel"><div className="editor-top"><div><span className="kicker">REPORT TITLE</span><input className="title-input" value={sessionTitle} onChange={(e) => setSessionTitle(e.target.value)} /></div><span className="edit-hint">내용을 클릭해 바로 수정하세요</span></div><div className="report-editor"><div className="toc"><div className="toc-title">목차 <span>5</span></div>{sections.map((section, index) => <button key={section.id} className={index === 0 ? "active" : ""}><span>0{index + 1}</span>{section.title.replace(/^\d\. /, "")}</button>)}</div><div className="section-editor">{sections.map((section) => <article key={section.id} className="editable-section"><div><span className="section-number">{section.title.split(".")[0]}</span><div><h3>{section.title.replace(/^\d\. /, "")}</h3><small>{section.prompt}</small></div></div><textarea value={section.body} onChange={(e) => updateSection(section.id, e.target.value)} /></article>)}</div></div></section>}
      {step === 6 && <section className="step-panel complete-panel"><div className="complete-icon">✓</div><h3>{studentName}님의 탐구 설계가 완성되었어요</h3><p>이제 보고서를 작성하며 궁금증을 직접 확인해보세요.</p><div className="complete-summary"><div><span>탐구 주제</span><strong>{sessionTitle}</strong></div><div><span>탐구 관점</span><strong>{selectedNames.join(" · ")}</strong></div><div><span>탐구 경로</span><strong>{paths.find((p) => p.id === selectedPath)?.title}</strong></div></div><button className="primary-button" onClick={saveSession}>✦ 탐구 세션 저장하기 <span>→</span></button></section>}
      <footer className="step-actions"><button className="back-button" onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1}>← 이전</button><div className="action-right"><span className="autosave"><span className="status-dot" /> {savedAt ? "자동 저장됨" : "입력 내용을 저장하고 있어요"}</span>{step < 6 && <button className="primary-button" onClick={() => setStep(Math.min(6, step + 1))}>{step === 5 ? "완성 화면으로" : "다음 단계"} <span>→</span></button>}</div></footer>
    </section>
    {toast && <div className="toast">✓ {toast}</div>}
  </main>;
}

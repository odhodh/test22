"use client";

import { useEffect, useMemo, useState } from "react";

type Perspective = { id: string; icon: string; title: string; desc: string; question: string; tint: string };
type Section = { id: string; title: string; prompt: string; body: string };
type AIContent = { topic: string; question: string; basic: string; advanced: string; recommendedMaterials: string; reportSections?: Array<{ title: string; prompt: string; body: string }> };

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

function perspectiveExample(interest: string, perspective: Perspective) {
  const subject = interest || "입력한 관심 주제";
  const examples: Record<string, string> = {
    premise: `${subject}를 탐구할 때, ‘현재 방식은 당연히 필요하다’고 가정하고 있지는 않은지 전제를 먼저 점검해 본다.`,
    definition: `${subject}에서 사용하는 핵심 개념을 교과서 정의에 머물지 않고, 관찰 가능한 현상을 설명하는 나만의 말로 다시 정의해 본다.`,
    depth: `${subject}의 겉으로 드러난 현상에서 멈추지 않고, 그 현상을 만들어 낸 구조와 원리를 한 층 더 내려가 살펴본다.`,
    unit: `${subject}를 개인·학급·학교 전체처럼 분석 단위를 달리해 살펴보고, 단위가 바뀔 때 어떤 모습이 새롭게 드러나는지 비교한다.`,
    scale: `${subject}를 측정할 때 사용한 기준을 바꾸어 보고, 어떤 척도를 선택하느냐에 따라 결과와 해석이 어떻게 달라지는지 확인한다.`,
    scope: `${subject}에 대한 설명이나 해결 방법이 모든 상황에 적용되는지, 성립하지 않는 조건과 적용 범위를 찾아 경계를 그어 본다.`,
    opposition: `${subject}를 찬성하는 입장과 반대하는 입장을 각각 충실하게 재구성한 뒤, 두 입장이 충돌하는 핵심 쟁점을 분석한다.`,
    difference: `${subject}와 비슷해 보이는 사례를 함께 비교해, 겉모습이 아니라 결과를 달라지게 만드는 결정적인 차이를 찾아낸다.`,
    similarity: `${subject}에서 발견한 구조를 다른 과목·지역·시대의 사례와 비교해, 서로 다른 대상에 반복되는 공통 원리를 찾아본다.`,
    hierarchy: `${subject}를 구성하는 기초 개념과 상위 개념, 실제 적용 사례를 층층이 연결해 무엇이 무엇의 바탕이 되는지 정리한다.`,
  };
  return examples[perspective.id] || `${subject}를 ${perspective.title}의 관점에서 바라보며 탐구 질문과 확인 방법을 구체화한다.`;
}

function developedTopic(interest: string, perspective: Perspective | undefined, pathTitle: string) {
  const subject = interest || "관심 주제";
  const templates: Record<string, string> = {
    premise: `${subject}는 정말 불가피한가? - 우리가 당연하게 여긴 전제 점검하기`,
    definition: `${subject}를 어떻게 정의할 때 현상이 가장 잘 보일까?`,
    depth: `${subject}의 표면 뒤에 있는 구조와 원리는 무엇일까?`,
    unit: `${subject}를 개인·집단·학교 단위로 보면 무엇이 달라질까?`,
    scale: `${subject}를 어떤 기준으로 측정해야 정확히 이해할 수 있을까?`,
    scope: `${subject}에 대한 설명은 어디까지 적용될까?`,
    opposition: `${subject}를 둘러싼 서로 다른 입장은 어디에서 충돌할까?`,
    difference: `${subject}와 비슷한 사례는 무엇이 다를까?`,
    similarity: `${subject}에서 발견한 구조는 다른 사례에도 반복될까?`,
    hierarchy: `${subject}를 이루는 기초와 상위 구조는 어떻게 연결될까?`,
  };
  return `${templates[perspective?.id || "premise"] || `${subject}를 ${perspective?.title || "탐구"}의 관점에서 살펴보기`} · ${pathTitle}`;
}

function inquiryContent(interest: string, perspective: Perspective | undefined, depth: "basic" | "advanced") {
  const subject = interest || "관심 주제";
  const id = perspective?.id || "premise";
  if (depth === "basic") {
    const basic: Record<string, string> = {
      premise: `${subject}를 둘러싼 당연한 가정은 무엇인지 찾고, 그 가정이 실제 관찰에서도 성립하는지 확인합니다.`,
      definition: `${subject}를 탐구하기 위해 핵심 개념을 자신의 말로 정의하고, 그 정의에 맞는 사례를 찾아봅니다.`,
      depth: `${subject}에서 눈에 보이는 현상을 기록한 뒤, 그 현상을 만들어 낸 원인과 구조를 한 단계씩 추적합니다.`,
      unit: `${subject}를 개인·학급·학교 단위로 나누어 관찰하고, 분석 단위에 따라 달라지는 모습을 비교합니다.`,
      scale: `${subject}를 측정할 기준을 정하고, 동일한 자료를 여러 기준으로 살펴보며 결과를 비교합니다.`,
      scope: `${subject}에 대한 설명이 성립하는 사례와 성립하지 않는 사례를 찾아 적용 범위를 확인합니다.`,
      opposition: `${subject}에 대한 찬성·반대 입장을 각각 정리하고, 두 입장이 중요하게 보는 기준을 비교합니다.`,
      difference: `${subject}와 유사한 사례를 함께 조사해 결과를 달라지게 만드는 특징을 찾아봅니다.`,
      similarity: `${subject}와 다른 영역의 사례를 비교해 반복해서 나타나는 공통 구조를 찾아봅니다.`,
      hierarchy: `${subject}를 이해하는 데 필요한 기초 개념과 상위 개념을 연결해 탐구 구조를 그려봅니다.`,
    };
    return basic[id] || `${subject}를 관찰하고 자료를 모아 탐구 질문을 구체화합니다.`;
  }
  const advanced: Record<string, string> = {
    premise: `찾아낸 전제가 깨지는 조건을 설계하고, 전제를 바꾸었을 때 ${subject}에 대한 결론이 어떻게 달라지는지 검증합니다.`,
    definition: `자신이 세운 정의로 설명되지 않는 경계 사례를 찾아 정의의 범위와 한계를 다시 정교화합니다.`,
    depth: `표면적 원인과 구조적 원인을 구분하고, 다른 사례에서도 같은 메커니즘이 작동하는지 비교합니다.`,
    unit: `분석 단위를 바꾸었을 때 상충하는 결과가 나타나는 지점을 찾아 단위 선택이 해석에 미치는 영향을 설명합니다.`,
    scale: `척도를 달리해 결과를 재계산하고, 어떤 기준이 탐구 목적에 더 적절한지 근거를 들어 평가합니다.`,
    scope: `예외 조건에서 어떤 새로운 설명이 필요한지 탐색해 ${subject}에 대한 주장의 적용 한계를 규명합니다.`,
    opposition: `두 입장이 충돌하는 핵심 쟁점을 분리하고, 어느 조건에서 두 입장이 양립하거나 달라지는지 분석합니다.`,
    difference: `겉으로 비슷한 사례의 결정적 차이가 결과에 미치는 영향을 변인별로 나누어 설명합니다.`,
    similarity: `서로 다른 사례에 공통 구조를 적용해 보고, 그 유사성이 성립하지 않는 경계 조건까지 확인합니다.`,
    hierarchy: `기초·상위·응용 개념 사이의 관계를 모형으로 정리하고, 어느 층위의 변화가 전체 결과에 영향을 주는지 추적합니다.`,
  };
  return advanced[id] || `${subject}에 대한 자료를 확장해 다른 사례와 비교하고 설명의 한계를 확인합니다.`;
}

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
  const [key, setKey] = useState("");
  const [model, setModel] = useState("Gemini 3.5 Flash-Lite");
  const [settings, setSettings] = useState(false);
  const [aiContent, setAiContent] = useState<AIContent | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiStatus, setAiStatus] = useState("");

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

  useEffect(() => {
    const settings = localStorage.getItem("inquiry-studio-settings");
    if (settings) { try { const value = JSON.parse(settings); setKey(value.key || ""); setModel(value.model || "Gemini 3.5 Flash-Lite"); } catch { /* use defaults */ } }
  }, []);
  useEffect(() => { if (key || model) localStorage.setItem("inquiry-studio-settings", JSON.stringify({ key, model })); }, [key, model]);

  const selectedNames = useMemo(() => perspectives.filter((p) => selectedPerspectives.includes(p.id)).map((p) => p.title), [selectedPerspectives]);
  const primaryPerspective = perspectives.find((p) => p.id === selectedPerspectives[0]);
  const pathTitle = paths.find((p) => p.id === selectedPath)?.title || "탐구 경로";
  const generatedTopic = developedTopic(interest, primaryPerspective, pathTitle);
  const activeTopic = sessionTitle === "학교 일회용품 사용을 줄이는 방법" ? generatedTopic : sessionTitle;
  const togglePerspective = (id: string) => setSelectedPerspectives((current) => current.includes(id) ? current.filter((x) => x !== id) : current.length < 3 ? [...current, id] : current);
  const updateSection = (id: string, body: string) => setSections((current) => current.map((section) => section.id === id ? { ...section, body } : section));
  const notify = (message: string) => { setToast(message); setTimeout(() => setToast(""), 2400); };
  const saveSession = () => { setSessions((current) => [{ title: activeTopic, date: new Date().toLocaleString("ko-KR", { dateStyle: "medium", timeStyle: "short" }) }, ...current]); notify("탐구 세션을 저장했어요"); };

  async function generateWithGoogle() {
    if (!key) { setSettings(true); notify("개인 설정에서 Gemini API 키를 먼저 입력해 주세요"); return; }
    setAiLoading(true); setAiStatus("Gemini가 주제에 맞는 탐구 내용을 찾고 있어요...");
    try {
      const response = await fetch("/api/inquiry/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ apiKey: key, model, interest, perspectives: selectedNames, path: pathTitle }) });
      const data = await response.json() as AIContent & { error?: string };
      if (!response.ok) throw new Error(data.error || "API 요청에 실패했습니다.");
      setAiContent(data); setSessionTitle(data.topic); if (data.reportSections?.length) setSections(data.reportSections.map((section, index) => ({ id: `ai-${index}`, ...section }))); setAiStatus("Google Gemini가 검색한 자료와 생성한 보고서 초안을 반영했어요");
    } catch (error) { setAiStatus(error instanceof Error ? error.message : "생성 중 오류가 발생했습니다."); }
    finally { setAiLoading(false); }
  }

  return <main className="inquiry-app"><button className="api-settings-fab" onClick={() => setSettings(true)}>⚙ Google API 설정</button>{step === 4 && <div className="google-inquiry-panel"><div><strong>Google Gemini로 탐구 내용 확장</strong><small>관심 주제와 선택한 사고 형식을 바탕으로 기본·심화 탐구 내용을 생성합니다.</small></div><button className="ai-button" onClick={generateWithGoogle} disabled={aiLoading}>{aiLoading ? "생성 중..." : "✦ Google로 생성"}</button>{aiStatus && <span className="ai-status-inline">{aiStatus}</span>}{aiContent && <div className="ai-result"><b>{aiContent.topic}</b><strong>기본 탐구</strong><p>{aiContent.basic}</p><strong>심화 탐구</strong><p>{aiContent.advanced}</p><strong>추천 자료</strong><p>{aiContent.recommendedMaterials}</p></div>}</div>}
    {settings && <div className="modal-backdrop" onClick={() => setSettings(false)}><div className="modal" onClick={(event) => event.stopPropagation()}><div className="modal-head"><div><span className="eyebrow">개인 설정</span><h2>Google API 설정</h2></div><button onClick={() => setSettings(false)}>×</button></div><label>Gemini API 키<input type="password" placeholder="AIza..." value={key} onChange={(event) => setKey(event.target.value)} /><small>API 호출에만 사용되며 이 브라우저에 저장됩니다.</small></label><label>선호 모델<select value={model} onChange={(event) => setModel(event.target.value)}><option>Gemini 3.5 Flash-Lite</option><option>Gemini 2.5 Flash</option><option>Gemini 2.5 Flash-Lite</option></select></label><button className="primary-button" onClick={() => { localStorage.setItem("inquiry-studio-settings", JSON.stringify({ key, model })); setSettings(false); notify("Google API 설정을 저장했어요"); }}>설정 저장 <span>→</span></button></div></div>}
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
      {step === 2 && <section className="step-panel"><div className="selection-summary"><span>선택한 사고 형식</span><strong>{selectedNames.length ? selectedNames.join(" · ") : "아직 선택하지 않았어요"}</strong></div><div className="perspective-grid">{perspectives.map((p) => <button key={p.id} className={`perspective-card ${p.tint} ${selectedPerspectives.includes(p.id) ? "selected" : ""}`} onClick={() => togglePerspective(p.id)}><span className="perspective-icon">{p.icon}</span><span className="card-check">{selectedPerspectives.includes(p.id) ? "✓" : ""}</span><strong>{p.title}</strong><small>{p.desc}</small><em>{p.question}</em></button>)}</div><div className="example-preview"><div className="example-preview-head"><span>✦</span><div><strong>관심 주제로 미리 보는 탐구 예시</strong><small>카드를 선택하면 사고 형식에 맞춰 예시가 바뀌어요.</small></div></div><div className="example-list">{perspectives.filter((p) => selectedPerspectives.includes(p.id)).map((p) => <div className="example-item" key={p.id}><span className={`example-mark ${p.tint}`}>{p.title}</span><p>{perspectiveExample(interest, p)}</p></div>)}</div></div></section>}
      {step === 3 && <section className="step-panel"><div className="path-list">{paths.map((path) => <button key={path.id} className={`path-card ${selectedPath === path.id ? "selected" : ""}`} onClick={() => setSelectedPath(path.id)}><span className="path-icon">{path.icon}</span><span className="path-copy"><strong>{path.title}</strong><small>{path.desc}</small></span><span className="path-time">예상 {path.time}</span><span className="radio">{selectedPath === path.id ? "✓" : ""}</span></button>)}</div><div className="path-preview"><div><span className="preview-label">선택한 경로</span><h3>{paths.find((p) => p.id === selectedPath)?.title}</h3><p>{paths.find((p) => p.id === selectedPath)?.desc}</p></div><span className="preview-arrow">→</span></div></section>}
      {step === 4 && <section className="step-panel content-panel"><div className="topic-banner"><span className="topic-spark">✦</span><div><small>관심 출발점: {interest}</small><h3>{activeTopic}</h3><div className="topic-tags">{selectedNames.map((name) => <span key={name}>{name}</span>)}<span>{pathTitle}</span></div></div><button onClick={() => setStep(5)}>주제 수정</button></div><div className="depth-tabs"><button className={activeDepth === "basic" ? "active" : ""} onClick={() => setActiveDepth("basic")}>기본 탐구 <small>핵심 질문과 관찰</small></button><button className={activeDepth === "advanced" ? "active" : ""} onClick={() => setActiveDepth("advanced")}>심화 탐구 <small>분석과 확장 질문</small></button></div><div className="content-check"><span className="check-badge">✓</span><div><strong>{activeDepth === "basic" ? "먼저 이 정도로 시작해보세요" : "여기서 한 단계 더 깊게"}</strong><p>{inquiryContent(interest, primaryPerspective, activeDepth)}</p></div></div><div className="question-grid"><div><span>핵심 질문</span><strong>{interest}를 {primaryPerspective?.title || "탐구"}의 관점에서 어떻게 확인할 수 있을까?</strong></div><div><span>추천 자료</span><strong>{activeDepth === "basic" ? "관찰 기록 · 학생 인터뷰 · 사용량 체크표" : "설문 통계 · 사례 비교 · 비용 계산표"}</strong></div></div></section>}
      {step === 5 && <section className="step-panel editor-panel"><div className="editor-top"><div><span className="kicker">REPORT TITLE</span><input className="title-input" value={activeTopic} onChange={(e) => setSessionTitle(e.target.value)} /></div><span className="edit-hint">내용을 클릭해 바로 수정하세요</span></div><div className="report-editor"><div className="toc"><div className="toc-title">목차 <span>5</span></div>{sections.map((section, index) => <button key={section.id} className={index === 0 ? "active" : ""}><span>0{index + 1}</span>{section.title.replace(/^\d\. /, "")}</button>)}</div><div className="section-editor">{sections.map((section) => <article key={section.id} className="editable-section"><div><span className="section-number">{section.title.split(".")[0]}</span><div><h3>{section.title.replace(/^\d\. /, "")}</h3><small>{section.prompt}</small></div></div><textarea value={section.body} onChange={(e) => updateSection(section.id, e.target.value)} /></article>)}</div></div></section>}
      {step === 6 && <section className="step-panel complete-panel"><div className="complete-icon">✓</div><h3>{studentName}님의 탐구 설계가 완성되었어요</h3><p>이제 보고서를 작성하며 궁금증을 직접 확인해보세요.</p><div className="complete-summary"><div><span>탐구 주제</span><strong>{activeTopic}</strong></div><div><span>탐구 관점</span><strong>{selectedNames.join(" · ")}</strong></div><div><span>탐구 경로</span><strong>{pathTitle}</strong></div></div><button className="primary-button" onClick={saveSession}>✦ 탐구 세션 저장하기 <span>→</span></button></section>}
      <footer className="step-actions"><button className="back-button" onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1}>← 이전</button><div className="action-right"><span className="autosave"><span className="status-dot" /> {savedAt ? "자동 저장됨" : "입력 내용을 저장하고 있어요"}</span>{step < 6 && <button className="primary-button" onClick={() => setStep(Math.min(6, step + 1))}>{step === 5 ? "완성 화면으로" : "다음 단계"} <span>→</span></button>}</div></footer>
    </section>
    {toast && <div className="toast">✓ {toast}</div>}
  </main>;
}

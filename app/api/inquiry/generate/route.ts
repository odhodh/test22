import { NextResponse } from "next/server";

type RequestBody = { apiKey?: string; model?: string; interest?: string; perspectives?: string[]; path?: string };
const modelIds: Record<string, string> = { "Gemini 3.5 Flash-Lite": "gemini-3.5-flash", "Gemini 3 Flash": "gemini-3.5-flash", "Gemini 2.5 Flash": "gemini-2.5-flash", "Gemini 2.5 Flash-Lite": "gemini-2.5-flash-lite" };

export async function POST(request: Request) {
  const body = await request.json() as RequestBody;
  const apiKey = body.apiKey || process.env.GEMINI_API_KEY;
  if (!apiKey || !body.interest || !body.perspectives?.length) return NextResponse.json({ error: "Gemini API 키, 관심 주제, 사고 형식을 준비해 주세요." }, { status: 400 });
  const model = modelIds[body.model || ""] || "gemini-2.5-flash";
  const prompt = `너는 학생 탐구 설계를 돕는 교육 연구 조력자다. Google Search로 최신·신뢰 가능한 자료를 찾아 아래 정보를 바탕으로 선택한 사고 형식에 맞는 탐구 설계 전체를 작성하라.\n\n관심 주제 또는 개념: ${body.interest}\n선택한 사고 형식: ${body.perspectives.join(", ")}\n선택한 탐구 경로: ${body.path || "자료 분석형"}\n\n규칙: 학생이 직접 관찰·조사·비교·검증할 수 있는 범위로 구체화하고, 선택한 사고 형식이 제목·질문·관점별 예시·탐구 내용·보고서에 드러나야 한다. 10가지 사고 형식 모두에 대해 이 관심 주제에 적용한 구체적인 예시를 작성하고, 학생이 2단계에서 비교하여 선택할 수 있게 한다. 3단계의 관찰형·자료 분석형·실험·검증형·문제 해결형 각각에 대해 2단계에서 선택한 관점과 관심 주제에 맞춘 수행 예시를 작성한다. 선택한 탐구 경로로 실제 수행할 수 있는 자료 수집과 분석 절차를 제안한다. 기본 탐구는 관찰과 자료 수집 중심, 심화 탐구는 조건 비교·한계·확장 질문 중심으로 작성한다. 검색한 자료는 출처명과 URL을 추천 자료에 포함한다. 확인되지 않은 사실을 단정하지 않는다. 반드시 아래 JSON 객체만 반환하고 마크다운 코드 블록은 사용하지 않는다.\n{\"topic\":\"발전된 탐구 주제 제목\",\"question\":\"핵심 탐구 질문\",\"basic\":\"기본 탐구 내용 2~3문장\",\"advanced\":\"심화 탐구 내용 2~3문장\",\"recommendedMaterials\":\"추천 자료명·출처·URL과 기록 방법\",\"perspectiveExamples\":{\"premise\":\"전제 관점 적용 예시\",\"definition\":\"정의 관점 적용 예시\",\"depth\":\"층위 관점 적용 예시\",\"unit\":\"단위 관점 적용 예시\",\"scale\":\"척도 관점 적용 예시\",\"scope\":\"범위 관점 적용 예시\",\"opposition\":\"대립 관점 적용 예시\",\"difference\":\"차이 관점 적용 예시\",\"similarity\":\"유사성 관점 적용 예시\",\"hierarchy\":\"위계 관점 적용 예시\"},\"pathExamples\":{\"observe\":\"관찰형 탐구 예시\",\"data\":\"자료 분석형 탐구 예시\",\"experiment\":\"실험·검증형 탐구 예시\",\"project\":\"문제 해결형 탐구 예시\"},\"pathGuide\":\"선택한 탐구 경로에 맞는 단계별 실행 안내\",\"reportSections\":[{\"title\":\"탐구 동기와 질문\",\"prompt\":\"이 주제를 선택한 이유와 핵심 질문\",\"body\":\"보고서 초안\"},{\"title\":\"배경 지식과 자료 조사\",\"prompt\":\"핵심 개념과 참고 자료\",\"body\":\"보고서 초안\"},{\"title\":\"탐구 방법\",\"prompt\":\"관찰·조사·검증 절차\",\"body\":\"보고서 초안\"},{\"title\":\"탐구 결과와 해석\",\"prompt\":\"수집한 자료의 정리와 해석\",\"body\":\"보고서 초안\"},{\"title\":\"결론과 제안\",\"prompt\":\"알게 된 점과 후속 질문\",\"body\":\"보고서 초안\"}]}`;
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, { method: "POST", headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey }, body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }] }], tools: [{ google_search: {} }], generationConfig: { temperature: 0.35, responseMimeType: "application/json" } }) });
  if (!response.ok) return NextResponse.json({ error: `Gemini API 요청에 실패했습니다. (${response.status})` }, { status: 502 });
  const result = await response.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
  const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) return NextResponse.json({ error: "Gemini 응답에서 생성된 내용을 찾지 못했습니다." }, { status: 502 });
  try { return NextResponse.json(JSON.parse(text.replace(/^```json\s*|\s*```$/g, ""))); } catch { return NextResponse.json({ error: "Gemini 응답을 JSON으로 읽지 못했습니다." }, { status: 502 }); }
}

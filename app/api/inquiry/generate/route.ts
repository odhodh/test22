import { NextResponse } from "next/server";

type RequestBody = { apiKey?: string; model?: string; interest?: string; perspectives?: string[]; path?: string };
const modelIds: Record<string, string> = { "Gemini 3.5 Flash-Lite": "gemini-3.5-flash", "Gemini 3 Flash": "gemini-3.5-flash", "Gemini 2.5 Flash": "gemini-2.5-flash", "Gemini 2.5 Flash-Lite": "gemini-2.5-flash-lite" };

export async function POST(request: Request) {
  const body = await request.json() as RequestBody;
  if (!body.apiKey || !body.interest || !body.perspectives?.length) return NextResponse.json({ error: "API 키, 관심 주제, 사고 형식을 입력해 주세요." }, { status: 400 });
  const model = modelIds[body.model || ""] || "gemini-2.5-flash";
  const prompt = `너는 학생 탐구 설계를 돕는 교육 연구 조력자다. 아래 정보를 바탕으로 선택한 사고 형식에 맞는 탐구 주제를 발전시키고 기본 탐구와 심화 탐구 내용을 작성하라.\n\n관심 주제 또는 개념: ${body.interest}\n선택한 사고 형식: ${body.perspectives.join(", ")}\n선택한 탐구 경로: ${body.path || "자료 분석형"}\n\n규칙: 학생이 직접 관찰·조사·비교·검증할 수 있는 범위로 구체화하고, 선택한 사고 형식이 제목과 내용에 드러나야 한다. 기본 탐구는 관찰과 자료 수집 중심, 심화 탐구는 조건 비교·한계·확장 질문 중심으로 작성한다. 확인되지 않은 사실을 단정하지 않는다. 반드시 아래 JSON 객체만 반환한다.\n{\"topic\":\"발전된 탐구 주제 제목\",\"question\":\"핵심 탐구 질문\",\"basic\":\"기본 탐구 내용 2~3문장\",\"advanced\":\"심화 탐구 내용 2~3문장\",\"recommendedMaterials\":\"추천 자료와 기록 방법\"}`;
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, { method: "POST", headers: { "Content-Type": "application/json", "x-goog-api-key": body.apiKey }, body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }] }], generationConfig: { temperature: 0.35, responseMimeType: "application/json" } }) });
  if (!response.ok) return NextResponse.json({ error: `Gemini API 요청에 실패했습니다. (${response.status})` }, { status: 502 });
  const result = await response.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
  const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) return NextResponse.json({ error: "Gemini 응답에서 생성된 내용을 찾지 못했습니다." }, { status: 502 });
  try { return NextResponse.json(JSON.parse(text.replace(/^```json\s*|\s*```$/g, ""))); } catch { return NextResponse.json({ error: "Gemini 응답을 JSON으로 읽지 못했습니다." }, { status: 502 }); }
}

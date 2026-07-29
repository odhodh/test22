import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "탐구 주제 잡기 | Inquiry Studio",
  description: "학생의 궁금증을 탐구 질문과 보고서 계획으로 발전시키는 탐구 설계 도구",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body>{children}</body></html>;
}

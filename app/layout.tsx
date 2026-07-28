import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "세특 스튜디오 | 학생 활동 기반 세특 초안",
  description: "학생 활동 키워드를 과목별 세부능력 및 특기사항 초안으로 정리합니다.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}

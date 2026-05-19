"use client";

import { useState } from "react";

export default function UploadPage() {
  const [token, setToken] = useState("");
  const [urls, setUrls] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  const count = urls
    .split(/\r?\n/)
    .map((v) => v.trim())
    .filter(Boolean).length;

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setResult("");
    setError("");

    try {
      const res = await fetch(`/api/admin/import?token=${encodeURIComponent(token)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urls }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "업로드 실패");
      setResult(`${json.uploaded}개 리딤 URL 업로드 완료`);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="wrap">
      <section className="card" style={{ maxWidth: 900 }}>
        <h1>리딤 URL 대량 업로드</h1>
        <p>리딤 URL 1000개를 아래 칸에 한 줄에 하나씩 붙여넣고 업로드하세요.</p>
        <form onSubmit={submit}>
          <label>관리자 토큰</label>
          <input
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Vercel 환경변수 ADMIN_TOKEN 값"
            style={{ width: "100%", padding: 12, margin: "8px 0 16px", borderRadius: 12, border: "1px solid #ddd" }}
          />

          <label>리딤 URL 목록</label>
          <textarea
            value={urls}
            onChange={(e) => setUrls(e.target.value)}
            placeholder={"https://example.com/redeem/001\nhttps://example.com/redeem/002\nhttps://example.com/redeem/003"}
            rows={18}
            style={{ width: "100%", padding: 12, margin: "8px 0 12px", borderRadius: 12, border: "1px solid #ddd", fontFamily: "monospace" }}
          />

          <p>현재 입력: {count}개</p>
          <button disabled={loading} style={{ padding: "12px 18px", borderRadius: 12, border: 0, cursor: "pointer" }}>
            {loading ? "업로드 중..." : "Firestore에 업로드"}
          </button>
        </form>
        {result && <p className="success">{result}</p>}
        {error && <p className="error">{error}</p>}
        <hr />
        <p style={{ fontSize: 14, color: "#666" }}>
          업로드 후 /admin?token=관리자토큰 에서 전체/잔여 수량을 확인하세요.
        </p>
      </section>
    </main>
  );
}

"use client";

import { useEffect, useState } from "react";

export default function AdminPage() {
  const [token, setToken] = useState("");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const queryToken = new URLSearchParams(window.location.search).get("token") || "";
    const savedToken = window.localStorage.getItem("ADMIN_TOKEN") || "";
    const initialToken = queryToken || savedToken;

    if (initialToken) {
      setToken(initialToken);
      loadSummary(initialToken);
    }
  }, []);

  async function loadSummary(nextToken = token) {
    if (!nextToken) {
      setError("관리자 토큰을 입력해 주세요. Vercel 환경변수 ADMIN_TOKEN 값과 같아야 합니다.");
      setData(null);
      return;
    }

    setLoading(true);
    setError("");

    try {
      window.localStorage.setItem("ADMIN_TOKEN", nextToken);
      const res = await fetch(`/api/admin/summary?token=${encodeURIComponent(nextToken)}`);
      const json = await res.json();

      if (!res.ok || !json.ok) {
        throw new Error(json.message || "관리자 정보를 불러올 수 없습니다.");
      }

      setData(json);
    } catch (e) {
      setError(e.message);
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="wrap">
      <section className="card" style={{ maxWidth: 900 }}>
        <h1>리딤 지급 현황</h1>

        <div style={{ display: "flex", gap: 8, margin: "12px 0 20px" }}>
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") loadSummary();
            }}
            placeholder="관리자 토큰을 입력하세요"
            style={{ flex: 1, padding: 12, borderRadius: 12, border: "1px solid #ddd" }}
          />
          <button
            onClick={() => loadSummary()}
            disabled={loading}
            style={{ padding: "12px 18px", borderRadius: 12, border: 0, cursor: "pointer" }}
          >
            {loading ? "확인 중..." : "확인"}
          </button>
        </div>

        {error && <p className="error">{error}</p>}

        {data && (
          <>
            <div className="grid">
              <div className="stat"><span>전체</span><b>{data.total}</b></div>
              <div className="stat"><span>지급 완료</span><b>{data.claimed}</b></div>
              <div className="stat"><span>잔여</span><b>{data.remaining}</b></div>
            </div>

            <p style={{ marginTop: 16 }}>
              <a href="/admin/upload">리딤 URL 업로드 페이지로 이동</a>
            </p>

            <h2>최근 지급 로그</h2>
            <table className="table">
              <thead>
                <tr>
                  <th>시간</th>
                  <th>상태</th>
                  <th>리딤 URL</th>
                  <th>IP</th>
                </tr>
              </thead>
              <tbody>
                {data.recentLogs.map((log) => (
                  <tr key={log.id}>
                    <td>{log.createdAt || "-"}</td>
                    <td>{log.status}</td>
                    <td style={{ wordBreak: "break-all" }}>{log.url || "-"}</td>
                    <td>{log.ip || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </section>
    </main>
  );
}

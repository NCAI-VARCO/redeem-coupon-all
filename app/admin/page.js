"use client";

import { useEffect, useState } from "react";

export default function AdminPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token") || "";
    fetch(`/api/admin/summary?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || "관리자 정보를 불러올 수 없습니다.");
        setData(json);
      })
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <main className="wrap"><section className="card"><h1>Admin</h1><p className="error">{error}</p></section></main>;
  if (!data) return <main className="wrap"><section className="card"><h1>Admin</h1><p>불러오는 중...</p></section></main>;

  return (
    <main className="wrap">
      <section className="card" style={{ maxWidth: 900 }}>
        <h1>리딤 지급 현황</h1>
        <div className="grid">
          <div className="stat"><span>전체</span><b>{data.total}</b></div>
          <div className="stat"><span>지급 완료</span><b>{data.claimed}</b></div>
          <div className="stat"><span>잔여</span><b>{data.remaining}</b></div>
        </div>
        <h2>최근 지급 로그</h2>
        <table className="table"><thead><tr><th>시간</th><th>상태</th><th>리딤 URL</th><th>IP</th></tr></thead><tbody>{data.recentLogs.map((log) => (<tr key={log.id}><td>{log.createdAt || "-"}</td><td>{log.status}</td><td style={{ wordBreak: "break-all" }}>{log.url || "-"}</td><td>{log.ip || "-"}</td></tr>))}</tbody></table>
      </section>
    </main>
  );
}

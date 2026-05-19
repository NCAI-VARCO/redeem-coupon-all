"use client";

import { useMemo, useState } from "react";

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);
}

function getTimeValue(value) {
  if (!value) return 0;
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? 0 : time;
}

export default function AdminDashboardPage() {
  const [token, setToken] = useState("");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [sort, setSort] = useState("usedAtDesc");
  const [query, setQuery] = useState("");

  async function loadDashboard() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/admin/dashboard?token=${encodeURIComponent(token)}`, {
        cache: "no-store",
      });
      const json = await res.json();

      if (!res.ok || !json.ok) {
        setError(json.message || "관리자 정보를 불러올 수 없습니다.");
        setData(null);
        return;
      }

      setData(json);
    } catch {
      setError("서버 연결 중 오류가 발생했습니다.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  const filteredCodes = useMemo(() => {
    const list = [...(data?.codes || [])];
    const normalizedQuery = query.trim().toLowerCase();

    return list
      .filter((code) => {
        if (statusFilter === "used" && !code.used) return false;
        if (statusFilter === "available" && code.used) return false;
        if (!normalizedQuery) return true;

        return [code.url, code.usedBy, code.id]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(normalizedQuery));
      })
      .sort((a, b) => {
        if (sort === "usedAtAsc") {
          return getTimeValue(a.usedAt) - getTimeValue(b.usedAt);
        }
        if (sort === "createdAtDesc") {
          return getTimeValue(b.createdAt) - getTimeValue(a.createdAt);
        }
        if (sort === "createdAtAsc") {
          return getTimeValue(a.createdAt) - getTimeValue(b.createdAt);
        }
        if (sort === "status") {
          if (a.used === b.used) return getTimeValue(b.usedAt) - getTimeValue(a.usedAt);
          return a.used ? -1 : 1;
        }
        return getTimeValue(b.usedAt) - getTimeValue(a.usedAt);
      });
  }, [data, query, sort, statusFilter]);

  const usageRate = data?.usageRate ?? 0;

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <p style={styles.eyebrow}>Admin</p>
            <h1 style={styles.title}>리딤 지급 현황</h1>
          </div>
          {data && <button style={styles.secondaryButton} onClick={loadDashboard}>새로고침</button>}
        </div>

        <div style={styles.card}>
          <input
            style={styles.input}
            type="password"
            placeholder="관리자 토큰"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") loadDashboard();
            }}
          />
          <button style={styles.button} onClick={loadDashboard} disabled={loading}>
            {loading ? "불러오는 중..." : "현황 불러오기"}
          </button>
        </div>

        {error && <p style={styles.error}>{error}</p>}

        {data && (
          <>
            <div style={styles.stats}>
              <div style={styles.statCard}>
                <span style={styles.statLabel}>전체 리딤</span>
                <strong style={styles.statNumber}>{data.total}</strong>
              </div>
              <div style={styles.statCard}>
                <span style={styles.statLabel}>사용된 리딤</span>
                <strong style={styles.statNumber}>{data.used}</strong>
              </div>
              <div style={styles.statCard}>
                <span style={styles.statLabel}>안 사용된 리딤</span>
                <strong style={styles.statNumber}>{data.available}</strong>
              </div>
              <div style={styles.statCard}>
                <span style={styles.statLabel}>리딤 사용률</span>
                <strong style={styles.statNumber}>{usageRate}%</strong>
                <div style={styles.progressTrack} aria-label={`리딤 사용률 ${usageRate}%`}>
                  <div style={{ ...styles.progressFill, width: `${Math.min(usageRate, 100)}%` }} />
                </div>
              </div>
            </div>

            <div style={styles.toolbar}>
              <div style={styles.segmented}>
                <button
                  style={statusFilter === "all" ? styles.activeTab : styles.tab}
                  onClick={() => setStatusFilter("all")}
                >
                  전체
                </button>
                <button
                  style={statusFilter === "used" ? styles.activeTab : styles.tab}
                  onClick={() => setStatusFilter("used")}
                >
                  사용된 리딤
                </button>
                <button
                  style={statusFilter === "available" ? styles.activeTab : styles.tab}
                  onClick={() => setStatusFilter("available")}
                >
                  안 사용된 리딤
                </button>
              </div>

              <div style={styles.controls}>
                <input
                  style={styles.searchInput}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="URL / IP / ID 검색"
                />
                <select style={styles.select} value={sort} onChange={(e) => setSort(e.target.value)}>
                  <option value="usedAtDesc">사용 시간 최신순</option>
                  <option value="usedAtAsc">사용 시간 오래된순</option>
                  <option value="status">사용된 리딤 먼저</option>
                  <option value="createdAtAsc">등록 오래된순</option>
                  <option value="createdAtDesc">등록 최신순</option>
                </select>
              </div>
            </div>

            <p style={styles.countText}>표시 중: {filteredCodes.length}개</p>

            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>상태</th>
                    <th style={styles.th}>리딤 URL</th>
                    <th style={styles.th}>사용 시간</th>
                    <th style={styles.th}>사용자/IP</th>
                    <th style={styles.th}>등록 시간</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCodes.length === 0 ? (
                    <tr>
                      <td style={styles.emptyTd} colSpan={5}>조건에 맞는 리딤이 없습니다.</td>
                    </tr>
                  ) : (
                    filteredCodes.map((code) => (
                      <tr key={code.id}>
                        <td style={styles.td}>
                          <span style={code.used ? styles.usedBadge : styles.availableBadge}>
                            {code.used ? "사용됨" : "미사용"}
                          </span>
                        </td>
                        <td style={styles.td}>
                          {code.url ? (
                            <a href={code.url} target="_blank" rel="noreferrer" style={styles.link}>
                              {code.url}
                            </a>
                          ) : "-"}
                        </td>
                        <td style={styles.td}>{formatDate(code.usedAt)}</td>
                        <td style={styles.td}>{code.usedBy || "-"}</td>
                        <td style={styles.td}>{formatDate(code.createdAt)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f6f7fb",
    padding: "32px",
    color: "#111827",
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Pretendard, sans-serif',
  },
  container: {
    maxWidth: "1180px",
    margin: "0 auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    marginBottom: "20px",
  },
  eyebrow: {
    margin: 0,
    color: "#6b7280",
    fontSize: "13px",
    fontWeight: 700,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
  },
  title: {
    fontSize: "30px",
    margin: "4px 0 0",
    color: "#111827",
    fontWeight: 800,
  },
  card: {
    display: "flex",
    gap: "12px",
    background: "#fff",
    padding: "20px",
    borderRadius: "20px",
    boxShadow: "0 8px 30px rgba(0,0,0,0.06)",
    marginBottom: "20px",
  },
  input: {
    flex: 1,
    minWidth: 0,
    padding: "12px 14px",
    borderRadius: "12px",
    border: "1px solid #d1d5db",
    fontSize: "14px",
    color: "#111827",
    background: "#fff",
  },
  button: {
    padding: "12px 18px",
    borderRadius: "12px",
    border: 0,
    background: "#111827",
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer",
  },
  secondaryButton: {
    padding: "10px 14px",
    borderRadius: "12px",
    border: "1px solid #d1d5db",
    background: "#fff",
    color: "#111827",
    fontWeight: 700,
    cursor: "pointer",
  },
  error: {
    color: "#dc2626",
    marginBottom: "16px",
    fontWeight: 700,
  },
  stats: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: "16px",
    marginBottom: "20px",
  },
  statCard: {
    background: "#fff",
    borderRadius: "20px",
    padding: "22px",
    boxShadow: "0 8px 30px rgba(0,0,0,0.06)",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    color: "#111827",
  },
  statLabel: {
    color: "#6b7280",
    fontSize: "13px",
    fontWeight: 700,
  },
  statNumber: {
    fontSize: "26px",
    fontWeight: 800,
  },
  progressTrack: {
    width: "100%",
    height: "9px",
    borderRadius: "999px",
    background: "#e5e7eb",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: "999px",
    background: "#111827",
  },
  toolbar: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "center",
    background: "#fff",
    borderRadius: "20px",
    padding: "14px",
    boxShadow: "0 8px 30px rgba(0,0,0,0.06)",
    marginBottom: "10px",
  },
  segmented: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
  },
  tab: {
    padding: "10px 12px",
    borderRadius: "999px",
    border: "1px solid #d1d5db",
    background: "#fff",
    color: "#374151",
    fontWeight: 700,
    cursor: "pointer",
  },
  activeTab: {
    padding: "10px 12px",
    borderRadius: "999px",
    border: "1px solid #111827",
    background: "#111827",
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer",
  },
  controls: {
    display: "flex",
    gap: "8px",
  },
  searchInput: {
    width: "210px",
    padding: "10px 12px",
    borderRadius: "12px",
    border: "1px solid #d1d5db",
    color: "#111827",
    background: "#fff",
  },
  select: {
    padding: "10px 12px",
    borderRadius: "12px",
    border: "1px solid #d1d5db",
    color: "#111827",
    background: "#fff",
  },
  countText: {
    color: "#6b7280",
    margin: "0 0 10px",
    fontSize: "13px",
    fontWeight: 700,
  },
  tableWrap: {
    background: "#fff",
    borderRadius: "20px",
    padding: "20px",
    overflowX: "auto",
    boxShadow: "0 8px 30px rgba(0,0,0,0.06)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "14px",
  },
  th: {
    textAlign: "left",
    borderBottom: "1px solid #e5e7eb",
    padding: "12px",
    color: "#374151",
    whiteSpace: "nowrap",
  },
  td: {
    borderBottom: "1px solid #f3f4f6",
    padding: "12px",
    color: "#111827",
    wordBreak: "break-all",
    verticalAlign: "top",
  },
  emptyTd: {
    padding: "28px",
    textAlign: "center",
    color: "#6b7280",
  },
  link: {
    color: "#2563eb",
    textDecoration: "none",
  },
  usedBadge: {
    display: "inline-flex",
    padding: "5px 9px",
    borderRadius: "999px",
    color: "#991b1b",
    background: "#fee2e2",
    fontWeight: 800,
    whiteSpace: "nowrap",
  },
  availableBadge: {
    display: "inline-flex",
    padding: "5px 9px",
    borderRadius: "999px",
    color: "#166534",
    background: "#dcfce7",
    fontWeight: 800,
    whiteSpace: "nowrap",
  },
};

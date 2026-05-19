"use client";

import { useState } from "react";

export default function AdminDashboardPage() {
  const [token, setToken] = useState("");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadDashboard() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/admin/dashboard?token=${encodeURIComponent(token)}`);
      const json = await res.json();

      if (!res.ok || !json.ok) {
        setError(json.message || "Failed to load dashboard.");
        setData(null);
        return;
      }

      setData(json);
    } catch (e) {
      setError("Something went wrong.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.title}>Redeem Dashboard</h1>

        <div style={styles.card}>
          <input
            style={styles.input}
            type="password"
            placeholder="Admin token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
          />
          <button style={styles.button} onClick={loadDashboard} disabled={loading}>
            {loading ? "Loading..." : "Load Dashboard"}
          </button>
        </div>

        {error && <p style={styles.error}>{error}</p>}

        {data && (
          <>
            <div style={styles.stats}>
              <div style={styles.statCard}>
                <strong style={styles.statNumber}>{data.total}</strong>
                <span>Total</span>
              </div>
              <div style={styles.statCard}>
                <strong style={styles.statNumber}>{data.used}</strong>
                <span>Used</span>
              </div>
              <div style={styles.statCard}>
                <strong style={styles.statNumber}>{data.available}</strong>
                <span>Available</span>
              </div>
            </div>

            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Redeem URL</th>
                    <th style={styles.th}>Used At</th>
                    <th style={styles.th}>Used By</th>
                  </tr>
                </thead>
                <tbody>
                  {data.codes.map((code) => (
                    <tr key={code.id}>
                      <td style={styles.td}>
                        <span style={code.used ? styles.used : styles.available}>
                          {code.used ? "Used" : "Available"}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <a href={code.url} target="_blank" rel="noreferrer" style={styles.link}>
                          {code.url}
                        </a>
                      </td>
                      <td style={styles.td}>{code.usedAt || "-"}</td>
                      <td style={styles.td}>{code.usedBy || "-"}</td>
                    </tr>
                  ))}
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
    color: "#111827", // 🔥 전체 글씨 검정
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Pretendard, sans-serif',
  },
  container: {
    maxWidth: "1100px",
    margin: "0 auto",
  },
  title: {
    fontSize: "28px",
    marginBottom: "20px",
    color: "#111827",
    fontWeight: 700,
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
    padding: "12px 14px",
    borderRadius: "12px",
    border: "1px solid #ddd",
    fontSize: "14px",
    color: "#111827",
  },
  button: {
    padding: "12px 18px",
    borderRadius: "12px",
    border: "0",
    background: "#111827",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
  },
  error: {
    color: "#dc2626",
    marginBottom: "16px",
  },
  stats: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "16px",
    marginBottom: "20px",
  },
  statCard: {
    background: "#fff",
    borderRadius: "20px",
    padding: "24px",
    boxShadow: "0 8px 30px rgba(0,0,0,0.06)",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    color: "#111827",
  },
  statNumber: {
    fontSize: "22px",
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
    borderBottom: "1px solid #eee",
    padding: "12px",
    color: "#374151",
  },
  td: {
    borderBottom: "1px solid #eee",
    padding: "12px",
    color: "#111827",
    wordBreak: "break-all",
  },
  link: {
    color: "#2563eb",
    textDecoration: "none",
  },
  used: {
    color: "#dc2626",
    fontWeight: 600,
  },
  available: {
    color: "#16a34a",
    fontWeight: 600,
  },
};

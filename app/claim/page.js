"use client";

import { useEffect, useState } from "react";

export default function ClaimPage() {
  const [message, setMessage] = useState("Preparing your redeem link...");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function claimRedeemUrl() {
      try {
        const res = await fetch("/api/claim", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await res.json();

        if (cancelled) return;

        if (data.ok && data.redeemUrl) {
          setMessage("Redirecting you now...");
          window.location.href = data.redeemUrl;
          return;
        }

        setError(data.message || "All redeem links have been claimed.");
      } catch (e) {
        setError("Something went wrong. Please try again later.");
      }
    }

    claimRedeemUrl();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main style={styles.page}>
      <div style={styles.card}>
        {!error ? (
          <>
            <div style={styles.spinner} />
            <h1 style={styles.title}>Please wait</h1>
            <p style={styles.text}>{message}</p>
          </>
        ) : (
          <>
            <h1 style={styles.title}>Notice</h1>
            <p style={styles.text}>{error}</p>
          </>
        )}
      </div>

      <style jsx>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </main>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f6f7fb",
    padding: "24px",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Pretendard, sans-serif',
  },
  card: {
    width: "100%",
    maxWidth: "420px",
    background: "#ffffff",
    borderRadius: "24px",
    padding: "40px 28px",
    textAlign: "center",
    boxShadow: "0 12px 40px rgba(0,0,0,0.08)",
  },
  spinner: {
    width: "44px",
    height: "44px",
    border: "4px solid #e5e7eb",
    borderTop: "4px solid #111827",
    borderRadius: "50%",
    margin: "0 auto 24px",
    animation: "spin 0.8s linear infinite",
  },
  title: {
    fontSize: "22px",
    fontWeight: 700,
    margin: "0 0 12px",
    color: "#111827",
  },
  text: {
    fontSize: "15px",
    lineHeight: 1.6,
    margin: 0,
    color: "#4b5563",
  },
};

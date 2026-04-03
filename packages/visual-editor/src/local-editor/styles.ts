import type React from "react";

export const shellStyles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(180deg, #f7f4ec 0%, #ffffff 100%)",
    color: "#1d1d1f",
    padding: "24px",
  } satisfies React.CSSProperties,
  header: {
    display: "flex",
    justifyContent: "space-between",
    gap: "16px",
    alignItems: "flex-start",
    marginBottom: "16px",
  } satisfies React.CSSProperties,
  title: {
    margin: 0,
    fontSize: "28px",
  } satisfies React.CSSProperties,
  subtitle: {
    margin: "8px 0 0",
    color: "#555",
  } satisfies React.CSSProperties,
  route: {
    background: "#111",
    color: "#fff",
    padding: "6px 10px",
    borderRadius: "999px",
  } satisfies React.CSSProperties,
  controls: {
    display: "grid",
    gap: "12px",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    marginBottom: "16px",
  } satisfies React.CSSProperties,
  controlGroup: {
    display: "grid",
    gap: "6px",
    fontSize: "14px",
  } satisfies React.CSSProperties,
  controlLabel: {
    fontWeight: 600,
  } satisfies React.CSSProperties,
  notice: {
    borderRadius: "12px",
    padding: "12px 14px",
    marginBottom: "12px",
    border: "1px solid transparent",
  } satisfies React.CSSProperties,
  warningNotice: {
    background: "#fff8e8",
    borderColor: "#f4d58d",
  } satisfies React.CSSProperties,
  errorNotice: {
    background: "#fff1f0",
    borderColor: "#f2a8a2",
  } satisfies React.CSSProperties,
  editorFrame: {
    position: "relative",
    background: "#fff",
    borderRadius: "16px",
    border: "1px solid #e7dfd1",
    overflow: "hidden",
    minHeight: "720px",
  } satisfies React.CSSProperties,
  loadingOverlay: {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(255, 255, 255, 0.72)",
    backdropFilter: "blur(2px)",
    zIndex: 1,
    fontWeight: 600,
    color: "#5f5b52",
  } satisfies React.CSSProperties,
};

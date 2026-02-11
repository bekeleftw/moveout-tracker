export default function Home() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      gap: 8,
      fontFamily: "'IBM Plex Sans', sans-serif",
    }}>
      <div style={{ fontSize: 48 }}>{"\uD83C\uDFE0"}</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: "#1a1a2e" }}>
        Move-Out Utility Tracker
      </div>
      <div style={{ fontSize: 14, color: "#667085" }}>
        Powered by Utility Profit
      </div>
    </div>
  );
}

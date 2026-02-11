export const metadata = {
  title: "Move-Out Utility Tracker | Utility Profit",
  description: "Track and manage utility transfers for your move-outs.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500&display=swap"
          rel="stylesheet"
        />
        <style>{`
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: 'IBM Plex Sans', sans-serif; background: #f8f9fb; -webkit-font-smoothing: antialiased; }
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  );
}

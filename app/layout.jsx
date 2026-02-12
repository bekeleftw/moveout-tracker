export const metadata = {
  title: "Move-Out Utility Tracker | Utility Profit",
  description: "Track and manage utility transfers for your move-outs.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window,document,"clarity","script","sxxthu1avi");
            `,
          }}
        />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500&display=swap"
          rel="stylesheet"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{`
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: 'IBM Plex Sans', sans-serif; background: #f8f9fb; -webkit-font-smoothing: antialiased; }
          @media (max-width: 640px) {
            .mot-topbar { flex-direction: column !important; align-items: flex-start !important; padding: 12px 16px !important; }
            .mot-topbar-powered { align-self: flex-start; }
            .mot-content { padding: 20px 12px !important; }
            .mot-card-header { flex-direction: column !important; align-items: stretch !important; padding: 14px 14px !important; gap: 8px !important; }
            .mot-card-addr-row { flex-direction: row !important; align-items: center !important; gap: 10px !important; }
            .mot-card-addr-row .mot-card-icon { width: 34px !important; height: 34px !important; min-width: 34px; font-size: 15px !important; border-radius: 8px !important; }
            .mot-card-meta { font-size: 12px !important; }
            .mot-card-bottom-row { display: flex !important; align-items: center !important; justify-content: space-between !important; }
            .mot-util-controls { flex-direction: column !important; }
            .mot-util-controls > select,
            .mot-util-controls > input { width: 100% !important; min-width: 0 !important; }
            .mot-filter-row { flex-wrap: nowrap !important; overflow-x: auto !important; -webkit-overflow-scrolling: touch; scrollbar-width: none; padding-bottom: 4px; }
            .mot-filter-row::-webkit-scrollbar { display: none; }
            .mot-filter-row > * { flex-shrink: 0 !important; }
          }
        `}</style>
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}

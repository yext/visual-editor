export const applyAnalytics = (document: Record<string, any>) => {
  if (!document?.__?.visualEditorConfig) {
    return;
  }

  const googleTagManagerId: string = JSON.parse(
    document.__.visualEditorConfig
  )?.googleTagManagerId;

  if (googleTagManagerId) {
    return `<!-- Google tag (gtag.js) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=${googleTagManagerId}"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
    
      gtag('config', '${googleTagManagerId}');
    </script>`;
  }
};

// getAnalyticsScopeHash hashes the Puck component
// id into a 3 digit number represented by a string.
export const getAnalyticsScopeHash = (puckId: string) => {
  let hash = 0;
  for (let i = 0; i < puckId.length; i++) {
    const char = puckId.charCodeAt(i);
    hash = (hash << 5) - hash + char; // DJB2-like hash algorithm
    hash |= 0;
  }

  return String(Math.abs(hash) % 1000).padStart(3, "0");
};

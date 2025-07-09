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
  // The puckId should always be provided but it may be missing in tests
  if (!puckId) {
    return "000";
  }

  // DJB2 hash algorithm
  let hash = 5381;
  for (let i = 0; i < puckId.length; i++) {
    hash = ((hash << 5) + hash) ^ puckId.charCodeAt(i);
  }

  return String(Math.abs(hash) % 1000).padStart(3, "0");
};

export const applyAnalytics = (document: Record<string, any>) => {
  if (!document?.__?.visualEditorConfig) {
    return;
  }

  const googleTagManagerId: string = JSON.parse(document.__.visualEditorConfig)
    ?.siteAttributes?.googleTagManagerId;

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

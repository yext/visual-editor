export const applyAnalytics = (document: Record<string, any>) => {
  if (!document?.__?.visualEditorConfig) {
    return;
  }

  // Google Tag Manager (GTM)
  const googleTagManagerId: string = JSON.parse(
    document.__.visualEditorConfig
  )?.googleTagManagerId;

  if (googleTagManagerId) {
    return `<!-- Google Tag Manager -->
    <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','${googleTagManagerId}');</script>
    <!-- End Google Tag Manager -->`;
  }

  // Google Analytics 4 (GA4)
  // Note that this does not yet exist in platform. Adding for future support.
  const googleAnalyticsId: string = JSON.parse(
    document.__.visualEditorConfig
  )?.googleAnalyticsId;

  if (googleAnalyticsId) {
    return `<!-- Google tag (gtag.js) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
    
      gtag('config', '${googleAnalyticsId}');
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

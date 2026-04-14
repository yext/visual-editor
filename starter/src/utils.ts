// Prevent Vite client script loading in StackBlitz
export const disableHmrForStackBlitz = `<script>
    (function() {
        var isStackBlitz = window.location.hostname.includes('webcontainer.io');
        
        if (isStackBlitz) {
        var originalWebSocket = window.WebSocket;
        // Block WebSocket connections for Vite HMR
        window.WebSocket = new Proxy(originalWebSocket, {
            construct: function(target, args, newTarget) {
            var url = args[0];
            var normalizedUrl = url == null ? '' : String(url);

            // Block Vite HMR WebSocket connections
            if (
                normalizedUrl &&
                (
                normalizedUrl.includes('24678') ||
                normalizedUrl.includes('vite') ||
                normalizedUrl.includes('hmr')
                )
            ) {
                console.log('Blocked Vite WebSocket connection:', normalizedUrl);
                return {
                readyState: target.CLOSED || 3,
                send: function() {},
                close: function() {},
                addEventListener: function() {},
                removeEventListener: function() {},
                };
            }

            return Reflect.construct(target, args, newTarget);
            },
        });
        }
    })();
</script>`;
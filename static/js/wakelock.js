export function initWakeLock() {
    if ('wakeLock' in navigator) {
        let wakeLockSentinel = null;
        const requestWakeLock = async () => {
            try {
                wakeLockSentinel = await navigator.wakeLock.request('screen');
                wakeLockSentinel.addEventListener('release', () => {
                    wakeLockSentinel = null;
                });
            } catch (err) {
                console.warn('WakeLock error:', err);
            }
        };
        requestWakeLock();
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible' && !wakeLockSentinel) {
                requestWakeLock();
            }
        });
    }
}
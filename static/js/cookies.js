export const cookies = {
    set: (name, value, days) => {
        try {
            const d = new Date();
            d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
            document.cookie = `${name}=${value};expires=${d.toUTCString()};path=/;SameSite=Lax`;
        } catch (e) { console.warn('Cookie set failed:', e); }
    },
    get: (name, defaultValue = null) => {
        try {
            const cookies = document.cookie.split(';');
            for (let c of cookies) {
                const [key, val] = c.trim().split('=');
                if (key === name) return val;
            }
        } catch (e) { console.warn('Cookie get failed:', e); }
        return defaultValue;
    }
};
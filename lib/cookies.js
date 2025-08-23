// SSR-safe cookie helpers
export function setCookie(name, value, days = 365) {
    if (typeof document === 'undefined') return;
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${value}; expires=${expires}; path=/`;
}

export function getCookie(name) {
    if (typeof document === 'undefined') return null;
    return document.cookie.split('; ').reduce((acc, cur) => {
        const [k, v] = cur.split('=');
        return k === name ? decodeURIComponent(v) : acc;
    }, null);
}

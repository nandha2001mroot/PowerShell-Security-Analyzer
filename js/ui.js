/**
 * Common UI Utilities (Theme, Toasts, etc.)
 */
const UI = {
    initTheme: () => {
        const settings = Storage.getSettings();
        const html = document.documentElement;
        
        if (settings.theme === 'auto') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            html.setAttribute('data-bs-theme', prefersDark ? 'dark' : 'light');
        } else {
            html.setAttribute('data-bs-theme', settings.theme);
        }
    },

    setTheme: (theme) => {
        const settings = Storage.getSettings();
        settings.theme = theme;
        Storage.saveSettings(settings);
        
        const html = document.documentElement;
        if (theme === 'auto') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            html.setAttribute('data-bs-theme', prefersDark ? 'dark' : 'light');
        } else {
            html.setAttribute('data-bs-theme', theme);
        }
    },

    showToast: (message, type = 'info') => {
        // Simple toast implementation without extra DOM bloat
        const toastContainer = document.getElementById('toast-container') || (() => {
            const div = document.createElement('div');
            div.id = 'toast-container';
            div.className = 'position-fixed bottom-0 end-0 p-3';
            div.style.zIndex = '1050';
            document.body.appendChild(div);
            return div;
        })();

        const bgClass = type === 'error' ? 'bg-danger' : (type === 'success' ? 'bg-success' : 'bg-primary');
        const toastEl = document.createElement('div');
        toastEl.className = `toast align-items-center text-white ${bgClass} border-0 show`;
        toastEl.setAttribute('role', 'alert');
        toastEl.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">${message}</div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        `;
        toastContainer.appendChild(toastEl);
        setTimeout(() => toastEl.remove(), 4000);
    }
};

// Initialize theme on load
document.addEventListener('DOMContentLoaded', UI.initTheme);
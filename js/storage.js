/**
 * LocalStorage wrapper for scan history and settings
 */
const Storage = {
    KEY_HISTORY: 'psa_scan_history',
    KEY_SETTINGS: 'psa_settings',

    getHistory: () => {
        try {
            return JSON.parse(localStorage.getItem(Storage.KEY_HISTORY) || '[]');
        } catch { return []; }
    },

    saveScan: (scanData) => {
        const history = Storage.getHistory();
        history.unshift({
            id: scanData.id,
            filename: scanData.filename || 'Pasted Code',
            timestamp: Date.now(),
            riskScore: scanData.riskScore,
            severity: scanData.severity,
            findingCount: scanData.findings.length
        });
        // Keep only last 50 scans
        if (history.length > 50) history.pop();
        localStorage.setItem(Storage.KEY_HISTORY, JSON.stringify(history));
    },

    clearHistory: () => {
        localStorage.removeItem(Storage.KEY_HISTORY);
    },

    getSettings: () => {
        try {
            return JSON.parse(localStorage.getItem(Storage.KEY_SETTINGS) || '{"theme": "dark"}');
        } catch { return { theme: 'dark' }; }
    },

    saveSettings: (settings) => {
        localStorage.setItem(Storage.KEY_SETTINGS, JSON.stringify(settings));
    }
};
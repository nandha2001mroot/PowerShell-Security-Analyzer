/**
 * Utility functions for the PowerShell Security Analyzer
 */
const Utils = {
    escapeHTML: (str) => {
        if (!str) return '';
        return str.replace(/[&<>"']/g, (match) => {
            const escapeMap = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
            return escapeMap[match];
        });
    },

    generateId: () => 'PSA-' + Math.random().toString(36).substr(2, 9).toUpperCase(),

    formatDate: (timestamp) => new Date(timestamp).toLocaleString(),

    downloadFile: (content, filename, mimeType) => {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    calculateEntropy: (str) => {
        if (!str) return 0;
        const len = str.length;
        const freq = {};
        for (let i = 0; i < len; i++) {
            const char = str[i];
            freq[char] = (freq[char] || 0) + 1;
        }
        let entropy = 0;
        for (const char in freq) {
            const p = freq[char] / len;
            entropy -= p * Math.log2(p);
        }
        return entropy;
    }
};
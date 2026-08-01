/**
 * Indicator of Compromise Extraction Engine
 */
const IOCEngine = {
    extract: (code) => {
        const iocs = [];
        const lines = code.split('\n');

        const patterns = {
            'IPv4': /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g,
            'URL': /https?:\/\/[^\s<>"']+/g,
            'Domain': /\b[a-zA-Z0-9-]+\.(com|net|org|io|ru|cn|tk|ml|ga|cf|gq|pw|top|xyz)[a-zA-Z0-9-._~:/?#[\]@!$&'()*+,;=]*\b/gi,
            'Email': /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
            'MD5': /\b[a-fA-F0-9]{32}\b/g,
            'SHA1': /\b[a-fA-F0-9]{40}\b/g,
            'SHA256': /\b[a-fA-F0-9]{64}\b/g,
            'Registry Path': /HKLM|HKCU|HKEY_LOCAL_MACHINE|HKEY_CURRENT_USER|\\Software\\Microsoft\\Windows\\CurrentVersion\\Run/gi,
            'File Path': /[a-zA-Z]:\\(?:[^\\/:*?"<>|\r\n]+\\)*[^\\/:*?"<>|\r\n]*/g,
            'UNC Path': /\\\\[a-zA-Z0-9-]+\\[a-zA-Z0-9-$]+/g
        };

        lines.forEach((line, index) => {
            for (const [type, regex] of Object.entries(patterns)) {
                const matches = line.match(regex);
                if (matches) {
                    matches.forEach(match => {
                        // Deduplicate and filter obvious false positives
                        if (match.length > 3 && !match.includes('example.com') && !match.includes('localhost')) {
                            iocs.push({
                                type,
                                value: match,
                                line: index + 1,
                                confidence: type === 'SHA256' || type === 'IPv4' ? 'High' : 'Medium'
                            });
                        }
                    });
                }
            }
        });

        // Deduplicate
        return iocs.filter((v, i, a) => a.findIndex(t => (t.value === v.value && t.type === v.type)) === i);
    }
};
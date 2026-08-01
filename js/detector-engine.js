/**
 * Static Detection Engine
 */
const DetectorEngine = {
    analyze: (code) => {
        const findings = [];
        const lines = code.split('\n');
        
        // Pre-process to ignore comments for some checks (basic false positive reduction)
        const cleanLines = lines.map(line => {
            const commentIndex = line.indexOf('#');
            return commentIndex !== -1 ? line.substring(0, commentIndex) : line;
        });

        Signatures.forEach(sig => {
            try {
                const regex = new RegExp(sig.p, 'gi');
                cleanLines.forEach((line, index) => {
                    if (regex.test(line)) {
                        findings.push({
                            id: sig.id,
                            name: sig.n,
                            category: sig.c,
                            severity: sig.s,
                            description: sig.d,
                            recommendation: sig.r,
                            mitre: sig.m,
                            line: index + 1,
                            snippet: lines[index].trim(),
                            confidence: DetectorEngine.calculateConfidence(sig, lines[index])
                        });
                    }
                });
            } catch (e) {
                // Ignore invalid regex in signatures gracefully
            }
        });

        return findings;
    },

    calculateConfidence: (sig, line) => {
        // Heuristic confidence calculation
        let score = 50; // Medium baseline
        if (sig.s === 'Critical') score += 30;
        if (sig.s === 'High') score += 20;
        
        // Increase confidence if multiple indicators on same line
        if (line.includes('|') || line.includes('+') || line.includes('&')) {
            score += 10;
        }
        
        if (score >= 80) return 'High';
        if (score >= 50) return 'Medium';
        return 'Low';
    }
};
/**
 * Obfuscation Analysis Engine
 */
const ObfuscationEngine = {
    analyze: (code) => {
        let score = 0;
        const reasons = [];

        // 1. Entropy check on long strings
        const longStrings = code.match(/["'][^"']{50,}["']/g) || [];
        longStrings.forEach(str => {
            const entropy = Utils.calculateEntropy(str);
            if (entropy > 4.5) {
                score += 15;
                reasons.push("High entropy strings detected (possible encoded payload).");
            }
        });

        // 2. Backtick abuse
        const backticks = (code.match(/`/g) || []).length;
        if (backticks > 10) {
            score += 20;
            reasons.push(`Excessive use of escape characters (backticks): ${backticks} found.`);
        }

        // 3. Base64 patterns
        if (/[A-Za-z0-9+/]{50,}={0,2}/.test(code)) {
            score += 25;
            reasons.push("Long Base64-like strings detected.");
        }

        // 4. Character array reconstruction
        if (/\[char\]\[/.test(code) || /\$\(\\s*\[char\]/.test(code)) {
            score += 20;
            reasons.push("Character array reconstruction detected.");
        }

        // 5. String splitting/joining
        if (/\['[^']+'\s*\]\s*-join\s*''/.test(code)) {
            score += 20;
            reasons.push("String splitting and joining obfuscation detected.");
        }

        return {
            score: Math.min(100, score),
            reasons: reasons.length > 0 ? reasons : ["No significant obfuscation detected."]
        };
    }
};
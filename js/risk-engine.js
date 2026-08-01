/**
 * Risk Scoring and Correlation Engine
 */
const RiskEngine = {
    calculate: (findings, obfuscationScore) => {
        let rawScore = 0;
        const weights = { 'Critical': 25, 'High': 15, 'Medium': 8, 'Low': 3, 'Informational': 1 };
        const categories = new Set();
        const mitreTechniques = new Set();

        findings.forEach(f => {
            rawScore += weights[f.severity] || 1;
            categories.add(f.category);
            if (f.mitre) f.mitre.forEach(m => mitreTechniques.add(m));
        });

        // Correlation bonus: Multiple high-risk categories present
        let correlationBonus = 0;
        const dangerousCombos = [
            ['Execution', 'Network'],
            ['Obfuscation', 'Execution'],
            ['Credential Access', 'Defense Evasion'],
            ['Persistence', 'Defense Evasion']
        ];

        dangerousCombos.forEach(combo => {
            if (combo.every(c => categories.has(c))) {
                correlationBonus += 15;
            }
        });

        // Obfuscation bonus
        if (obfuscationScore > 50) correlationBonus += 10;

        // Normalize to 0-100
        let finalScore = Math.min(100, Math.round(rawScore + correlationBonus));
        
        // Determine overall severity
        let severity = 'Informational';
        if (finalScore >= 80) severity = 'Critical';
        else if (finalScore >= 60) severity = 'High';
        else if (finalScore >= 40) severity = 'Medium';
        else if (finalScore >= 20) severity = 'Low';

        // Calculate Malicious Behavior Score (0-100%)
        const malScore = Math.min(100, Math.round((finalScore * 0.8) + (obfuscationScore * 0.2)));
        
        // Confidence based on finding count and severity
        let confidence = 'Low';
        if (findings.length > 5 && finalScore > 50) confidence = 'Medium';
        if (findings.length > 10 && finalScore > 70) confidence = 'High';

        return {
            riskScore: finalScore,
            severity,
            maliciousScore: malScore,
            confidence,
            categoryCount: categories.size,
            mitreCount: mitreTechniques.size,
            categories: Array.from(categories),
            mitreTechniques: Array.from(mitreTechniques)
        };
    },

    generateSummary: (riskData, findings) => {
        if (riskData.riskScore < 20) {
            return "The script appears to be low-risk with minimal suspicious indicators. Standard administrative behaviors were detected. Always verify the source of the script before execution.";
        }
        
        let summary = `This script exhibits ${riskData.severity.toLowerCase()}-risk characteristics (Score: ${riskData.riskScore}/100). `;
        
        if (riskData.categories.includes('Obfuscation')) {
            summary += "Significant obfuscation techniques were detected, attempting to hide the script's true intent. ";
        }
        if (riskData.categories.includes('Network')) {
            summary += "Network communication indicators suggest the script may download or transmit data. ";
        }
        if (riskData.categories.includes('Credential Access')) {
            summary += "WARNING: Behaviors associated with credential harvesting or dumping were identified. ";
        }
        if (riskData.categories.includes('Persistence')) {
            summary += "The script contains mechanisms to maintain access across reboots. ";
        }
        
        summary += "Due to the combination of these behaviors, manual review in an isolated environment is strongly recommended before any execution.";
        return summary;
    }
};
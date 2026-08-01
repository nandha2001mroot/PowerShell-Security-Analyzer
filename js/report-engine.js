/**
 * Report Generation Engine
 */
const ReportEngine = {
    generateHTML: (data) => {
        const date = new Date().toISOString();
        return `<!DOCTYPE html>
<html><head><title>PSA Report</title>
<style>body{font-family:monospace;background:#0f1115;color:#e6edf3;padding:20px;}
table{width:100%;border-collapse:collapse;margin-top:10px;}
th,td{border:1px solid #2d333b;padding:8px;text-align:left;}
.critical{color:#f85149;}.high{color:#ff7b72;}</style></head>
<body>
<h1>PowerShell Security Analyzer Report</h1>
<p><strong>Author:</strong> Nandha Kumar M | <strong>LinkedIn:</strong> <a href="https://www.linkedin.com/in/nandha-kumar-m-952342159/" style="color:#58a6ff">Profile</a></p>
<p><strong>Timestamp:</strong> ${date}</p>
<p><strong>File:</strong> ${data.filename} | <strong>Risk Score:</strong> <span class="${data.risk.severity.toLowerCase()}">${data.risk.riskScore}/100 (${data.risk.severity})</span></p>
<hr>
<h3>Analyst Summary</h3>
<p>${data.summary}</p>
<h3>Findings</h3>
<table><tr><th>Severity</th><th>Category</th><th>Description</th><th>Line</th></tr>
${data.findings.map(f => `<tr><td class="${f.severity.toLowerCase()}">${f.severity}</td><td>${f.category}</td><td>${f.description}</td><td>${f.line}</td></tr>`).join('')}
</table>
<h3>Indicators of Compromise</h3>
<table><tr><th>Type</th><th>Value</th><th>Line</th></tr>
${data.iocs.map(i => `<tr><td>${i.type}</td><td>${i.value}</td><td>${i.line}</td></tr>`).join('')}
</table>
<p style="margin-top:40px;font-size:0.8em;color:#8b949e;">Disclaimer: Detection results are heuristic and may contain false positives. Never execute suspicious code solely based on this report.</p>
</body></html>`;
    },

    generateJSON: (data) => JSON.stringify(data, null, 2),

    generateCSV: (findings) => {
        const headers = ['ID', 'Severity', 'Category', 'Name', 'Description', 'Line', 'Snippet'];
        const rows = findings.map(f => [
            f.id, f.severity, f.category, f.name, `"${f.description.replace(/"/g, '""')}"`, f.line, `"${f.snippet.replace(/"/g, '""').replace(/\n/g, ' ')}"`
        ]);
        return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    }
};
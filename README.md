# 🛡️ BYOVD Watchdog

Real-time analysis of LOLDrivers against Microsoft's HVCI blocklist. This tool is the updated version of [BYOVDFinder](https://github.com/ghostbyt3/BYOVDFinder). It automatically monitors drivers from loldrivers.io that are not blocked by the current HVCI (Hypervisor Code Integrity) blocklist on your system. This is particularly useful for identifying BYOVD (Bring Your Own Vulnerable Driver) attack paths, where vulnerable drivers are allowed to load despite HVCI being enabled.

🔗 Live Demo: [byovd-watchdog.pwnfuzz.com](https://byovd-watchdog.pwnfuzz.com/)  
📦 Repository: [BYOVD Watchdog](https://github.com/ghostbyt3/byovd-watchdog)

---

## What It Does

- Periodically fetches Microsoft's latest HVCI blocklist (`SiPolicy_Enforced.xml`)
- Parses and converts it to a JSON format using `byovd.py`
- Compares** the parsed blocklist with the known LOLDrivers list from [loldrivers.io](https://www.loldrivers.io) using `compare_hvci.py`
- Generates a changelog to track newly blocked or unblocked drivers
- Feeds data into a web frontend that displays live results and historical changes

---

## ⚙️ How It Works

### 1. `byovd.py`
- Takes an HVCI blocklist XML file (`SiPolicy_Enforced.xml`) as input
- Parses it to extract driver rules
- Outputs a structured `byovd_finder_results_*.json` file

### 2. `compare_hvci.py`
- Compares the newly generated `byovd_finder_results_*.json` with the previous version
- Identifies changes (newly blocked or removed drivers)
- Generates:
  - `byovd_changelog.json` — tracks what's added or removed
  - `results_index.json` — used by the website frontend

### 3. GitHub Actions Workflow
- Automates the entire pipeline:
  - Periodic blocklist download
  - Script execution
  - JSON output generation
  - Auto-pushes changes to the repo
- The website dynamically fetches the latest results from GitHub

---

## Website Preview

- View current unblocked LOLDrivers not covered by the HVCI policy
- Explore historical changelog of added or removed drivers

🔗 [byovd-watchdog.pwnfuzz.com](https://byovd-watchdog.pwnfuzz.com/)

---

## 🧠 Why This Matters

HVCI is a security feature in Windows that helps protect against attacks like kernel exploits by verifying the integrity of code running at the kernel level. It blocks drivers that are unsigned or known to be malicious by checking them against an internal blocklist. If a driver is not recognized, it will be blocked to prevent possible exploitation. However, according to [Microsoft](https://learn.microsoft.com/en-us/windows/security/application-security/application-control/app-control-for-business/design/microsoft-recommended-driver-block-rules#microsoft-vulnerable-driver-blocklist), the list is updated once or twice a year, giving us plenty of time to use drivers that haven't yet been blocked.

## Author

**Nikhil John Thomas (@ghostbyt3)**
- GitHub: [ghostbyt3](https://github.com/ghostbyt3)
- Project: [BYOVDFinder](https://github.com/ghostbyt3/BYOVDFinder)

## Acknowledgments

- **Robin (@D4mianWayne)** - Contributor
- **loldrivers.io** - Driver vulnerability database

## License

Apache License 2.0 - See LICENSE file for details

---

**⚠️ Disclaimer**: This tool is for research and educational purposes only. Always follow responsible disclosure practices when working with security vulnerabilities.


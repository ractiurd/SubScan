# SubScan - Chrome Extension for Subdomain Enumeration

SubScan is a powerful and lightweight Chrome extension designed for bug bounty hunters and security researchers to fetch subdomains from various online resources with ease. It allows users to quickly gather subdomain information for a given domain using multiple sources.

- **Multiple Data Sources**: Fetch subdomains from the following services:
  - RapidDNS
  - AlienVault
  - Subdomain Center
  - Certspotter
  - Crt.sh
  - Shodan
 
- **User-Friendly Interface**: Simple input and checkboxes to select preferred data sources.
- **Results Handling**:
  - View fetched subdomains directly within the extension.
  - Copy results to the clipboard.
  - Download results as a text file.
- **Lightweight & Fast**: Optimized for quick subdomain enumeration.

## Installation

1. Download the repository from GitHub:
   ```bash
   git clone https://github.com/ractiurd/subscan.git
   ```

2. Open Google Chrome and navigate to `chrome://extensions/`
3. Enable **Developer mode** (toggle on the top-right corner).
4. Click on **Load unpacked** and select the cloned `subscan` directory.
5. The extension should now be visible in your Chrome toolbar.

## Usage

1. Click on the SubScan icon in your Chrome toolbar.
2. Enter the target domain (e.g., `example.com`).
3. Select the data sources you want to use by checking the respective boxes.
4. Click the **Fetch** button to start enumeration.
5. View, copy, or download the results as needed.

## Screenshot

![SubScan Screenshot](https://github.com/Ractiurd/SubScan/blob/main/SubScan.png)

## Contributing

Bug bounty hunters and security researchers are welcome to contribute to SubScan. Feel free to submit issues, feature requests, or pull requests via GitHub.

## Author

**Mahedi Hasan (Ractiurd)**  
- [Twitter](https://x.com/ractiurd)
- [Facebook](https://facebook.com/ractiurd)
- [GitHub](https://github.com/ractiurd)
- [Bugcrowd](https://bugcrowd.com/Ractiurd)
- [HackerOne](https://hackerone.com/ractiurd)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Happy Bug Hunting! 🐞

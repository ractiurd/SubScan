# SubScan - Chrome Extension for Subdomain Enumeration

SubScan is a powerful and lightweight Chrome extension designed for bug bounty hunters and security researchers to fetch subdomains from various online resources with ease. It allows users to quickly gather subdomain information for a given domain using multiple sources.

- **Multiple Data Sources**: Fetch subdomains from the following services:
  - RapidDNS 
  - AlienVault
  - Subdomain Center(removed on v1.1)
  - Certspotter
  - Crt.sh
  - Shodan
  - Anubis
  - LeakIX
  - HackerTarget
 
- **User-Friendly Interface**: Simple input and checkboxes to select preferred data sources.
- **Results Handling**:
  - View fetched subdomains directly within the extension.
  - Copy results to the clipboard.
  - Download results as a text file.
- **Lightweight & Fast**: Optimized for quick subdomain enumeration.

## Installation

1. Download the repository from GitHub:
   ```bash
   git clone https://github.com/ractiurd/SubScan.git
   ```

2. Open Google Chrome and navigate to `chrome://extensions/`
3. Enable **Developer mode** (toggle on the top-right corner).
4. Click on **Load unpacked** and select the cloned `SubScan` directory.
5. The extension should now be visible in your Chrome toolbar.

## Configuration

To fetch subdomains from Shodan, you need to provide your Shodan API key in the `popup.js` file:

```javascript
const apiKey = "YOUR_SHODAN_API_KEY_HERE"; // Place your Shodan API key here
```

## Usage

1. Click on the SubScan icon in your Chrome toolbar.
2. Enter the target domain (e.g., `example.com`).
3. Select the data sources you want to use by checking the respective boxes.
4. Click the **Fetch** button to start enumeration.
5. View, copy, or download the results as needed.

## Screenshot

![SubScan Screenshot](https://github.com/Ractiurd/SubScan/blob/main/SubScan.png)
![SubScan Screenshot](https://github.com/Ractiurd/SubScan/blob/main/resultSubScan.png)


## Contributing

Bug bounty hunters and security researchers are welcome to contribute to SubScan. Feel free to submit issues, feature requests, or pull requests via GitHub.

## Author

**Mahedi Hasan (Ractiurd)**  
- [Twitter](https://x.com/ractiurd)
- [Facebook](https://facebook.com/ractiurd)
- [Bugcrowd](https://bugcrowd.com/Ractiurd)
- [HackerOne](https://hackerone.com/ractiurd)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🌍 Stand for Palestine 🇵🇸

We stand in solidarity with the people of Palestine and encourage everyone to **raise awareness, support charitable causes, and take a stand against genocide and injustice.** Together, we can make a difference.

### 💡 How You Can Help:
- **Educate** yourself and others about the ongoing situation.
- **Donate** to trusted humanitarian organizations providing aid to Palestinian families.
- **Advocate** for justice and speak out against oppression.
- **Support** Palestinian businesses and initiatives.

> _"Injustice anywhere is a threat to justice everywhere." – Martin Luther King Jr._

Consider contributing to verified organizations working towards humanitarian aid and relief efforts in Palestine.

--- 


---

Happy Bug Hunting! 🐞

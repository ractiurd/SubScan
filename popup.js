document.getElementById("fetch").addEventListener("click", async () => {
  const domain = document.getElementById("domain").value.trim();
  const resultsElement = document.getElementById("results");

  if (!domain) {
    alert("Please enter a domain.");
    return;
  }

  resultsElement.textContent = "Fetching subdomains...";

  const useRapidDNS = document.getElementById("useRapidDNS").checked;
  const useAPI = document.getElementById("useAPI").checked;
  const useCRTSh = document.getElementById("useCRTSh").checked;
  const useCertspotter = document.getElementById("useCertspotter").checked;
  const useSubdomainCenter = document.getElementById("useSubdomainCenter").checked;
  const useShodan = document.getElementById("useShodan").checked;




  let allSubdomains = [];

  // Fetch subdomains based on selected checkboxes
  

  if (useCertspotter) {
    await fetchCertspotterSubdomains(domain, allSubdomains, resultsElement);
  }
  if (useRapidDNS) {
    await fetchRapidDNS(domain, allSubdomains, resultsElement);
  }

  if (useAPI) {
    await fetchAlienVault(domain, allSubdomains, resultsElement);
  }

  if (useCRTSh) {
    await fetchCRTShSubdomains(domain, allSubdomains, resultsElement);
  }
  if (useSubdomainCenter) {
    await fetchSubdomainCenterSubdomains(domain, allSubdomains, resultsElement);
  }
  if (useShodan) {
    await fetchShodanSubdomains(domain, allSubdomains, resultsElement);
  }
  

  // Display the results
  if (allSubdomains.length > 0) {
    resultsElement.textContent = allSubdomains.join("\n");
  } else {
    resultsElement.textContent = "No subdomains found.";
  }
});

// Separate functions for each source
// Fetch subdomains from Shodan
async function fetchShodanSubdomains(domain, allSubdomains, resultsElement) {
  const apiKey = "YOUR_SHODAN_API_KEY_HERE"; // Place your shodan api key here
  const url = `https://api.shodan.io/dns/domain/${domain}?key=${apiKey}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const jsonResponse = await response.json();

    if (!jsonResponse || !jsonResponse.subdomains) {
      throw new Error("No subdomains found in the response.");
    }

    const shodanSubdomains = jsonResponse.subdomains.map(subdomain => `${subdomain}.${domain}`);
    allSubdomains.push(...shodanSubdomains);
  } catch (error) {
    resultsElement.textContent = "Error fetching Shodan data.";
    alert("Error fetching Shodan data: " + error.message);
  }
}



// Fetch subdomains from Certspotter
async function fetchCertspotterSubdomains(domain, allSubdomains, resultsElement) {
  const url = `https://api.certspotter.com/v1/issuances?domain=${domain}&include_subdomains=true&expand=dns_names`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.6778.86 Safari/537.36",
        "Accept": "application/json",
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const jsonResponse = await response.json();

    const subdomainRegex = /(?:[a-zA-Z0-9-]+\.)+[a-zA-Z0-9-]+/g;
    const uniqueSubdomains = new Set();

    jsonResponse.forEach(cert => {
      cert.dns_names.forEach(name => {
        const matches = name.match(subdomainRegex);
        if (matches) {
          matches.forEach(subdomain => {
            uniqueSubdomains.add(subdomain);
          });
        }
      });
    });

    allSubdomains.push(...uniqueSubdomains);
  } catch (error) {
    resultsElement.textContent = "Error fetching Certspotter data.";
    alert("Error fetching Certspotter data: " + error.message);
  }
}
// Fetch subdomains from subdomain center
async function fetchSubdomainCenterSubdomains(domain, allSubdomains, resultsElement) {
  const url = `https://api.subdomain.center/?domain=${domain}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const responseBody = await response.text();

    // Define the regex pattern to match subdomains
    const regex = /(?:[a-zA-Z0-9-]+\.)+[a-zA-Z0-9-]+/g;
    const matches = responseBody.match(regex);

    if (matches) {
      const uniqueSubdomains = new Set(matches.map(subdomain => subdomain.trim()));
      allSubdomains.push(...uniqueSubdomains);
      resultsElement.textContent = `Found ${uniqueSubdomains.size} subdomains.`;
    } else {
      resultsElement.textContent = "No subdomains found.";
    }

  } catch (error) {
    resultsElement.textContent = "Error fetching subdomain.center data.";
    console.error("Error fetching subdomain.center data:", error);
    alert("Error fetching subdomain.center data: " + error.message);
  }
}


// Fetch subdomains from RapidDNS
async function fetchRapidDNS(domain, allSubdomains, resultsElement) {
  const rapidDNSURL = `https://rapiddns.io/subdomain/${domain}?full=1#result`;

  try {
    const response = await fetch(rapidDNSURL, {
      method: "GET",
      headers: {
        "Host": "rapiddns.io",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.6778.86 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml",
      }
    });

    const text = await response.text();
    const matches = [...text.matchAll(/<td>([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})<\/td>/g)];
    const domains = [...new Set(matches.map(match => match[1]))];
    allSubdomains.push(...domains);
  } catch (error) {
    resultsElement.textContent = "Error fetching RapidDNS data.";
    alert("Error fetching RapidDNS data: " + error.message);
  }
}

// Fetch subdomains from AlienVault API
async function fetchAlienVault(domain, allSubdomains, resultsElement) {
  const apiURLTemplate = `https://otx.alienvault.com/api/v1/indicators/domain/${domain}/url_list?limit=100&page=%d`;

  try {
    const apiSubdomains = await fetchURLsFromAPI(apiURLTemplate, domain);
    allSubdomains.push(...apiSubdomains);
  } catch (error) {
    resultsElement.textContent = "Error fetching API data.";
    alert("Error fetching API data: " + error.message);
  }
}
// getting result from crt.sh
async function fetchCRTShSubdomains(domain, allSubdomains, resultsElement) {
  const url = `https://crt.sh/?q=%25.${domain}&output=json`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Host": "crt.sh",
        "Sec-Ch-Ua": "\"Chromium\";v=\"131\", \"Not_A Brand\";v=\"24\"",
        "Sec-Ch-Ua-Mobile": "?0",
        "Sec-Ch-Ua-Platform": "\"Linux\"",
        "Accept-Language": "en-US,en;q=0.9",
        "Upgrade-Insecure-Requests": "1",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.6778.86 Safari/537.36",
        "Accept": "application/json, text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-User": "?1",
        "Sec-Fetch-Dest": "document",
        "Accept-Encoding": "gzip, deflate, br",
        "Priority": "u=0, i"
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const responseBody = await response.text();

    try {
      const jsonResponse = JSON.parse(responseBody);
      
      const regex = /[a-zA-Z0-9-]+\.[a-zA-Z0-9.-]+/g;
      const uniqueSubdomains = new Set();

      jsonResponse.forEach(cert => {
        if (cert.name_value) {
          const matches = cert.name_value.match(regex);
          if (matches) {
            matches.forEach(subdomain => {
              uniqueSubdomains.add(subdomain.trim());
            });
          }
        }
      });

      allSubdomains.push(...uniqueSubdomains);
      resultsElement.textContent = `Found ${uniqueSubdomains.size} subdomains.`;
    } catch (parseError) {
      throw new Error("Error parsing JSON response.");
    }

  } catch (error) {
    resultsElement.textContent = "Error fetching crt.sh data.";
    console.error("Error fetching crt.sh data:", error);
    alert("Error fetching crt.sh data: " + error.message);
  }
}



// Fetch subdomains from AlienVault API
async function fetchURLsFromAPI(apiURLTemplate, domain) {
  let allURLs = [];
  let page = 1;

  while (true) {
    const url = apiURLTemplate.replace("%d", page);
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Host": "otx.alienvault.com",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.6778.86 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml",
        }
      });

      const text = await response.text();
      const regex = /"url":\s*"([a-zA-Z][a-zA-Z0-9+\-.]*:\/\/[^"]+)"/g;
      const matches = [...text.matchAll(regex)];

      matches.forEach(match => {
        const url = match[1];
        if (!shouldFilterURL(url)) {
          allURLs.push(url);
        }
      });

      if (!text.includes('"has_next": true')) {
        break;
      }
      page++;
    } catch (error) {
      throw new Error("Error fetching API data: " + error.message);
    }
  }

  return extractSubdomainsFromURLs(allURLs);
}

function extractSubdomainsFromURLs(urls) {
  const subdomainRegex = /(?:https?:\/\/)?([^\/]+)/;
  const subdomains = new Set();

  urls.forEach(url => {
    const match = url.match(subdomainRegex);
    if (match && match[1]) {
      const subdomain = match[1];
      if (subdomain.includes(".")) {
        subdomains.add(subdomain);
      }
    }
  });

  return Array.from(subdomains);
}

function shouldFilterURL(url) {
  const filters = [
    ".pdf", ".css", ".jpg", ".jpeg", ".png", ".svg", ".img", ".gif", ".mp4", ".flv", ".ogv", ".webm", ".webp",
    ".mov", ".mp3", ".m4a", ".m4p", ".scss", ".tif", ".tiff", ".ttf", ".otf", ".woff", ".woff2", ".bmp", ".ico", ".eot",
    ".htc", ".rtf", ".swf", ".image", "/image", "/img", "/css", "/wp-json", "/wp-content", "/wp-includes", "/theme",
    "/audio", "/captcha", "/font", "node_modules", "/jquery", "/bootstrap"
  ];

  return filters.some(filter => url.toLowerCase().includes(filter));
}

// Copy and Download functionality (unchanged)
document.getElementById("copy").addEventListener("click", () => {
  const results = document.getElementById("results").textContent;
  if (results && results !== "Results will appear here..." && results !== "Fetching subdomains...") {
    navigator.clipboard.writeText(results)
      .then(() => alert("Copied to clipboard!"))
      .catch(err => alert("Failed to copy: " + err));
  } else {
    alert("No data to copy.");
  }
});

document.getElementById("download").addEventListener("click", () => {
  const results = document.getElementById("results").textContent;
  if (results && results !== "Results will appear here..." && results !== "Fetching subdomains...") {
    const blob = new Blob([results], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    chrome.downloads.download({
      url: url,
      filename: "subdomains.txt"
    });
  } else {
    alert("No data to download.");
  }
});

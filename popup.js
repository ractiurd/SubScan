document.addEventListener("DOMContentLoaded", function () {
  // Load saved results when extension opens
  let storedSubdomains = JSON.parse(localStorage.getItem('subdomains')) || [];

  // Fetch button click event
  document.getElementById("fetch").addEventListener("click", async () => {
    const domain = document.getElementById("domain").value.trim();
    const resultsElement = document.getElementById("results");

    if (!domain) {
      alert("Please enter a domain.");
      return;
    }

    // Clear previous results when starting a new scan
    storedSubdomains = [];
    resultsElement.textContent = "Fetching subdomains...";

   // const useRapidDNS = document.getElementById("useRapidDNS").checked;
    const useAPI = document.getElementById("useAPI").checked;
    const useCRTSh = document.getElementById("useCRTSh").checked;
    const useCertspotter = document.getElementById("useCertspotter").checked;
    const useHackerTarget = document.getElementById("useHackerTarget").checked;
    const useAnubis = document.getElementById("useAnubis").checked;
    const useLeakIX = document.getElementById("useLeakIX").checked;
    //const useSubdomainCenter = document.getElementById("useSubdomainCenter").checked;
    const useShodan = document.getElementById("useShodan").checked;
  

    let allSubdomains = [];

    // Fetch subdomains based on selected checkboxes
    if (useLeakIX) {
      await fetchLeakIXSubdomains(domain, allSubdomains, resultsElement);
    }



    if (useCertspotter) {
      await fetchCertspotterSubdomains(domain, allSubdomains, resultsElement);
    }
   // if (useRapidDNS) {
   //   await fetchRapidDNS(domain, allSubdomains, resultsElement);
    //}
    if (useHackerTarget) {
      await fetchHackerTargetSubdomains(domain, allSubdomains, resultsElement);
    }
    if (useAnubis) {
      await fetchAnubisSubdomains(domain, allSubdomains, resultsElement);
    }

    if (useAPI) {
      await fetchAlienVault(domain, allSubdomains, resultsElement);
    }
    if (useCRTSh) {
      await fetchCRTShSubdomains(domain, allSubdomains, resultsElement);
    }

    if (useShodan) {
      await fetchShodanSubdomains(domain, allSubdomains, resultsElement);
    }

    // Store the new results (with duplicates removed)
    storedSubdomains = [...new Set(allSubdomains)];
    localStorage.setItem('subdomains', JSON.stringify(storedSubdomains));

    // Display the results
    if (storedSubdomains.length > 0) {
      resultsElement.textContent = storedSubdomains.join("\n");
    } else {
      resultsElement.textContent = "No subdomains found.";
    }
  });

  // Show stored results when popup opens if they exist
  const resultsElement = document.getElementById("results");
  if (storedSubdomains.length > 0) {
    resultsElement.textContent = storedSubdomains.join("\n");
  }

  // Rest of your existing functions (fetchCertspotterSubdomains, etc.) remain unchanged below this point
  // ... [all your existing functions stay exactly as they were] ...
});


/// Separate functions for each source
// Fetch subdomains from Shodan
async function fetchShodanSubdomains(domain, allSubdomains, resultsElement) {
  const apiKey = " Place your shodan api key here"; // Place your shodan api key here
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
async function fetchHackerTargetSubdomains(domain, allSubdomains, resultsElement) {
  const url = `https://api.hackertarget.com/hostsearch/?q=${domain}`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    
    const text = await response.text();
    const uniqueSubdomains = new Set();

    text.split('\n')
      .filter(line => line.trim() && line.includes(domain))
      .forEach(line => {
        const subdomain = line.split(',')[0].trim();
        if (subdomain) uniqueSubdomains.add(subdomain);
      });

    allSubdomains.push(...uniqueSubdomains);
    
  } catch (error) {
    resultsElement.textContent += `\nHackerTarget error: ${error.message}`;
    console.error("HackerTarget error:", error);
  }
}
//checked for anubis
async function fetchAnubisSubdomains(domain, allSubdomains, resultsElement) {
  const url = `https://jldc.me/anubis/subdomains/${domain}`;
  
  try {
    // Show loading status
  
    
    const response = await fetch(url);
    
    // Check for API limitations or errors
    if (response.status === 429) {
      resultsElement.textContent += "\n[-] Anubis: Rate limit exceeded (try again later)";
      return;
    }
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const subdomains = await response.json();

    // Add results and update status
    if (subdomains.length > 0) {
      allSubdomains.push(...subdomains);
      resultsElement.textContent += `\n[+] Anubis found ${subdomains.length} subdomains`;
    } else {
      resultsElement.textContent += "\n[-] Anubis: No subdomains found";
    }

  } catch (error) {
    const errorMsg = `\n[-] Anubis error: ${error.message || "Unknown error"}`;
    resultsElement.textContent += errorMsg;
    console.error("Anubis error:", error);
  }
}
//fetch from leakx
async function fetchLeakIXSubdomains(domain, allSubdomains, resultsElement) {
  // Try direct connection first
  let response;
  try {
    const directUrl = `https://leakix.net/domain/${domain}`;
    response = await fetch(directUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
      },
      credentials: 'omit'
    });
  } catch (directError) {
    // If direct fails, try CORS proxy
    try {
      resultsElement.textContent += "\n[!] Trying CORS proxy for LeakIX...";
      const proxyUrl = 'https://corsproxy.io/?';
      const targetUrl = encodeURIComponent(`https://leakix.net/domain/${domain}`);
      response = await fetch(proxyUrl + targetUrl, {
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
    } catch (proxyError) {
      resultsElement.textContent += `\n[-] LeakIX failed: ${proxyError.message}`;
      console.error("LeakIX error:", proxyError);
      return;
    }
  }

  try {
    const html = await response.text();
    const subdomains = new Set();

    // More robust regex pattern
    const regex = /(?:<a [^>]*href="\/host\/[^"]*"[^>]*>|·)\s*([a-zA-Z0-9][a-zA-Z0-9.-]*\.(?:[a-zA-Z]{2,}|[a-zA-Z]+\.[a-zA-Z]+))/gi;
    
    let match;
    while ((match = regex.exec(html)) !== null) {
      const subdomain = match[1].trim().toLowerCase();
      if (subdomain.endsWith(`.${domain.toLowerCase()}`)) {
        subdomains.add(subdomain);
      }
    }

    if (subdomains.size > 0) {
      allSubdomains.push(...subdomains);
      resultsElement.textContent += `\n[+] LeakIX found ${subdomains.size} subdomains`;
    } else {
      resultsElement.textContent += "\n[-] LeakIX: No valid subdomains found";
    }
  } catch (error) {
    resultsElement.textContent += `\n[-] LeakIX parsing error: ${error.message}`;
    console.error("LeakIX parsing error:", error);
  }
}


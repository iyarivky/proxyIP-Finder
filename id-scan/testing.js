// Function to fetch IP addresses from the JSON URL
async function fetchIPAddresses(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch IP addresses: ${response.statusText}`);
  }
  const ipAddresses = await response.json();
  return ipAddresses;
}

// Function to fetch the response from the API for each IP address
async function fetchAPIResponse(ipAddress) {
  const apiUrl = `https://proxyip.edtunnel.best/api?ip=${ipAddress}&host=speed.cloudflare.com&port=443&tls=true`;
  const response = await fetch(apiUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch API response for ${ipAddress}: ${response.statusText}`);
  }
  const data = await response.text();
  return data;
}

// Function to write responses to a text file
async function writeResponsesToFile(ipAddresses, responses, fileName) {
  let fileContent = "";
  for (let i = 0; i < ipAddresses.length; i++) {
    fileContent += `==========================\nResponse for ${ipAddresses[i]}:\n${responses[i]}\n==========================\n`;
  }
  await Bun.write(fileName, fileContent);
}

// Function to add delay
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  const ipJsonUrl = "https://raw.githubusercontent.com/iyarivky/proxyIP-Finder/main/id-scan/asnpool-ID/AS131745%20PT.%20Cybertechtonic%20Pratama.json";
  try {
    // Fetch IP addresses from the JSON URL
    const ipAddresses = await fetchIPAddresses(ipJsonUrl);

    const responses = [];
    for (const ip of ipAddresses) {
      try {
        const response = await fetchAPIResponse(ip);
        responses.push(response);
        // Add delay of 1 second (1000 milliseconds) between requests
        await delay(1000);
      } catch (error) {
        console.error(error.message);
        responses.push("Error: " + error.message);
      }
    }

    // Write the responses to a text file
    await writeResponsesToFile(ipAddresses, responses, "responses.txt");

    console.log("Responses have been written to responses.txt");
  } catch (error) {
    console.error(error);
  }
}

// Run the main function
main();

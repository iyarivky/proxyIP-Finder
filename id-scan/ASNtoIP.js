async function ASNtoNetblock(asn) {
	try {
		// Fetch the HTML from the URL
		const response = await fetch(`https://ipinfo.io/${asn}`);
		let res = [];

		await new HTMLRewriter()
			.on("div#ipv4-data >table.table.table-bordered.table-md.table-details > tbody > tr > td > a.charcoal-link", {
				text(text) {
					let numblock = text.text
					if (numblock) {
						res.push(numblock)
					}
				}
			})
			.transform(response).arrayBuffer();

		return res;
	} catch (error) {
		console.error('Error fetching or parsing HTML:', error);
	}
}

function NetblockToIP(cidr) {
	function ipToNumber(ip) {
		return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
	}

	function numberToIp(num) {
		return [
			(num >>> 24) & 0xff,
			(num >>> 16) & 0xff,
			(num >>> 8) & 0xff,
			num & 0xff
		].join('.');
	}

	function getNetblockRange(cidr) {
		const [baseIp, subnet] = cidr.split('/');
		const baseIpNumber = ipToNumber(baseIp);
		const subnetMask = ~((1 << (32 - subnet)) - 1) >>> 0;
		const startIpNumber = baseIpNumber & subnetMask;
		const endIpNumber = startIpNumber | ~subnetMask >>> 0;

		return [startIpNumber, endIpNumber];
	}
	let result = []
	const [startIpNumber, endIpNumber] = getNetblockRange(cidr);
	for (let ipNumber = startIpNumber; ipNumber <= endIpNumber; ipNumber++) {
		result.push(numberToIp(ipNumber));
	}
	return result
}

console.log(NetblockToIP('103.149.176.0/24'))
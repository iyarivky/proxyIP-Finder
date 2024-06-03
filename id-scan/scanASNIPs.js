async function fetchASNName(asn) {
	try {
		const response = await fetch(`https://ipinfo.io/${asn}`)
		let title = '';
		await new HTMLRewriter()
			.on("title", {
				text(text) {
					title += text.text
				}
			}).transform(response).arrayBuffer()
		let asnName = title.split(' details ')[0];
		return asnName
	} catch (error) {
		console.error('Error fetching or parsing HTML', error)
	}
}

async function fetchASNNetblocks(asn) {
	try {
		const response = await fetch(`https://ipinfo.io/${asn}`);
		let netblocks = [];

		await new HTMLRewriter()
			.on("div#ipv4-data > table.table.table-bordered.table-md.table-details > tbody > tr > td > a.charcoal-link", {
				text(text) {
					let netblock = text.text;
					if (netblock) {
						netblocks.push(netblock);
					}
				}
			})
			.transform(response).arrayBuffer();

		return netblocks;
	} catch (error) {
		console.error('Error fetching or parsing HTML:', error);
	}
}

async function convertNetblocksToIPs(netblocks) {
	function netblockToIPs(cidr) {
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

		let ips = [];
		const [startIpNumber, endIpNumber] = getNetblockRange(cidr);
		for (let ipNumber = startIpNumber; ipNumber <= endIpNumber; ipNumber++) {
			ips.push(numberToIp(ipNumber));
		}
		return ips;
	}

	let allIPs = [];
	for (let i = 0; i < netblocks.length; i++) {
		allIPs = allIPs.concat(netblockToIPs(netblocks[i]));
	}
	return allIPs;
}

async function scanASNIPs(asn) {
	let netblocks = await fetchASNNetblocks(asn);
	let ips = await convertNetblocksToIPs(netblocks);
	return ips;
}

async function main() {
	try {
		const data = await Bun.file("hosting-id.json").text();
		const asnList = JSON.parse(data);

		for (const asnData of asnList) {
			const { asn, name } = asnData;
			console.log(`Processing ASN: ${asn}, Name: ${name}`);
			
			const asnName = await fetchASNName(asn);
			const ips = await scanASNIPs(asn);

            Bun.write(`asnpool-ID/${asnName}.json`, JSON.stringify(ips, null, 2));
		}

		console.log('Processing completed.');
	} catch (error) {
		console.error('Error:', error);
	}
}

main();
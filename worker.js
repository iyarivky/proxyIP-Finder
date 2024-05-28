import { connect } from 'cloudflare:sockets';

async function connectAndCheck(address, port) {
    try {
        const connectPromise = (async () => {
            const tcpSocket = await connect({ hostname: address, port: port });
            console.log(`Trying connect to ${address}:${port}`);

            const request = "GET / HTTP/1.1\r\nHost: https://speedtest.net\r\nConnection: close\r\n\r\n";
            const writer = tcpSocket.writable.getWriter();
            await writer.write(new TextEncoder().encode(request));
            writer.releaseLock();

            const reader = tcpSocket.readable.getReader();
            const { value, done } = await reader.read();
            reader.releaseLock();

            if (done) {
                return `Result for ${address} : Connection closed by server \nMaybe you can use this ip as proxyIP, but with several weird anomalies :/`;
            }

            const response = new TextDecoder().decode(value);
            if (response.includes("HTTP/1.1 400 Bad Request\r\nServer: cloudflare")) {
                return `Result for ${address} : Successfully accessed speedtest.net \nYou can use this ip as proxyIP \n\nResponse : \n${response}`;
            } else {
                return `Result for ${address} : Successfully accessed speedtest.net \nMaybe you can use this ip as proxyIP, but with several weird anomalies :/ \n\nResponse : \n${response}`;
            }
        })();

        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject('Connection timeout'), 5000));

        return await Promise.race([connectPromise, timeoutPromise]);
    } catch (error) {
        return `Result for ${address} : ${error}\nBruh, you can't use this ip as proxyIP`;
    }
}

export default {
    async fetch(req) {
        const url = new URL(req.url);
        const ip = url.searchParams.get('ip');
        if (ip){
          try {
            const result = await connectAndCheck(ip, 443);
            console.log(result);
            return new Response(String(result), { headers: { "Content-Type": "text/plain" } });
        } catch (error) {
            return new Response("Socket connection failed: " + error, { status: 500 });
        }
        } else {
            return new Response("bapak kao", { headers: { "Content-Type": "text/plain" } });
        }
    }
};

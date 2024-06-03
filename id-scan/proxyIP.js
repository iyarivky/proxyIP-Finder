async function connectAndCheck(address, port) {
    try {
        const connectPromise = new Promise((resolve, reject) => {
            const socket = Bun.connect({
                hostname: address,
                port: port,

                socket: {
                    data(socket, data) {
                        const response = new TextDecoder().decode(data);
                        if (response.includes("HTTP/1.1 400 Bad Request\r\nServer: cloudflare")) {
                            resolve(`Result for ${address} : Successfully accessed speedtest.net \nYou can use this IP as proxyIP \n\nResponse : \n${response}`);
                        } else {
                            resolve(`Result for ${address} : Successfully accessed speedtest.net \nMaybe you can use this IP as proxyIP, but with several weird anomalies :/ \n\nResponse : \n${response}`);
                        }
                    },
                    open(socket) {
                        console.log(`Trying to connect to ${address}:${port}`);

                        const request = "GET / HTTP/1.1\r\nHost: https://speedtest.net\r\nConnection: close\r\n\r\n";
                        socket.write(new TextEncoder().encode(request));
                    },
                    close(socket) {
                        resolve(`Result for ${address} : Connection closed by server \nMaybe you can use this IP as proxyIP, but with several weird anomalies :/`);
                    },
                    error(socket, error) {
                        reject(`Result for ${address} : ${error.message}\nBruh, you can't use this IP as proxyIP`);
                    },
                    connectError(socket, error) {
                        reject(`Result for ${address} : Connection failed with error: ${error.message}`);
                    },
                    timeout(socket) {
                        reject(`Result for ${address} : Connection timed out`);
                    },
                    end(socket) {
                        resolve(`Result for ${address} : Connection closed by server \nMaybe you can use this IP as proxyIP, but with several weird anomalies :/`);
                    }
                }
            });
        });

        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject('Connection timeout'), 5000));

        return await Promise.race([connectPromise, timeoutPromise]);
    } catch (error) {
        return `Result for ${address} : ${error}\nBruh, you can't use this IP as proxyIP`;
    }
}

let ip = "43.163.3.63";
const result = await connectAndCheck(ip, 443);
console.log(result);
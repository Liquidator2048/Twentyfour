interface SimpleW3ClientConfig {
    url: string,
    cid?: number
}

interface JsonReponse {
    jsonrpc: '2.0',
    id: number
    result: any
}

function SimpleW3Client(config: SimpleW3ClientConfig): ISimpleW3Client {
    return new Proxy({} as ISimpleW3Client, {
        get(_, method: string | symbol) {
            return (...params: any[]) => {
                config.cid = config.cid || 0;
                return fetch(
                    new Request(config.url, {
                        method: 'POST',
                        body: JSON.stringify({
                            jsonrpc: '2.0',
                            method: method,
                            params: params,
                            id: ++config.cid,
                        }),
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    }),
                ).then(resp => resp.json());
            };
        },
    });
}

interface ISimpleW3Client {
    [name: string]: (...params: any[]) => Promise<JsonReponse>;
}


export default SimpleW3Client;

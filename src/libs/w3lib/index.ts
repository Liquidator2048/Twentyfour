import { ethers } from 'ethers';
import contractAbi from './contractAbi.json';

export type ExternalProvider = {
    isMetaMask?: boolean;
    isStatus?: boolean;
    host?: string;
    path?: string;
    sendAsync?: (request: { method: string, params?: Array<any> }, callback: (error: any, response: any) => void) => void
    send?: (request: { method: string, params?: Array<any> }, callback: (error: any, response: any) => void) => void
    request?: (request: { method: string, params?: Array<any> }) => Promise<any>
    on?: (eventName: string, callback: (...params: any[]) => void) => void;
}

class W3lib {
    provider: ethers.providers.BaseProvider;
    contract: ethers.Contract;
    useInBrowser: boolean;
    contractAddress: string;
    web3RPC: string;
    chainId: number;

    constructor(contractAddress: string, useInBrowser: boolean, web3RPC: string, chainId: number, contractInterface: ethers.ContractInterface) {
        this.contractAddress = contractAddress;
        this.web3RPC = web3RPC;
        this.useInBrowser = useInBrowser;
        this.chainId = chainId;
        if (this.useInBrowser) {
            const inbrowserProvider = (window as any).ethereum;
            this.web3BrowserProviderSetup(this.chainId, inbrowserProvider);
            this.provider = new ethers.providers.Web3Provider(inbrowserProvider);
        } else {
            this.provider = new ethers.providers.StaticJsonRpcProvider(this.web3RPC);
        }
        this.contract = new ethers.Contract(
            this.contractAddress,
            contractInterface,
        ).connect(this.provider);
    }

    private web3BrowserProviderSetup(chainId: number | string, provider: ExternalProvider): void {
        if (provider?.request)
            provider?.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: `0x${chainId.toString(16)}` }],
            });
        if (provider?.on)
            provider.on('chainChanged', (newChainId) => {
                console.log('chainChanged', newChainId);
                if (provider?.request)
                    provider?.request({
                        method: 'wallet_switchEthereumChain',
                        params: [{ chainId: `0x${chainId.toString(16)}` }],
                    });
                window.location.reload(); // TODO: emit an event
            });
    }
}


export default (contractAddress: string, useInBrowser: boolean, web3RPC: string, chainId: number, contractInterface: ethers.ContractInterface = contractAbi) => {
    const w3 = new W3lib(contractAddress, useInBrowser, web3RPC, chainId, contractInterface);

    return new Proxy<W3lib | ethers.Contract>(
        w3,
        {
            get(target: W3lib, p: string | symbol): ethers.ContractFunction {
                return Reflect.get(target.contract, p);
            },
        },
    ) as ethers.Contract;
}

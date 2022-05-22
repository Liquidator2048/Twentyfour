import * as IpfsHttp from 'ipfs-http-client';
import { getAllFiles } from './utils.mjs';

async function main(ipfsKeyName, ipfsHttp) {
    const ipfsRemote = await IpfsHttp.create({ url: ipfsHttp });
    if (ipfsRemote.isOnline()) {
        console.log(`remote ipfs '${ipfsHttp}' is online`);
    }
    console.log('Ipfs: ', await ipfsRemote.id());
    const arrayOfFiles = getAllFiles('./dist');
    let lastOne = null;
    for await(let response of await ipfsRemote.addAll(arrayOfFiles, { pin: true })) {
        lastOne = response;
        console.log(`${response.path}\t->\t/ipfs/${response.cid?.toString()}`);
    }

    console.log('folder cid', lastOne.cid.toString());
    await ipfsRemote.pin.add(lastOne.cid, { recursive: true });
    console.log(await ipfsRemote.name.publish(lastOne.cid, { key: ipfsKeyName }));
}

main(process.env.IPFS_KEY_NAME, process.env.IPFS_HTTP).then(() => {
    console.log('done');
});

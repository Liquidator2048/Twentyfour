import * as IpfsCore from 'ipfs-core';
import { getAllFiles, importKey } from './utils.mjs';

async function main(ipfsKeyName, ipfsKeyBase64, ipfsKeyId) {
  const ipfs = await IpfsCore.create({
    start: false, init: { id: ipfsKeyId, privateKey: ipfsKeyBase64 },
  });
  try {
    await ipfs.start();
    if (ipfs.isOnline()) {
      console.log('local ipfs is online');
    } else {
      throw new Error('offline');
    }
    console.log('Ipfs:', await ipfs.id());

    console.log('key', await importKey(ipfs, ipfsKeyBase64, ipfsKeyId, ipfsKeyName));

    const arrayOfFiles = getAllFiles('./dist');

    let lastOne = null;
    for await(let response of await ipfs.addAll(arrayOfFiles, { pin: true })) {
      lastOne = response;
      console.log(`${response.path}\t->\t/ipfs/${response.cid?.toString()}`);
    }

    console.log('folder cid', lastOne.cid.toString());
    await ipfs.pin.add(lastOne.cid, { recursive: true });
    console.log(await ipfs.name.publish(lastOne.cid, { key: ipfsKeyName }));

  } finally {
    await ipfs.stop();
  }
}

main(process.env.IPFS_KEY_NAME, process.env.IPFS_KEY_B64, process.env.IPFS_KEY_ID).then(() => {
  console.log('done');
});

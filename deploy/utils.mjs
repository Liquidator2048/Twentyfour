import * as PeerId from 'peer-id';
import fs from 'fs';
import path from 'path';
import * as IpfsCore from 'ipfs-core';
import glob from 'glob';

/***
 *
 * @param {IpfsCore.IPFS} ipfs
 * @param {string} ipfsPath
 * @returns {Promise<Uint8Array>}
 * @private
 */
export async function getIpfsFile(ipfs, ipfsPath) {
  const fileStat = await ipfs.files.stat(`${ipfsPath}`);
  console.log('File stats', fileStat);
  const fileSize = fileStat.size;
  let tmpSize = 0;
  const file = new Uint8Array(fileSize);
  for await (const f of await ipfs.cat(ipfsPath)) {
    console.log(`Writing ${f.length} @${tmpSize}`);
    file.set(f, tmpSize);
    tmpSize += f.length;
    console.log(`${((tmpSize / fileSize) * 100).toFixed(2)}% ( ${tmpSize}/${fileSize} )`, f.length);
  }
  return file;
}

/**
 *
 * @param {string} filePath
 * @param {Uint8Array} data
 */
export function writeToFile(filePath, data) {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
  fs.appendFile(filePath, Buffer.from(data), function(err) {
    if (err) {
      console.error(err);
      throw err;
    }
  });
}

export function getAllFiles(dirPath) {
  return glob.sync(dirPath + '/**/*').map(filePath => ({
    path: path.relative(path.dirname(dirPath), filePath.toString()).replace(/\\/g, '/'), //fullPath: path.resolve(filePath),
    content: fs.statSync(filePath.toString()).isDirectory() ? undefined : fs.readFileSync(filePath.toString()),
    mtime: fs.statSync(filePath.toString()).mtime,
  }));
}

/**
 *
 * @param {IpfsCore.IPFS} ipfs
 * @param {string} keyB64
 * @param {string} keyId
 * @param {string} keyName
 *
 * @return {IpfsCore.Key}
 */
export async function importKey(ipfs, keyB64, keyId, keyName) {
  const pId = await PeerId.createFromJSON({ id: keyId, privKey: keyB64 });
  const keyList = (await ipfs.key.list()).filter(k => k.name === keyName);
  if (keyList.length) {
    await ipfs.key.rm(keyName);
  }
  const key = await pId.privKey.export('export');
  return await ipfs.key.import(keyName, key, 'export');
}

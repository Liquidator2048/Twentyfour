import { MemoryAsyncVFS } from 'wa-sqlite/src/examples/MemoryAsyncVFS.js';
import * as IPFSCore from 'ipfs-core';
import { IPFS } from 'ipfs-core';
import * as VFS from 'wa-sqlite/src/sqlite-constants.js';
import { StatResult } from 'ipfs-core-types/types/src/files';


export class IpfsAsyncVFS extends MemoryAsyncVFS {
  public name = 'ipfs-async';

  private _ipfs!: IPFS;
  private _files: { [key: number]: { name: string | null, stat: StatResult } } = {};

  constructor(ipfs: IPFS | undefined = undefined) {
    super();
    if (ipfs)
      this._ipfs = ipfs;
  }

  xOpen(name: string | null, fileId: number, flags: number, pOutFlags: {
    set: (arg0: number) => void;
  }): number | Promise<number> {
    console.log('IpfsAsyncVFS.xOpen', name, fileId, flags, pOutFlags);
    return this.handleAsync(async () => {
      console.log('IpfsAsyncVFS.xOpen', fileId, 'handleAsync');

      if (!this._ipfs) {
        console.log('IpfsAsyncVFS.xOpen', fileId, 'handleAsync - IPFS.create', IPFSCore.create);
        this._ipfs = await IPFSCore.create();
      }
      console.log('IpfsAsyncVFS.xOpen', fileId, 'handleAsync - getting stats', this._ipfs);
      const stat = await this._ipfs.files.stat(`/ipfs/${name}`);
      this._files[fileId] = { name, stat };
      return VFS.SQLITE_OK;
    });
  }


  xRead(fileId: number, pData: {
    size: number;
    value: Int8Array;
  }, iOffset: number): number | Promise<number> {
    console.log('IpfsAsyncVFS.xRead', fileId, pData, iOffset);
    const offset = iOffset;
    const length = pData.size;
    return this.handleAsync(async () => {
      for await(const b of this._ipfs.files.read(`/ipfs/${this._files[fileId].name}`, { offset, length })) {
        pData.value.set(b);
      }
      return VFS.SQLITE_OK;
      //return super.xRead(fileId, pData, iOffset)
    });
  }

  xFileSize(
    fileId: number,
    pSize64: { set(value: number): void },
  ): number | Promise<number> {
    return this.handleAsync(async () => {
      if (!this._files[fileId]) {
        debugger
        return VFS.SQLITE_CANTOPEN;
      }
      if (!this._files[fileId].stat) {
        this._files[fileId].stat = await this._ipfs.files.stat(`/ipfs/${this._files[fileId].name}`);
      }
      pSize64.set(this._files[fileId].stat.size);
      return VFS.SQLITE_OK;
    });
  }

  xClose(fileId: number): number | Promise<number> {
    delete this._files[fileId];
    return this.handleAsync(async () => VFS.SQLITE_OK);
  }

}

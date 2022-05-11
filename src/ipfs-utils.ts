import * as IPFS from 'ipfs-core';
import { Decimal } from 'decimal.js';

const chunkSize = 1024;

const fileSize = async (ipfs: IPFS.IPFS, cid: string): Promise<number> => {
    const stat = await ipfs.files.stat(`/ipfs/${cid}`);
    return stat.size;
};

const readFile = async (ipfs: IPFS.IPFS, cid: string, offset: number, length: number): Promise<Uint8Array[]> => {
    const data: Uint8Array[] = [];
    const c: Decimal = (new Decimal(length)).div(new Decimal(chunkSize));
    const sizes: Decimal[] = [];
    if (c < new Decimal(1)) {
        sizes.push(c);
    } else {
        for (let i = 0; i < parseInt(c.toString()); i++) {
            sizes.push(new Decimal(1));
        }
        if (c.mod(1) > new Decimal(0)) {
            sizes.push(c.mod(1));
        }
    }
    let chunk_offset = offset;
    for (const size of sizes) {
        const chunk_length = size.mul(new Decimal(chunkSize)).toNumber();
        const read = ipfs.files.read(`/ipfs/${cid}`, { offset: chunk_offset, length: chunk_length });
        for await(const b of read) {
            data.push(b);
        }
        chunk_offset = chunk_offset + chunk_length;
    }

    return data;
};

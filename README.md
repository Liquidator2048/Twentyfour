# Twentyfour

Example vue.js app that use a SQLite database over [IPFS](https://ipfs.io/).

Thanks to the FTS5 SQLite module the database file is not completely downloaded. See `IpfsAsyncVFS.ts` file for details.

Credit:

* [Boredcaveman](https://boredcaveman.xyz/post/0x2_static-torrent-website-p2p-queries.html)
* [rhashimoto/wa-sqlite](https://github.com/rhashimoto/wa-sqlite.git).

Demo [here](https://ipfs.io/ipns/k51qzi5uqu5dlwn01vorkqibtgizo26llfn0ug2lr9srovnm0jvr9nmkypcgf3).

## Project setup

```
yarn install
```

### Compiles and hot-reloads for development

```
yarn serve
```

### Compiles and minifies for production

```
yarn build
```

### Run your unit tests

```
yarn test:unit
```

### Lints and fixes files

```
yarn lint
```

### Customize configuration

See [Configuration Reference](https://cli.vuejs.org/config/).

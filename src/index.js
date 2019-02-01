import Web from './web'
import IPFS from './ipfs'

const Fetch = async thing => {
  const prot = new URL(thing).protocol
  if (!prot) {
    return
  }

  if (prot.includes('http')) { // HTTP
    return Web.fetcher(thing)
  } else if (prot.includes('ipfs')) { // IPFS
    return IPFS.fetcher(thing)
  } else { // unsupported protocol
    console.log('Unknown protocol:', prot)
  }
}

module.exports = { Fetch, Web, IPFS }

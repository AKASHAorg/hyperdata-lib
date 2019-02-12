const IPFSClient = require('ipfs-http-client')

let ipfs

const init = (multiaddr) => {
  ipfs = new IPFSClient(multiaddr)
}

const fetcher = async url => {
  // buffer: true results in the returned result being a buffer rather than a stream
  try {
    // init node if needed
    if (ipfs === undefined) {
      await init()
    }
    // get the CID from the url
    const parsed = new URL(url)
    const CID = parsed.pathname.substring(2, parsed.pathname.length)
    // fetch the data as string
    const data = await ipfs.cat(CID)
    // attempt to return parsed JSON
    return JSON.parse(data.toString('utf8'))
  } catch (err) {
    console.log('ipfs cat error', err)
  }
}

module.exports = { fetcher, init, ipfs }

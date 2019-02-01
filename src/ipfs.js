const IPFS = require('ipfs')

let node

const init = () => {
  return new Promise(resolve => {
    node = new IPFS()
    node.on('ready', () => {
      // done
      console.log('IPFS node initialized')
      resolve()
    })
  })
}

const fetcher = async url => {
  // buffer: true results in the returned result being a buffer rather than a stream
  try {
    // init node if needed
    if (node === undefined) {
      await init()
    }
    // get the CID from the url
    const parsed = new URL(url)
    const CID = parsed.pathname.substring(2, parsed.pathname.length)
    console.log(CID)
    // fetch the data as string
    const data = await node.cat(CID)
    // attempt to return parsed JSON
    return JSON.parse(data.toString('utf8'))
  } catch (err) {
    console.log('ipfs cat error', err)
  }
}

module.exports = { fetcher, init }

const IPFS = require('ipfs')

let node

const init = () => {
  return new Promise(resolve => {
    node = new IPFS()
    node.on('ready', () => {
      // nothing
      console.log('IPFS node ready')
      resolve()
    })
  })
}

const fetcher = async hash => {
  // buffer: true results in the returned result being a buffer rather than a stream
  try {
    const data = await node.cat(hash)
    return data.toString('utf8')
  } catch (err) {
    console.log('ipfs cat error', err)
  }
}

module.exports = { init, fetcher }

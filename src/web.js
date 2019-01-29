const axios = require('axios')

const fetcher = async url => {
  try {
    const response = await axios.get(url)
    return response.data
  } catch (err) {
    console.log(err)
  }
}

module.exports = { fetcher }

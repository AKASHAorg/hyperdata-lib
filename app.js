let comments = []

const listItem = function (data) {
  // DID resolver
  // https://github.com/decentralized-identity/universal-resolver/blob/master/docs/api-definition.md
  // https://uniresolver.io/1.0/identifiers/did:sov:WRfXPg8dantKVubE3HX8pw

  if (!data || !data.comment) {
    return
  }
  data.comment.authorImage = data.comment.authorImage || 'favicon.png'
  data.comment.authorName = data.comment.authorName || 'anonymous'

  const comment = document.createElement('div')
  comment.id = data.source

  console.log(data)
  var source = data.source
  if (source.indexOf('ipfs') >= 0) {
    source = 'http://127.0.0.1:8080/api/v0/cat?stream-channels=true&arg=' + source.substring(source.lastIndexOf('//') + 2, source.length)
  }

  comment.innerHTML = `<div class="user"> 
    <img class="avatar" src="${data.comment.authorImage}">
    <div class="comment-box">
      <h4 class="comment-body">${data.comment.body}</h4>
      By ${data.comment.authorName}<br>
      <small>Source: <a href="${source}">${data.source}</a></small>
    </div>
  </div>`

  const parent = document.getElementById(data.comment.ref)
  if (parent && data.comment.type === 'Reply') {
    console.log('Found parent!', data.ref)
    comment.setAttribute('style', 'margin-left: 1em;')
    parent.appendChild(comment)
  } else {
    console.log('Not a reply')
    document.getElementById('comments').appendChild(comment)
    // add a spacer
    document.getElementById('comments').appendChild(document.createElement('br'))
  }
}

const toCommentsList = function (data) {
  comments.push(data)
  comments.sort(function (a, b) {
    return new Date(a.created) - new Date(b.created)
  })
  // clear list
  document.getElementById('comments').innerHTML = ''

  comments.forEach(function (comment) {
    listItem(comment)
  })
}

const getDIDProfile = function (did) {
  return new Promise(function (resolve, reject) {
    if (!did || did.indexOf('did:muport') < 0) {
      return reject(new Error('Not a muport DID:', did))
    }
    const CID = did.substring(did.lastIndexOf(':') + 1, did.length)
    Hyperdata.Fetch('ipfs://' + CID).then(function (data) {
      if (data && data.managementKey) {
        Box.getProfile(data.managementKey).then(function (profile) {
          return resolve(profile)
        }).catch(function (err) {
          reject(err)
        })
      }
    }).catch(function (error) {
      // handle error
      console.log(error)
    })
  })
}

// Use local IPFS node
var IPFSaddr = '/ip4/127.0.0.1/tcp/8080'
// Init Hyperdata
Hyperdata.IPFS.init(IPFSaddr)
console.log('Initialized local IPFS node')

// Test Web fetching
const index = [
  'https://deiu.github.io/cdn/comment-ab019f3.jsonld',
  'ipfs://QmXAQJSUtvmoroV5CNBJBT7HmZk25e64hPuRcpFjyfG5tq',
  'ipfs://QmWUK85iJJYMRmfNDaBSMvNoqsuKuyMqAFnSbwiD8Q6Vwc'
]
index.forEach(function (url) {
  Hyperdata.Fetch(url).then(function (data) {
    if (data) {
      data.source = url
      getDIDProfile(data.comment.author).then(function (profile) {
        data.comment.authorDID = profile.ethereum_proof.linked_did
        if (profile.name) {
          data.comment.authorName = profile.name
        }
        if (profile.image) {
          data.comment.authorImage = 'https://ipfs.infura.io/ipfs/' + profile.image[0].contentUrl['/']
        }
        toCommentsList(data)
      }).catch(function (err) {
        console.log(err)
        toCommentsList(data)
      })
    }
  }).catch(function (err) {
    console.log('ERROR fetching:', err)
  })
})

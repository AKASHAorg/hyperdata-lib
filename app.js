const AKASHAComments = (function () {
  const CONF = {
    IPFSaddr: '/ip4/127.0.0.1/tcp/8080'
  }

  // list of external dependencies
  const DEPS = [
    'dist/Hyperdata.js',
    'https://unpkg.com/3box/dist/3box.min.js'
  ]

  // emulate indexing service for all comments
  const index = [
    'https://deiu.github.io/cdn/comment-ab019f3.jsonld',
    'ipfs://QmXAQJSUtvmoroV5CNBJBT7HmZk25e64hPuRcpFjyfG5tq',
    'ipfs://QmQvM3oa7ZUY2JwQbi9vQfoA5AdYKeb5CmafSagW11BNJc'
  ]

  // default name
  var commentsElement = 'AKASHAComments'

  var comments = []

  // add style
  var style = document.createElement('style')
  style.innerHTML =
    `.comments-avatar {
      margin-right: 10px;
      -webkit-border-radius: 50%;
      -moz-border-radius: 50%;
      border-radius: 50%;
      height: 73px;
      width: 73px;
      float: left;
    }
    .comments-avatar img {
      position: relative;
      display: block;
      width: 100%;
      border-radius: 50%;
      z-index: -1;
    }


    .comments-user {
      border: 1px solid gray;
      min-width: 250px;
      min-height: 80px;
      margin: auto;
      padding: 10px;
      box-shadow: 1px 1px 3px 1px grey;
    }

    .comments-user-pic {
      border-bottom: 2px solid gray;
    }

    .comments-body {
      margin-top: 10px;
      text-align: left;
    }


    @media only screen 
    and (min-width : 600px) {
      .comments-user-pic {
        border-right: 2px solid gray;
        float: left;
      }
      .comments-box {
        float: left;
        text-align: left;
      }
    }`
  document.body.appendChild(style)

  // const loadDeps = function (deps) {
  //   deps = deps || DEPS
  //   return new Promise(function (resolve, reject) {
  //     const injectScript = function (src) {
  //       return new Promise((resolve, reject) => {
  //         const script = document.createElement('script')
  //         script.src = src
  //         script.addEventListener('load', resolve)
  //         script.addEventListener('error', function () {
  //           reject(new Error('Error loading script.'))
  //         })
  //         script.addEventListener('abort', function () {
  //           reject(new Error('Script loading aborted.'))
  //         })
  //         var ref = window.document.getElementsByTagName('script')[0]
  //         ref.parentNode.insertBefore(script, ref)
  //       })
  //     }
  //     var promises = []
  //     for (var i = 0; i < DEPS.length; i++) {
  //       promises.push(injectScript(DEPS[i]))
  //     }
  //     Promise.all(promises).then(function () {
  //       return resolve
  //     }).catch(function (err) {
  //       return reject(err)
  //     })
  //   })
  // }

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
    comment.setAttribute('style', 'margin-top: 2em;')
    comment.id = data.source

    var source = data.source
    if (source.indexOf('ipfs') >= 0) {
      source = 'http://127.0.0.1:8080/api/v0/cat?stream-channels=true&arg=' + source.substring(source.lastIndexOf('//') + 2, source.length)
    }

    comment.innerHTML = `<div class="comments-user"> 
      <img class="comments-avatar" src="${data.comment.authorImage}">
      <div class="comments-box">
        <h4 class="comments-body">${data.comment.body}</h4>
        By ${data.comment.authorName}<br>
        <small>Source: <a href="${source}">${data.source}</a></small>
      </div>
    </div>`

    const parent = document.getElementById(data.comment.ref)
    if (parent && data.comment.type === 'Reply') {
      comment.setAttribute('style', 'margin-left: 2em;')
      parent.appendChild(comment)
    } else {
      document.getElementById(commentsElement).appendChild(comment)
      // add a spacer
      document.getElementById(commentsElement).appendChild(document.createElement('br'))
    }
  }

  const toCommentsList = function (data) {
    comments.push(data)
    comments.sort(function (a, b) {
      return new Date(a.created) - new Date(b.created)
    })
    // clear list
    document.getElementById(commentsElement).innerHTML = ''

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
      window.Hyperdata.Fetch('ipfs://' + CID).then(function (data) {
        if (data && data.managementKey) {
          window.Box.getProfile(data.managementKey).then(function (profile) {
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

  const init = function (divID, conf) {
    commentsElement = divID
    conf = conf || CONF

    // Init Hyperdata
    window.Hyperdata.IPFS.init(conf.IPFSaddr)
    console.log('Using IPFS node:', conf.IPFSaddr)

    index.forEach(function (url) {
      window.Hyperdata.Fetch(url).then(function (data) {
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
  }

  return {
    init,
    commentsElement
  }
})()

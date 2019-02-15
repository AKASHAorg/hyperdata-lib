const AKASHAComments = (function () {
  const CONF = {
    IPFSaddr: '/ip4/127.0.0.1/tcp/5001' // '/ip4/127.0.0.1/tcp/8080'
  }

  // main reference item for the thread
  const mainRef = 'https://twitter.com/AkashaProject/status/1085598391827120130'

  // list of external dependencies
  const DEPS = [
    'dist/Hyperdata.js',
    'https://unpkg.com/3box/dist/3box.min.js'
  ]

  // emulate indexing service for all comments
  const index = [
    'https://deiu.github.io/cdn/comment-ab019f3.jsonld',
    'ipfs://QmbYxRia33rKq2x6CLGprEBnRmb6aXGcDNfb34yDSur6Nz',
    'ipfs://QmaR8fvCPZVLMpPspEXnNLa4brMbr2ELuBtG9sxrpYPEpC'
  ]

  // default element where we list comments
  let commentsElement
  let comments = []
  let web3js

  const initLayout = function (divID) {
    const main = document.getElementById(divID)

    // add style
    let style = document.createElement('style')
    style.innerHTML =
      `
      textarea {
        border: 1px solid black;
        min-width: 400px;
        min-height: 200px;
        margin-bottom: 10px;
      }
      .verified {
        color: green;
      }
      .comments-avatar {
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
        overflow: auto;
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
      .new-comment {
        margin: 20px 0 20px 0;
        might-height: 100px;
      }
      .new-button {
        background-color: #fff;
        color: #000;
        letter-spacing: 0.05em;
        text-transform: uppercase;
        font-size: 100%;
        padding: 0.5em 1em;
        text-decoration: none;
        border: 1px solid #777;
        border-radius: 2px;
        margin-right: 5px;
        cursor: pointer;
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

    // create button
    const newButton = document.createElement('button')
    newButton.innerHTML = 'New comment'
    newButton.classList.add('new-button')
    newButton.addEventListener('click', function () {
      showDialog(newButton)
    })
    main.appendChild(newButton)

    // create element to store comments
    commentsElement = document.createElement('div')
    commentsElement.id = 'AKASHAComments'

    main.appendChild(commentsElement)
  }

  const showDialog = function (btn, ref, isReply) {
    const comment = document.createElement('div')
    comment.classList.add('new-comment')
    const textbox = document.createElement('textarea')
    comment.appendChild(textbox)
    comment.appendChild(document.createElement('br'))
    const submitBtn = document.createElement('button')
    submitBtn.innerHTML = 'Submit'
    submitBtn.classList.add('new-button')
    comment.appendChild(submitBtn)

    const cancelBtn = document.createElement('button')
    cancelBtn.innerHTML = 'Cancel'
    cancelBtn.classList.add('new-button')
    cancelBtn.addEventListener('click', function () {
      comment.remove()
    })
    comment.appendChild(cancelBtn)

    // logic for submitting a comment
    submitBtn.addEventListener('click', function () {
      getProfileFromETH(web3js.eth.defaultAccount).then(function (profile) {
        let payload = {
          'type': (isReply) ? 'AKASHAReply' : 'AKASHAComment',
          'ref': ref || mainRef,
          'created': new Date().toISOString(),
          'author': profile.ethereum_proof.linked_did,
          'body': textbox.value
        }
        signData(JSON.stringify(payload)).then(function (signature) {
          let data = {
            '@context': [
              'https://w3id.org/identity/v1',
              'https://akasha.org/contexts/comments.jsonld'
            ],
            'payload': payload,
            'proof': {
              'type': 'web3Signature',
              'creator': profile.ethereum_proof.linked_did,
              'hashingFunction': 'SHA3',
              'signatureValue': signature
            }
          }

          // TODO write to IPFS
          window.Hyperdata.IPFS.addString(JSON.stringify(data)).then(function (res) {
            data.source = 'ipfs://' + res[0].hash
            data.verified = true // signing step succeeded (verify by default for now)
            // add comment to list
            if (profile.name) {
              data.authorName = profile.name
            }
            if (profile.image) {
              data.authorImage = 'https://ipfs.infura.io/ipfs/' + profile.image[0].contentUrl['/']
            }
            toCommentsList(data)
            // finally, remove the dialog div
            comment.remove()
          }).catch(function (err) {
            window.alert('Could not write to IPFS. Check console.')
            console.error(err)
          })
        }).catch(function (err) {
          window.alert('Could not sign data. Check console.')
          console.error(err)
        })
      }).catch(function (err) {
        window.alert(`Could not retrieve your DID. Maybe you don't have a 3box account.`)
        console.error(err)
      })
    })

    // add elements to DOM
    btn.parentNode.insertBefore(comment, btn.nextSibling)
  }

  // sign data using Metamask and ETH keys (using web3)
  const signData = function (data) {
    console.log('Signing data:', data)
    return new Promise(function (resolve, reject) {
      const hash = web3js.sha3(data)
      web3js.personal.sign(hash, web3js.eth.defaultAccount, function (err, signature) {
        if (err) {
          console.error(err)
          return reject(err)
        }
        return resolve(signature)
      })
    })
  }
  // verify signature (using web3)
  const verifySig = function (data, sig, id) {
    return new Promise(function (resolve, reject) {
      const hash = web3js.sha3(data)
      web3js.personal.ecRecover(hash, sig, function (err, result) {
        if (err) {
          return reject(err)
        }
        return (result === id) ? resolve(true) : resolve(false)
      })
    })
  }

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

    if (!data || !data.payload) {
      return
    }
    data.authorImage = data.authorImage || 'favicon.png'
    data.authorName = data.authorName || 'anonymous'

    const comment = document.createElement('div')
    comment.setAttribute('style', 'margin-top: 2em;')
    comment.id = data.source

    let verified = '<small>[not verified]</small>'
    if (data.verified) {
      verified = '<small class="verified">[verified]</small>'
    }

    let source = data.source
    if (source.indexOf('ipfs') >= 0) {
      source = 'http://127.0.0.1:8080/api/v0/cat?stream-channels=true&arg=' + source.substring(source.lastIndexOf('//') + 2, source.length)
    }

    const date = new Date(data.payload.created).toLocaleDateString() + ' at ' + new Date(data.payload.created).toLocaleTimeString()

    comment.innerHTML = `<div class="comments-user"> 
      <img class="comments-avatar" src="${data.authorImage}">
      <div class="comments-box">
        <h4 class="comments-body">${data.payload.body}</h4>
        By ${data.authorName}<br>
        <small>On ${date}</small><br>
        <small>Source: <a href="${source}">${data.source}</a></small>
        ${verified}
      </div>
    </div>`

    const parent = document.getElementById(data.payload.ref)
    if (parent && data.payload.type === 'AKASHAReply') {
      comment.setAttribute('style', 'margin-left: 2em;')
      parent.appendChild(comment)
    } else {
      commentsElement.appendChild(comment)
      // add a spacer
      commentsElement.appendChild(document.createElement('br'))
    }

    // reply button
    const btn = document.createElement('button')
    btn.innerHTML = 'Reply'
    btn.classList.add('new-button')
    btn.addEventListener('click', function () {
      showDialog(btn, data.source, true)
    })
    comment.appendChild(btn)
  }

  const toCommentsList = function (data) {
    comments.push(data)
    comments.sort(function (a, b) {
      return new Date(a.payload.created) - new Date(b.payload.created)
    })
    // clear list
    commentsElement.innerHTML = ''

    comments.forEach(function (comment) {
      listItem(comment)
    })
  }

  const getProfileFromETH = function (addr) {
    return new Promise(function (resolve, reject) {
      window.Box.getProfile(addr).then(profile => {
        profile.key = addr
        return resolve(profile)
      }).catch(function (err) {
        return reject(err)
      })
    })
  }

  const getProfileFromDID = function (did) {
    return new Promise(function (resolve, reject) {
      if (!did || did.indexOf('did:muport') < 0) {
        return reject(new Error('Not a muport DID:', did))
      }
      const CID = did.substring(did.lastIndexOf(':') + 1, did.length)
      window.Hyperdata.Fetch('ipfs://' + CID).then(function (data) {
        if (data && data.managementKey) {
          window.Box.getProfile(data.managementKey).then(function (profile) {
            profile.key = data.managementKey
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
    // set up the DOM for comments
    initLayout(divID)
    // init Metamask
    window.addEventListener('load', function () {
      // Checking if Web3 has been injected by the browser (Mist/MetaMask)
      if (typeof web3 !== 'undefined') {
        // Use Mist/MetaMask's provider
        web3js = new window.Web3(window.web3.currentProvider)
      } else {
        console.log('You need Metamask to use this app in write mode!')
      }
      // Now you can start your app & access web3 freely:
      startApp(divID, conf)
    })
  }

  const startApp = function (divID, conf) {
    conf = conf || CONF

    // Init Hyperdata
    window.Hyperdata.IPFS.init(conf.IPFSaddr)
    console.log('Using IPFS node:', conf.IPFSaddr)

    index.forEach(function (url) {
      window.Hyperdata.Fetch(url).then(function (data) {
        if (data) {
          data.source = url
          data.verified = false
          getProfileFromDID(data.payload.author).then(function (profile) {
            data.authorDID = profile.ethereum_proof.linked_did
            if (profile.name) {
              data.authorName = profile.name
            }
            if (profile.image) {
              data.authorImage = 'https://ipfs.infura.io/ipfs/' + profile.image[0].contentUrl['/']
            }
            if (profile.key) {
              // verify signature if key is present
              verifySig(JSON.stringify(data.payload), data.proof.signatureValue, profile.key).then(function (ok) {
                if (ok) {
                  data.verified = true
                }
                toCommentsList(data)
              }).catch(function (err) {
                console.log(err)
                toCommentsList(data)
              })
            } else {
              toCommentsList(data)
            }
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
    signData,
    verifySig
  }
})()

/* eslint-disable promise/no-nesting */
const functions = require('firebase-functions');
const admin = require("firebase-admin");
const Email = require('email-templates');
const algoliasearch = require('algoliasearch');

admin.initializeApp();

const fs=require('fs'); 
const nodemailer = require('nodemailer');
const ALGOLIA_ID = functions.config().algolia.app_id
const ALGOLIA_ADMIN_KEY = functions.config().algolia.api_key
const client = algoliasearch(ALGOLIA_ID, ALGOLIA_ADMIN_KEY)
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions


const mailTransport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: functions.config().mail.email,
    pass: functions.config().mail.password,
  }
})

exports.sendWelcomeEmail = functions.auth.user().onCreate((user) => {
  const recipientEmail = user.email;
  const email = new Email({
    message: {
      from: functions.config().mail.email,
    },
    send: true,
    transport: mailTransport,
  });
  email.send({
    template: "welcome",
    message: {
      to: recipientEmail,
    },
    locals: {
      name: user.displayName,
      baseUrl: functions.config().app.url,
    }
  }).catch(console.error)
  
  return null;
})

exports.createUserSettings = functions.auth.user().onCreate((user) => {
  if (user.displayName) {
    return admin.firestore().collection('users/').doc(user.uid).set({
      isNewsletterSubscribe: true,
      isModerator: false,
      email: user.email,
      name: user.displayName,
    });
  } else {
    return admin.firestore().collection('users/').doc(user.uid).set({
      isNewsletterSubscribe: true,
      isModerator: false,
      email: user.email,
    }, { merge: true });
  }
  
})

exports.invite = functions.https.onCall(async (data, context) => {
  if (!context.auth.uid) {
    throw new functions.https.HttpsError("permission-denied", `Only authenticated users can send invite`)
  }
  await admin.firestore().collection('users').doc(context.auth.uid).get()
  .then(snapshot => {
    if (!snapshot.data().isModerator) throw new functions.https.HttpsError("permission-denied", `Only moderators can invite`)
    return
  }).catch(err => {throw err})

  admin.firestore().collection('meta').doc('invite').update({
    emails: admin.firestore.FieldValue.arrayUnion(data.email)
  })

  const email = new Email({
    message: {
      from: functions.config().mail.email,
    },
    send: true,
    transport: mailTransport,
  });
  email.send({
    template: "invite",
    message: {
      to: data.email,
    },
    locals: {
      email: data.email,
      baseUrl: functions.config().app.url,
      supportEmail: functions.config().mail.email,
    }
  }).catch(console.error)
})

const sendMailinglistEmail = async (data, context) => {
  if (!context.auth.uid) {
    throw new functions.https.HttpsError("permission-denied", `Only authenticated users can send a mailing list email`)
  }
  await admin.firestore().collection('users').doc(context.auth.uid).get()
  .then(snapshot => {
    if (!snapshot.data().isModerator) throw new functions.https.HttpsError("permission-denied", `Only moderators can send a mailing list email`)
    return
  }).catch(err => {throw err})

  var content, title;
  try {
    content = data.content;
    title = data.title;
  } catch (e) {
    throw new functions.https.HttpsError("invalid-argument", `Must supply content and title as arguments`)
  }
  
  const recipientEmails = await admin.firestore().collection('users').where('isNewsletterSubscribe', '==', true).get()
    .then((snapshot) => {
      const recipientEmails = snapshot.docs.map(doc => doc.data().email)
      return recipientEmails
    })

  const email = new Email({
    message: {
      from: functions.config().mail.email,
    },
    send: true,
    transport: mailTransport,
  });
  email.send({
    template: "newsletter",
    message: {
      bcc: recipientEmails,
    },
    locals: {
      content: content,
      title: title,
      baseUrl: functions.config().app.url,
    }
  }).catch(console.error)

  return null;
}

exports.sendMailinglistEmail = functions.https.onCall(sendMailinglistEmail)

exports.publish = functions.https.onCall(async (data, context) => {
  if (!context.auth.uid) {
    throw new functions.https.HttpsError("permission-denied", `Only authenticated users can send a mailing list email`)
  }
  await admin.firestore().collection('users').doc(context.auth.uid).get()
  .then(snapshot => {
    if (!snapshot.data().isModerator) throw new functions.https.HttpsError("permission-denied", `Only moderators can send a mailing list email`)
    return
  }).catch(err => {throw err})

  const current = await admin.firestore().collection('publications').where('status', '==', 'current').get()
    .then(snapshot => {
      if (snapshot.size !== 1) {
        throw new Error(`Error with publications: more more than one current publication`)
      }
      return snapshot.docs[0]
    })

  const pending = await admin.firestore().collection('publications').where('status', '==', 'pending').get()
    .then(snapshot => {
      if (snapshot.size !== 1) {
        throw new Error(`Error with publications: more more than one pending publication`)
      }
      return snapshot.docs[0]
    })

  const pendingQuoteIDs = await admin.firestore().collection('quotes').where('inPublication', '==', false).get()
    .then(snapshot => snapshot.docs.map(doc => doc.id))
  admin.firestore().collection('publications').add({
    datePublished: null,
    quotes: pendingQuoteIDs.map(id => admin.firestore().collection('quotes').doc(id)),
    status: 'pending',
    voters: [],
    email: null,
  })

  pendingQuoteIDs.forEach(id => {
    admin.firestore().collection('quotes').doc(id).update({
      inPublication: true,
    })
  })

  await sendMailinglistEmail({
    content: data.content,
    title: data.title,
  }, context)
  admin.firestore().collection('emails').add({
    content: data.content,
    title: data.title,
    date: admin.firestore.FieldValue.serverTimestamp(),
  }).then((emailRef) => {
    const currentRef = admin.firestore().collection('publications').doc(current.id)
    const pendingRef = admin.firestore().collection('publications').doc(pending.id)
    currentRef.update({
      status: 'archived',
      email: emailRef,
    }).then(() => {
      currentRef.get().then(snap => {
        const publication = snap.data()
        var promises = publication.quotes.map((quote, index) => {
          const promise = quote.get().then((ret) => {
            publication.quotes[index] = Object.assign(ret.data(), {
              id: ret.id
            })
            return
          })
          return promise
        })
    
        if (publication.email !== null) {
          const promise = publication.email.get().then((ret) => {
            publication.email = Object.assign(ret.data(), {
              id: ret.id
            })
            return
          })
          promises.push(promise)
        }
        Promise.all(promises).then(() => {
          publication.objectID = current.id
          const index = client.initIndex("publications")
          index.saveObject(publication).catch(console.error)
          return
        }).catch(err => {throw err})
        return
      }).catch(err => {throw err})
      return
    }).catch(err => {throw err})
    pendingRef.update({
      status: 'current',
      datePublished: admin.firestore.FieldValue.serverTimestamp(),
    })
    return
  }).catch(console.error)
  return null
})

exports.getQuotes = functions.https.onCall(async (data, context) => {
  const status = data.status
  if (!['current', 'pending'].includes(status)) {
    throw new functions.https.HttpsError("invalid-argument", "status must be one of current or pending")
  }
  const retData = await admin.firestore().collection('publications').where("status", "==", status)
    .get()
    .then((snapshot) => {
      if (snapshot.size !== 1) {
        throw new Error(`Error with publications: more than one ${status} publication`)
      }
      return Object.assign(snapshot.docs[0].data(), {
        id: snapshot.docs[0].id,
      })
    })

  var promises = retData.quotes.map((quote, index) => {
    const promise = quote.get().then((ret) => {
      retData.quotes[index] = Object.assign(ret.data(), {
        id: ret.id
      })
      return
    })
    return promise
  })

  if (retData.email !== null) {
    await retData.email.get().then((ret) => {
      retData.email = ret.data()
      return
    })
  }

  await Promise.all(promises)

  return retData
})

exports.getQuotesByID = functions.https.onCall(async (data, context) => {
  const ID = data.id
  if (!ID) {
    throw new functions.https.HttpsError("invalid-argument", "Must supply ID")
  }

  const docRef = admin.firestore().collection('publications').doc(ID)
  const retData = await docRef.get().then(snapshot => {
    if (snapshot.exists) {
      return snapshot.data()
    } else {
      throw new functions.https.HttpsError("invalid-argument", "ID does not exist")
    }
  }).catch( e => {
    throw e
  })
  var promises = retData.quotes.map((quote, index) => {
    const promise = quote.get().then((ret) => {
      retData.quotes[index] = Object.assign(ret.data(), {
        id: ret.id
      })
      return
    })
    return promise
  })

  if (retData.email !== null) {
    await retData.email.get().then((ret) => {
      retData.email = ret.data()
      return
    })
  }

  await Promise.all(promises)

  return retData
})

exports.vote = functions.https.onCall((data, context) => {
  if (!context.auth.uid) {
    throw new functions.https.HttpsError("permission-denied", `Only authenticated users can vote`)
  }

  const votes = data.votes
  const publicationID = data.publicationID
  const handleVote = (publication, email) => (id, index) => {
    const quoteIDs = publication.quotes.map(ref => ref.id)
    if (!quoteIDs.includes(id)) {
      throw new functions.https.HttpsError("invalid-argument", `Quote with id ${id} is not in publication ${publicationID}`)
    }
    const quoteRef = admin.firestore().collection('quotes').doc(id)

    quoteRef.update({
      votes: admin.firestore.FieldValue.arrayUnion({email, vote: index})
    })
  }

  const publicationRef = admin.firestore().collection('publications').doc(publicationID)
  const handlePublication = (email) => publicationRef.get()
    .then(doc => {
      if (!doc.exists) {
        throw new functions.https.HttpsError("invalid-argument", `Publication with id ${publicationID} does not exist`)
      }
      if (doc.data().status !== "pending") {
        throw new functions.https.HttpsError("invalid-argument", `Publication ${publicationID} is not being voted on`)
      }
      if (doc.data().voters.includes(email)) {
        throw new functions.https.HttpsError("invalid-argument", `You cannot vote twice in the same vote`)
      }

      votes.forEach(handleVote(doc.data(), email))
      return
    }).catch(console.error)
  
  const promise = admin.auth().getUser(context.auth.uid)
  .then(userRecord => {
    handlePublication(userRecord.email)
    return userRecord.email
  }).catch(err =>
    {throw err}
  )
  return promise.then((email) => {
    publicationRef.update({
      voters: admin.firestore.FieldValue.arrayUnion(email),
    })
    return
  }).catch(err => 
    { throw err;}  
  )
})

exports.changeVote = functions.https.onCall((data, context) => {
  if (!context.auth.uid) {
    throw new functions.https.HttpsError("permission-denied", `Only authenticated users can change vote`)
  }

  const votes = data.votes
  const publicationID = data.publicationID
  const handleVote = (publication, email) => (id, index) => {
    const quoteIDs = publication.quotes.map(ref => ref.id)
    if (!quoteIDs.includes(id)) {
      throw new functions.https.HttpsError("invalid-argument", `Quote with id ${id} is not in publication ${publicationID}`)
    }
    const quoteRef = admin.firestore().collection('quotes').doc(id)
    quoteRef.get().then(doc => {
      const votes = doc.data().votes.filter((vote) => vote.email !== email)
      quoteRef.update({
        votes: votes.concat([{email, vote: index}])
      })
      return
    }).catch(console.error)
    return
  }

  const publicationRef = admin.firestore().collection('publications').doc(publicationID)
  const handlePublication = (email) => publicationRef.get()
    .then(doc => {
      if (!doc.exists) {
        throw new functions.https.HttpsError("invalid-argument", `Publication with id ${publicationID} does not exist`)
      }
      if (doc.data().status !== "pending") {
        throw new functions.https.HttpsError("invalid-argument", `Publication ${publicationID} is not being voted on`)
      }

      votes.forEach(handleVote(doc.data(), email))
      return
    }).catch(console.error)
  
  return admin.auth().getUser(context.auth.uid)
  .then(userRecord => {
    handlePublication(userRecord.email)
    return userRecord.email
  }).catch(console.error)
})

exports.getQuotesOfEmail = functions.https.onCall((data, context) => {
  let email = null
  try {
    email = data.email.split("@")[0]
  } catch (e) {
    throw e
  }
  return admin.firestore().collection('quotes').get().then((docs) => {
    return docs.docs.filter(doc => {
      const people = doc.data().quote.people.map(person => person.email)
      return people.includes(email) && doc.data().inPublication
    })
  }).catch(e => {throw e})
})
/*
const runtimeOpts = {
  timeoutSeconds: 300,
  memory: '1GB'
}

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

exports.importToAlgolia = functions.runWith(runtimeOpts).https.onRequest(async (data, context) => {
  const docs = await admin.firestore().collection("publications").where("status", "==", "archived").get()
  var arr = []
  const docsPromises = docs.docs.map(doc => {
    console.log(doc.id)
    var publication = doc.data()
    var promises = publication.quotes.map((quote, index) => {
      const promise = quote.get().then((ret) => {
        publication.quotes[index] = Object.assign(ret.data(), {
          id: ret.id
        })
        return
      })
      return promise
    })

    if (publication.email !== null) {
      const promise = publication.email.get().then((ret) => {
        publication.email = Object.assign(ret.data(), {
          id: ret.id
        })
      })
      promises.push(promise)
    }
    return Promise.all(promises).then(() => {
      publication.objectID = doc.id
      arr.push(publication)
      return
    })
  })
  return Promise.all(docsPromises).then(() => {
    const index = client.initIndex("publications")
    console.log("Sending")
    index.saveObjects(arr).catch(console.error)
    return
  }).catch(console.error)
})


exports.oneOff = functions.runWith(runtimeOpts).https.onRequest(async (data, context) => {
  const readData = fs.readFileSync('quotes.json', 'utf-8')
  const json = JSON.parse(readData)
  const promises = json.map(({body, date, title}) => {
    console.log(title)
    return admin.firestore().collection("publications").where('datePublished', '==', new Date(date)).get().then((snap) => {
      const index = client.initIndex("publications")
      console.log(snap.size)
      index.deleteObject(snap.docs[0].id).catch(console.error)
      const publication = snap.docs[0].data()
      return publication.email.get().then((ret) => {
        publication.email = Object.assign(ret.data(), {
          id: ret.id
        })
        publication.objectID = snap.docs[0].id
        return
      }).then(() => {
        index.saveObject(publication)
        return
      }).catch(e => {throw e})
      
    }).catch(e => {
      throw e
    })
  })
  await Promise.all(promises)
  return
})
*/
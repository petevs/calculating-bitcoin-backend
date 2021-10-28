import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
// import moment from 'moment'


const db = admin.firestore()

export const createUserDoc = functions.auth.user().onCreate((user) => {
    db.collection('users').doc(user.uid).set({
        exists: true
    })
})

// export const gameCount = functions.firestore
//     .document('games/{gameId}')
//     .onCreate(async (snapshot, context) => {
//         const data = snapshot.data()

//         const userRef = db.doc(`users/${data.uid}`)

//         const userSnap = await userRef.get()
//         const userData = userSnap.data()

//         return userRef.update({
//             gameCount: userData.gameCount + 1
//         })


//     })

// export const updateTransactions = functions.firestore
//     .document('users/{docId}')
//     .onUpdate(async (snapshot, context) => {

//         const after = snapshot.after.data()

//         after[]

//         const transactionRef = db.collection('transactions').doc(`${after.docId}`)

//         // const transactionSnap = await transactionRef.get()
//         // const transactionData = transactionSnap.data()

//         return transactionRef.set({
//             hi: 'hello'
//         })

//     })
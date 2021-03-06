import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
// import moment from 'moment'


const db = admin.firestore()

export const createUserDoc = functions.auth.user().onCreate((user) => {
    db.collection('users').doc(user.uid).set({
        account: {
            uid: user.uid,
            email: user.email,
            displayName: '',
            currency: 'usd',
            avatarURL: ''
        },
    })
})

export const updatePublic = functions.firestore
    .document('portfolios/{docId}')
    .onUpdate(async (snapshot, context) => {
        const before = snapshot.before.data()
        const after = snapshot.after.data()

        for (const portfolioId in after) {

            if(portfolioId in before){
                const beforeVisibility = before[portfolioId].visibility
                const afterVisibility = after[portfolioId].visibility

                if(beforeVisibility === 'private' && afterVisibility === 'public'){
                    db.collection('portfolios').doc('public').update({
                        [portfolioId]: {...after[portfolioId]}
                    })
                }

                if(beforeVisibility === 'public' && afterVisibility === 'private') {
                    db.collection('portfolios').doc('public').update({
                        [portfolioId]: admin.firestore.FieldValue.delete()
                    })
                }
            }

        }


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
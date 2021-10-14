import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import axios from 'axios'

admin.initializeApp()

const db = admin.firestore()

export const updateMarketData = functions
    .runWith({ memory: '1GB', timeoutSeconds: 300})
    .pubsub.schedule('*/5 * * * *').onRun( async (context) => {

        const { data } = await axios.get('https://api.coingecko.com/api/v3/coins/bitcoin?localization=cad')

        db.collection('marketData').doc('data').set({data})

    })
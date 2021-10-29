import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import axios from 'axios'
import * as moment from 'moment'

admin.initializeApp()

const db = admin.firestore()

export const updateMarketData = functions
    .runWith({ memory: '1GB', timeoutSeconds: 300})
    .pubsub.schedule('*/5 * * * *').onRun( async (context) => {

        let result: any

        const { data } = await axios.get('https://api.coingecko.com/api/v3/coins/bitcoin?localization=cad')
        
        result = data

        db.collection('marketData').doc('data').set({...result.market_data})

    })

export const updateHistoricalData = functions
    .runWith({ memory: '1GB', timeoutSeconds: 300})
    .pubsub.schedule('0 * * * *').onRun( async (context) => {


        const getHistorical = async (currency) => {

            let result: any
    
            const { data } = await axios.get(`https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=${currency}&days=3650&interval=daily`)
    
            result = data
    
            let historical = {}
    
            await result.prices.forEach( item => {
    
                const friendlyDate:any = moment(item[0]).format('YYYY-MM-DD')
    
                historical = {
                    ...historical,
                    [friendlyDate]: item[1]
                }
            })
    
            db.collection('historicalData').doc(currency).set(historical)
        }


        const currencies = ['cad', 'usd']

        currencies.forEach(curr => getHistorical(curr))

    })
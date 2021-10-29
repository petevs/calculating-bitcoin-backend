import * as moment from 'moment'
import axios from 'axios'

const getDaysBetween = (start, end) => {
    const startDate = moment(start)
    let endDate = moment()

    return endDate.diff(startDate, 'days')

}

const getPrices = async (currency, days) => {

    //Get price data from coingecko
    const { data } = await axios.get(`https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=${currency}&days=${days}&interval=daily`)
    const prices: any = data

    let results = {}

    //make object of [date]: price for easier access
    prices.prices.forEach(item => {

        const friendlyDate = moment(item[0]).format('YYYY-MM-DD')
        const price = item [1]

        results = {
            ...results,
            [friendlyDate]: price
        }
    })

    return results
    
}

const getDates = (start, end, frequency ) => {
    let dateList = []
    let current: any = moment(start)
    const stopDate = moment().format('YYYY-MM-DD')
    let newFrequency: any = 1

    switch(newFrequency) {
        case 'daily':
            newFrequency = 1
            break 
        case 'weekly':
            newFrequency = 7
            break
        case 'monthly':
            newFrequency = 30
            break
    }
    
    while(current.isSameOrBefore(stopDate)){
        dateList.push(current.format('YYYY-MM-DD'))
        current.add(newFrequency, 'days')
    }

    return dateList

}



export const calculateDCA = async (details) => {

    const dates = getDates(details.startDate, details.endDate, details.frequency)
    const days = getDaysBetween(details.startDate, details.endDate)
    const prices = await getPrices(details.currency, days + 1)

    // return {
    //     dates: dates,
    //     days: days,
    //     prices: prices
    // }

    let runningBal = 0
    let totalInvested = 0
    let averageCost = 0
    let value = 0
    let gainLoss = 0

    const transactions = dates.map(item => {
        const date = item
        const price = prices[date]
        const dollarsSpent = details.dollarAmount
        totalInvested = totalInvested + dollarsSpent
        const bitcoinAdded = details.dollarAmount / price
        runningBal = runningBal + bitcoinAdded
        averageCost = totalInvested / runningBal
        value = runningBal * price
        gainLoss = value - totalInvested


        return {
            date: date,
            price: price,
            dollarsSpent: dollarsSpent,
            totalInvested: totalInvested,
            bitcoinAdded: bitcoinAdded,
            runningBal: runningBal,
            averageCost: averageCost,
            value: value,
            gainLoss: gainLoss
        }
    })

    return transactions
}
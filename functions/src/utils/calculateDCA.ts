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
    let dateObj = {}
    let current: any = moment(start)
    let stopDate = moment().format('YYYY-MM-DD')
    const today = moment().format('YYYY-MM-DD')
    if(end){
        stopDate = moment(end).format('YYYY-MM-DD')
    }
    let newFrequency: any = 1

    switch(frequency) {
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

    //Set count to frequency so buy the first day
    let count = newFrequency - 1
    
    while(current.isSameOrBefore(today)){

        count = count + 1
        let action = false

        if(count === newFrequency){
            action = true
            count = 0
        }

        if(current.isSameOrAfter(stopDate)){
            action = false
        }

        dateObj = {
            ...dateObj,
            [current.format('YYYY-MM-DD')]: action
        }

        current.add(1, 'days')
    }

    return dateObj

}


const getCurrentPrice = async (currency) => {
    const { data } = await axios.get(`https://api.coingecko.com/api/v3/coins/bitcoin?localization=${currency}`)
        
    const result: any = data

    return result.market_data.current_price[currency]
}


const getSummary = (list, price) => {
    const lastIndex = list.length - 1
    const lastTransaction = list[lastIndex]

    const currentValue = lastTransaction.runningBal * price
    const totalInvested = lastTransaction.totalInvested
    const gainLoss = currentValue - totalInvested
    const roi = gainLoss / totalInvested * 100

    const summary = {
        currentPrice: price,
        totalInvested: totalInvested,
        bitcoinHoldings: lastTransaction.runningBal,
        averageCost: lastTransaction.averageCost,
        currentValue: currentValue,
        gainLoss: gainLoss,
        roi: roi
    }

    return summary
}

export const calculateDCA = async (details) => {

    const dates = getDates(details.startDate, details.endDate, details.frequency)
    const days = getDaysBetween(details.startDate, details.endDate)
    const prices = await getPrices(details.currency, days + 1)

    let runningBal = 0
    let totalInvested = 0
    let averageCost = 0
    let value = 0
    let gainLoss = 0

    // const lastDate = dates.length - 1
    const currentPrice = await getCurrentPrice(details.currency)

    const dailyTotals = []
    const transactions = []

    for (const key in dates) {
        const date = key
        const price = prices[date]
        let dollarsSpent = 0
        let bitcoinAdded = 0

        if(dates[key]){
           dollarsSpent = details.dollarAmount
           bitcoinAdded = details.dollarAmount / price
        }

        totalInvested = totalInvested + dollarsSpent
        runningBal = runningBal + bitcoinAdded
        averageCost = totalInvested / runningBal
        value = runningBal * price
        gainLoss = value - totalInvested

        const transaction = {
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

        dailyTotals.push(transaction)

        if(dates[key]){
            transactions.push(transaction)
        }
    }


    return {
        summary: {
            ...getSummary(transactions, currentPrice),
            totalTransactions: transactions.length
        },
        transactions: transactions,
        dailyTotals: dailyTotals
    }

}
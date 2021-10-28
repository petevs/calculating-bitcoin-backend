import * as moment from 'moment'
import axios from 'axios'

const getDaysBetween = (start, end) => {
    const startDate = moment(start)
    let endDate = moment()
    
    if(end) {
        endDate = moment(end)
    }

    return startDate.diff(endDate, 'days')
}



export const calculateDCA = async (details) => {

    let dateList = []
    
    let current = moment(details.startDate)
    const stopDate = moment().format('YYYY-MM-DD')
    let frequency = 1


    const daysBetween = getDaysBetween(details.startDate, details.endDate)

    const { data } = await axios.get(`https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=${details.currency}&days=${daysBetween}&interval=daily`)

    const prices: any = data

    switch(details.frequency) {
        case 'daily':
            frequency = 1
            break 
        case 'weekly':
            frequency = 7
            break
        case 'monthly':
            frequency = 30
            break
    }


    while(current.isSameOrBefore(stopDate)){
        dateList.push(current.format('YYYY-MM-DD'))
        current.add(frequency, 'days')
    }

    return {
        dateList: dateList,
        prices: prices
    }
}
import * as functions from 'firebase-functions'
import * as express from 'express'
import * as cors from 'cors'
// import * as admin from 'firebase-admin'
// admin.initializeApp()
import { calculateDCA } from './utils/calculateDCA'

const app = express()

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cors({ origin: true }))

app.get('/cat', (req, res) => {

    res.send('HI CAT')
})
app.get('/dog', (req, res) => {
    res.send('DOG')
})

app.post('/dca', async (req, res, next) => {

    try {
        const result = await calculateDCA(req.body)
        res.status(201).json(result)
    }

    catch(err) {
        next(err)
    }

})

export const api = functions.https.onRequest(app)

const cors = require('cors')
const express = require('express')
const app = express()
const morgan = require('morgan')
const Vendor = require('./src/vendor.controller.js')

// Configuraciones
app.set('port', process.env.PORT || 3000)
app.set('json spaces', 2)

// Middleware
app.use(morgan('dev'))
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

app.use(cors())

// Routes
app.get('/', (req, res) => res.status(200).send('Hello'))
app.get('/best-buy/:product', Vendor.getBestBuy)
app.get('/amazon/:product', Vendor.getAmazon)

// Iniciando el servidor
app.listen(app.get('port'), () => {
  console.log(`Server listening on port ${app.get('port')}`)
})

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
app.get('/gearbest/:product', Vendor.getGearbest)
app.get('/aliexpress/:product', Vendor.getAliexpress)

app.get('/zona-digital/:product', Vendor.getZonaDigital)
app.get('/electronica-japonesa/:product', Vendor.getElectronicaJaponesa)
app.get('/office-depto/:product', Vendor.getOfficeDepot)

// Iniciando el servidor
app.listen(app.get('port'), () => {
  console.log(`Server listening on port ${app.get('port')}`)
})

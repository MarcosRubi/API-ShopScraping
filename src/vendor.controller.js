const jsdom = require('jsdom')
const chrome = require('chrome-aws-lambda')
let puppeteer

process.env.AWS_LAMBDA_FUNCTION_VERSION
  ? (puppeteer = require('puppeteer-core'))
  : (puppeteer = require('puppeteer'))

const Vendor = {
  getBestBuy: (req, res) => {
    (async () => {
      let options = { headless: false }
      if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
        options = {
          args: [...chrome.args, '--hide-scrollbars', '--disable-web-security'],
          defaultViewport: chrome.defaultViewport,
          executablePath: await chrome.executablePath,
          headless: true,
          ignoreHTTPSErrors: true
        }
      }
      try {
        // Abrimos una instancia del puppeteer y accedemos a la url
        // const browser = await puppeteer.launch({ headless: false })
        const browser = await puppeteer.launch(options)
        const page = await browser.newPage()
        const response = await page.goto(
          `https://www.bestbuy.com/site/searchpage.jsp?st=${req.params.product}&intl=nosplash`
        )
        const body = await response.text()

        // Creamos una instancia del resultado devuelto por puppeter para parsearlo con jsdom
        const {
          window: { document }
        } = new jsdom.JSDOM(body)

        // Validamos si encontro resultados
        const products = document.querySelectorAll(
          '.sku-item-list li.sku-item'
        )
        if (products === null) {
          res.status(200).json({ bestBuy: 'null' })
          return
        }

        const results = []

        products.forEach((product, index) => {
          const name = product.querySelector('h4.sku-title a').textContent
          const model = product.querySelector('span.sku-value').textContent
          const price = product.querySelector(
            '.priceView-customer-price span'
          ).textContent
          const url = `https://www.bestbuy.com${
            product.querySelector('.image-link').href
          }`

          results.push({ name, model, price, url })
        })

        res.setHeader('Access-Control-Allow-Credentials', true)
        res.setHeader('Access-Control-Allow-Origin', '*')
        res.setHeader(
          'Access-Control-Allow-Methods',
          'GET,OPTIONS,PATCH,DELETE,POST,PUT'
        )
        res.setHeader(
          'Access-Control-Allow-Headers',
          'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
        )
        res.status(200).json(results)

        // Cerramos el puppeteer
        await page.close()
        await browser.close()
      } catch (error) {
        console.error(error)
      }
    })()
  },

  getAmazon: (req, res) => {
    (async () => {
      let options = { headless: false }
      if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
        options = {
          args: [...chrome.args, '--hide-scrollbars', '--disable-web-security'],
          defaultViewport: chrome.defaultViewport,
          executablePath: await chrome.executablePath,
          headless: true,
          ignoreHTTPSErrors: true
        }
      }
      try {
        // Abrimos una instancia del puppeteer y accedemos a la url
        // const browser = await puppeteer.launch({ headless: false })
        const browser = await puppeteer.launch(options)
        const page = await browser.newPage()
        const response = await page.goto(
          `https://www.amazon.com/s?k=${req.params.product}`
        )
        const body = await response.text()

        // Creamos una instancia del resultado devuelto por puppeter para parsearlo con jsdom
        const {
          window: { document }
        } = new jsdom.JSDOM(body)

        // Validamos si encontro resultados
        const products = document.querySelectorAll(
          '[data-component-type=s-search-results] .s-card-container'
        )
        if (products === null) {
          res.status(200).json({ amazon: 'null' })
          return
        }

        const results = []

        products.forEach((product, index) => {
          const name = product.querySelector('h2').textContent
          const model = ''
          const price = product.querySelector('.a-offscreen')?.textContent
          const url = `http://amazon.com${product.querySelector('h2 a')?.href}`

          results.push({ name, model, price, url })
        })

        res.setHeader('Access-Control-Allow-Credentials', true)
        res.setHeader('Access-Control-Allow-Origin', '*')
        res.setHeader(
          'Access-Control-Allow-Methods',
          'GET,OPTIONS,PATCH,DELETE,POST,PUT'
        )
        res.setHeader(
          'Access-Control-Allow-Headers',
          'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
        )
        res.status(200).json(results)

        // Cerramos el puppeteer
        await page.close()
        await browser.close()
      } catch (error) {
        console.error(error)
      }
    })()
  }
}

module.exports = Vendor

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

        getHeaders(res)
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

        getHeaders(res)
        res.status(200).json(results)

        // Cerramos el puppeteer
        await page.close()
        await browser.close()
      } catch (error) {
        console.error(error)
      }
    })()
  },

  getGearbest: (req, res) => {
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
        const browser = await puppeteer.launch(options)
        const page = await browser.newPage()
        const response = await page.goto(
          `https://www.gearbest.com/search/?Keyword=${req.params.product}`
        )
        const body = await response.text()

        // Creamos una instancia del resultado devuelto por puppeter para parsearlo con jsdom
        const {
          window: { document }
        } = new jsdom.JSDOM(body)

        // Validamos si encontro resultados
        const products = document.querySelectorAll('.list_products_box .list_products_item')
        if (products.length === 0) {
          res.status(200).json({ gearbest: 'null' })
          return
        }

        const results = []

        products.forEach((product, index) => {
          const name = product.querySelector('a').title
          const model = ''
          const price = product.querySelector('.a-offscreen')?.textContent
          const url = `https://www.gearbest.com${product.querySelector('a')?.href}`

          results.push({ name, model, price, url })
        })

        getHeaders(res)
        res.status(200).json(results)

        // Cerramos el puppeteer
        await page.close()
        await browser.close()
      } catch (error) {
        console.error(error)
      }
    })()
  },

  getAliexpress: (req, res) => {
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
        const browser = await puppeteer.launch(options)
        const page = await browser.newPage()
        const response = await page.goto(
          `https://www.aliexpress.com/af/${req.params.product.split(' ').join('-')}.html`
        )
        const body = await response.text()

        // Creamos una instancia del resultado devuelto por puppeter para parsearlo con jsdom
        const {
          window: { document }
        } = new jsdom.JSDOM(body)

        // Validamos si encontro resultados
        const products = document.querySelectorAll('.list--gallery--34TropR > a')
        if (products.length === 0) {
          res.status(200).json({ aliexpress: 'null' })
          return
        }

        const results = []

        products.forEach((product, index) => {
          const CONVERTTOUSD = 0.114286
          const name = product.querySelector('h1.manhattan--titleText--WccSjUS').textContent
          const model = ''
          const priceArr = product.querySelectorAll('.manhattan--price-sale--1CCSZfK span')
          let price = ''
          priceArr.forEach((item, index) => {
            if (index !== 0) {
              price += item.textContent
            }
          })
          price = `$${(parseFloat(price) * CONVERTTOUSD).toFixed(2)}`
          const url = `https:${product.href}`

          results.push({ name, model, price, url })
        })

        getHeaders(res)
        res.status(200).json(results)

        // Cerramos el puppeteer
        await page.close()
        await browser.close()
      } catch (error) {
        console.error(error)
      }
    })()
  },

  getZonaDigital: (req, res) => {
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
        const browser = await puppeteer.launch(options)
        const page = await browser.newPage()
        const response = await page.goto(
          `https://www.zonadigitalsv.com/search?term=${req.params.product.split(' ').join('+')}&cat=all`
        )
        const body = await response.text()

        // Creamos una instancia del resultado devuelto por puppeter para parsearlo con jsdom
        const {
          window: { document }
        } = new jsdom.JSDOM(body)

        // Validamos si encontro resultados
        const products = document.querySelectorAll('#product-list .product-card')
        if (products.length === 0) {
          res.status(200).json({ zonaDigital: 'null' })
          return
        }

        const results = []

        products.forEach((product, index) => {
          const name = product.querySelector('h3 a').textContent
          const model = ''
          const price = product.querySelector('span.text-primary').textContent
          const url = `${product.querySelector('h3 a').href}`

          results.push({ name, model, price, url })
        })

        getHeaders(res)
        res.status(200).json(results)

        // Cerramos el puppeteer
        await page.close()
        await browser.close()
      } catch (error) {
        console.error(error)
      }
    })()
  },

  getElectronicaJaponesa: (req, res) => {
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
        const browser = await puppeteer.launch(options)
        const page = await browser.newPage()
        const response = await page.goto(
          `https://www.electronicajaponesa.com/?s=${req.params.product.split(' ').join('+')}&product_cat=0&post_type=product`
        )
        const body = await response.text()

        // Creamos una instancia del resultado devuelto por puppeter para parsearlo con jsdom
        const {
          window: { document }
        } = new jsdom.JSDOM(body)

        // Validamos si encontro resultados
        const products = document.querySelectorAll('ul.products li')
        if (products.length === 0) {
          res.status(200).json({ electronicaJaponesa: 'null' })
          return
        }

        const results = []

        products.forEach((product, index) => {
          const name = product.querySelector('h2.woocommerce-loop-product__title').textContent
          const model = ''
          const price = product.querySelector('span.woocommerce-Price-amount').textContent
          const url = product.querySelector('a.woocommerce-LoopProduct-link.woocommerce-loop-product__link').href

          results.push({ name, model, price, url })
        })

        getHeaders(res)
        res.status(200).json(results)

        // Cerramos el puppeteer
        await page.close()
        await browser.close()
      } catch (error) {
        console.error(error)
      }
    })()
  },

  getOfficeDepot: (req, res) => {
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
        const browser = await puppeteer.launch(options)
        const page = await browser.newPage()
        const response = await page.goto(
          `https://www.officedepot.com.sv/officedepotSV/en/search/?text=${req.params.product.split(' ').join('+')}`
        )
        const body = await response.text()

        // Creamos una instancia del resultado devuelto por puppeter para parsearlo con jsdom
        const {
          window: { document }
        } = new jsdom.JSDOM(body)

        // Validamos si encontro resultados
        const products = document.querySelectorAll('.product__switch_view.product__listing .product-item')
        if (products.length === 0) {
          res.status(200).json({ officeDepto: 'null' })
          return
        }

        const results = []

        products.forEach((product, index) => {
          const name = product.querySelector('.name h2').textContent.trim()
          const model = ''
          const price = product.querySelector('.prices-container').textContent.trim()
          const url = `https://www.officedepot.com.sv${product.querySelector('a.product-description').href}`

          results.push({ name, model, price, url })
        })

        getHeaders(res)
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

const getHeaders = (res) => {
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
}

module.exports = Vendor

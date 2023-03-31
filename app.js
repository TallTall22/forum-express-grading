const express = require('express')
const routes = require('./routes')

const exphbs = require('express-handlebars') // 引入 express-handlebars
const session = require('express-session')
const flash = require('connect-flash')
const usePassport = require('./config/passport')

const { getUser } = require('./helpers/auth-helpers')
const handlebarsHelpers = require('./helpers/handlebars-helper')

const app = express()
const port = process.env.PORT || 3000
const SESSION_SECRET = 'secret'

// 註冊 Handlebars 樣板引擎，並指定副檔名為 .hbs
app.engine('hbs', exphbs({ extname: '.hbs', helpers: handlebarsHelpers }))
// 設定使用Handlebars作為引擎樣板
app.set('view engine', 'hbs')
// set body-parser
app.use(express.urlencoded({ extended: true }))

app.use(session({ secret: SESSION_SECRET, resave: false, saveUninitialized: true }))
usePassport(app)
app.use(flash())

app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg')
  res.locals.error_msg = req.flash('error_msg')
  res.locals.user = getUser(req)
  next()
})

app.use(routes)

app.listen(port, () => {
  console.info(`Example app listening on port ${port}!`)
})

module.exports = app

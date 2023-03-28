const express = require('express')
const routes = require('./routes')

const exphbs = require('express-handlebars') // 引入 express-handlebars

const app = express()
const port = process.env.PORT || 3000
// 註冊 Handlebars 樣板引擎，並指定副檔名為 .hbs
app.engine('hbs', exphbs({ extname: '.hbs' }))
// 設定使用Handlebars作為引擎樣板
app.set('view engine', 'hbs')

app.use(routes)

app.listen(port, () => {
  console.info(`Example app listening on port ${port}!`)
})

module.exports = app

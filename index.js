const express = require('express')

const app = express()
const port = process.env.PORT || '8000'

app.use('/', require('./routes/sunrise'))

app.listen(port, () => {
  console.log(`Listening to requests on http://localhost:${port}`)
})

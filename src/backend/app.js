const express = require('express')
const shows = require('./modules/shows.js')

const app = express()
const port = 3000

app.get('/', (req, res) => {
  let showList = shows.getTvTimeData()

  showList.then(function(result) {
    console.info(result)
    res.send(result[0])
  })  
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
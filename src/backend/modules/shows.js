const config = require('../config.json');
const cheerio = require('cheerio')
const user = require('./user.js')
const httpMethods = require('./httpMethods.js')

function getShows () {
  const listShows = []
  
  return new Promise((resolve, reject) => {
    if (!user.isLogin()) {
      resolve('User no login')
      return
    }
    const userId = user.getUser()
    console.info("logged in")
    httpMethods.get(`/en/user/${userId}/profile`)
      .then(resp => {
        const bodyParse = cheerio.load(resp.body)
  
        bodyParse('ul.shows-list li.first-loaded')
          .each((index, item) => {
            const li = cheerio.load(item)
            const linkSerie = li('div.poster-details a')
            const imgSerie = li('div.image-crop img')
            listShows.push({
              id: linkSerie.attr('href').split('/')[3],
              name: linkSerie.text().trim(),
              img: imgSerie.attr('src')
            })
          })
          resolve(listShows)
  
      })
      .catch(reject)
  })
}

function getTvTimeData(){
  return new Promise((resolve, reject) => {
    user.login(config.username, config.password)
    .then(function ()
    {
      let shows = getShows()
      shows.then(function (result) {
        resolve(result)
      })
    })
  })
}

module.exports = { getShows, getTvTimeData }
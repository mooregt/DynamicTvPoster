const config = require('./config.json');
const cheerio = require('cheerio')
const express = require('express')
const fs = require('fs')
const needle = require('needle')
const path = require('path')
const user = require('./user.js')

const app = express()
const port = 3000
const urlBase = 'https://www.tvtime.com'

function get (urlPath, data) {
  const url = urlBase + urlPath
  const cookies = { cookies: user.getCookies() }

  return new Promise((resolve, reject) => {
    needle('get', url, data, cookies)
      .then(resp => {
        if (resp.cookies && resp.cookies.tvstRemember === 'deleted') {
          return user.removeAccess()
            .then(resolve)
        }

        resolve(resp)
      })
      .catch(reject)
  })
}

function post (urlPath, data) {
  const url = urlBase + urlPath
  const cookies = { cookies: user.getCookies() }

  return new Promise((resolve, reject) => {
    needle('post', url, data, cookies)
      .then(resp => {
        const cookies = resp.cookies

        if (cookies.tvstRemember) {
          user.setCookie(d => {
            resolve(d)
          }, { tvstRemember: cookies.tvstRemember, symfony: cookies.symfony })
        } else {
          resolve('')
        }
      })
      .catch(reject)
  })
}

function getShows () {
  const listShows = []
  
  return new Promise((resolve, reject) => {
    if (!user.isLogin()) {
      resolve('User no login')
      return
    }
    const userId = user.getUser()
    console.info("logged in")
    get(`/en/user/${userId}/profile`)
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

app.get('/', (req, res) => {
  let shows = getTvTimeData()

  shows.then(function(result) {
    console.info(result)
    res.send(result[0])
  })  
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
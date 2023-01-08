const config = require('./config.json');
const cheerio = require('cheerio')
const express = require('express')
const fs = require('fs')
const needle = require('needle')
const path = require('path')

const app = express()
const port = 3000
const urlBase = 'https://www.tvtime.com'

function getCookies () {
  const setting = require(path.join(__dirname, 'access.json'))
  let cookies = {}
  if (setting.tvstRemember.length > 0) {
    cookies = {
      tvstRemember: setting.tvstRemember,
      symfony: setting.symfony
    }
  }
  return cookies
}

function getUser () {
  const setting = require(path.join(__dirname, 'access.json'))
  let userId = 0
  if (setting.user > 0) {
    userId = setting.user
  }
  return userId
}

async function setCookie (callback, obj, remove = false) {
  let setting = require(path.join(__dirname, 'access.json'))
  setting = Object.assign(setting, obj)

  await fs.open(path.join(__dirname, 'access.json'), 'w', (err, d) => {
    if (err) console.error(err)

    fs.write(d, JSON.stringify(setting, null, '\t'), 0, 'utf-8', err => {
      if (err) return err

      const txt = remove ? 'Deleting credentials' : 'Storing credentials'

      callback(txt)
    })
  })
}

function setUser (callback, userId = 0) {
  setCookie(callback, { user: userId })
}

function removeAccess () {
  return new Promise((resolve, reject) => {
    setCookie(r => {
      resolve(r)
    }, { tvstRemember: '', symfony: '', user: 0 }, true)
  })
}

function isLogin () {
  if (getCookies().tvstRemember !== undefined) {
    return true
  }
  return false
}

function get (urlPath, data) {
  const url = urlBase + urlPath
  const cookies = { cookies: getCookies() }

  return new Promise((resolve, reject) => {
    needle('get', url, data, cookies)
      .then(resp => {
        if (resp.cookies && resp.cookies.tvstRemember === 'deleted') {
          return removeAccess()
            .then(resolve)
        }

        resolve(resp)
      })
      .catch(reject)
  })
}

function post (urlPath, data) {
  const url = urlBase + urlPath
  const cookies = { cookies: getCookies() }

  return new Promise((resolve, reject) => {
    needle('post', url, data, cookies)
      .then(resp => {
        const cookies = resp.cookies

        if (cookies.tvstRemember) {
          setCookie(d => {
            resolve(d)
          }, { tvstRemember: cookies.tvstRemember, symfony: cookies.symfony })
        } else {
          resolve('')
        }
      })
      .catch(reject)
  })
}

function put (urlPath, data) {
  const url = urlBase + urlPath
  const cookies = { cookies: getCookies() }

  return new Promise((resolve, reject) => {
    needle('put', url, data, cookies)
      .then(resp => {
        if (resp.cookies && resp.cookies.tvstRemember === 'deleted') {
          return removeAccess()
            .then(resolve)
            .catch(reject)
        }
        resolve(resp)
      })
      .catch(reject)
  })
}

function deleted (urlPath, data) {
  const url = urlBase + urlPath
  const cookies = { cookies: getCookies() }

  return new Promise((resolve, reject) => {
    needle('delete', url, data, cookies)
      .then(resp => {
        if (resp.cookies && resp.cookies.tvstRemember === 'deleted') {
          return removeAccess()
            .then(resolve)
            .catch(reject)
        }
        resolve(resp)
      })
      .catch(reject)
  })
}

function login (user, passw, force = false) {
    return new Promise((resolve, reject) => {
      if (isLogin() && !force) {
        resolve('User is login')
        return
      }
  
      post('/signin', {
        username: user,
        password: passw
      })
        .then(_ => {
          getUser()
        })
        .catch(reject)
    })
  }

function getShows () {
  const listShows = []
  
  return new Promise((resolve, reject) => {
    if (!isLogin()) {
      resolve('User no login')
      return
    }
    const userId = getUser()
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
    login(config.username, config.password)
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
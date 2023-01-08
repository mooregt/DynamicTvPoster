const needle = require('needle')
const user = require('./user.js')
const path = require('path')

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

function get (urlPath, data) {
  const url = urlBase + urlPath
  const cookies = { cookies: getCookies() }

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

module.exports = { getCookies, get, post }
const needle = require('needle')
const user = require('./user.js')

const urlBase = 'https://www.tvtime.com'

function get (urlPath, data) {
  const url = urlBase + urlPath
  const cookies = { cookies: user.getCookies }

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

module.exports = { get, post }
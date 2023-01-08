const fs = require('fs')
const path = require('path')

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

function getUser () {
  const setting = require(path.join(__dirname, 'access.json'))
  let userId = 0
  if (setting.user > 0) {
    userId = setting.user
  }
  return userId
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

module.exports = { getCookies, setCookie, getUser, removeAccess, isLogin, login }
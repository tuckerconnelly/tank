const CONNECTING_CHECK_INTERVAL = 10
const CONNECTION_TIMEOUT = 10000

export { default as WSRRProvider } from './WSRRProvider'

export default class WSRRClient {
  currentID = 0;
  sid = null;
  opts = {
    getSID: () => Promise.resolve(this.sid),
    setSID: sid => Promise.resolve(this.sid = sid),
  }

  constructor(ws, opts) {
    this.ws = ws
    this.opts = { ...this.opts, ...opts }
  }

  _makeSureConnected() {
    return new Promise((resolve, reject) => {
      if (this.ws.readyState === WebSocket.OPEN) return resolve()

      const timeout = setTimeout(() => {
        clearInterval(checkInterval) // eslint-disable-line no-use-before-define
        reject('WebSocket connection timed out.')
      }, CONNECTION_TIMEOUT)

      const checkInterval = setInterval(() => {
        if (this.ws.readyState !== WebSocket.OPEN) return
        clearTimeout(timeout)
        clearInterval(checkInterval)
        resolve()
      }, CONNECTING_CHECK_INTERVAL)
    })
  }

  _makeSureSIDExists() {
    if (this.sid) return Promise.resolve()

    return this.opts.getSID()
      .then(sid => {
        if (sid) return sid
        return this.request('sid', null, true)
      })
      .then(sid => {
        this.sid = sid
        return this.opts.setSID(sid)
      })
  }

  request(name, data, skipChecks) {
    const doChecks = () => skipChecks ?
      Promise.resolve() :
      this._makeSureConnected().then(this._makeSureSIDExists.bind(this))

    return doChecks()
      .then(() => new Promise((resolve, reject) => {
        const id = ++this.currentID

        // One-off listener for this message
        const listener = message => {
          const response = JSON.parse(message.data)
          if (response.id !== id) return 0

          this.ws.removeEventListener('message', listener)

          if (response.error) return reject(response.error)
          resolve(response.result)
        }

        this.ws.addEventListener('message', listener)
        this.ws.send(JSON.stringify({ sid: this.sid, id, name, data }))
      }))
  }
}

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

  request(name, data) {
    return this._makeSureConnected()
      .then(this.opts.getSID)
      .then(sid => new Promise((resolve, reject) => {
        const id = ++this.currentID

        // One-off listener for this message
        const listener = message => {
          const response = JSON.parse(message.data)
          if (response.id !== id) return 0

          this.ws.removeEventListener('message', listener)

          if (response.error) return reject(response.error)
          // If the server returns a different sid, update it here, client-side
          if (sid !== response.sid) {
            return this.opts.setSID(response.sid)
              .then(() => resolve(response.result))
          }
          resolve(response.result)
        }

        this.ws.addEventListener('message', listener)
        this.ws.send(JSON.stringify({ sid, id, name, data }))
      }))
  }
}

export class MemorySIDStore {
  _sid: null
  async get() { return this._sid }
  async set(sid) { this._sid = sid }
}

export default class TankClient {
  static CONNECTING_CHECK_INTERVAL = 10
  static CONNECTION_TIMEOUT = 10000

  _currentRequestID = 0

  constructor(ws, sidStore = new MemorySIDStore(), getExtra = () => ({})) {
    this._ws = ws
    this._sidStore = sidStore
    this._getExtra = getExtra
  }

  _makeSureConnected() {
    return new Promise((resolve, reject) => {
      if (this._ws.readyState === 1) { // 1 === WebSocket.OPEN
        resolve()
        return
      }

      const timeout = setTimeout(() => {
        clearInterval(checkInterval) // eslint-disable-line no-use-before-define
        reject('WebSocket connection timed out.')
      }, TankClient.CONNECTION_TIMEOUT)

      const checkInterval = setInterval(() => {
        if (this._ws.readyState !== 1) return // 1 === WebSocket.OPEN
        clearTimeout(timeout)
        clearInterval(checkInterval)
        resolve()
      }, TankClient.CONNECTING_CHECK_INTERVAL)
    })
  }

  request(name, payload) {
    return this._makeSureConnected()
      .then(this._sidStore.get)
      .then(_sid => new Promise((resolve, reject) => {
        const id = ++this._currentRequestID

        // One-off listener for this message
        const listener = message => {
          const response = JSON.parse(message.data || message)

          if (response.id !== id) return

          this._ws.removeEventListener('message', listener)

          if (response.error) {
            reject(response.error)
            return
          }

          // If the server returns a different _sid, update it here, client-side
          if (_sid !== response.sid) {
            this._sidStore.set(response.sid).then(() => resolve(response.result))
            return
          }

          resolve(response.result)
        }

        this._ws.addEventListener('message', listener)
        this._ws.send(JSON.stringify({ sid: _sid, id, name, payload, extra: this._getExtra() }))
      }))
  }
}

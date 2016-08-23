import uid from 'uid-safe'

export class MemorySessionManager {
  store = {};
  get(key) { return this.store[key] }
  set(key, value) { this.store[key] = value }
}

export default class OpsServer {
  constructor(requests, wss, sessionManager) {
    this._sessionManager = sessionManager

    wss.on('connection', ws => {
      ws.on('message', async function(jsonMessage) {
        const { id, sid, name, payload, extra } = JSON.parse(jsonMessage)

        let requestAction
        requests.forEach(availableRequest => {
          if (name === availableRequest) requestAction = requests[availableRequest]
        })

        try {
          if (requestAction === undefined) throw new Error('Request not recognized')

          // Ensure there's a session
          const session = await sessionManager.get(sid)
          const guaranteedSID = session ? sid : await this._createSession(sessionManager)

          const result = await requestAction(guaranteedSID, payload, extra)
          ws.send(JSON.stringify({ id, sid: guaranteedSID, result }))
        } catch (err) {
          let message = err
          if (err instanceof Error) message = err.message
          ws.send(JSON.stringify({ id, error: message }))
        }
      })
    })
  }

  async _createSession() {
    const sid = uid.sync(24)
    await this._sessionManager.set(sid, JSON.stringify({}))
    return sid
  }
}

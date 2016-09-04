import uuid from 'uuid'

// Defaut implementation of a SessionManager
// `get()` is an async function that always returns a session with an sid.
// If the passed sid is blank or not found, it returns a new session
export class MemorySessionManager {
  _store = {};

  async get(sid) {
    let guaranteedSID = sid

    if (!guaranteedSID || !this._store[guaranteedSID]) {
      guaranteedSID = uuid.v4()
      this._store[guaranteedSID] = { sid: guaranteedSID }
    }

    return this._store[guaranteedSID]
  }
}

export default class OpsServer {
  constructor(wss, sessionManager, requests) {
    this._sessionManager = sessionManager

    wss.on('connection', ws => {
      ws.on('message', async jsonMessage => {
        const { id, sid, name, payload, extra } = JSON.parse(jsonMessage)

        let requestAction
        Object.keys(requests).forEach(availableRequest => {
          if (name === availableRequest) requestAction = requests[availableRequest]
        })

        try {
          if (requestAction === undefined) throw new Error('Request not recognized')

          // Ensure there's a session
          const session = await sessionManager.get(sid)

          const result = await requestAction(session.sid, payload, extra)
          ws.send(JSON.stringify({ id, sid: session.sid, result }))
        } catch (err) {
          let message = err
          if (err instanceof Error) message = err.message
          ws.send(JSON.stringify({ id, error: message }))
        }
      })
    })
  }
}

import uuid from 'uuid'
import EventEmitter from 'eventemitter3'

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

export default class TankServer extends EventEmitter {
  constructor(wss, sessionManager, requests) {
    super()

    this._sessionManager = sessionManager


    wss.on('connection', ws => {
      ws.on('message', async jsonMessage => {
        let request = {}
        try {
          request = JSON.parse(jsonMessage)
          const { id, sid, name, payload, extra } = request

          this.emit('request', request)

          let requestAction
          Object.keys(requests).forEach(availableRequest => {
            if (name === availableRequest) requestAction = requests[availableRequest]
          })

          if (requestAction === undefined) {
            this.emit('error', 'Request not recognized')
            throw new Error('Request not recognized')
          }

          // Ensure there's a session
          const session = await sessionManager.get(sid)

          const result = await requestAction(session.sid, payload, extra)
          const response = { id, sid: session.sid, result }
          ws.send(JSON.stringify(response))
          this.emit('response', response, request)
        } catch (err) {
          let message = err
          if (err instanceof Error) message = err.message

          const response = { id: request.id, error: message }
          ws.send(JSON.stringify(response))
          this.emit('response', response, request)
        }
      })
    })
  }
}

import uid from 'uid-safe'

class MemorySessionManager {
  store = {};
  get(key) { return this.store[key] }
  set(key, value) { this.store[key] = value }
}

export async function createSession(store) {
  const sid = uid.sync(24)

  await store.set(sid, JSON.stringify({}))

  return sid
}

const defaultOpts = {
  sessionManager: new MemorySessionManager(),
}

export default (wss, requests, opts) => {
  opts = { ...defaultOpts, ...opts }

  wss.on('connection', ws => {
    ws.on('message', async function(jsonMessage) {
      const { id, sid, name, payload, extra } = JSON.parse(jsonMessage)

      let requestAction
      for (const availableRequest in requests) {
        if (!{}.hasOwnProperty.call(requests, availableRequest)) return
        if (name === availableRequest) {
          requestAction = requests[availableRequest]
          break
        }
      }

      try {
        if (requestAction === undefined) throw new Error('Request not recognized')

        // Ensure there's a session
        const session = await opts.sessionManager.get(sid)
        const guaranteedSID = session ? sid : await createSession(opts.sessionManager)

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

import uid from 'uid-safe'
import WebSocket from 'ws'

class MemoryRedis {
  store = {};
  get(key) { return this.store[key] }
  set(key, value) { this.store[key] = value }
  expire() {}
}

export async function makeSID(store) {
  const sid = uid.sync(24)

  return store.set(sid, {})
    .then(() => store.expire(sid, global.SESSION_TTL))
    .then(() => sid)
}

const defaultOpts = {
  sidStore: new MemoryRedis(),
}

export default (server, requests, opts) => {
  const wss = new WebSocket.Server({ server })

  opts = { ...defaultOpts, ...opts }

  // Add sid request
  requests = { ...requests, sid: makeSID.bind(null, opts.sidStore) }

  wss.on('connection', ws => {
    ws.on('message', async function(jsonMessage) {
      const { id, sid, name, data } = JSON.parse(jsonMessage)

      let requestAction
      for (const availableRequest in requests) {
        if (!{}.hasOwnProperty.call(requests, availableRequest)) return
        if (name === availableRequest) {
          requestAction = requests[availableRequest]
          break
        }
      }

      if (requestAction === undefined) {
        throw new Error('Request not recognized')
      }

      try {
        const result = await requestAction(sid, data)
        ws.send(JSON.stringify({ id, result }))
      } catch (error) {
        ws.send(JSON.stringify({ id, error }))
      }
    })
  })
}

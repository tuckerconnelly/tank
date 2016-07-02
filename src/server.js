import uid from 'uid-safe'

class MemoryRedis {
  store = {};
  get(key) { return this.store[key] }
  set(key, value) { this.store[key] = value }
  expire() {}
}

export async function createSession(store) {
  const sid = uid.sync(24)

  return store.set(sid, JSON.stringify({}))
    .then(() => store.expire(sid, global.SESSION_TTL))
    .then(() => sid)
}

export function bindTo(commands, ...objectsToBind) {
  return Object.keys(commands).reduce((accumulator, current) => ({
    ...accumulator,
    // Bind an array of args to a function
    // See http://stackoverflow.com/questions/21507320/using-function-prototype-bind-with-an-array-of-arguments
    [current]: commands[current].bind.apply(
      commands[current], [null].concat(objectsToBind)
    ),
  }), {})
}

const defaultOpts = {
  sidStore: new MemoryRedis(),
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
        const session = await opts.sidStore.get(sid)
        const guaranteedSID = session ? sid : await createSession(opts.sidStore)

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

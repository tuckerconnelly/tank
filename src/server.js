import uid from 'uid-safe'
import WebSocket from 'ws'

class MemoryRedis {
  store = {};
  get(key) { return this.store[key] }
  set(key, value) { this.store[key] = value }
  expire() {}
}

async function makeSID(store) {
  const sid = uid.sync(24)

  return store.set(sid, {})
    .then(() => store.expire(sid, global.SESSION_TTL))
    .then(() => sid)
}

const defaultOpts = {
  sidStore: new MemoryRedis(),
}

export default (server, commands, opts) => {
  const wss = new WebSocket.Server({ server })

  opts = { ...defaultOpts, ...opts }

  // Add getSID command
  commands = { ...commands, getSID: makeSID.bind(null, opts.sidStore) }

  wss.on('connection', ws => {
    ws.on('message', async function(jsonMessage) {
      const { messageID, sid, command, data } = JSON.parse(jsonMessage)

      let foundCommandAction
      for (const availableCommand in commands) {
        if (command === availableCommand) {
          foundCommandAction = commands[availableCommand]
          break
        }
      }

      if (foundCommandAction === undefined) {
        throw new Error('Command not recognized')
      }

      try {
        const result = await foundCommandAction(sid, data)
        ws.send(JSON.stringify({ messageID, result }))
      } catch (error) {
        ws.send(JSON.stringify({ messageID, error }))
      }
    })
  })
}

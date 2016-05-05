import uid from 'uid-safe'
const WebSocket = window.WebSocket ? window.WebSocket : require('ws')

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

export const wsrr = (server, commands, opts) => {
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

export class WSRRClient extends WebSocket {
  messageID = 0;
  sid = null;
  opts = {
    getSID: () => Promise.resolve(this.sid),
    setSID: sid => Promise.resolve(this.sid = sid),
  }

  constructor(url, protocols, opts) {
    super(url, protocols)
    this.opts = { ...this.opts, ...opts }
  }

  init() {
    return new Promise(async function(resolve) {
      if (await this.opts.getSID()) return resolve()
      this.opts.setSID(await this.request('getSID'))
      resolve()
    })
  }

  request(command, data) {
    return new Promise((resolve, reject) => {
      const messageID = ++this.messageID

      // One-off listener for this message
      const listener = message => {
        const response = JSON.parse(message.data)
        if (response.messageID !== messageID) return 0

        this.removeEventListener('message', listener)

        if (response.error) return reject(response.error)
        resolve(response)
      }

      this.addEventListener('message', listener)
      this.send(JSON.stringify({ sid: this.sid, messageID, command, data }))
    })
  }
}

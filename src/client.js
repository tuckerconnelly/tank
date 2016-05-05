export default class WSRRClient {
  messageID = 0;
  sid = null;
  opts = {
    getSID: () => Promise.resolve(this.sid),
    setSID: sid => Promise.resolve(this.sid = sid),
  }

  constructor(ws, opts) {
    this.ws = ws
    this.opts = { ...this.opts, ...opts }
  }

  init = async function() {
    let sid = await this.opts.getSID()
    if (sid) return sid

    sid = await this.request('getSID')
    this.opts.setSID(sid)
    return sid
  }

  request(command, data) {
    return new Promise((resolve, reject) => {
      const messageID = ++this.messageID

      // One-off listener for this message
      const listener = message => {
        const response = JSON.parse(message.data)
        if (response.messageID !== messageID) return 0

        this.ws.removeEventListener('message', listener)

        if (response.error) return reject(response.error)
        resolve(response)
      }

      this.ws.addEventListener('message', listener)
      this.ws.send(JSON.stringify({ sid: this.sid, messageID, command, data }))
    })
  }
}

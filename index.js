const WEBSOCKET_CONNECTING_CHECK_INTERVAL = 10
const WEBSOCKET_CONNECTION_TIMEOUT = 10000

/**
 * Formats an error response from GraphQL server request.
 */
function formatRequestErrors(request, errors) {
  const CONTEXT_BEFORE = 20
  const CONTEXT_LENGTH = 60

  const queryLines = request.getQueryString().split('\n')
  return errors.map(({ locations, message }, i) => {
    const prefix = (i + 1) + '. '
    const indent = ' '.repeat(prefix.length)

    // Custom errors thrown in graphql-server may not have locations
    const locationMessage = locations ?
      ('\n' + locations.map(({ column, line }) => {
        const queryLine = queryLines[line - 1]
        const offset = Math.min(column - 1, CONTEXT_BEFORE)
        return [
          queryLine.substr(column - 1 - offset, CONTEXT_LENGTH),
          ' '.repeat(offset) + '^^^',
        ].map(messageLine => indent + messageLine).join('\n')
      }).join('\n')) :
      ''

    return prefix + message + locationMessage
  }).join('\n')
}

export default class RelayWebSocketNetworkLayer {
  _currentRequestID = 0;

  constructor(ws, setup = () => Promise.resolve({})) {
    this._ws = ws
    this._setup = setup
  }

  sendMutation(request) {
    return this._sendMutation(request)
      .then(({ result }) => {
        if (result.hasOwnProperty('errors')) {
          const error = new Error(
            'Server request for mutation `' + request.getDebugName() + '` ' +
            'failed for the following reasons:\n\n' +
            formatRequestErrors(request, result.errors)
          )
          error.source = result
          request.reject(error)
          return
        }

        request.resolve({ response: result.data })
      })
      .catch(error => request.reject(error))
  }

  _makeSureConnected() {
    return new Promise((resolve, reject) => {
      if (this._ws.readyState === WebSocket.OPEN) return resolve()
      const timeout = setTimeout(() => {
        clearInterval(checkInterval) // eslint-disable-line no-use-before-define
        reject()
      }, WEBSOCKET_CONNECTION_TIMEOUT)
      const checkInterval = setInterval(() => {
        if (this._ws.readyState !== WebSocket.OPEN) return
        clearTimeout(timeout)
        clearInterval(checkInterval)
        this._extra ?
          resolve() :
          this._setup()
            .then(extra => { this._extra = extra })
            .then(resolve)
      }, WEBSOCKET_CONNECTING_CHECK_INTERVAL)
    })
  }

  sendQueries(requests) {
    return this._makeSureConnected()
      .then(this._sendQueries.bind(this, requests))
      .then((response) => {
        response.result.forEach((result, i) => {
          if (result.hasOwnProperty('errors')) {
            const error = new Error(
              'Server request for query `' + requests[i].getDebugName() + '` ' +
              'failed for the following reasons:\n\n' +
              formatRequestErrors(requests[i], result.errors)
            )
            error.source = result
            requests[i].reject(error)
            return
          }

          if (!result.hasOwnProperty('data')) {
            requests[i].reject(new Error(
              'Server response was missing for query `' + requests[i].getDebugName() +
              '`.'
            ))
          }

          requests[i].resolve({ response: result.data })
        })
      })
  }

  supports() { return false }

  _sendMutation(request) {
    // TODO Handle files
    return new Promise(resolve => {
      const thisID = ++this._currentRequestID

      this._ws.send(JSON.stringify({
        messageID: thisID,
        query: request.getQueryString(),
        ...this._extra,
      }))

      const listener = this._ws.addEventListener('message', message => {
        const response = JSON.parse(message.data)
        if (response.messageID !== thisID) return

        this._ws.removeEventListener(listener)
        resolve(response)
      })
    })
  }

  _sendQueries(requests) {
    return new Promise((resolve, reject) => {
      const thisID = ++this._currentRequestID

      this._ws.send(JSON.stringify({
        messageID: thisID,
        command: 'query',
        data: requests.map(request => request.getQueryString()),
        ...this._extra,
      }))

      const listener = message => {
        const response = JSON.parse(message.data)
        if (response.messageID !== thisID) return

        this._ws.removeEventListener('message', listener)

        if (response.error) reject(response.error)
        else resolve(response)
      }

      this._ws.addEventListener('message', listener)
    })
  }
}

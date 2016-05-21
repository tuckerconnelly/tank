import React from 'react'
const { Component, PropTypes, Children } = React

const mockWSRR = {
  send: () => 0,
  close: () => 0,
  request: () => Promise.resolve(),
}

class WSRRProvider extends Component {
  constructor(props, context) {
    super(props, context)
    this.ws = props.ws
  }

  getChildContext() {
    return { ws: this.ws }
  }

  render() {
    return Children.only(this.props.children)
  }
}

WSRRProvider.propTypes = {
  ws: PropTypes.object.isRequired,
  children: PropTypes.node.isRequired,
}

WSRRProvider.defaultProps = {
  ws: mockWSRR,
}

WSRRProvider.childContextTypes = {
  ws: PropTypes.object,
}

export default WSRRProvider

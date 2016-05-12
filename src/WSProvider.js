import React from 'react'
const { Component, PropTypes, Children } = React

const mockWSRR = {
  send: () => 0,
  close: () => 0,
  request: () => Promise.resolve(),
}

class WSProvider extends Component {
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

WSProvider.propTypes = {
  ws: PropTypes.object.isRequired,
  children: PropTypes.node.isRequired,
}

WSProvider.defaultProps = {
  ws: mockWSRR,
}

WSProvider.childContextTypes = {
  ws: PropTypes.object,
}

export default WSProvider

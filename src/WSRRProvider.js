import { Component, PropTypes, Children } from 'react'

const mockWSRR = {
  send: () => 0,
  close: () => 0,
  request: () => Promise.resolve(),
}

class WSRRProvider extends Component {
  constructor(props, context) {
    super(props, context)
    this.wsrr = props.wsrr
  }

  getChildContext() {
    return { wsrr: this.wsrr }
  }

  render() {
    return Children.only(this.props.children)
  }
}

WSRRProvider.propTypes = {
  wsrr: PropTypes.object.isRequired,
  children: PropTypes.node.isRequired,
}

WSRRProvider.defaultProps = {
  wsrr: mockWSRR,
}

WSRRProvider.childContextTypes = {
  wsrr: PropTypes.object,
}

export default WSRRProvider

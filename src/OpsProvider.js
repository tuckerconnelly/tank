import { Component, PropTypes, Children } from 'react'

class OpsProvider extends Component {
  getChildContext() { return { ops: this.props.ops } }
  render() { return Children.only(this.props.children) }
}

OpsProvider.propTypes = {
  ops: PropTypes.object.isRequired,
  children: PropTypes.node.isRequired,
}
OpsProvider.defaultProps = {
  ops: {
    send: () => 0,
    close: () => 0,
    request: () => Promise.resolve(),
  },
}
OpsProvider.childContextTypes = { ops: PropTypes.object }

export default OpsProvider

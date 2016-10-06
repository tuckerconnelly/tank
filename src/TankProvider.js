import { Component, PropTypes, Children } from 'react'

class TankProvider extends Component {
  getChildContext() { return { tank: this.props.tank } }
  render() { return Children.only(this.props.children) }
}

TankProvider.propTypes = {
  tank: PropTypes.object.isRequired,
  children: PropTypes.node.isRequired,
}
TankProvider.defaultProps = {
  tank: {
    send: () => 0,
    close: () => 0,
    request: () => Promise.resolve(),
  },
}
TankProvider.childContextTypes = { tank: PropTypes.object }

export default TankProvider

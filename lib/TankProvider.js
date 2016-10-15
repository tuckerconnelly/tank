var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value"in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}function _possibleConstructorReturn(self,call){if(!self){throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call&&(typeof call==="object"||typeof call==="function")?call:self;}function _inherits(subClass,superClass){if(typeof superClass!=="function"&&superClass!==null){throw new TypeError("Super expression must either be null or a function, not "+typeof superClass);}subClass.prototype=Object.create(superClass&&superClass.prototype,{constructor:{value:subClass,enumerable:false,writable:true,configurable:true}});if(superClass)Object.setPrototypeOf?Object.setPrototypeOf(subClass,superClass):subClass.__proto__=superClass;}var React=require('react');var
Component=React.Component;var PropTypes=React.PropTypes;var Children=React.Children;var

TankProvider=function(_Component){_inherits(TankProvider,_Component);function TankProvider(){_classCallCheck(this,TankProvider);return _possibleConstructorReturn(this,(TankProvider.__proto__||Object.getPrototypeOf(TankProvider)).apply(this,arguments));}_createClass(TankProvider,[{key:'getChildContext',value:function getChildContext()
{return{tank:this.props.tank};}},{key:'render',value:function render()
{return Children.only(this.props.children);}}]);return TankProvider;}(Component);


TankProvider.propTypes={
tank:PropTypes.object.isRequired,
children:PropTypes.node.isRequired};

TankProvider.defaultProps={
tank:{
send:function send(){return 0;},
close:function close(){return 0;},
request:function request(){return Promise.resolve();}}};


TankProvider.childContextTypes={tank:PropTypes.object};

module.exports=TankProvider;
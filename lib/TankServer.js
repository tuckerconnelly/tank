Object.defineProperty(exports,"__esModule",{value:true});exports.MemorySessionManager=undefined;var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value"in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();var _uuid=require('uuid');var _uuid2=_interopRequireDefault(_uuid);
var _eventemitter=require('eventemitter3');var _eventemitter2=_interopRequireDefault(_eventemitter);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}function _possibleConstructorReturn(self,call){if(!self){throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call&&(typeof call==="object"||typeof call==="function")?call:self;}function _inherits(subClass,superClass){if(typeof superClass!=="function"&&superClass!==null){throw new TypeError("Super expression must either be null or a function, not "+typeof superClass);}subClass.prototype=Object.create(superClass&&superClass.prototype,{constructor:{value:subClass,enumerable:false,writable:true,configurable:true}});if(superClass)Object.setPrototypeOf?Object.setPrototypeOf(subClass,superClass):subClass.__proto__=superClass;}function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}var




MemorySessionManager=exports.MemorySessionManager=function(){function MemorySessionManager(){_classCallCheck(this,MemorySessionManager);this.
_store={};}_createClass(MemorySessionManager,[{key:'get',value:function get(

sid){var guaranteedSID;return regeneratorRuntime.async(function get$(_context){while(1){switch(_context.prev=_context.next){case 0:
guaranteedSID=sid;

if(!guaranteedSID||!this._store[guaranteedSID]){
guaranteedSID=_uuid2.default.v4();
this._store[guaranteedSID]={sid:guaranteedSID};
}return _context.abrupt('return',

this._store[guaranteedSID]);case 3:case'end':return _context.stop();}}},null,this);}}]);return MemorySessionManager;}();var



TankServer=function(_EventEmitter){_inherits(TankServer,_EventEmitter);
function TankServer(wss,sessionManager,requests){var _this2=this;_classCallCheck(this,TankServer);var _this=_possibleConstructorReturn(this,(TankServer.__proto__||Object.getPrototypeOf(TankServer)).call(this));


_this._sessionManager=sessionManager;


wss.on('connection',function(ws){
ws.on('message',function _callee2(jsonMessage){var request,message,_response;return regeneratorRuntime.async(function _callee2$(_context3){while(1){switch(_context3.prev=_context3.next){case 0:
request={};_context3.prev=1;_context3.next=4;return regeneratorRuntime.awrap(function _callee(){var _request,id,sid,name,payload,extra,requestAction,session,result,response;return regeneratorRuntime.async(function _callee$(_context2){while(1){switch(_context2.prev=_context2.next){case 0:

request=JSON.parse(jsonMessage);_request=
request;id=_request.id;sid=_request.sid;name=_request.name;payload=_request.payload;extra=_request.extra;

_this.emit('request',request);

requestAction=void 0;
Object.keys(requests).forEach(function(availableRequest){
if(name===availableRequest)requestAction=requests[availableRequest];
});if(!(

requestAction===undefined)){_context2.next=13;break;}
_this.emit('error','Request not recognized');throw(
new Error('Request not recognized'));case 13:_context2.next=15;return regeneratorRuntime.awrap(



sessionManager.get(sid));case 15:session=_context2.sent;_context2.next=18;return regeneratorRuntime.awrap(

requestAction(session.sid,payload,extra));case 18:result=_context2.sent;
response={id:id,sid:session.sid,result:result};
ws.send(JSON.stringify(response));
_this.emit('response',response,request);case 22:case'end':return _context2.stop();}}},null,_this2);}());case 4:_context3.next=13;break;case 6:_context3.prev=6;_context3.t0=_context3['catch'](1);

message=_context3.t0;
if(_context3.t0 instanceof Error)message=_context3.t0.message;

_response={id:request.id,error:message};
ws.send(JSON.stringify(_response));
_this.emit('response',_response,request);case 13:case'end':return _context3.stop();}}},null,_this2,[[1,6]]);});


});return _this;
}return TankServer;}(_eventemitter2.default);exports.default=TankServer;
Object.defineProperty(exports,"__esModule",{value:true});exports.MemorySessionManager=undefined;var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value"in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();var _uuid=require('uuid');var _uuid2=_interopRequireDefault(_uuid);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}var




MemorySessionManager=exports.MemorySessionManager=function(){function MemorySessionManager(){_classCallCheck(this,MemorySessionManager);this.
_store={};}_createClass(MemorySessionManager,[{key:'get',value:function get(

sid){var guaranteedSID;return regeneratorRuntime.async(function get$(_context){while(1){switch(_context.prev=_context.next){case 0:
guaranteedSID=sid;

if(!guaranteedSID||!this._store[guaranteedSID]){
guaranteedSID=_uuid2.default.v4();
this._store[guaranteedSID]={sid:guaranteedSID};
}return _context.abrupt('return',

this._store[guaranteedSID]);case 3:case'end':return _context.stop();}}},null,this);}}]);return MemorySessionManager;}();var



TankServer=
function TankServer(wss,sessionManager,requests){var _this=this;_classCallCheck(this,TankServer);
this._sessionManager=sessionManager;

wss.on('connection',function(ws){
ws.on('message',function _callee(jsonMessage){var _JSON$parse,id,sid,name,payload,extra,requestAction,session,result,message;return regeneratorRuntime.async(function _callee$(_context2){while(1){switch(_context2.prev=_context2.next){case 0:_JSON$parse=
JSON.parse(jsonMessage);id=_JSON$parse.id;sid=_JSON$parse.sid;name=_JSON$parse.name;payload=_JSON$parse.payload;extra=_JSON$parse.extra;

requestAction=void 0;
Object.keys(requests).forEach(function(availableRequest){
if(name===availableRequest)requestAction=requests[availableRequest];
});_context2.prev=8;if(!(


requestAction===undefined)){_context2.next=11;break;}throw new Error('Request not recognized');case 11:_context2.next=13;return regeneratorRuntime.awrap(


sessionManager.get(sid));case 13:session=_context2.sent;_context2.next=16;return regeneratorRuntime.awrap(

requestAction(session.sid,payload,extra));case 16:result=_context2.sent;
ws.send(JSON.stringify({id:id,sid:session.sid,result:result}));_context2.next=25;break;case 20:_context2.prev=20;_context2.t0=_context2['catch'](8);

message=_context2.t0;
if(_context2.t0 instanceof Error)message=_context2.t0.message;
ws.send(JSON.stringify({id:id,error:message}));case 25:case'end':return _context2.stop();}}},null,_this,[[8,20]]);});


});
};exports.default=TankServer;
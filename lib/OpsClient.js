Object.defineProperty(exports,"__esModule",{value:true});var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value"in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();var _OpsProvider=require('./OpsProvider');Object.defineProperty(exports,'OpsProvider',{enumerable:true,get:function get(){return _interopRequireDefault(_OpsProvider).default;}});function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}var

MemorySIDStore=exports.MemorySIDStore=function(){function MemorySIDStore(){_classCallCheck(this,MemorySIDStore);}_createClass(MemorySIDStore,[{key:'get',value:function get(){return regeneratorRuntime.async(function get$(_context){while(1){switch(_context.prev=_context.next){case 0:return _context.abrupt('return',

this._sid);case 1:case'end':return _context.stop();}}},null,this);}},{key:'set',value:function set(
sid){return regeneratorRuntime.async(function set$(_context2){while(1){switch(_context2.prev=_context2.next){case 0:this._sid=sid;case 1:case'end':return _context2.stop();}}},null,this);}}]);return MemorySIDStore;}();var


OpsClient=function(){





function OpsClient(ws){var sidStore=arguments.length<=1||arguments[1]===undefined?new MemorySIDStore():arguments[1];var getExtra=arguments.length<=2||arguments[2]===undefined?function(){return{};}:arguments[2];_classCallCheck(this,OpsClient);this._currentRequestID=0;
this._ws=ws;
this._sidStore=sidStore;
this._getExtra=getExtra;
}_createClass(OpsClient,[{key:'_makeSureConnected',value:function _makeSureConnected()

{var _this=this;
return new Promise(function(resolve,reject){
if(_this._ws.readyState===WebSocket.OPEN){
resolve();
return;
}

var timeout=setTimeout(function(){
clearInterval(checkInterval);// eslint-disable-line no-use-before-define
reject('WebSocket connection timed out.');
},OpsClient.CONNECTION_TIMEOUT);

var checkInterval=setInterval(function(){
if(_this._ws.readyState!==WebSocket.OPEN)return;
clearTimeout(timeout);
clearInterval(checkInterval);
resolve();
},OpsClient.CONNECTING_CHECK_INTERVAL);
});
}},{key:'request',value:function request(

name,payload){var _this2=this;
return this._makeSureConnected().
then(this._sidStore.get).
then(function(_sid){return new Promise(function(resolve,reject){
var id=++_this2._currentRequestID;

// One-off listener for this message
var listener=function listener(message){
var response=JSON.parse(message.data);

if(response.id!==id)return;

_this2._ws.removeEventListener('message',listener);

if(response.error){
reject(response.error);
return;
}

// If the server returns a different _sid, update it here, client-side
if(_sid!==response.sid){
_this2._sidStore.set(response.sid).then(function(){return resolve(response.result);});
return;
}

resolve(response.result);
};

_this2._ws.addEventListener('message',listener);
_this2._ws.send(JSON.stringify({sid:_sid,id:id,name:name,payload:payload,extra:_this2._getExtra()}));
});});
}}]);return OpsClient;}();OpsClient.CONNECTING_CHECK_INTERVAL=10;OpsClient.CONNECTION_TIMEOUT=10000;exports.default=OpsClient;
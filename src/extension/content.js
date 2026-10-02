var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
(function () {
    try {
        var container_1 = document.documentElement;
        var script_1 = document.createElement('script');
        script_1.setAttribute('async', "false");
        script_1.setAttribute('fetchpriority', "high");
        script_1.src = chrome.runtime.getURL('src/extension/inject.js');
        container_1.prepend(script_1);
        script_1.addEventListener('load', function () { container_1.removeChild(script_1); });
    }
    catch (error) {
        console.error('MetaMask: Provider injection failed.', error);
    }
})();
var allowedMethods = {
    'eth_accounts': true,
    'eth_requestAccounts': true,
    'eth_chainId': true,
    'personal_sign': true,
    'wallet_requestPermissions': true,
    'eth_gasPrice': true,
    'eth_getBlockByNumber': true,
    'eth_blockNumber': true,
    'eth_estimateGas': true,
    'eth_sign': true,
    'net_version': true,
    'eth_sendTransaction': true,
    'wallet_switchEthereumChain': true,
    'eth_call': true,
    'eth_getBalance': true,
    'eth_getTransactionByHash': true,
    'eth_getTransactionReceipt': true,
    'signTypedData': true,
    'eth_signTypedData': true,
    'signTypedData_v1': true,
    'eth_signTypedData_v1': true,
    'signTypedData_v3': true,
    'eth_signTypedData_V3': true,
    'signTypedData_v4': true,
    'eth_signTypedData_v4': true,
    'web3_clientVersion': true,
    'wallet_getPermissions': true,
    'net_listening': true,
    'eth_coinbase': true,
    'wallet_addEthereumChain': true,
    'eth_getCode': true,
    'eth_getTransactionCount': true,
};
window.addEventListener("message", function (event) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    if (event.source != window)
        return;
    // console.log(event)
    if (event.data.type && (event.data.type === "CLWALLET_CONTENT")) {
        event.data.data.resId = event.data.resId;
        event.data.data.type = "CLWALLET_CONTENT_MSG";
        event.data.data.website = (_b = (_a = document === null || document === void 0 ? void 0 : document.location) === null || _a === void 0 ? void 0 : _a.href) !== null && _b !== void 0 ? _b : '';
        if (((_e = (_d = (_c = event === null || event === void 0 ? void 0 : event.data) === null || _c === void 0 ? void 0 : _c.data) === null || _d === void 0 ? void 0 : _d.method) !== null && _e !== void 0 ? _e : 'x') in allowedMethods) {
            chrome.runtime.sendMessage(event.data.data, function (res) {
                var data = { type: "CLWALLET_PAGE", data: res, resId: event.data.resId };
                // console.log('data back', data)
                window.postMessage(data, "*");
            });
        }
        else {
            var data = { type: "CLWALLET_PAGE", data: { error: true, message: (_h = 'ClearWallet: Unknown method requested ' + ((_g = (_f = event === null || event === void 0 ? void 0 : event.data) === null || _f === void 0 ? void 0 : _f.data) === null || _g === void 0 ? void 0 : _g.method)) !== null && _h !== void 0 ? _h : '' }, resId: event.data.resId };
            window.postMessage(data, "*");
        }
    }
    else if (event.data.type && (event.data.type === "CLWALLET_PING")) {
        event.data.data.resId = event.data.resId;
        event.data.data.type = "CLWALLET_CONTENT_MSG";
        event.data.data.method = "wallet_connect";
        event.data.data.params = Array(0);
        chrome.runtime.sendMessage(event.data.data, function (res) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                window.postMessage(res, "*");
                return [2 /*return*/];
            });
        }); });
    }
});
// eslint-disable-next-line @typescript-eslint/no-unused-vars
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.type === "CLWALLET_EXT_LISTNER") {
        var data = { type: "CLWALLET_PAGE_LISTENER", data: message.data };
        // console.log('data listner', data)
        window.postMessage(data, "*");
    }
    return true;
});

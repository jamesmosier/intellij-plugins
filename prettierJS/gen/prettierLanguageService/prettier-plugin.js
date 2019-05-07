"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
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
exports.__esModule = true;
var prettier = require("prettier");
var PrettierPlugin = /** @class */ (function () {
    function PrettierPlugin() {
    }
    PrettierPlugin.prototype.onMessage = function (p, writer) {
        var r = JSON.parse(p);
        var response;
        try {
            if (r.command == "reformat") {
                response = this.handleReformatCommand(r.arguments);
            }
            else if (r.command == "getSupportedFiles") {
                response = this.getSupportedFiles(r.arguments.prettierPath);
            }
            else {
                response = { error: "Unknown command: " + r.command };
            }
        }
        catch (e) {
            response = { error: e.message + " " + e.stack };
        }
        response.request_seq = r.seq;
        writer.write(JSON.stringify(response));
    };
    PrettierPlugin.prototype.handleReformatCommand = function (args) {
        var prettierApi = this.requirePrettierApi(args.prettierPath);
        try {
            var options = { ignorePath: args.ignoreFilePath, withNodeModules: true };
            if (prettierApi.getFileInfo && prettierApi.getFileInfo.sync(args.path, options).ignored) {
                return { ignored: true };
            }
            return performFormat(prettierApi, args);
        }
        catch (e) {
            return { error: args.path + ": " + (e.stack && e.stack.length > 0 ? e.stack : e.message) };
        }
    };
    PrettierPlugin.prototype.getSupportedFiles = function (path) {
        var prettierApi = this.requirePrettierApi(path);
        var info = prettierApi.getSupportInfo();
        var extensions = flatten(info.languages.map(function (l) { return l.extensions; })).map(function (e) { return withoutPrefix(e, "."); });
        var fileNames = flatten(info.languages.map(function (l) { return l.filenames != null ? l.filenames : []; }));
        return {
            fileNames: fileNames,
            extensions: extensions
        };
    };
    PrettierPlugin.prototype.requirePrettierApi = function (path) {
        if (this._prettierApi != null && this._prettierApi.path == path) {
            return this._prettierApi;
        }
        var prettier = require(path);
        prettier.path = path;
        return prettier;
    };
    return PrettierPlugin;
}());
exports.PrettierPlugin = PrettierPlugin;
function withoutPrefix(e, prefix) {
    if (e == null || e.length == 0) {
        return e;
    }
    var index = e.indexOf(prefix);
    return index == 0 ? e.substr(prefix.length) : e;
}
function flatten(arr) {
    return arr.reduce(function (previousValue, currentValue) { return previousValue.concat(currentValue); });
}
function performFormat(api, args) {
    return __awaiter(this, void 0, void 0, function () {
        var config, getFormatted;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (args.flushConfigCache) {
                        api.clearConfigCache();
                    }
                    return [4 /*yield*/, prettier.resolveConfig.sync(args.path, { useCache: true, editorconfig: true })];
                case 1:
                    config = _a.sent();
                    if (config == null) {
                        config = { filepath: args.path };
                    }
                    if (config.filepath == null) {
                        config.filepath = args.path;
                    }
                    config.rangeStart = args.start;
                    config.rangeEnd = args.end;
                    getFormatted = api({
                        text: args.content,
                        filePath: config.filepath
                    });
                    return [2 /*return*/, { formatted: getFormatted }];
            }
        });
    });
}

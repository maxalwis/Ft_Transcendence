"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggerMiddleware = void 0;
var common_1 = require("@nestjs/common");
var LoggerMiddleware = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var LoggerMiddleware = _classThis = /** @class */ (function () {
        function LoggerMiddleware_1() {
            this.logger = new common_1.Logger('HTTP');
        }
        LoggerMiddleware_1.prototype.use = function (req, res, next) {
            var _this = this;
            var method = req.method, originalUrl = req.originalUrl, body = req.body, query = req.query;
            var start = Date.now();
            res.on('finish', function () {
                var statusCode = res.statusCode;
                var duration = Date.now() - start;
                var decodedUrl = decodeURIComponent(originalUrl);
                // ANSI escape codes for grey, invisible (conceal), and reset
                var grey = '\x1b[90m';
                var invisible = '\x1b[8m';
                var reset = '\x1b[0m'; // or \x1b[28m
                // Spaces padding to match the width of the timestamp, process ID, and log level prefix after the newline
                var padding = '                                                     ';
                var logMessage = [
                    "".concat(method, " ").concat(grey).concat(decodedUrl, " ").concat(statusCode, " - ").concat(duration, "ms"),
                    "".concat(padding).concat(invisible).concat(method).concat(reset).concat(grey, "|- Body: ").concat(JSON.stringify(body)),
                    "".concat(padding).concat(invisible).concat(method).concat(reset).concat(grey, "`- Query: ").concat(JSON.stringify(query)),
                ].join('\n');
                _this.logger.log(logMessage);
            });
            next();
        };
        return LoggerMiddleware_1;
    }());
    __setFunctionName(_classThis, "LoggerMiddleware");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        LoggerMiddleware = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return LoggerMiddleware = _classThis;
}();
exports.LoggerMiddleware = LoggerMiddleware;

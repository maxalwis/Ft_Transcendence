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
Object.defineProperty(exports, "__esModule", { value: true });
exports.NearbyQueryDto = exports.MapQueryDto = void 0;
var class_transformer_1 = require("class-transformer");
var common_1 = require("@nestjs/common");
var class_validator_1 = require("class-validator");
// Parse et valide "minLon,minLat,maxLon,maxLat" reçu en query param
var MapQueryDto = function () {
    var _a;
    var _bbox_decorators;
    var _bbox_initializers = [];
    var _bbox_extraInitializers = [];
    var _from_decorators;
    var _from_initializers = [];
    var _from_extraInitializers = [];
    var _to_decorators;
    var _to_initializers = [];
    var _to_extraInitializers = [];
    return _a = /** @class */ (function () {
            function MapQueryDto() {
                this.bbox = __runInitializers(this, _bbox_initializers, void 0);
                this.from = (__runInitializers(this, _bbox_extraInitializers), __runInitializers(this, _from_initializers, void 0));
                this.to = (__runInitializers(this, _from_extraInitializers), __runInitializers(this, _to_initializers, void 0));
                __runInitializers(this, _to_extraInitializers);
            }
            return MapQueryDto;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _bbox_decorators = [(0, class_validator_1.IsDefined)(), (0, class_transformer_1.Transform)(function (_b) {
                    var value = _b.value;
                    if (typeof value != 'string') {
                        throw new common_1.BadRequestException('bounding box must be a string');
                    }
                    var parts = value.split(',').map(Number);
                    if (parts.length != 4 || parts.some(isNaN)) {
                        throw new common_1.BadRequestException('bounding box must be in the format "minLon,minLat,maxLon,maxLat"');
                    }
                    var minLon = parts[0], minLat = parts[1], maxLon = parts[2], maxLat = parts[3];
                    if (minLon >= maxLon || minLat >= maxLat) {
                        throw new common_1.BadRequestException('bounding box is invalid: min values must be lower than max values');
                    }
                    return { minLon: minLon, minLat: minLat, maxLon: maxLon, maxLat: maxLat };
                })];
            _from_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsISO8601)()];
            _to_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsISO8601)()];
            __esDecorate(null, null, _bbox_decorators, { kind: "field", name: "bbox", static: false, private: false, access: { has: function (obj) { return "bbox" in obj; }, get: function (obj) { return obj.bbox; }, set: function (obj, value) { obj.bbox = value; } }, metadata: _metadata }, _bbox_initializers, _bbox_extraInitializers);
            __esDecorate(null, null, _from_decorators, { kind: "field", name: "from", static: false, private: false, access: { has: function (obj) { return "from" in obj; }, get: function (obj) { return obj.from; }, set: function (obj, value) { obj.from = value; } }, metadata: _metadata }, _from_initializers, _from_extraInitializers);
            __esDecorate(null, null, _to_decorators, { kind: "field", name: "to", static: false, private: false, access: { has: function (obj) { return "to" in obj; }, get: function (obj) { return obj.to; }, set: function (obj, value) { obj.to = value; } }, metadata: _metadata }, _to_initializers, _to_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.MapQueryDto = MapQueryDto;
// Parse et valide "lon,lat" reçu en query param 'center'
var NearbyQueryDto = function () {
    var _a;
    var _center_decorators;
    var _center_initializers = [];
    var _center_extraInitializers = [];
    var _radius_decorators;
    var _radius_initializers = [];
    var _radius_extraInitializers = [];
    var _from_decorators;
    var _from_initializers = [];
    var _from_extraInitializers = [];
    var _to_decorators;
    var _to_initializers = [];
    var _to_extraInitializers = [];
    return _a = /** @class */ (function () {
            function NearbyQueryDto() {
                this.center = __runInitializers(this, _center_initializers, void 0);
                this.radius = (__runInitializers(this, _center_extraInitializers), __runInitializers(this, _radius_initializers, void 0)); // en mètres
                this.from = (__runInitializers(this, _radius_extraInitializers), __runInitializers(this, _from_initializers, void 0));
                this.to = (__runInitializers(this, _from_extraInitializers), __runInitializers(this, _to_initializers, void 0));
                __runInitializers(this, _to_extraInitializers);
            }
            return NearbyQueryDto;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _center_decorators = [(0, class_validator_1.IsDefined)(), (0, class_transformer_1.Transform)(function (_b) {
                    var value = _b.value;
                    if (typeof value != 'string') {
                        throw new common_1.BadRequestException('center must be a string');
                    }
                    var parts = value.split(',').map(Number);
                    if (parts.length != 2 || parts.some(isNaN)) {
                        throw new common_1.BadRequestException('center must be in the format "lon,lat"');
                    }
                    var lon = parts[0], lat = parts[1];
                    return { lon: lon, lat: lat };
                })];
            _radius_decorators = [(0, class_transformer_1.Type)(function () { return Number; }), (0, class_validator_1.IsNumber)(), (0, class_validator_1.IsPositive)(), (0, class_validator_1.Max)(20000)];
            _from_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsISO8601)()];
            _to_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsISO8601)()];
            __esDecorate(null, null, _center_decorators, { kind: "field", name: "center", static: false, private: false, access: { has: function (obj) { return "center" in obj; }, get: function (obj) { return obj.center; }, set: function (obj, value) { obj.center = value; } }, metadata: _metadata }, _center_initializers, _center_extraInitializers);
            __esDecorate(null, null, _radius_decorators, { kind: "field", name: "radius", static: false, private: false, access: { has: function (obj) { return "radius" in obj; }, get: function (obj) { return obj.radius; }, set: function (obj, value) { obj.radius = value; } }, metadata: _metadata }, _radius_initializers, _radius_extraInitializers);
            __esDecorate(null, null, _from_decorators, { kind: "field", name: "from", static: false, private: false, access: { has: function (obj) { return "from" in obj; }, get: function (obj) { return obj.from; }, set: function (obj, value) { obj.from = value; } }, metadata: _metadata }, _from_initializers, _from_extraInitializers);
            __esDecorate(null, null, _to_decorators, { kind: "field", name: "to", static: false, private: false, access: { has: function (obj) { return "to" in obj; }, get: function (obj) { return obj.to; }, set: function (obj, value) { obj.to = value; } }, metadata: _metadata }, _to_initializers, _to_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.NearbyQueryDto = NearbyQueryDto;

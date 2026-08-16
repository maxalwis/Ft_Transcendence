"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
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
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IngestionService = void 0;
var common_1 = require("@nestjs/common");
var schedule_1 = require("@nestjs/schedule");
var IngestionService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _handleDailyIngestionAndCleanup_decorators;
    var IngestionService = _classThis = /** @class */ (function () {
        function IngestionService_1(prisma) {
            this.prisma = (__runInitializers(this, _instanceExtraInitializers), prisma);
            this.logger = new common_1.Logger(IngestionService.name);
        }
        // Exécution automatique au démarrage de NestJS pour valider l'ingestion en local
        IngestionService_1.prototype.onModuleInit = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            this.logger.log('--- TEST MANUEL D\'INGESTION AU DÉMARRAGE ---');
                            return [4 /*yield*/, this.handleDailyIngestionAndCleanup()];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        IngestionService_1.prototype.handleDailyIngestionAndCleanup = function () {
            return __awaiter(this, void 0, void 0, function () {
                var now, deleted, error_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            this.logger.log('Starting scheduled daily ingestion and cleanup job...');
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 4, , 5]);
                            now = new Date();
                            return [4 /*yield*/, this.prisma.event.deleteMany({
                                    where: {
                                        dateEnd: {
                                            lt: now,
                                        },
                                    },
                                })];
                        case 2:
                            deleted = _a.sent();
                            this.logger.log("Cleanup complete: Removed ".concat(deleted.count, " past events."));
                            return [4 /*yield*/, this.fetchFromMairieParis()];
                        case 3:
                            _a.sent();
                            this.logger.log('Scheduled ingestion successfully completed.');
                            return [3 /*break*/, 5];
                        case 4:
                            error_1 = _a.sent();
                            this.logger.error('Error during scheduled job:', error_1);
                            return [3 /*break*/, 5];
                        case 5: return [2 /*return*/];
                    }
                });
            });
        };
        IngestionService_1.prototype.fetchFromMairieParis = function () {
            return __awaiter(this, void 0, void 0, function () {
                var baseUrl, limit, offset, totalCount, totalIngested, url, response, data, mappedEvents, error_2;
                var _this = this;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            baseUrl = 'https://opendata.paris.fr/api/explore/v2.1/catalog/datasets/que-faire-a-paris-/records';
                            limit = 100;
                            offset = 0;
                            totalCount = Infinity;
                            totalIngested = 0;
                            _b.label = 1;
                        case 1:
                            if (!(offset < totalCount)) return [3 /*break*/, 8];
                            url = "".concat(baseUrl, "?limit=").concat(limit, "&offset=").concat(offset);
                            _b.label = 2;
                        case 2:
                            _b.trys.push([2, 6, , 7]);
                            return [4 /*yield*/, fetch(url, { signal: AbortSignal.timeout(10000) })];
                        case 3:
                            response = _b.sent();
                            if (!response.ok) {
                                this.logger.error("Failed to fetch page at offset ".concat(offset, ": ").concat(response.statusText));
                                return [3 /*break*/, 8];
                            }
                            return [4 /*yield*/, response.json()];
                        case 4:
                            data = _b.sent();
                            if (totalCount === Infinity) {
                                totalCount = (_a = data.total_count) !== null && _a !== void 0 ? _a : 0;
                            }
                            if (!data.results || data.results.length === 0)
                                return [3 /*break*/, 8];
                            mappedEvents = data.results.map(function (item) { return _this.mapToEvent(item); });
                            return [4 /*yield*/, Promise.all(mappedEvents.map(function (eventData) { return _this.upsertEvent(eventData); }))];
                        case 5:
                            _b.sent();
                            totalIngested += data.results.length;
                            this.logger.log("Fetched ".concat(data.results.length, " events (offset ").concat(offset, "/").concat(totalCount, ")"));
                            offset += limit;
                            return [3 /*break*/, 7];
                        case 6:
                            error_2 = _b.sent();
                            this.logger.error("Error processing offset ".concat(offset, ":"), error_2);
                            return [3 /*break*/, 8];
                        case 7: return [3 /*break*/, 1];
                        case 8:
                            this.logger.log("Ingestion complete: ".concat(totalIngested, " events processed"));
                            return [2 /*return*/];
                    }
                });
            });
        };
        IngestionService_1.prototype.parseDelimitedString = function (value, delimiter) {
            if (delimiter === void 0) { delimiter = ';'; }
            if (!value)
                return [];
            return value
                .split(delimiter)
                .map(function (t) { return t.trim(); })
                .filter(Boolean);
        };
        IngestionService_1.prototype.parseDate = function (dateStr) {
            if (!dateStr)
                return null;
            var date = new Date(dateStr);
            return isNaN(date.getTime()) ? null : date;
        };
        IngestionService_1.prototype.mapToEvent = function (item) {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s;
            return {
                source: 'mairie_paris',
                externalId: item.id,
                title: (_a = item.title) !== null && _a !== void 0 ? _a : 'Sans titre',
                description: (_b = item.lead_text) !== null && _b !== void 0 ? _b : null,
                dateStart: (_c = this.parseDate(item.date_start)) !== null && _c !== void 0 ? _c : new Date(),
                dateEnd: (_d = this.parseDate(item.date_end)) !== null && _d !== void 0 ? _d : new Date(),
                coverUrl: (_e = item.cover_url) !== null && _e !== void 0 ? _e : null,
                addressName: (_f = item.address_name) !== null && _f !== void 0 ? _f : null,
                addressStreet: (_g = item.address_street) !== null && _g !== void 0 ? _g : null,
                zipCode: (_h = item.address_zipcode) !== null && _h !== void 0 ? _h : null,
                city: (_j = item.address_city) !== null && _j !== void 0 ? _j : null,
                latitude: (_l = (_k = item.lat_lon) === null || _k === void 0 ? void 0 : _k.lat) !== null && _l !== void 0 ? _l : null,
                longitude: (_o = (_m = item.lat_lon) === null || _m === void 0 ? void 0 : _m.lon) !== null && _o !== void 0 ? _o : null,
                priceType: (_p = item.price_type) !== null && _p !== void 0 ? _p : null,
                priceDetail: (_q = item.price_detail) !== null && _q !== void 0 ? _q : null,
                category: this.parseDelimitedString(item.qfap_tags),
                accessLink: (_r = item.access_link) !== null && _r !== void 0 ? _r : null,
                audience: (_s = item.audience) !== null && _s !== void 0 ? _s : null,
                rank: item.rank ? parseFloat(item.rank) : null,
                weight: item.weight ? parseInt(item.weight, 10) : null,
            };
        };
        IngestionService_1.prototype.upsertEvent = function (data) {
            return __awaiter(this, void 0, void 0, function () {
                var source, externalId, eventPayload, event;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!data.externalId)
                                return [2 /*return*/, null];
                            source = data.source, externalId = data.externalId, eventPayload = __rest(data, ["source", "externalId"]);
                            return [4 /*yield*/, this.prisma.event.upsert({
                                    where: { source_externalId: { source: source, externalId: externalId } },
                                    update: eventPayload,
                                    create: __assign({ source: source, externalId: externalId }, eventPayload),
                                })];
                        case 1:
                            event = _a.sent();
                            if (!(data.latitude != null && data.longitude != null)) return [3 /*break*/, 3];
                            return [4 /*yield*/, this.prisma.$executeRaw(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n        UPDATE \"Event\"\n        SET location = ST_SetSRID(ST_MakePoint(", ", ", "), 4326)::geography\n        WHERE id = ", "\n      "], ["\n        UPDATE \"Event\"\n        SET location = ST_SetSRID(ST_MakePoint(", ", ", "), 4326)::geography\n        WHERE id = ", "\n      "])), data.longitude, data.latitude, event.id)];
                        case 2:
                            _a.sent();
                            _a.label = 3;
                        case 3: return [2 /*return*/, event];
                    }
                });
            });
        };
        return IngestionService_1;
    }());
    __setFunctionName(_classThis, "IngestionService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _handleDailyIngestionAndCleanup_decorators = [(0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_MIDNIGHT)];
        __esDecorate(_classThis, null, _handleDailyIngestionAndCleanup_decorators, { kind: "method", name: "handleDailyIngestionAndCleanup", static: false, private: false, access: { has: function (obj) { return "handleDailyIngestionAndCleanup" in obj; }, get: function (obj) { return obj.handleDailyIngestionAndCleanup; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        IngestionService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return IngestionService = _classThis;
}();
exports.IngestionService = IngestionService;
var templateObject_1;

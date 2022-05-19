"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const appError_1 = require("./appError");
const getCoordsForAddress = (address) => __awaiter(void 0, void 0, void 0, function* () {
    const res = yield (0, axios_1.default)({
        method: 'GET',
        url: `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${process.env.GOOGLE_API_KEY}`
    });
    const data = yield res.data;
    if (!data || data.status === 'ZERO_RESULTS') {
        throw new appError_1.AppError('Could not find a location for the given address', 404);
    }
    const coordinates = data.results[0].geometry.location;
    return coordinates;
});
exports.default = getCoordsForAddress;
//# sourceMappingURL=location.js.map
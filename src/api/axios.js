"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.axiosInstance = void 0;
const axios_1 = __importDefault(require("axios"));
exports.axiosInstance = axios_1.default.create({
    baseURL: 'https://api.ajax.systems/api/',
});
exports.axiosInstance.interceptors.request.use((config) => {
    config.headers['X-Api-Key'] = 'TIulbo0gre8eKjFtsBAWGMK/VDrIRxfE';
    return config;
});

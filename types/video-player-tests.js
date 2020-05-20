"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var video_player_1 = __importDefault(require("./video-player"));
var player = new video_player_1["default"]('player', {}, false);
player.source('test', {
    sourceTypes: ['mp4/h264']
});
player.play();
player.currentPublicId(); // te

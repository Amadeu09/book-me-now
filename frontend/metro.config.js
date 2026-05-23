const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Exclude .claude from Metro — only relevant when running with volume mounts in Docker dev
config.resolver.blockList = [/[/\\]\.claude[/\\].*/];

module.exports = config;

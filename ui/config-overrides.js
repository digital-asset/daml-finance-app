// Copyright (c) 2024 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const webpack = require('webpack');

module.exports = function override(config, env) {
  config.resolve.fallback = {
    ...config.resolve.fallback,
    "buffer": require.resolve("buffer"),
    "crypto": require.resolve("crypto-browserify"),
    "stream": require.resolve("stream-browserify"),
    "util": require.resolve("util")
  };
  config.plugins = [
    ...config.plugins,
    new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
    }),
    // new webpack.ProvidePlugin({
    //     process: 'process/browser',
    // }),
  ];
  return config;
}

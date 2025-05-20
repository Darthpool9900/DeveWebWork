import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  webpack(config) {
    // Ativa suporte a WebAssembly assíncrono
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    };

    // Define que arquivos `.wasm` são do tipo wasm assíncrono
    config.module.rules.push({
      test: /\.wasm$/,
      type: 'webassembly/async',
    });

    return config;
  },
};

export default nextConfig;

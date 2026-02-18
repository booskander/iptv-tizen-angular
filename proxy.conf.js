const PROXY_CONFIG = {
  "/api": {
    target: "http://ky-tv.cc",
    secure: false,
    changeOrigin: true,
    followRedirects: true,
    pathRewrite: {
      "^/api": ""
    },
    headers: {
      "Origin": "http://ky-tv.cc",
      "Referer": "http://ky-tv.cc/"
    },
    onProxyRes: function(proxyRes, req, res) {
      // Add CORS headers to allow all origins
      proxyRes.headers['Access-Control-Allow-Origin'] = '*';
      proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
      proxyRes.headers['Access-Control-Allow-Headers'] = '*';
    }
  },
  "/live": {
    target: "http://ky-tv.cc",
    secure: false,
    changeOrigin: true,
    followRedirects: true,
    onProxyRes: function(proxyRes) {
      proxyRes.headers['Access-Control-Allow-Origin'] = '*';
    }
  },
  "/movie": {
    target: "http://ky-tv.cc",
    secure: false,
    changeOrigin: true,
    followRedirects: true,
    onProxyRes: function(proxyRes) {
      proxyRes.headers['Access-Control-Allow-Origin'] = '*';
    }
  },
  "/series": {
    target: "http://ky-tv.cc",
    secure: false,
    changeOrigin: true,
    followRedirects: true,
    onProxyRes: function(proxyRes) {
      proxyRes.headers['Access-Control-Allow-Origin'] = '*';
    }
  },
  "/get.php": {
    target: "http://ky-tv.cc",
    secure: false,
    changeOrigin: true,
    followRedirects: true,
    onProxyRes: function(proxyRes) {
      proxyRes.headers['Access-Control-Allow-Origin'] = '*';
    }
  }
};

module.exports = PROXY_CONFIG;

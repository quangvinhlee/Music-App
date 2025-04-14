module.exports = {
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "missing" }],
        destination: "/not-found",
        permanent: false,
      },
    ];
  },
};

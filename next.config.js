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
  images: {
    domains: ["i1.sndcdn.com", "res.cloudinary.com"], // Add the SoundCloud and Cloudinary image domains
  },
};

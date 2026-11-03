// Public URL prefix of uploaded files, which are served from /images.
// Production uses PRODUCTION_IMAGE_URL; anywhere else DEVELOPMENT_IMAGE_URL,
// then PRODUCTION_IMAGE_URL, then this server on localhost.
export const imageBaseUrl = () =>
  (process.env.NODE_ENV === "production"
    ? process.env.PRODUCTION_IMAGE_URL
    : process.env.DEVELOPMENT_IMAGE_URL || process.env.PRODUCTION_IMAGE_URL) ||
  `http://localhost:${process.env.PORT || 8084}/images/`;

export const imageUrl = (file) => imageBaseUrl() + file.filename;

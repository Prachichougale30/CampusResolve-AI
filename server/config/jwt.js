const secret = process.env.JWT_SECRET;

if (!secret || secret.length < 24) {
  throw new Error('JWT_SECRET must be set to a random value of at least 24 characters.');
}

if (secret.length < 32) {
  console.warn('JWT_SECRET should be rotated to a random value of at least 32 characters.');
}

module.exports = secret;

function decodeBase64Image(dataString) {
  const matches = dataString.match(/^data:([A-Za-z-+/0-9]+);base64,(.+)$/);

  if (matches.length !== 3) {
    return new Error('Invalid input string');
  }

  const response = {
    type: matches[1],
    data: Buffer.from(matches[2], 'base64'),
  };

  return response;
}

module.exports = {
  decodeBase64Image,
};

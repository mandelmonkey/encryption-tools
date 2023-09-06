var crypto = require("crypto");
var Buffer = require("buffer/").Buffer;
const characterArray =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

function CeaserTotal(charArray) {
  let total = 0;
  for (let i = 0; i < charArray.length; i += 1) {
    total += characterArray.indexOf(charArray[i]);
  }
  return total;
}
unscramble = function (base64String, ceaser) {
  // Convert the Base64 string back to a Buffer
  const buffer = Buffer.from(base64String, "base64");

  // Extract numbers from the Buffer
  const numbers = [];
  for (let i = 0; i < buffer.length; i += 4) {
    numbers.push(buffer.readUInt32LE(i));
  }
  // Convert numbers to comma-separated string
  const data = numbers.join(",");
  const dataSplit = data.split(",");

  const ceaserTotal = CeaserTotal(ceaser);
  let unscrambled = "";
  for (let i = 0; i < dataSplit.length; i += 1) {
    const char1 = dataSplit[i];
    if (char1.length === 0) {
      // eslint-disable-next-line no-continue
      continue;
    }
    const char1Int = parseInt(char1, 10) / (ceaserTotal + i);
    const char2 = ceaser[i % ceaser.length];
    const index2 = characterArray.indexOf(char2);
    const index3 = char1Int - index2;
    const char = characterArray[index3];
    unscrambled += char;
  }
  return unscrambled;
};

decryptData = function (payload, key, iv) {
  const ivBuffer = new Buffer.from(iv, "base64");

  const keyBuffer = new Buffer.from(key, "base64");

  const decipher = crypto.createDecipheriv("aes-256-cbc", keyBuffer, ivBuffer);
  const encryptdata = new Buffer.from(payload, "base64").toString("binary");
  let decoded = decipher.update(encryptdata, "binary", "utf8");

  decoded += decipher.final("utf8");
  return decoded;
};

decrypt = function (data, key) {
  try {
    const keyArray = key.split(".");
    const dataArray = data.split(".");

    if (keyArray.length != 2) {
      throw new Error("key not correct");
    }

    if (dataArray.length != 2) {
      throw new Error("data not correct");
    }

    const encryptionKey = keyArray[0];
    const ceaser = keyArray[1];
    const encryptedData = dataArray[0];
    const iv = dataArray[1];
    var unscrambled = unscramble(encryptedData, ceaser);
    const decrypted = decryptData(unscrambled, encryptionKey, iv);
    return decrypted;
  } catch (e) {
    throw new Error(e);
  }
};

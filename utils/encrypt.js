const crypto = require("crypto");
const algorithm = "aes-256-cbc"; //Using AES encryption
const key = Buffer.from("3u19lp2tqi6jyrgvyuuzacpellycmsog");
const iv = Buffer.from("73zu90l69ex82x9n");

//Encrypting text
exports.encrypt = (text) => {
  let cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(key), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return { iv: iv.toString("hex"), encryptedData: encrypted.toString("hex") };
};

// Decrypting text
exports.decrypt = (text) => {
  let encryptedText = Buffer.from(text.encryptedData, "hex");
  let decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(key), iv);
  decipher.setAutoPadding(false);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
};

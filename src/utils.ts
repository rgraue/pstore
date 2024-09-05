import crypto from 'crypto';
import { Pass } from './passfile';

const createKey = (pwd: string, salt: string) => {
  return crypto.pbkdf2Sync(pwd, salt, 100000, 32, 'sha512');
};

// use static iv and salt, so that the only thing the user needs to enter is the password
export const hash = (pwd: string, toHash: string, iv: string, salt: string) => {
  const cipher = crypto.createCipheriv(
    'aes-256-gcm',
    createKey(pwd, salt),
    Buffer.from(iv, 'base64'),
  );

  let result = cipher.update(toHash, 'utf-8', 'base64');
  result += cipher.final('base64');

  const tag = cipher.getAuthTag().toString('base64');
  return result + tag; // tag is **always** 24 char long. famous last words
};

export const decrypt = (
  pwd: string,
  toDecrypt: string,
  iv: string,
  salt: string,
) => {
  const val = toDecrypt.slice(0, -24);
  const tag = toDecrypt.slice(-24);

  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    createKey(pwd, salt),
    Buffer.from(iv, 'base64'),
  );

  decipher.setAuthTag(Buffer.from(tag, 'base64'));

  let result = decipher.update(val, 'base64', 'utf8');
  result += decipher.final('utf8');
  return result;
};

export const prettyPrintPass = (nickname: string, pass: Pass) => {
  let result = '';

  const indent = 20;

  result += `${nickname.padEnd(indent, ' ')}${pass.username}\n`;
  pass.url ? (result += `${''.padEnd(indent, ' ')}${pass.url}\n`) : null;
  result += `${''.padEnd(indent, ' ')}${pass.password}\n\n`;

  console.log(result);
};

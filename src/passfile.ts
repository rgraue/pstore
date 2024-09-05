import crypto from 'crypto';
import { decrypt, hash } from './utils';

export interface Pass {
  username: string;
  password: string;
  url?: string;
}

export interface PassFile {
  [nickname: string]: Pass;
}

export const CHECK = '__check';

// we dont know iv and salt at this point
export const findCheckEntry = (pwd: string, pf: PassFile) => {
  const found = Object.keys(pf).filter((val, index, a) => {
    try {
      const toCheck = pf[val];

      const iv = toCheck.username;
      const salt = toCheck.password;

      const decrypted = decrypt(pwd, val, iv, salt);

      return decrypted === CHECK;
    } catch {
      return false;
    }
  });

  if (found.length < 1) {
    return null;
  }

  // always get first, cuz... i want to
  return pf[found[0]];
};

export const initPassFile = (password: string): PassFile => {
  const initSalt = crypto.randomBytes(16).toString('base64');
  const initIv = crypto.randomBytes(12).toString('base64');

  const hashedCheck = hash(password, CHECK, initIv, initSalt);
  const result: PassFile = {};

  result[hashedCheck] = {
    username: initIv,
    password: initSalt,
  };

  return result;
};

export const encryptEntry = (
  pwd: string,
  toEncrypt: Pass,
  iv: string,
  salt: string,
): Pass => {
  try {
    const hashedUsername = hash(pwd, toEncrypt.username, iv, salt);
    const hasehdPassword = hash(pwd, toEncrypt.password, iv, salt);
    const hashedUrl = toEncrypt.url ? hash(pwd, toEncrypt.url, iv, salt) : null;

    const encryptedPass: Pass = {
      username: hashedUsername,
      password: hasehdPassword,
    };

    if (hashedUrl) {
      encryptedPass.url = hashedUrl;
    }

    return encryptedPass;
  } catch {
    throw new Error('unable to encrypt');
  }
};

export const decryptEntry = (
  pwd: string,
  pass: Pass,
  iv: string,
  salt: string,
) => {
  try {
    const result: Pass = {
      username: decrypt(pwd, pass.username, iv, salt),
      password: decrypt(pwd, pass.password, iv, salt),
    };

    if (pass.url) {
      result.url = decrypt(pwd, pass.url, iv, salt);
    }

    // console.log(result);

    return result;
  } catch (e) {
    // console.log(e)
    throw new Error(`unable to decrypt ${pass}`);
  }
};

export const findEntry = (
  pwd: string,
  key: string,
  pf: PassFile,
  iv: string,
  salt: string,
) => {
  const encryptedKey = hash(pwd, key, iv, salt);

  const result = pf[encryptedKey];

  if (!result) {
    throw new Error(`entry not found: ${key}`);
  }

  return result;
};

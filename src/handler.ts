import {
  decryptEntry,
  encryptEntry,
  findEntry,
  Pass,
  PassFile,
} from './passfile';
import { decrypt, hash, prettyPrintPass } from './utils';
import { input, password } from '@inquirer/prompts';

export const handleAdd = async (
  pwd: string,
  opts: string[],
  pf: PassFile,
  iv: string,
  salt: string,
): Promise<PassFile> => {
  try {
    validateAddOpts(opts);

    // question block
    const nickname = await input({ message: 'provide nickname for entry' });
    const username = await input({ message: 'username/email' });
    const p = await password({ message: 'password', mask: '*' });
    const url = await input({ message: 'url (hit enter if none)' });

    const pass: Pass = {
      username: username,
      password: p,
    };

    if (url && url !== '') {
      pass.url = url;
    }

    const encryptedNickname = hash(pwd, nickname, iv, salt);

    const encryptedEntry = encryptEntry(pwd, pass, iv, salt);
    pf[encryptedNickname] = encryptedEntry;

    return pf;
  } catch (e) {
    console.log((e as Error).message);
    return pf;
  }
};

export const validateAddOpts = (opts: string[]) => {
  if (opts.length > 0) {
    throw new Error('add does not take any parameters');
  }
};

export const handleList = (
  pwd: string,
  opts: string[],
  pf: PassFile,
  iv: string,
  salt: string,
) => {
  try {
    validateListOpts(opts);
    Object.keys(pf).forEach((val, index, a) => {
      // try needed due to check entry not folling the similar encryption pattern
      try {
        const encryptedEntry = pf[val];
        const decryptedEntry = decryptEntry(pwd, encryptedEntry, iv, salt);

        prettyPrintPass(decrypt(pwd, val, iv, salt), decryptedEntry);
      } catch {
        null;
      }
    });
  } catch (e) {
    console.log((e as Error).message);
  }
};

export const validateListOpts = (opts: string[]) => {
  if (opts.length > 0) {
    throw new Error('List does not take any parameters');
  }
};

export const handleGet = (
  pwd: string,
  opts: string[],
  pf: PassFile,
  iv: string,
  salt: string,
) => {
  try {
    const key = validateGetOpts(opts);

    const encryptedEntry = findEntry(pwd, key, pf, iv, salt);
    const decryptedEntry = decryptEntry(pwd, encryptedEntry, iv, salt);

    if (!decryptedEntry) {
      throw new Error(`error decrypting: ${opts}`);
    }

    prettyPrintPass(key, decryptedEntry!);
  } catch (e) {
    console.log((e as Error).message);
  }
};

export const validateGetOpts = (opts: string[]) => {
  if (!opts) {
    throw new Error('no key given');
  }

  if (opts.length > 1) {
    throw new Error('provide just one key to find');
  }

  if (opts.length < 1) {
    throw new Error('no key given');
  }

  return opts[0];
};

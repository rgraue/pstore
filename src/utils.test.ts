import { findCheckEntry, initPassFile } from './passfile';
import { decrypt, hash } from './utils';

describe('test password hashing', () => {
  it('encrypt and decrypt', async () => {
    const pwd = 'test123fdsfsddsfdsfsdfsdfsdfdsfsdfds';
    const val = 'test';
    const salt = '7a ea 6f ea 9d 51 1a 3d 18 c3 b0 f9 60 3a 51 4d';
    const iv = '7a ea 6f ea 9d 51 1a 3d 18 c3 b0 f9';

    const hashed = hash(pwd, val, iv, salt);
    const hashed2 = hash(pwd, val, iv, salt);

    // these being equals means that the hashing is only dependent on the pwd
    // not the most secure, but fine for this application
    expect(hashed).toEqual(hashed2);

    const decrypted = decrypt(pwd, hashed, iv, salt);

    expect(decrypted).toEqual(val);
  });
});

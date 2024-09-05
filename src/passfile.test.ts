import {
  decryptEntry,
  encryptEntry,
  findCheckEntry,
  initPassFile,
  Pass,
} from './passfile';

describe('Test PassFile Hashing function', () => {
  it('creates initial PassFile from password only', async () => {
    const pwd = 'PASSWORD';
    const pf = initPassFile(pwd);

    expect(pf).toBeDefined();
  });

  it('findsCheckEntry', async () => {
    const pwd = 'PASSWORD';
    const pf = initPassFile(pwd);

    const notFound = findCheckEntry('wrong', pf);
    const foundPF = findCheckEntry(pwd, pf);

    // safe assumption because no other entries should exist
    var expectedKey = Object.keys(pf)[0];

    expect(notFound).toBeNull();
    expect(foundPF).toEqual(pf[expectedKey]);
  });

  it('hashed/decrypt custom entry', () => {
    const pwd = 'PASSWORD';
    const pf = initPassFile(pwd);

    const checkEntry = findCheckEntry(pwd, pf);
    const iv = checkEntry!.username;
    const salt = checkEntry!.password;

    const expectedPass: Pass = {
      username: 'testuser',
      password: 'testpass',
      url: 'blah',
    };

    const encrytped = encryptEntry(pwd, expectedPass, iv, salt);
    expect(encrytped).toBeDefined();
    expect(encrytped).not.toEqual(expectedPass);

    const decrypted = decryptEntry(pwd, encrytped!, iv, salt);
    expect(decrypted).toEqual(expectedPass);
  });

  it('hash and unhash custom entry', () => {
    const pwd = 'PASSWORD';
    const pf = initPassFile(pwd);

    const checkEntry = findCheckEntry(pwd, pf);

    const iv = checkEntry?.username;
    const salt = checkEntry?.password;

    const payload: Pass = {
      username: 'test',
      password: 'test',
      url: 'test',
    };

    const encryptedEntry = encryptEntry(pwd, payload, iv!, salt!);
    console.log();
    expect(encryptEntry).not.toEqual(payload);

    const decrypted = decryptEntry(pwd, encryptedEntry, iv!, salt!);
    console.log(decrypted);
    expect(decrypted).toEqual(payload);
  });
});

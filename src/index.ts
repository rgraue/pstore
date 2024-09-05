#!/usr/bin/env node
import * as fs from 'fs';
import * as path from 'path';
import { password, input } from '@inquirer/prompts';
import { findCheckEntry, initPassFile, Pass, PassFile } from './passfile';
import { handleAdd, handleGet, handleList } from './handler';

const dbFolder = path.resolve(__dirname, 'db');
const dbPath = dbFolder + "/db.json";

const getPassFile = (): PassFile | null => {
  try {
    const data = fs.readFileSync(dbPath).toString();

    return JSON.parse(data);
  } catch (e) {
    return null;
  }
};

const makeNewPassFile = async (): Promise<PassFile> => {
  console.log('no password file found\ncreating new one\n\n');
  const pwd = await password({ message: 'enter master password', mask: '*' });
  const init = initPassFile(pwd);

  if (!fs.existsSync(dbFolder)) {
    fs.mkdirSync(dbFolder);
  }

  await fs.writeFileSync(dbPath, JSON.stringify(init));

  return init;
};

const login = (pwd: string, pf: PassFile) => {
  const entry = findCheckEntry(pwd, pf);

  const iv = entry ? entry.username : null;
  const salt = entry ? entry.password : null;

  return { iv, salt };
};

(async () => {
  try {
    const existingPassFile = getPassFile();

    let passFile = existingPassFile
      ? existingPassFile
      : await makeNewPassFile();
    const pwd = await password({ message: 'enter master password', mask: '*' });
    const { iv, salt } = login(pwd, passFile);

    let isLoggedIn = !!pwd && !!iv && !!salt;

    if (isLoggedIn) {
      console.log('welcome');
    } else {
      console.log('password incorrect');
    }

    while (isLoggedIn) {
      const cmdAndOpts = (
        await input({ message: 'add | get | list | exit\n' })
      ).split(' ');

      const cmd = cmdAndOpts[0];
      const opts = cmdAndOpts.slice(1, cmdAndOpts.length);

      // main switchboard
      switch (cmd) {
        case 'add':
          passFile = await handleAdd(pwd, opts, passFile, iv!, salt!);
          await fs.writeFileSync(dbPath, JSON.stringify(passFile));
          break;
        case 'get':
          handleGet(pwd, opts, passFile, iv!, salt!);
          break;
        case 'list':
          handleList(pwd, opts, passFile, iv!, salt!);
          break;
        case 'exit':
          isLoggedIn = !isLoggedIn;
          break;
        default:
          console.log(`not a valid command: ${cmd}`);
          break;
      }
    }

    console.log('goodbye');
  } catch (e) {
    // console.log(e); uncomment to debug
    console.log('goodbye');
  }
})();

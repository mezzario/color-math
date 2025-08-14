#!/usr/bin/env node

import {rm} from 'fs/promises';
import {existsSync} from 'fs';
import {dirname, join} from 'path';
import {fileURLToPath} from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

const directories = ['lib', 'dist', 'es'];

async function clean() {
  for (const dir of directories) {
    const dirPath = join(rootDir, dir);
    if (existsSync(dirPath)) {
      try {
        await rm(dirPath, {recursive: true, force: true});
        console.log(`✓ Removed ${dir}/`);
      } catch (error) {
        console.error(`✗ Failed to remove ${dir}/:`, error.message);
        process.exit(1);
      }
    }
  }
  console.log('Clean completed!');
}

clean();

import fs from 'fs';
import { Parser } from 'expr-eval';
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

const rl = readline.createInterface({ input, output });

const promptTemplate = fs.readFileSync('prompt_template.txt', 'utf-8');
const mergeTemplate = fs.readFileSync('merge_template.txt', 'utf-8');

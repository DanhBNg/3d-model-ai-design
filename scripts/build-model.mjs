import { spawn } from 'node:child_process';
import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
const local = existsSync('tools/local.json') ? JSON.parse(readFileSync('tools/local.json','utf8')) : {};
const bin = process.env.BLENDER_BIN || local.blenderBin || 'blender';
const args = process.argv.slice(2);
const file = args.includes('--motion') ? 'verify_motion.py' : args.includes('--verify') ? 'verify.py' : args.includes('--render') ? 'render.py' : 'build.py';
mkdirSync('output', {recursive:true});
const child = spawn(bin, ['--background','--factory-startup','--python',resolve('blender/drone',file),'--',...args], {stdio:['ignore','pipe','pipe']});
let log='';
child.stdout.on('data', b=>{log+=b;process.stdout.write(b)});
child.stderr.on('data', b=>{log+=b;process.stderr.write(b)});
child.on('error', e=>{console.error('Set BLENDER_BIN to Blender 5.2.2 executable:',e.message);process.exitCode=1});
child.on('close',code=>{
  writeFileSync(`output/${file}.log`,log);
  const markers=log.match(/^AGENT_(OK|FAIL).*$/gm) || [];
  if(code!==0 || !markers.at(-1)?.startsWith('AGENT_OK')){console.error('Blender did not finish with AGENT_OK. See output log.');process.exitCode=1;}
});

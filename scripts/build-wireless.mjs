import { spawn } from 'node:child_process';
import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
const local=existsSync('tools/local.json')?JSON.parse(readFileSync('tools/local.json','utf8')):{};
const args=process.argv.slice(2),file=args.includes('--verify')?'verify.py':args.includes('--render')?'render.py':'build.py';
mkdirSync('output/wireless-charging',{recursive:true});
const child=spawn(process.env.BLENDER_BIN||local.blenderBin||'blender',['--background','--factory-startup','--disable-autoexec','--python-exit-code','3','--python',resolve('blender/wireless-charging',file),'--',...args],{stdio:['ignore','pipe','pipe']});
let log='';for(const s of [child.stdout,child.stderr])s.on('data',b=>{log+=b;process.stdout.write(b)});
child.on('error',e=>{console.error(e);process.exitCode=1});
child.on('close',code=>{writeFileSync(`output/wireless-charging/${file}${args.includes('--blockout')?'-blockout':''}.log`,log);if(code!==0||!(log.match(/^AGENT_(OK|FAIL).*$/gm)||[]).at(-1)?.startsWith('AGENT_OK'))process.exitCode=1;});



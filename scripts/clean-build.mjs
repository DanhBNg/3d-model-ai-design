import { mkdirSync,cpSync,copyFileSync,writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
const target=resolve('.test-build');mkdirSync(target,{recursive:true});
for(const file of ['package.json','package-lock.json','vite.config.js','index.html'])copyFileSync(file,resolve(target,file));
for(const dir of ['src','public'])cpSync(dir,resolve(target,dir),{recursive:true});
const logs=[];
for(const args of [['ci','--no-audit','--no-fund'],['run','build']]){
 const result=spawnSync(process.platform==='win32'?'npm.cmd':'npm',args,{cwd:target,encoding:'utf8',shell:process.platform==='win32'});
 logs.push({command:'npm '+args.join(' '),status:result.status,stdout:result.stdout,stderr:result.stderr});
 console.log(result.stdout);if(result.status!==0){console.error(result.stderr);writeFileSync('output/clean-build.json',JSON.stringify({passed:false,logs},null,2));process.exit(result.status||1);}
}
writeFileSync('output/clean-build.json',JSON.stringify({passed:true,scope:'fresh node_modules in isolated workspace directory; copied source and assets only',logs},null,2));

import {PARTS,PART_BY_ID,LESSONS} from '../../models/wind-turbine/metadata.js';
import { flowDiagram, flowLegend, modelHeader } from '../../ui/model-shell/markup.js';

export function mountWindUI(host){
 const header=modelHeader({modeAttribute:'wmode',brand:'VENTO',code:'03',principleLabel:'Nguyên lý',version:'V.02',homeId:'wind-back'});
 host.innerHTML=`<div class="wind-app model-shell">
 ${header}
 <main class="wind-workspace model-workspace"><section class="wind-stage model-stage"><div id="wind-viewport"></div>
 <div class="wind-heading"><p>NĂNG LƯỢNG TỪ CHUYỂN ĐỘNG</p><h1>Đón gió.<br>Tạo năng lượng<span>.</span></h1><span id="wind-subtitle">Tua-bin ba cánh · hệ truyền động có hộp số</span></div>
 <div class="wind-views model-view-tools" aria-label="Góc nhìn"><button data-wview="hero">Rotor</button><button data-wview="whole">Toàn bộ</button><button data-wview="machine">Khoang máy</button><button data-wview="rear">Mặt sau</button></div>
 <div id="wind-loading" class="model-loading" role="status">Đang tải tua-bin…</div><div id="wind-label" hidden></div>
 <div class="wind-stage-footer"><span>Kéo để xoay · Cuộn / chụm để zoom</span><span id="wind-stats"></span></div>
 <div id="wind-explode-panel" class="wind-floating model-explode-card" hidden><div><strong>Tách cấu tạo</strong><output id="wind-explode-value">0%</output></div><p>Mở vỏ trước, tách các cụm theo trục lắp.</p><input id="wind-explode" aria-label="Mức tách cấu tạo" type="range" min="0" max="100" value="70"><div><button id="wind-auto">▷ Tự tách / lắp</button><button id="wind-assemble">Lắp lại</button></div></div>
 <div id="wind-flow-legend" class="wind-flow-legend" hidden>${flowLegend([{label:'Gió & cơ năng',kind:'control'},{label:'Điện năng',kind:'energy'}])}</div>
 </section>
 <aside class="wind-panel model-inspector"><div class="wind-panel-top"><p>KHÁM PHÁ HỆ THỐNG <span>${PARTS.length} CỤM</span></p><h2 id="wind-part-name">Từ gió đến điện.</h2><p id="wind-part-description">Chọn trực tiếp trên mô hình hoặc trong danh sách để xem vai trò của từng bộ phận.</p><div class="wind-actions"><button id="wind-cutaway" aria-pressed="false">Mở vỏ</button><button id="wind-isolate" disabled aria-pressed="false">Xem riêng</button><button id="wind-focus" disabled>Xem gần</button></div></div>
 <section id="wind-principle-panel" hidden>
 <div class="wind-flow">${flowDiagram(['Gió','Rotor','Hộp số','Máy phát'])}</div>
 <div class="wind-metrics"><div><output id="wind-rpm">0</output><small>RPM ROTOR</small></div><div><output id="wind-generator">0</output><small>RPM MÁY PHÁT</small></div><div><output id="wind-power">0</output><small>kW MINH HỌA</small></div></div>
 <p id="wind-status" role="status"></p>
 <label class="wind-slider">Tốc độ gió <output id="wind-speed-value">9 m/s</output><input id="wind-speed" type="range" min="0" max="30" step=".5" value="9"></label>
 <label class="wind-slider">Hướng gió <output id="wind-direction-value">0°</output><input id="wind-direction" type="range" min="-180" max="180" step="5" value="0"></label>
 <div class="wind-presets"><button data-speed="2">Gió yếu</button><button data-speed="9">Phát điện</button><button data-speed="17">Định mức</button><button data-speed="27">Gió mạnh</button></div>
 <div class="wind-playback model-playback"><button id="wind-play">Ⅱ Tạm dừng</button><button id="wind-slow" aria-pressed="false">0,25×</button><span id="wind-pitch">Pitch 2°</span></div>
 <div class="wind-lesson"><p>THEO DÒNG NĂNG LƯỢNG</p><div class="wind-steps">${LESSONS.map((l,i)=>`<button data-lesson="${i}" title="${l.title}" aria-pressed="false">0${i+1}</button>`).join('')}</div><h3 id="wind-lesson-title"></h3><p id="wind-lesson-text"></p><div><button id="wind-lesson-focus">Xem vị trí ↗</button><button id="wind-lesson-auto" aria-pressed="false">Tự chuyển bước</button></div></div>
 <p class="wind-note">Mô hình giáo dục · chuyển động hiển thị chậm 0,32×. Hộp số minh họa 6:1; luồng gió và công suất được giản lược, không phải CFD.</p>
 </section>
 <details class="wind-parts" open><summary>Danh mục bộ phận</summary><div>${PARTS.map((p,i)=>`<button data-wpart="${p.id}" aria-pressed="false"><small>${String(i+1).padStart(2,'0')}</small><span>${p.name}</span><b>↗</b></button>`).join('')}</div></details>
 <button id="wind-reset" class="wind-reset">↺ Đặt lại mô hình</button>
 </aside></main><footer class="wind-footer model-bottom-bar"><span>GIÓ → CƠ NĂNG → ĐIỆN NĂNG</span><span>Mô hình giáo dục · VENTO 03</span></footer></div>`;
}

export function connectWindUI(host,c,studio,onExit,r){
 const abort=new AbortController(),$=s=>host.querySelector(s),listen=(el,ev,fn)=>el.addEventListener(ev,fn,{signal:abort.signal});
 function selected(id){c.select(id);const p=PART_BY_ID[id];$('#wind-part-name').textContent=p?.name||'Từ gió đến điện.';$('#wind-part-description').textContent=p?.description||'Chọn một bộ phận để khám phá cấu tạo.';$('#wind-isolate').disabled=!id;$('#wind-focus').disabled=!id;}
 listen($('#wind-back'),'click',e=>{e.preventDefault();onExit();});
 for(const b of host.querySelectorAll('[data-wmode]'))listen(b,'click',()=>{c.setMode(b.dataset.wmode);studio.view(c.state.mode==='explore'?'hero':c.state.mode==='explode'?'explode':'machine');$('.wind-parts').open=c.state.mode!=='principle';});
 for(const b of host.querySelectorAll('[data-wview]'))listen(b,'click',()=>{if(['machine','rear'].includes(b.dataset.wview))c.setCutaway(true);studio.view(b.dataset.wview);});
 for(const b of host.querySelectorAll('[data-wpart]'))listen(b,'click',()=>selected(b.dataset.wpart));
 listen($('#wind-cutaway'),'click',()=>{c.setCutaway(!c.state.cutaway);if(c.state.cutaway)studio.view('machine');});
 listen($('#wind-isolate'),'click',()=>{c.setIsolated(!c.state.isolated);if(c.state.isolated)studio.focus(r.nodes[c.state.selected]);else studio.view(c.state.mode==='explode'?'explode':'machine');});
 listen($('#wind-focus'),'click',()=>studio.focus(r.nodes[c.state.selected]));
 listen($('#wind-explode'),'input',e=>c.setExplode(+e.target.value/100));listen($('#wind-auto'),'click',()=>c.toggleAuto());listen($('#wind-assemble'),'click',()=>c.setExplode(0));
 listen($('#wind-speed'),'input',e=>c.setWind(+e.target.value));listen($('#wind-direction'),'input',e=>c.setDirection(+e.target.value*Math.PI/180));
 for(const b of host.querySelectorAll('[data-speed]'))listen(b,'click',()=>c.setWind(+b.dataset.speed));
 listen($('#wind-play'),'click',()=>c.setPlaying(!c.state.playing));listen($('#wind-slow'),'click',()=>c.setSlow(!c.state.slow));
 for(const b of host.querySelectorAll('[data-lesson]'))listen(b,'click',()=>c.setLesson(+b.dataset.lesson));
 listen($('#wind-lesson-focus'),'click',()=>{const id=LESSONS[c.state.lesson].part;selected(id);studio.focus(r.nodes[id]);});listen($('#wind-lesson-auto'),'click',()=>c.toggleLesson());
 listen($('#wind-reset'),'click',()=>{c.reset();selected(null);studio.view('hero');$('.wind-parts').open=true;});
 let last=0;
 return {selected,update(now){if(now-last<80)return;last=now;const s=c.state;$('.wind-app').dataset.windMode=s.mode;
  for(const b of host.querySelectorAll('[data-wmode]'))b.setAttribute('aria-pressed',String(b.dataset.wmode===s.mode));
  for(const b of host.querySelectorAll('[data-wpart]'))b.setAttribute('aria-pressed',String(b.dataset.wpart===s.selected));
  $('#wind-explode-panel').hidden=s.mode!=='explode';$('#wind-principle-panel').hidden=s.mode!=='principle';$('#wind-flow-legend').hidden=s.mode!=='principle';
  $('#wind-explode-value').textContent=`${Math.round(s.explode*100)}%`;$('#wind-explode').value=Math.round(s.explodeTarget*100);
  $('#wind-cutaway').setAttribute('aria-pressed',String(s.cutaway));$('#wind-isolate').setAttribute('aria-pressed',String(s.isolated));$('#wind-auto').textContent=s.auto?'Ⅱ Dừng tự tách':'▷ Tự tách / lắp';$('#wind-cutaway').textContent=s.cutaway?'Đóng vỏ':'Mở vỏ';$('#wind-cutaway').disabled=s.mode!=='explore';$('#wind-isolate').textContent=s.isolated?'Hiện tất cả':'Xem riêng';
  $('#wind-rpm').textContent=s.rpm.toFixed(1);$('#wind-generator').textContent=(s.rpm*6).toFixed(0);$('#wind-power').textContent=Math.round(s.power).toLocaleString('vi-VN');
  $('#wind-status').textContent=s.transition?'Đang lắp lại trước khi vận hành…':s.status;$('#wind-speed-value').textContent=`${s.wind} m/s`;$('#wind-direction-value').textContent=`${Math.round(s.direction*180/Math.PI)}°`;
  $('#wind-speed').value=s.wind;$('#wind-direction').value=s.direction*180/Math.PI;$('#wind-play').textContent=s.playing?'Ⅱ Tạm dừng':'▷ Chạy';$('#wind-slow').setAttribute('aria-pressed',String(s.slow));$('#wind-pitch').textContent=`Pitch ${s.pitch.toFixed(0)}°`;
  const l=LESSONS[s.lesson];$('#wind-lesson-title').textContent=l.title;$('#wind-lesson-text').textContent=l.text;$('#wind-lesson-auto').setAttribute('aria-pressed',String(s.lessonAuto));
  for(const b of host.querySelectorAll('[data-lesson]'))b.setAttribute('aria-pressed',String(+b.dataset.lesson===s.lesson));
 },dispose(){abort.abort();}};
}

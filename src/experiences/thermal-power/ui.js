import {PARTS,PART_BY_ID} from '../../models/thermal-power/metadata.js';
import {LESSONS} from '../../models/thermal-power/lesson.js';

export function mountThermalUI(host){
 host.innerHTML=`<main class="thermal-app">
 <header class="thermal-header"><button id="thermal-back" title="Về bộ sưu tập">← <span>Bộ sưu tập</span></button><strong>THERMO <em>/ 04</em></strong><nav aria-label="Chế độ nhà máy">${[['explore','Khám phá'],['explode','Tách cấu tạo'],['principle','Nguyên lý']].map(([id,t],i)=>`<button data-tmode="${id}" aria-pressed="${i===0}"><small>0${i+1}</small>${t}</button>`).join('')}</nav><span class="thermal-live">● ENERGY LAB</span></header>
 <section class="thermal-stage"><div id="thermal-viewport"></div>
 <div class="thermal-heading"><p>NHIỆT → CƠ NĂNG → ĐIỆN</p><h1>Từ ngọn lửa<br>đến dòng điện<span>.</span></h1><span id="thermal-subtitle">Một tổ máy than · chu trình hơi có tái nhiệt</span></div>
 <div class="thermal-views" aria-label="Góc nhìn">${[['hero','Toàn cảnh'],['machine','Tổ máy'],['boiler','Lò hơi'],['cooling','Giải nhiệt'],['rear','Mặt sau']].map(([id,t])=>`<button data-tview="${id}">${t}</button>`).join('')}</div>
 <div id="thermal-loading" role="status">Đang tải nhà máy…</div><div id="thermal-label" hidden></div>
 <div class="thermal-stage-footer"><span>Kéo để xoay · Cuộn / chụm để zoom</span><span id="thermal-stats"></span></div>
 <div id="thermal-explode-panel" class="thermal-floating" hidden><div><strong>Tách cấu tạo</strong><output id="thermal-explode-value">0%</output></div><p>Mở bao che, nâng nắp máy, rồi tách cụm bên trong.</p><input id="thermal-explode" aria-label="Mức tách cấu tạo" type="range" min="0" max="100" value="0"><div><button id="thermal-auto">▷ Tự tách / lắp</button><button id="thermal-assemble">Lắp lại</button></div></div>
 </section>
 <aside class="thermal-panel"><div class="thermal-panel-top"><p>KHÁM PHÁ HỆ THỐNG <span>${PARTS.length} CỤM</span></p><h2 id="thermal-part-name">Một vòng tuần hoàn.</h2><p id="thermal-part-description">Mở bao che để nhìn tổ máy. Chọn trên mô hình hoặc trong danh mục để khám phá từng bộ phận.</p><div class="thermal-actions"><button id="thermal-cutaway">Mở vỏ</button><button id="thermal-isolate" disabled>Xem riêng</button><button id="thermal-focus" disabled>Xem gần</button></div></div>
 <section id="thermal-principle-panel" hidden>
 <div class="thermal-metrics"><div><output id="thermal-power">0</output><small>MW ĐIỆN</small></div><div><output id="thermal-rpm">0</output><small>RPM MÁY PHÁT</small></div><div><output id="thermal-heat">0</output><small>MW NHIỆT VÀO</small></div></div>
 <p id="thermal-status" role="status"></p>
 <label class="thermal-slider">Mức tải yêu cầu <output id="thermal-load-value">70%</output><input id="thermal-load" type="range" min="0" max="100" step="5" value="70"></label>
 <div class="thermal-presets"><button data-tload="0">0%</button><button data-tload=".5">50%</button><button data-tload=".7">70%</button><button data-tload="1">100%</button></div>
 <div class="thermal-playback"><button id="thermal-play">Ⅱ Tạm dừng</button><button id="thermal-slow" aria-pressed="false">0,25×</button><button id="thermal-cooling" aria-pressed="true">Làm mát: bật</button></div>
 <label class="thermal-filter">Hiện tuyến năng lượng<select id="thermal-flow"><option value="lesson">Theo bước đang học</option><option value="all">Toàn hệ thống</option><option value="steam">Hơi / tái nhiệt</option><option value="feed">Nước cấp</option><option value="cooling">Nước làm mát</option><option value="electric">Điện</option><option value="flue">Khí thải</option></select></label>
 <div class="thermal-legend"><span style="--flow:#ff9d49">Hơi</span><span style="--flow:#55dce8">Nước cấp</span><span style="--flow:#549eff">Làm mát</span><span style="--flow:#86dc99">Cơ năng</span><span style="--flow:#ffe484">Điện</span><span style="--flow:#b6b8bb">Khí thải</span></div>
 <div class="thermal-lesson"><p>THEO DÒNG NĂNG LƯỢNG</p><div class="thermal-steps">${LESSONS.map((l,i)=>`<button data-tlesson="${i}" title="${l.title}" aria-label="Bước ${i+1}: ${l.title}">0${i+1}</button>`).join('')}</div><h3 id="thermal-lesson-title"></h3><p id="thermal-lesson-text"></p><div><button id="thermal-lesson-focus">Xem vị trí ↗</button><button id="thermal-lesson-auto">Tự chuyển bước</button></div></div>
 <p class="thermal-note">Mô hình giáo dục 100 MW, hiệu suất cố định 36%. Máy phát nối lưới giữ 3.000 RPM khi mang tải; hình quay đã giảm tốc để quan sát. Nước cấp và nước làm mát không trộn nhau. Tháp giải nhiệt không phải ống khói.</p>
 <details class="thermal-limits"><summary>Phạm vi minh họa</summary><p>Không mô phỏng đầy đủ gia nhiệt hồi nhiệt, khử khí, xử lý nước hay khử SOx/NOx. Cụm lọc bụi không đại diện toàn bộ hệ thống xử lý khí thải. Các giá trị chỉ minh họa, không dùng để vận hành nhà máy.</p></details>
 </section>
 <details class="thermal-parts" open><summary>Danh mục bộ phận</summary><div>${PARTS.map((p,i)=>`<button data-tpart="${p.id}"><small>${String(i+1).padStart(2,'0')}</small><span>${p.name}</span><b>↗</b></button>`).join('')}</div></details>
 <button id="thermal-reset" class="thermal-reset">↺ Đặt lại mô hình</button>
 </aside></main>`;
}

export function connectThermalUI(host,c,studio,onExit,r){
 const abort=new AbortController(),$=s=>host.querySelector(s),listen=(el,ev,fn)=>el.addEventListener(ev,fn,{signal:abort.signal});
 const buttons={modes:[...host.querySelectorAll('[data-tmode]')],parts:[...host.querySelectorAll('[data-tpart]')],lessons:[...host.querySelectorAll('[data-tlesson]')]};
 function selected(id){c.select(id);syncSelection();}
 let previousSelected;
 function syncSelection(){const id=c.state.selected;if(id===previousSelected)return;previousSelected=id;const p=PART_BY_ID[id];$('#thermal-part-name').textContent=p?.name||'Một vòng tuần hoàn.';$('#thermal-part-description').textContent=p?.description||'Mở bao che để nhìn tổ máy. Chọn trên mô hình hoặc trong danh mục để khám phá từng bộ phận.';$('#thermal-isolate').disabled=!id;$('#thermal-focus').disabled=!id;}
 listen($('#thermal-back'),'click',onExit);
 for(const b of buttons.modes)listen(b,'click',()=>{c.setMode(b.dataset.tmode);studio.view(c.state.mode==='explode'?'explode':'hero');$('.thermal-parts').open=c.state.mode!=='principle';});
 for(const b of host.querySelectorAll('[data-tview]'))listen(b,'click',()=>{if(['machine','boiler'].includes(b.dataset.tview))c.setCutaway(true);studio.view(b.dataset.tview);});
 for(const b of buttons.parts)listen(b,'click',()=>selected(b.dataset.tpart));
 listen($('#thermal-cutaway'),'click',()=>{c.setCutaway(!c.state.cutaway);});
 listen($('#thermal-isolate'),'click',()=>{c.setIsolated(!c.state.isolated);if(c.state.isolated)studio.focus(r.nodes[c.state.selected]);else studio.view('hero');});
 listen($('#thermal-focus'),'click',()=>studio.focus(r.nodes[c.state.selected]));
 listen($('#thermal-explode'),'input',e=>c.setExplode(+e.target.value/100));listen($('#thermal-auto'),'click',()=>c.toggleAuto());listen($('#thermal-assemble'),'click',()=>c.setExplode(0));
 listen($('#thermal-load'),'input',e=>c.setLoad(+e.target.value/100));for(const b of host.querySelectorAll('[data-tload]'))listen(b,'click',()=>c.setLoad(+b.dataset.tload));
 listen($('#thermal-cooling'),'click',()=>c.setCooling(!c.state.cooling));listen($('#thermal-play'),'click',()=>c.setPlaying(!c.state.playing));listen($('#thermal-slow'),'click',()=>c.setSlow(!c.state.slow));listen($('#thermal-flow'),'change',e=>c.setFlowFilter(e.target.value));
 for(const b of buttons.lessons)listen(b,'click',()=>c.setLesson(+b.dataset.tlesson));
 listen($('#thermal-lesson-focus'),'click',()=>{const id=LESSONS[c.state.lesson].part;selected(id);studio.focus(r.nodes[id]);});listen($('#thermal-lesson-auto'),'click',()=>c.toggleLesson());
 listen($('#thermal-reset'),'click',()=>{c.reset();syncSelection();studio.view('hero');$('.thermal-parts').open=true;});
 let last=-Infinity;
 return {selected,update(now){if(now-last<80)return;last=now;const s=c.state;syncSelection();$('.thermal-app').dataset.thermalMode=s.mode;
  for(const b of buttons.modes)b.setAttribute('aria-pressed',String(b.dataset.tmode===s.mode));for(const b of buttons.parts)b.setAttribute('aria-pressed',String(b.dataset.tpart===s.selected));
  $('#thermal-explode-panel').hidden=s.mode!=='explode';$('#thermal-principle-panel').hidden=s.mode!=='principle';$('#thermal-explode-value').textContent=`${Math.round(s.explode*100)}%`;$('#thermal-explode').value=Math.round(s.explodeTarget*100);
  $('#thermal-auto').textContent=s.auto?'Ⅱ Dừng tự tách':'▷ Tự tách / lắp';$('#thermal-cutaway').textContent=s.cutaway?'Đóng vỏ':'Mở vỏ';$('#thermal-cutaway').disabled=s.mode!=='explore';$('#thermal-isolate').textContent=s.isolated?'Hiện tất cả':'Xem riêng';
  $('#thermal-rpm').textContent=Math.round(s.rpm).toLocaleString('vi-VN');$('#thermal-power').textContent=s.powerMW.toFixed(1);$('#thermal-heat').textContent=s.heatMW.toFixed(1);
  $('#thermal-status').textContent=s.transition?'Đang lắp lại trước khi vận hành…':!s.playing?'Đã tạm dừng thời gian mô phỏng.':!s.cooling?'Mất làm mát · ngừng phát điện trong mô hình.':s.load===0?'Tải bằng 0 · không phát điện.':s.status||'Chu trình đang vận hành · số liệu minh họa.';
  $('#thermal-load-value').textContent=`${Math.round(s.load*100)}%`;$('#thermal-load').value=Math.round(s.load*100);$('#thermal-play').textContent=s.playing?'Ⅱ Tạm dừng':'▷ Chạy';$('#thermal-slow').setAttribute('aria-pressed',String(s.slow));$('#thermal-cooling').setAttribute('aria-pressed',String(s.cooling));$('#thermal-cooling').textContent=s.cooling?'Làm mát: bật':'Làm mát: tắt';$('#thermal-flow').value=s.flowFilter;
  const lesson=LESSONS[s.lesson];$('#thermal-lesson-title').textContent=lesson.title;$('#thermal-lesson-text').textContent=lesson.text;$('#thermal-lesson-auto').setAttribute('aria-pressed',String(s.lessonAuto));for(const b of buttons.lessons)b.setAttribute('aria-pressed',String(+b.dataset.tlesson===s.lesson));
 },dispose(){abort.abort();}};
}

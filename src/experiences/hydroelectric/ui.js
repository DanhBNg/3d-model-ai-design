import { LESSONS } from '../../models/hydroelectric/lesson.js';
import { PARTS,PART_BY_ID,LIMITATIONS } from '../../models/hydroelectric/metadata.js';
import { flowDiagram, flowLegend, modelHeader } from '../../ui/model-shell/markup.js';

export function mountHydroUI(host){
 const header=modelHeader({modeAttribute:'hmode',brand:'HYDRO',code:'01',principleLabel:'Nguyên lý',version:'V.02'}).replace('data-exit-model','data-exit-model id="hydro-back"').replace('<strong class="model-header__brand">','<a class="model-header__brand" href="/" id="hydro-home">').replace('</strong>','</a>');
 host.innerHTML=`<div class="hydro-app model-shell">
 ${header}
 <main class="hydro-layout model-workspace"><section class="hydro-stage model-stage" aria-label="Mô hình nhà máy"><div id="hydro-viewport"></div>
 <div class="hydro-intro"><p>CHUYỂN ĐỘNG CỦA NƯỚC</p><h1>Từ dòng chảy<br>đến dòng điện<span>.</span></h1><span id="hydro-context">Một nhà máy. Một hành trình năng lượng.</span></div>
 <div class="hydro-views model-view-tools" aria-label="Góc nhìn"><button data-hview="hero" title="Góc tổng thể" aria-label="Góc tổng thể">◈</button><button data-hview="top" title="Nhìn từ trên" aria-label="Nhìn từ trên">⊞</button><button data-hview="section" title="Mặt cắt đường nước" aria-label="Mặt cắt đường nước">▤</button><button data-hview="machine" title="Cận cảnh tổ máy" aria-label="Cận cảnh tổ máy">◎</button><button id="hydro-fit" title="Căn khung" aria-label="Căn khung">⛶</button></div>
 <div id="hydro-label" hidden></div><div id="hydro-loading" class="model-loading" role="status"><b>Đang dựng không gian thủy điện…</b><span>Tải mô hình và vật liệu</span></div>
 <div class="hydro-stage-foot"><span>Kéo để xoay · Cuộn / chụm để zoom</span><span id="hydro-stats"></span></div>
 <div class="hydro-legend" id="hydro-legend" hidden>${flowLegend([{label:'Nước',kind:'control'},{label:'Điện',kind:'energy'}])}<small>Đường màu minh họa · Quay chậm 20 lần</small></div>
 <section id="hydro-explode-panel" class="hydro-explode model-explode-card" hidden><div class="hydro-field"><label for="hydro-explode">Mức tách cấu tạo</label><output id="hydro-explode-value">0%</output></div><input id="hydro-explode" type="range" min="0" max="100" value="0"><div class="hydro-range-caption"><span>Lắp hoàn chỉnh</span><span>Tách các cụm</span></div><div class="hydro-explode-actions"><button id="hydro-auto" class="hydro-primary">▷ Tự động tách / lắp</button><button id="hydro-assemble">Lắp lại</button></div><p class="hydro-small">Mái mở trước, các cụm máy tách sau. Dòng nước và điện dừng trong chế độ này.</p></section>
 </section><aside class="hydro-panel model-inspector">
 <div class="hydro-panel-top"><span id="hydro-panel-kicker">CÔNG TRÌNH / NGOẠI THẤT</span><b>22 CỤM</b></div>
 <h2 id="hydro-title">Năng lượng<br>từ chênh cao.</h2><p id="hydro-description">Khám phá ngoại thất trước. Mở mái và phần bao che để thấy tuyến nước cùng tổ máy bên trong.</p>
 <div class="hydro-actions"><button id="hydro-cutaway" aria-pressed="false">◐ Xem bên trong</button><button id="hydro-isolate" disabled aria-pressed="false">◎ Xem riêng</button></div>
 <section id="hydro-principle-panel" hidden>
 <div class="hydro-flow">${flowDiagram(['Hồ','Turbine','Máy phát','Lưới'])}</div>
 <div class="hydro-lesson"><div class="hydro-lesson-nav" aria-label="Các bước nguyên lý">${LESSONS.map((l,i)=>`<button data-lesson="${i}" title="${l.title}" aria-pressed="false">0${i+1}</button>`).join('')}</div><h3 id="hydro-lesson-title"></h3><p id="hydro-lesson-text"></p><div class="hydro-lesson-buttons"><button id="hydro-tour">▷ Tự chuyển bước</button><button id="hydro-lesson-focus">◎ Xem vị trí</button></div><small>Các bước giải thích cùng một hệ thống đang vận hành.</small></div>
 <div class="hydro-field"><label for="hydro-opening">Độ mở cánh hướng</label><output id="hydro-opening-value">65%</output></div><input id="hydro-opening" type="range" min="0" max="100" value="65">
 <div class="hydro-field"><label for="hydro-head">Cột nước giả định</label><output id="hydro-head-value">50 m</output></div><input id="hydro-head" type="range" min="20" max="80" value="50">
 <div class="hydro-telemetry"><div><span>CÔNG SUẤT</span><strong id="hydro-power">0.00</strong><small>MW</small></div><div><span>LƯU LƯỢNG</span><strong id="hydro-flow-value">0.0</strong><small>m³/s</small></div><div><span>TỐC ĐỘ TỔ MÁY</span><strong id="hydro-rpm">0</strong><small>vòng/phút</small></div></div>
 <p id="hydro-status" role="status">Đang chuẩn bị tổ máy…</p>
 <div class="hydro-playback model-playback"><button id="hydro-play" class="hydro-primary">Ⅱ Tạm dừng</button><button id="hydro-slow" aria-pressed="false">0,25×</button><button id="hydro-load" aria-pressed="true">Ngắt tải</button></div>
 <details class="hydro-notes"><summary>Giả định & nguyên lý</summary><p>${LIMITATIONS}</p><a href="https://www.energy.gov/cmei/water/how-hydropower-works" target="_blank" rel="noreferrer">Nguồn: Bộ Năng lượng Hoa Kỳ ↗</a></details>
 </section>
 <div class="hydro-list-heading"><span>DANH MỤC CẤU TẠO</span><button id="hydro-clear">Bỏ chọn</button></div><div class="hydro-part-list">${PARTS.map((p,i)=>`<button data-hpart="${p.id}" aria-pressed="false"><small>${String(i+1).padStart(2,'0')}</small><span>${p.name}</span><i>↗</i></button>`).join('')}</div>
 <button id="hydro-reset" class="hydro-reset">↺ Đặt lại mô hình</button>
 </aside></main><footer class="hydro-footer model-bottom-bar"><span>HỒ CHỨA → CƠ NĂNG → ĐIỆN NĂNG</span><span>Mô hình giáo dục · Thiết kế nguyên bản</span></footer></div>`;
}

export function connectHydroUI(host,controller,studio,onExit,runtime){
 const abort=new AbortController(),s=controller.state,$=id=>host.querySelector('#'+id);
 const on=(id,type,fn)=>$(id).addEventListener(type,fn,{signal:abort.signal});
 function selected(id){controller.select(id);const p=PART_BY_ID[id];if(p?.type==='machine'&&!['transformer','grid'].includes(id))controller.setCutaway(true);if(s.isolated&&id)studio.focus(runtime.nodes[id]);$('hydro-title').textContent=p?.name||'Năng lượng từ chênh cao.';$('hydro-description').textContent=p?.description||'Khám phá ngoại thất trước. Mở mái và phần bao che để thấy tuyến nước cùng tổ máy bên trong.';$('hydro-isolate').disabled=!id;for(const b of host.querySelectorAll('[data-hpart]')){const v=b.dataset.hpart===id;b.classList.toggle('active',v);b.setAttribute('aria-pressed',v);} }
 function mode(id){controller.setMode(id);studio.setMode(id);syncMode();}
 function syncMode(){for(const b of host.querySelectorAll('[data-hmode]')){const v=b.dataset.hmode===s.mode;b.classList.toggle('active',v);b.setAttribute('aria-pressed',v);}$('hydro-explode-panel').hidden=s.mode!=='explode';$('hydro-principle-panel').hidden=s.mode!=='principle';$('hydro-legend').hidden=s.mode!=='principle';$('hydro-cutaway').disabled=s.mode!=='explore';$('hydro-context').textContent=s.mode==='explore'?'Một nhà máy. Một hành trình năng lượng.':s.mode==='explode'?'Mở công trình, quan sát từng lớp cấu tạo.':'Nước truyền năng lượng; máy phát tạo điện.';}
 host.addEventListener('click',e=>{const lesson=e.target.closest('[data-lesson]');if(lesson){controller.setLesson(+lesson.dataset.lesson);}const m=e.target.closest('[data-hmode]'),p=e.target.closest('[data-hpart]'),v=e.target.closest('[data-hview]');if(m)mode(m.dataset.hmode);if(p)selected(p.dataset.hpart);if(v){if(['machine','section'].includes(v.dataset.hview))controller.setCutaway(true);studio.view(v.dataset.hview);}},{signal:abort.signal});
 on('hydro-tour','click',()=>controller.toggleLesson());on('hydro-lesson-focus','click',()=>studio.focus(runtime.nodes[LESSONS[s.lesson].part]));on('hydro-back','click',e=>{e.preventDefault();onExit();});on('hydro-home','click',e=>{e.preventDefault();onExit();});on('hydro-fit','click',()=>studio.fit());on('hydro-clear','click',()=>selected(null));
 on('hydro-cutaway','click',()=>controller.setCutaway(!s.cutaway));on('hydro-isolate','click',()=>{controller.setIsolated(!s.isolated);if(s.isolated)studio.focus(runtime.nodes[s.selected]);else studio.fit();});
 on('hydro-explode','input',e=>controller.setExplode(+e.target.value/100));on('hydro-auto','click',()=>controller.toggleAuto());on('hydro-assemble','click',()=>controller.setExplode(0));
 on('hydro-opening','input',e=>controller.setOpening(+e.target.value/100));on('hydro-head','input',e=>controller.setHead(+e.target.value));on('hydro-load','click',()=>controller.setConnected(!s.connected));on('hydro-play','click',()=>controller.setPlaying(!s.playing));on('hydro-slow','click',()=>controller.setSlow(!s.slow));
 on('hydro-reset','click',()=>{controller.reset();selected(null);syncMode();studio.setMode('explore');});syncMode();
 let last=0;return {selected,update(now){if(now-last<80)return;last=now;
  const lesson=LESSONS[s.lesson];$('hydro-lesson-title').textContent=lesson.title;$('hydro-lesson-text').textContent=lesson.text;$('hydro-tour').textContent=s.lessonAuto?'Ⅱ Dừng chuyển bước':'▷ Tự chuyển bước';for(const b of host.querySelectorAll('[data-lesson]')){const active=+b.dataset.lesson===s.lesson;b.classList.toggle('active',active);b.setAttribute('aria-pressed',active);}
  $('hydro-cutaway').textContent=s.cutaway?'◐ Đóng công trình':'◐ Xem bên trong';$('hydro-cutaway').setAttribute('aria-pressed',s.cutaway);$('hydro-isolate').setAttribute('aria-pressed',s.isolated);
  $('hydro-explode-value').textContent=`${Math.round(s.explode*100)}%`;if(document.activeElement!==$('hydro-explode'))$('hydro-explode').value=s.explodeTarget*100;
  $('hydro-auto').textContent=s.explodeAuto?'Ⅱ Dừng tự động':'▷ Tự động tách / lắp';$('hydro-opening-value').textContent=`${Math.round(s.openingTarget*100)}%`;$('hydro-head-value').textContent=`${s.head} m`;
  if(document.activeElement!==$('hydro-opening'))$('hydro-opening').value=s.openingTarget*100;if(document.activeElement!==$('hydro-head'))$('hydro-head').value=s.head;
  $('hydro-power').textContent=s.powerMW.toFixed(2);$('hydro-flow-value').textContent=s.flow.toFixed(1);$('hydro-rpm').textContent=Math.round(s.rpm);
  $('hydro-play').textContent=s.playing?'Ⅱ Tạm dừng':'▷ Chạy';$('hydro-slow').setAttribute('aria-pressed',s.slow);$('hydro-load').setAttribute('aria-pressed',s.connected);$('hydro-load').textContent=s.connected?'Ngắt tải':'Hòa lưới';
  $('hydro-status').textContent=s.transition?'Đang lắp tổ máy trước khi vận hành…':!s.connected?'Đã ngắt tải: công suất bằng 0, cánh hướng đóng dần.':!s.playing?'Đã tạm dừng thời gian mô phỏng.':s.opening<.001?'Cánh hướng đóng — chưa có nước qua turbine.':'Hòa lưới: tốc độ tiến đến 300 rpm; tăng lưu lượng làm tăng công suất.';
  $('hydro-panel-kicker').textContent=s.isolated?'ĐANG XEM RIÊNG':s.mode==='principle'?'ĐANG XEM NGUYÊN LÝ':s.coverOpen>.98?'CÔNG TRÌNH / MẶT CẮT':'CÔNG TRÌNH / NGOẠI THẤT';
 },dispose(){abort.abort();}};
}

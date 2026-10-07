import {PARTS,PART_BY_ID} from '../../models/wireless-charging/metadata.js';
import {LESSONS} from '../../models/wireless-charging/lesson.js';

export function mountWirelessUI(host){
 host.innerHTML=`<main class="wireless-app">
 <header class="wireless-header"><button id="wireless-back">← <span>Bộ sưu tập</span></button><strong>FLUX <em>/ 05</em></strong><nav aria-label="Chế độ mô hình">${[['explore','Khám phá'],['explode','Tách cấu tạo'],['principle','Nguyên lý']].map(([id,t],i)=>`<button data-wmode="${id}" aria-pressed="${i===0}"><small>0${i+1}</small>${t}</button>`).join('')}</nav><span class="wireless-live">● ENERGY LAB</span></header>
 <section class="wireless-stage"><div id="wireless-viewport"></div>
 <div class="wireless-heading"><p>NĂNG LƯỢNG QUA KHOẢNG KHÔNG</p><h1>Không dây.<br>Vẫn kết nối<span>.</span></h1><span id="wireless-subtitle">Hai cuộn dây. Một trường từ biến thiên.</span></div>
 <div class="wireless-views" aria-label="Góc nhìn">${[['hero','Tổng thể'],['coils','Cuộn dây'],['phone','Điện thoại'],['pad','Đế sạc']].map(([id,t])=>`<button data-wview="${id}">${t}</button>`).join('')}</div>
 <div id="wireless-loading" role="status">Đang tải điện thoại và đế sạc…</div><div id="wireless-label" hidden></div>
 <div id="wireless-field-note" hidden><span>↕ TRƯỜNG TỪ ĐỔI CHIỀU</span><p>Vòng từ trường khép kín · không có electron vượt khe hở</p><small id="wireless-gap-note"></small></div>
 <div class="wireless-stage-footer"><span>Kéo để xoay · Cuộn / chụm để zoom</span><span id="wireless-stats"></span></div>
 <div id="wireless-explode-panel" class="wireless-floating" hidden><div><strong>Tách từng lớp</strong><output id="wireless-explode-value">0%</output></div><p>Khám phá hai cuộn dây và các lớp bảo vệ bên trong.</p><input id="wireless-explode" aria-label="Mức tách cấu tạo" type="range" min="0" max="100" value="0"><div><button id="wireless-auto">▷ Tự tách / lắp</button><button id="wireless-assemble">Lắp lại</button></div></div>
 </section>
 <aside class="wireless-panel"><div class="wireless-panel-top"><p>KHÁM PHÁ CẤU TẠO <span>${PARTS.length} CỤM</span></p><h2 id="wireless-part-name">Năng lượng vô hình.</h2><p id="wireless-part-description">Mở vỏ, chọn từng lớp và khám phá cách chiếc điện thoại nhận năng lượng từ đế sạc.</p><div class="wireless-actions"><button id="wireless-cutaway">Mở vỏ</button><button id="wireless-isolate" disabled>Xem riêng</button><button id="wireless-focus" disabled>Xem gần</button></div></div>
 <div id="wireless-docking" class="wireless-playback"><button id="wireless-dock">↑ Nhấc điện thoại</button><span id="wireless-dock-status" role="status">Đặt trên đế để xem báo sạc.</span></div>
 <section id="wireless-principle-panel" hidden>
 <div class="wireless-metrics"><div><output id="wireless-input">0</output><small>W ĐẦU VÀO*</small></div><div><output id="wireless-power">0</output><small>W NHẬN ĐƯỢC*</small></div><div><output id="wireless-soc">0%</output><small>PIN MINH HỌA</small></div></div>
 <p id="wireless-status" role="status"></p>
 <label class="wireless-slider">Độ lệch tâm <output id="wireless-alignment-value">0 mm</output><input id="wireless-alignment" type="range" min="-35" max="35" step="1" value="0"></label>
 <label class="wireless-slider">Khoảng cách vật lý <output id="wireless-gap-value">6 mm</output><input id="wireless-gap" type="range" min="6" max="18" step="1" value="6"></label>
 <p class="wireless-coupling">Liên kết từ minh họa <output id="wireless-coupling">0%</output></p>
 <div class="wireless-playback"><button id="wireless-play">Ⅱ Tạm dừng</button><button id="wireless-slow" aria-pressed="false">0,25×</button><button id="wireless-align">Căn giữa</button></div>
 <label class="wireless-filter">Hiện tuyến năng lượng<select id="wireless-flow"><option value="lesson">Theo bước đang học</option><option value="all">Toàn hệ thống</option><option value="power">Dòng điện</option><option value="field">Trường từ</option></select></label>
 <div class="wireless-legend"><span style="--flow:#ffc579">Điện vào / TX</span><span style="--flow:#56cbe5">Trường từ</span><span style="--flow:#7bf3da">RX / pin</span></div>
 <div class="wireless-lesson"><p>THEO DÒNG NĂNG LƯỢNG</p><div class="wireless-steps">${LESSONS.map((l,i)=>`<button data-wlesson="${i}" title="${l.title}" aria-label="Bước ${i+1}: ${l.title}">0${i+1}</button>`).join('')}</div><h3 id="wireless-lesson-title"></h3><p id="wireless-lesson-text"></p><div><button id="wireless-lesson-focus">Xem vị trí ↗</button><button id="wireless-lesson-auto">Tự chuyển bước</button></div></div>
 <p class="wireless-note">* Công suất, liên kết từ và phần trăm pin chỉ minh họa. Khe nhìn giữa hai cuộn dây được mở thêm 14 mm để dễ quan sát; tính toán dùng khoảng cách vật lý trên thanh trượt. Từ trường đã làm chậm, không biểu diễn tần số thực. Các đường nối đến linh kiện dời ra ngoài là sơ đồ kết nối.</p>
 <details class="wireless-limits"><summary>Phạm vi minh họa</summary><p>Không phải mô phỏng điện từ, nhiệt, hiệu suất đo được hay thời gian sạc thực. Không thể hiện chứng nhận Qi. Bộ nguồn minh họa được ngắt khỏi điện lưới; mô hình chỉ giải thích chuỗi chuyển đổi năng lượng.</p></details>
 </section>
 <details class="wireless-parts" open><summary>Danh mục bộ phận</summary><div>${PARTS.map((p,i)=>`<button data-wpart="${p.id}"><small>${String(i+1).padStart(2,'0')}</small><span>${p.name}</span><b>↗</b></button>`).join('')}</div></details>
 <button id="wireless-reset" class="wireless-reset">↺ Đặt lại mô hình</button>
 </aside></main>`;
}

export function connectWirelessUI(host,c,studio,onExit,r){
 const abort=new AbortController(),$=s=>host.querySelector(s),listen=(el,ev,fn)=>el.addEventListener(ev,fn,{signal:abort.signal});
 const buttons={modes:[...host.querySelectorAll('[data-wmode]')],parts:[...host.querySelectorAll('[data-wpart]')],lessons:[...host.querySelectorAll('[data-wlesson]')]};
 let previousSelected;
 function syncSelection(){const id=c.state.selected;if(id===previousSelected)return;previousSelected=id;const p=PART_BY_ID[id];$('#wireless-part-name').textContent=p?.name||'Năng lượng vô hình.';$('#wireless-part-description').textContent=p?.description||'Mở vỏ, chọn từng lớp và khám phá cách chiếc điện thoại nhận năng lượng từ đế sạc.';$('#wireless-isolate').disabled=!id;$('#wireless-focus').disabled=!id;}
 function selected(id){c.select(id);syncSelection();}
 listen($('#wireless-back'),'click',onExit);
 for(const b of buttons.modes)listen(b,'click',()=>{c.setMode(b.dataset.wmode);if(c.state.mode==='principle')c.setFlowFilter('all');studio.view(c.state.mode==='explode'?'explode':c.state.mode==='principle'?'coils':'hero');$('.wireless-parts').open=c.state.mode!=='principle';});
 for(const b of host.querySelectorAll('[data-wview]'))listen(b,'click',()=>{const id=b.dataset.wview;if(id!=='hero')c.setCutaway(true);studio.view(id);});
 for(const b of buttons.parts)listen(b,'click',()=>selected(b.dataset.wpart));
 listen($('#wireless-cutaway'),'click',()=>c.setCutaway(!c.state.cutaway));
 listen($('#wireless-dock'),'click',()=>{c.setDocked(!c.state.docked);studio.view('hero');});
 listen($('#wireless-isolate'),'click',()=>{c.setIsolated(!c.state.isolated);if(c.state.isolated)studio.focus(r.nodes[c.state.selected]);else studio.view(c.state.mode==='principle'?'coils':'hero');});
 listen($('#wireless-focus'),'click',()=>studio.focus(r.nodes[c.state.selected]));
 listen($('#wireless-explode'),'input',e=>c.setExplode(+e.target.value/100));listen($('#wireless-auto'),'click',()=>c.toggleAuto());listen($('#wireless-assemble'),'click',()=>c.setExplode(0));
 listen($('#wireless-alignment'),'input',e=>c.setAlignment(+e.target.value));listen($('#wireless-gap'),'input',e=>c.setGap(+e.target.value));listen($('#wireless-align'),'click',()=>c.setAlignment(0));
 listen($('#wireless-play'),'click',()=>c.setPlaying(!c.state.playing));listen($('#wireless-slow'),'click',()=>c.setSlow(!c.state.slow));listen($('#wireless-flow'),'change',e=>c.setFlowFilter(e.target.value));
 for(const b of buttons.lessons)listen(b,'click',()=>c.setLesson(+b.dataset.wlesson));
 listen($('#wireless-lesson-focus'),'click',()=>{const id=LESSONS[c.state.lesson].part;selected(id);studio.focus(r.nodes[id]);});listen($('#wireless-lesson-auto'),'click',()=>c.toggleLesson());
 listen($('#wireless-reset'),'click',()=>{c.reset();syncSelection();studio.view('hero');$('.wireless-parts').open=true;});
 let last=-Infinity;
 return {selected,update(now){if(now-last<80)return;last=now;const s=c.state;syncSelection();$('.wireless-app').dataset.wirelessMode=s.mode;
  for(const b of buttons.modes)b.setAttribute('aria-pressed',String(b.dataset.wmode===s.mode));for(const b of buttons.parts)b.setAttribute('aria-pressed',String(b.dataset.wpart===s.selected));
  $('#wireless-docking').hidden=s.mode!=='explore'||s.cutaway;$('#wireless-dock').textContent=s.docked?'↑ Nhấc điện thoại':'↓ Đặt lên đế sạc';$('#wireless-dock-status').textContent=s.charging?'Pin sáng · đang nhận sạc':s.docked?'Đang đặt xuống…':'Đã nhấc · ngừng sạc';
  $('#wireless-explode-panel').hidden=s.mode!=='explode';$('#wireless-principle-panel').hidden=s.mode!=='principle';$('#wireless-field-note').hidden=s.mode!=='principle'||s.isolated;$('#wireless-gap-note').textContent=`Khe vật lý ${s.gap} mm · khe nhìn mở thêm 14 mm`;
  $('#wireless-explode-value').textContent=`${Math.round(s.explode*100)}%`;$('#wireless-explode').value=Math.round(s.explodeTarget*100);
  $('#wireless-auto').textContent=s.auto?'Ⅱ Dừng tự tách':'▷ Tự tách / lắp';$('#wireless-cutaway').textContent=s.cutaway?'Đóng vỏ':'Mở vỏ';$('#wireless-cutaway').disabled=s.mode!=='explore';$('#wireless-isolate').textContent=s.isolated?'Hiện tất cả':'Xem riêng';
  $('#wireless-input').textContent=s.inputW.toFixed(1);$('#wireless-power').textContent=s.receivedW.toFixed(1);$('#wireless-soc').textContent=`${Math.round(s.soc)}%`;
  $('#wireless-status').textContent=s.transition?'Đang lắp lại trước khi truyền năng lượng…':!s.playing?'Đã tạm dừng thời gian minh họa.':s.charging?'Đang truyền năng lượng · số liệu minh họa.':'Liên kết yếu · hãy căn giữa hai cuộn dây.';
  $('#wireless-alignment-value').textContent=`${s.alignment} mm`;$('#wireless-alignment').value=s.alignment;$('#wireless-gap-value').textContent=`${s.gap} mm`;$('#wireless-gap').value=s.gap;$('#wireless-coupling').textContent=`${Math.round(s.coupling*100)}%`;
  $('#wireless-play').textContent=s.playing?'Ⅱ Tạm dừng':'▷ Chạy';$('#wireless-slow').setAttribute('aria-pressed',String(s.slow));$('#wireless-flow').value=s.flowFilter;
  const lesson=LESSONS[s.lesson];$('#wireless-lesson-title').textContent=lesson.title;$('#wireless-lesson-text').textContent=lesson.text;$('#wireless-lesson-auto').setAttribute('aria-pressed',String(s.lessonAuto));for(const b of buttons.lessons)b.setAttribute('aria-pressed',String(+b.dataset.wlesson===s.lesson));
 },dispose(){abort.abort();}};
}



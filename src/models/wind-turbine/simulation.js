// Illustrative 2 MW geared turbine. These thresholds are chosen lesson values.
export const WIND_SPEC = Object.freeze({cutIn:3,rated:12,cutOut:25,ratedKW:2000,ratio:6,visualRate:.32});
export function sampleWind(speed, error=0){
 const v=Math.max(0,Math.min(35,Number.isFinite(speed)?speed:0));
 const aligned=Math.max(0,Math.cos(error));
 const storm=v>=WIND_SPEC.cutOut, running=v>=WIND_SPEC.cutIn&&!storm;
 const fraction=running?Math.min(1,Math.max(0,(v**3-27)/(12**3-27)))*aligned**3:0;
 const rpm=running?Math.min(18,6+(v-3)*4/3)*aligned:0;
 return {power:2000*fraction,rpm,generatorRpm:rpm*6,pitch:storm?85:v>12?Math.min(35,(v-12)*2.6):2,
  status:storm?'Gió mạnh · dừng bảo vệ':v<3?'Chưa đủ gió':aligned<.95?'Đang quay đón gió':v>=12?'Điều tiết công suất':'Đang phát điện'};
}

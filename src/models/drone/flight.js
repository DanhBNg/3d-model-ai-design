import { MOTOR_LAYOUT } from './metadata.js';
export const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
export const smooth=v=>{const t=clamp(v);return t*t*t*(t*(t*6-15)+10)};
// +X pitch torque tips the nose UP; +Z roll torque raises the right side.
// Reaction yaw is opposite to the rotor angular velocity about +Y.
export function mixThrust(collective,pitch,roll,yaw){
 return MOTOR_LAYOUT.map(m=>clamp(collective-Math.sign(m.position[2])*pitch+Math.sign(m.position[0])*roll-m.spin*yaw,.02,.95));
}
export function moments(thrust){
 return MOTOR_LAYOUT.reduce((a,m,i)=>({pitch:a.pitch-m.position[2]*thrust[i],roll:a.roll+m.position[0]*thrust[i],yaw:a.yaw-m.spin*thrust[i]}),{pitch:0,roll:0,yaw:0});
}
export function sampleFlight(id,time){
 const t=Math.max(0,time),u=clamp((t-1.4)/6.5),w=2*Math.PI;
 // Bounded educational trajectory: accelerate, brake, hold. Bank reverses
 // during braking; no discontinuous loop and no endless acceleration offscreen.
 const travel=u-2/(3*Math.PI)*Math.sin(w*u)+1/(12*Math.PI)*Math.sin(2*w*u);
 const bank=.5*Math.sin(w*u)-.25*Math.sin(2*w*u);
 const bankAcceleration=u>0&&u<1?-.5*w*w*Math.sin(w*u)+w*w*Math.sin(2*w*u):0;
 const y=.125*smooth(t/2.6),p=[0,y,0],r=[0,0,0];
 let pitch=0,roll=0,yaw=0,phase=t<1.4?'Ổn định độ cao':u<.5?'Tăng tốc':u<1?'Hãm chuyển động':'Giữ vị trí';
 const gain=.0045;
 if(id==='forward'||id==='backward'){
  const d=id==='forward'?-1:1;p[2]=d*.14*travel;r[0]=d*.29*bank;pitch=d*gain*bankAcceleration;
 }
 if(id==='left'||id==='right'){
  const d=id==='right'?1:-1;p[0]=d*.14*travel;r[2]=-d*.29*bank;roll=-d*gain*bankAcceleration;
 }
 if(id==='yaw_left'||id==='yaw_right'){
  const d=id==='yaw_left'?1:-1;r[1]=d*Math.PI*.46*travel;
  yaw=d*.12*bank;phase=u<.5?'Tạo mô-men xoay':u<1?'Hãm xoay':'Giữ hướng';
 }
 if(id==='takeoff'){p[1]=.18*smooth(t/5);phase=t<5?'Tăng độ cao':'Chuyển sang bay treo';}
 if(id==='hover')phase=t<2.6?'Ổn định độ cao':'Bay treo';
 const liftT=id==='takeoff'?clamp(t/5):clamp(t/2.6);
 const verticalAcceleration=liftT>0&&liftT<1?(60*liftT-180*liftT**2+120*liftT**3):0;
 const collective=.3025/Math.max(.9,Math.cos(r[0])*Math.cos(r[2]))+.007*verticalAcceleration;
 const thrust=mixThrust(collective,pitch,roll,yaw);
 return {position:p,rotation:r,thrust,speeds:thrust.map(Math.sqrt),phase};
}

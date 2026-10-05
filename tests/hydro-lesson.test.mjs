import test from 'node:test';
import assert from 'node:assert/strict';
import {advanceLesson} from '../src/models/hydroelectric/lesson.js';
test('lesson advances on its own clock and preserves manual selection when stopped',()=>{
 const s={lesson:0,lessonTime:0,lessonAuto:false};advanceLesson(s,10);assert.equal(s.lesson,0);
 s.lessonAuto=true;advanceLesson(s,9.1);assert.equal(s.lesson,1);assert.ok(s.lessonTime<.11);
 s.lesson=4;s.lessonTime=8;advanceLesson(s,1);assert.equal(s.lesson,0);
});

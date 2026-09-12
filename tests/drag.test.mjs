import test from 'node:test';
import assert from 'node:assert/strict';
import { Window } from 'happy-dom';
import { installTileDrag } from '../dist/drag.js';
import { newGame, moveTile, removeTile } from '../dist/engine.js';

// DOM-level input tests use actual game transitions. Browser hit testing and
// native DataTransfer are supplied by the harness; desktop dragging is also
// exercised in the real browser before release.
function fixture(t, initial = newGame()) {
  const win = new Window();
  t.after(() => win.happyDOM.abort());
  const doc = win.document;
  doc.body.innerHTML = '<section class="game"><div id="board"></div><div id="rack"></div></section><aside id="outside"></aside>';
  const board = doc.querySelector('#board'), rack = doc.querySelector('#rack');
  const game = { ...initial, board: [...initial.board] };
  const messages = [], drops = [], frames = new Map();
  let frameId = 0, hit = null, scrolling = 0;
  win.requestAnimationFrame = callback => { frames.set(++frameId, callback); return frameId; };
  win.cancelAnimationFrame = id => frames.delete(id);
  win.scrollBy = options => { scrolling += options.top; };
  doc.elementFromPoint = () => hit;
  function render() {
    board.innerHTML = game.board.map((id, cell) => `<button data-cell="${cell}" ${id===null?'':`data-occupant="${id}"`} class="cell">${id??''}</button>`).join('');
    rack.innerHTML = Array.from({length:9},(_,id)=>game.board.includes(id)?'':`<button class="tile" data-tile="${id}"><span>${id}</span></button>`).join('');
  }
  render();
  const controller = installTileDrag({
    board,rack,isPlaying:()=>!game.won,
    canMove:id=>Number.isInteger(id)&&id>=0&&id<9&&!game.locked.includes(game.board.indexOf(id)),
    canDrop:(id,cell)=>!game.locked.includes(cell),
    onStart:()=>{},announce:message=>messages.push(message),
    onCellDrop:(id,cell)=>{game.board=moveTile(game.board,id,cell,game.locked);drops.push(['cell',id,cell]);render();},
    onRackDrop:(id,before)=>{const source=game.board.indexOf(id);if(source!==-1)game.board=removeTile(game.board,source,game.locked);drops.push(['rack',id,before]);render();},
  });
  t.after(()=>controller.cancel());
  const cell = position => board.querySelector(`[data-cell="${position}"]`);
  const tile = id => rack.querySelector(`[data-tile="${id}"]`);
  function event(type, target, props = {}) {
    const e = new win.Event(type,{bubbles:true,cancelable:true});
    Object.assign(e,props);target.dispatchEvent(e);return e;
  }
  function transfer() {
    const data = new Map();
    return {effectAllowed:'none',dropEffect:'none',setData:(key,value)=>data.set(key,value),getData:key=>data.get(key)??'',setDragImage:()=>{}};
  }
  function native(source, destination) {
    const dataTransfer=transfer();event('dragstart',source,{dataTransfer});
    event('dragover',destination,{dataTransfer});event('drop',destination,{dataTransfer});event('dragend',source,{dataTransfer});
  }
  function pointer(type, source, options = {}) {
    const e=new win.PointerEvent(type,{bubbles:true,cancelable:true,pointerType:'touch',pointerId:1,isPrimary:true,button:0,clientX:100,clientY:100,...options});
    source.dispatchEvent(e);return e;
  }
  return {win,doc,board,rack,game,controller,cell,tile,event,native,pointer,transfer,drops,messages,frames,
    hit:element=>{hit=element;},scrolling:()=>scrolling,
    frame:time=>{const callbacks=[...frames.values()];frames.clear();callbacks.forEach(callback=>callback(time));},
    startTouch:(source,options={})=>{
      let captured=false;source.setPointerCapture=()=>{captured=true;};source.hasPointerCapture=()=>captured;source.releasePointerCapture=()=>{captured=false;};
      pointer('pointerdown',source,options);pointer('pointermove',source,{clientX:120,...options});
    },
    clean:()=>{assert.equal(controller.active,false);assert.equal(doc.querySelectorAll('.drag-preview,.drag-origin,.drop-target,.drop-blocked,.is-dragging').length,0);assert.equal(frames.size,0);},
  };
}

test('native drag places, replaces, swaps and returns tiles using the game engine',t=>{
  const f=fixture(t);
  f.native(f.tile(0),f.cell(1));assert.equal(f.game.board[1],0);
  f.native(f.tile(1),f.cell(2));f.native(f.cell(1),f.cell(2));
  assert.equal(f.game.board[1],1);assert.equal(f.game.board[2],0);
  f.native(f.tile(2),f.cell(2));assert.equal(f.game.board[2],2);assert.ok(f.tile(0));
  f.native(f.cell(2),f.rack);assert.equal(f.game.board[2],null);assert.ok(f.tile(2));
  // Native preview frames are harmless after a synchronous drop.
  f.frame(16);f.clean();
});
test('native drag rejects locked tiles, invalid targets, cancelled drags and unrelated payloads',t=>{
  const initial=newGame();initial.board[0]=0;initial.locked.push(0);
  const f=fixture(t,initial),before=[...f.game.board];
  f.native(f.cell(0),f.cell(1));f.native(f.tile(1),f.cell(0));f.native(f.tile(2),f.doc.querySelector('#outside'));
  const source=f.tile(3),dataTransfer=f.transfer();
  f.event('dragstart',source,{dataTransfer});f.event('dragend',source,{dataTransfer});
  f.event('dragstart',source,{dataTransfer});f.event('drop',f.cell(1),{dataTransfer:f.transfer()});
  assert.deepEqual(f.game.board,before);assert.equal(f.drops.length,0);f.frame(16);f.clean();
});
test('touch taps stay clicks; a real drag shows a preview, places a tile and suppresses its compatibility click',t=>{
  const f=fixture(t),source=f.tile(0);
  f.pointer('pointerdown',source);f.pointer('pointermove',source,{clientX:103});f.pointer('pointerup',source);
  assert.equal(f.controller.active,false);assert.equal(f.drops.length,0);
  f.hit(f.cell(0));f.startTouch(source);
  assert.equal(f.controller.active,true);assert.ok(f.doc.querySelector('.drag-preview'));assert.ok(f.cell(0).classList.contains('drop-target'));
  f.pointer('pointerup',source,{clientX:120});assert.equal(f.game.board[0],0);assert.equal(f.drops.length,1);f.clean();
  let clicks=0;f.doc.addEventListener('click',()=>clicks++);
  f.cell(0).dispatchEvent(new f.win.MouseEvent('click',{bubbles:true,cancelable:true,detail:1}));assert.equal(clicks,0);
  f.cell(0).dispatchEvent(new f.win.MouseEvent('click',{bubbles:true,cancelable:true,detail:0}));assert.equal(clicks,1);
});
test('touch and pen can swap board tiles, return them, and reorder the rack',t=>{
  const initial=newGame();initial.board[0]=0;initial.board[1]=1;
  const f=fixture(t,initial);
  f.hit(f.cell(1));let source=f.cell(0);f.startTouch(source);f.pointer('pointerup',source);
  assert.equal(f.game.board[0],1);assert.equal(f.game.board[1],0);
  f.hit(f.rack);source=f.cell(1);f.startTouch(source,{pointerType:'pen'});f.pointer('pointerup',source,{pointerType:'pen'});
  assert.equal(f.game.board[1],null);assert.ok(f.tile(0));
  f.hit(f.tile(3).querySelector('span'));source=f.tile(0);f.startTouch(source);f.pointer('pointerup',source);
  assert.deepEqual(f.drops.at(-1),['rack',0,3]);f.clean();
});
test('touch drags reject locked cells and outside drops without changing the board',t=>{
  const f=fixture(t),before=[...f.game.board];
  for(const target of [f.cell(4),f.doc.querySelector('#outside'),null]){
    const source=f.tile(0);f.hit(target);f.startTouch(source);f.pointer('pointerup',source);f.clean();
    assert.deepEqual(f.game.board,before);
  }
  f.startTouch(f.cell(4));assert.equal(f.controller.active,false);assert.equal(f.drops.length,0);
});
test('interrupted touches and Escape clean up previews, pointer capture and auto-scroll',t=>{
  const f=fixture(t),before=[...f.game.board];
  for(const type of ['pointercancel','lostpointercapture','keydown','blur','pagehide','second-touch']){
    const source=f.tile(0);f.hit(f.cell(0));f.startTouch(source);
    if(type==='keydown')f.doc.dispatchEvent(new f.win.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
    else if(type==='blur'||type==='pagehide')f.win.dispatchEvent(new f.win.Event(type));
    else if(type==='second-touch')f.pointer('pointerdown',source,{pointerId:2,isPrimary:false});
    else f.pointer(type,source);
    f.clean();assert.deepEqual(f.game.board,before);
  }
});
test('touch drag auto-scrolls near the viewport edge and stops immediately after cancellation',t=>{
  const f=fixture(t);f.hit(f.cell(0));f.startTouch(f.tile(0));
  f.pointer('pointermove',f.tile(0),{clientX:120,clientY:f.win.innerHeight-5});
  f.frame(16);assert.ok(f.scrolling()>0);assert.equal(f.frames.size,1);
  f.controller.cancel();const last=f.scrolling();f.frame(32);assert.equal(f.scrolling(),last);f.clean();
});

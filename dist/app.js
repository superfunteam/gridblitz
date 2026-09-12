import { LINES, PUZZLES, getPuzzle, newGame, evaluateBoard, moveTile, removeTile, hintMove, preserveLockedTiles, restoreGame } from './engine.js';
import { installTileDrag } from './drag.js';

const $ = selector => document.querySelector(selector);
const STORAGE_KEY = 'grid-blitz.game.v1';
let game = newGame();
try { const saved = restoreGame(JSON.parse(localStorage.getItem(STORAGE_KEY))); if (saved) game = saved; } catch { /* Storage is optional in private browsers. */ }
let puzzle = getPuzzle(game.round);
if (game.won && !evaluateBoard(game.board, puzzle).solved) game.won = false;
let selectedTile = null, selectedCell = null, activeLine = null, checked = false;
let order = [2,7,5,0,8,1,3,6];
let tileDrag;
let history = [], toastTimeout, popTimeout, modalOpener, lastTick = performance.now();
const modal = $('#modal');
const fmt = seconds => `${Math.floor(seconds/60)}:${String(Math.floor(seconds%60)).padStart(2,'0')}`;
const save = () => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(game)); } catch {} };
function toast(message) { $('#toast').textContent = message; $('#toast').classList.add('visible'); clearTimeout(toastTimeout); toastTimeout = setTimeout(() => $('#toast').classList.remove('visible'), 3300); }
function announce(message) { $('#instruction').textContent = message; }
function startClock() { if (!game.started) { game.started = true; lastTick = performance.now(); } }
function tileMarkup(id, rack = false, locked = false) {
  const tile = puzzle.tiles[id];
  return `<span class="tile-letter">${tile.letter}</span><span class="tile-number ${rack?'rack-number':''}">${tile.number}</span>${locked&&!rack?'<span class="lock-mark" aria-hidden="true"></span>':''}`;
}
function render() {
  const focused = document.activeElement;
  const focusKey = focused?.dataset.cell !== undefined ? `[data-cell="${focused.dataset.cell}"]` : focused?.dataset.tile !== undefined ? `[data-tile="${focused.dataset.tile}"]` : null;
  const result = evaluateBoard(game.board, puzzle);
  const invalidCells = new Set(result.numbers.filter(n=>n.duplicate).flatMap(n=>n.cells));
  if (checked) result.words.filter(w=>w.complete&&!w.valid).forEach(w=>w.cells.forEach(c=>invalidCells.add(c)));
  $('#board').innerHTML = game.board.map((id,i) => {
    const tile = id === null ? null : puzzle.tiles[id];
    const locked = game.locked.includes(i);
    const label = `Row ${Math.floor(i/3)+1}, column ${i%3+1}, ${tile ? `${tile.letter} ${tile.number}${locked?', locked green tile':''}` : 'empty'}`;
    return `<button class="cell ${tile?'occupied':''} ${locked?'fixed':''} ${id!==null&&selectedTile===id?'selected':''} ${selectedCell===i?'target':''} ${activeLine!==null&&LINES[activeLine].cells.includes(i)?'line-highlight':''} ${invalidCells.has(i)?'invalid':''}" data-cell="${i}" ${tile?`data-occupant="${id}"`:""} data-locked="${locked}" aria-describedby="drag-instructions" aria-label="${label}" aria-pressed="${selectedCell===i || (id!==null&&selectedTile===id)}" draggable="${!!tile&&!locked&&!game.won}">${tile?tileMarkup(id,false,locked):''}</button>`;
  }).join('');
  const available = order.filter(id=>!game.board.includes(id));
  $('#rack').innerHTML = available.map(id=>`<button class="tile ${selectedTile===id?'selected':''}" data-tile="${id}" aria-describedby="drag-instructions" draggable="${!game.won}" aria-label="Tile ${puzzle.tiles[id].letter} ${puzzle.tiles[id].number}" aria-pressed="${selectedTile===id}">${tileMarkup(id,true)}</button>`).join('') + '<div class="rack-slot" aria-hidden="true"></div>'.repeat(8-available.length);
  $('#placed-count').textContent = `${result.placed} / 9 tiles placed`;
  $('#word-count').textContent = `${result.wordCount} / 8 words`;
  $('#watch-count').textContent = `${result.wordCount}/8`;
  $('#progress-dots').innerHTML = Array.from({length:9},(_,i)=>`<i class="${i<result.placed?'active':''}"></i>`).join('');
  $('#word-lines').innerHTML = [{title:'ACROSS',icon:'→',start:0,end:3},{title:'DOWN',icon:'↓',start:3,end:6},{title:'DIAGONAL',icon:'↘',start:6,end:8}].map(group=>`<div class="word-group"><p class="word-group-label"><span aria-hidden="true">${group.icon}</span>${group.title}</p>${result.words.slice(group.start,group.end).map((line,i)=>`<button class="word-line ${line.valid?'valid':''} ${activeLine===group.start+i?'active':''}" data-line="${group.start+i}" aria-label="${line.name}: ${line.word.replaceAll('·','blank ')}${line.valid?', valid word':''}. Show clue"><span class="word-label">${line.name.replace('Column','Col').replace('Diagonal','Diag')}</span><span class="word-letters">${line.word}</span><span class="line-state" aria-hidden="true">${line.valid?'✓':checked&&line.complete?'×':'○'}</span></button>`).join('')}</div>`).join('');
  $('#number-lines').innerHTML = result.numbers.map((n,i)=>`<span class="number-pill ${n.duplicate?'invalid':n.valid?'valid':''}" aria-label="${LINES[i].name}: ${n.duplicate?'repeated number':n.valid?'numbers valid':'incomplete'}">${i<3?'R':'C'}${i%3+1}${n.valid?' ✓':n.duplicate?' ×':''}</span>`).join('');
  $('#puzzle-number').textContent = `PUZZLE ${String(game.round+1).padStart(2,'0')}`;
  $('#difficulty').textContent = puzzle.title;
  $('#timer').textContent = fmt(game.elapsed);
  $('#undo-button').disabled = history.length === 0 || game.won;
  $('#hint-button').disabled = game.hints === 0 || game.won;
  $('#hint-count').textContent = game.hints;
  $('#check-button').innerHTML = game.won ? 'Next puzzle <span aria-hidden="true">↗</span>' : 'Check grid <span aria-hidden="true">↗</span>';
  if (focusKey) $(focusKey)?.focus({preventScroll:true});
}
const sameBoard = (a, b) => a.every((id, i) => id === b[i]);
function changed(next, message, destination, remember = true) {
  if (remember && sameBoard(next, game.board)) { selectedTile=null; selectedCell=null; render(); announce('Your tile is already there.'); return; }
  if (remember) history.push([...game.board]);
  game.board = next;
  while (history.length && sameBoard(history.at(-1), game.board)) history.pop();
  game.moves++; checked = false; activeLine = null;
  selectedTile = null; selectedCell = null; startClock(); render(); save(); announce(message);
  if (destination !== undefined) {
    const cell = $(`[data-cell="${destination}"]`); cell?.focus({preventScroll:true}); cell?.classList.add('pop');
    clearTimeout(popTimeout); popTimeout=setTimeout(()=>cell?.classList.remove('pop'),220);
  }
}
function place(tileId, position) {
  if(game.won) return;
  try { changed(moveTile(game.board,tileId,position,game.locked),'Looking good. Keep connecting.',position); } catch(e) { toast(e.message); }
}
function pickTile(id) {
  if(game.won) return;
  if(selectedCell!==null) { place(id,selectedCell); return; }
  selectedTile=selectedTile===id?null:id; activeLine=null; render();
  announce(selectedTile===null?'Pick a tile. Find its place.':`${puzzle.tiles[id].letter}${puzzle.tiles[id].number} selected. Tap a square.`);
}
function pickCell(position) {
  if(game.won) return;
  if(game.locked.includes(position)) { toast('Green tiles are locked in place.');return; }
  if(selectedTile!==null) {
    if(game.board[position]===selectedTile) { changed(removeTile(game.board,position,game.locked),'Back on the rack. Try another spot.',position); return; }
    place(selectedTile,position);return;
  }
  if(game.board[position]!==null) { selectedTile=game.board[position]; selectedCell=null; announce('Tap another square to move. Tap again to remove.'); }
  else { selectedCell=selectedCell===position?null:position; announce(selectedCell===null?'Pick a tile. Find its place.':'Square selected. Pick a tile below.'); }
  activeLine=null; render();
}
function showModal(html) { tileDrag?.cancel(); modalOpener=document.activeElement; $('#modal-content').innerHTML=html; $('#modal-content h2')?.setAttribute('id','modal-title'); if(!modal.open)modal.showModal(); }
function closeModal() { modal.close(); modalOpener?.focus?.({preventScroll:true}); lastTick=performance.now(); }
function help() {
  showModal(`<p class="modal-kicker">A LITTLE WORDPLAY</p><h2>Welcome to Grid Blitz.</h2><p>Fit all nine letter-and-number tiles into the grid. Each tile is one piece: its letter and number move together.</p><ol><li><strong>Make eight 3-letter words.</strong> Read across left to right, down top to bottom, and both diagonals from the top.</li><li><strong>Use 1, 2, and 3 exactly once</strong> in every row and column. The numbers aren’t points. Diagonals only need to be words.</li><li><strong>Drag a tile onto a square.</strong> Drop on another tile to swap, or back in the rack to return it. You can also tap a tile, then a square. Green tiles stay put.</li></ol><p>Tap a line in Word watch for a clue. Need a nudge? Each hint permanently places a random correct tile and turns it green. Locked hints survive undo and reload. You get three per puzzle.</p><button class="primary-button" data-action="close">Let’s play <span aria-hidden="true">↗</span></button>`);
}
function check() {
  if(game.won) { nextPuzzle(); return; }
  checked=true;
  const result=evaluateBoard(game.board,puzzle); render();
  if(result.placed<9) { const remaining=9-result.placed; announce(`${remaining} more tile${remaining===1?'':'s'} to place. You’ve got this.`);toast(`Fill all nine squares first. ${remaining} to go!`); return; }
  if(result.solved) { win(); return; }
  const numberErrors=result.numbers.filter(n=>n.duplicate).length;
  const wordErrors=8-result.wordCount;
  const message=numberErrors?`Check the numbers: ${numberErrors} row${numberErrors===1?' or column needs':'s or columns need'} a 1, 2, and 3.`:`Almost! ${wordErrors} line${wordErrors===1?' still needs a word':'s still need words'}. Tap Word watch for clues.`;
  announce(message);toast(message);
}
function confetti() {
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  $('#confetti').innerHTML=Array.from({length:45},()=>`<i style="--x:${Math.random()*100}%;--delay:${Math.random()*.7}s;--r:${Math.random()*180}deg;--c:${['#d4fa44','#bba0ef','#252623','#f0c26a'][Math.floor(Math.random()*4)]}"></i>`).join('');
  setTimeout(()=>$('#confetti').replaceChildren(),3600);
}
function win() {
  game.won=true;game.started=false;selectedTile=null;selectedCell=null;render();save();confetti();announce('Eight words. Perfect numbers. You nailed it!');
  showModal(`<div class="win-symbol" aria-hidden="true">✳</div><p class="modal-kicker">THAT’S YOUR AHA MOMENT.</p><h2>You’re on the grid.</h2><p>Eight words. Perfect numbers.<br>One very happy brain.</p><div class="modal-stats"><div><strong>${fmt(game.elapsed)}</strong><small>Your time</small></div><div><strong>${game.moves}</strong><small>Tile moves</small></div><div><strong>${3-game.hints}</strong><small>Hints used</small></div></div><button class="primary-button" data-action="next">One more puzzle <span aria-hidden="true">↗</span></button><button class="text-button view-grid" data-action="close">Admire your grid</button>`);
}
function nextPuzzle() { closeModal();game=newGame(game.round+1);puzzle=getPuzzle(game.round);history=[];selectedTile=null;selectedCell=null;checked=false;activeLine=null;shuffle(false);render();save();announce('New grid. New aha. Let’s go.');$('.game').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'}); }
function reset() { closeModal();game=newGame(game.round);history=[];selectedTile=null;selectedCell=null;checked=false;activeLine=null;render();save();announce('A fresh start. You’ve got this.'); }
function shuffle(notify=true) { for(let i=order.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[order[i],order[j]]=[order[j],order[i]];}selectedTile=null;selectedCell=null;render();if(notify)announce('A fresh perspective. Same possibilities.'); }
function hint() {
  if(!game.hints||game.won)return;
  if(evaluateBoard(game.board,puzzle).solved){check();return;}
  const h=hintMove(game.board,puzzle,game.locked);if(!h)return;
  game.hints--;game.locked=h.locked;
  history=history.map(snapshot=>preserveLockedTiles(snapshot,h.board,game.locked)).filter((snapshot,i,all)=>i===0||!sameBoard(snapshot,all[i-1]));
  changed(h.board,`Locked in green. ${game.hints} hint${game.hints===1?'':'s'} left.`,h.target,false);
  toast(`${puzzle.tiles[game.board[h.target]].letter}${puzzle.tiles[game.board[h.target]].number} is locked in row ${Math.floor(h.target/3)+1}, column ${h.target%3+1}.`);
}
function undo() { if(!history.length||game.won)return;game.board=preserveLockedTiles(history.pop(),game.board,game.locked);while(history.length&&sameBoard(history.at(-1),game.board))history.pop();game.moves++;checked=false;activeLine=null;selectedTile=null;selectedCell=null;render();save();announce('One step back. A new way forward.'); }
function showClue(index) {
  activeLine=index;render();const line=evaluateBoard(game.board,puzzle).words[index];
  showModal(`<p class="modal-kicker">${line.direction.toUpperCase()} · ${line.name.toUpperCase()}</p><h2>${line.valid?line.word:'A little clue.'}</h2><p>${line.valid && line.word !== LINES[index].cells.map(i=>puzzle.tiles[i].letter).join('') ? 'This word works here. Keep connecting the rest of the grid' : puzzle.clues[index]}.</p><p class="clue-note">${line.valid?'This line already makes a word. Nice work!':'This clue suggests one possible fit. Any valid 3-letter word works if the whole grid fits.'}</p><button class="primary-button" data-action="close">Got it <span aria-hidden="true">↗</span></button>`);
}
const actions={help,close:closeModal,shuffle,hint,undo,check,next:nextPuzzle,confirmReset:reset,reset:()=>showModal(`<p class="modal-kicker">FRESH EYES?</p><h2>Give it another go.</h2><p>Put your tiles back on the rack and restart this puzzle with three hints.</p><button class="primary-button" data-action="confirmReset">Start this puzzle over <span aria-hidden="true">↗</span></button><button class="text-button view-grid" data-action="close">Keep playing</button>`)};
document.addEventListener('click',event=> {
  if(tileDrag?.active)return;
  const action=event.target.closest('[data-action]');if(action){actions[action.dataset.action]?.();return;}
  const tile=event.target.closest('[data-tile]');if(tile){pickTile(Number(tile.dataset.tile));return;}
  const cell=event.target.closest('[data-cell]');if(cell){pickCell(Number(cell.dataset.cell));return;}
  const line=event.target.closest('[data-line]');if(line)showClue(Number(line.dataset.line));
});
modal.addEventListener('click',e=>{if(e.target===modal){const r=modal.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeModal();}});
modal.addEventListener('close',()=>{lastTick=performance.now();});
document.addEventListener('keydown',e=>{
  if(modal.open||tileDrag?.active)return;
  if(e.key==='Escape'){selectedTile=null;selectedCell=null;activeLine=null;render();announce('Pick a tile. Find its place.');return;}
  if(game.won||e.ctrlKey||e.metaKey||e.altKey)return;
  const focused=document.activeElement;
  if(focused?.dataset.cell!==undefined){const pos=Number(focused.dataset.cell);const offsets={ArrowLeft:-1,ArrowRight:1,ArrowUp:-3,ArrowDown:3};if(e.key in offsets){e.preventDefault();$(`[data-cell="${(pos+offsets[e.key]+9)%9}"]`)?.focus();return;}if((e.key==='Backspace'||e.key==='Delete')&&!game.locked.includes(pos)&&game.board[pos]!==null){e.preventDefault();changed(removeTile(game.board,pos,game.locked),'Tile returned to the rack.',pos);return;}}
  if(/^[a-z]$/i.test(e.key)){const ids=order.filter(id=>!game.board.includes(id)&&puzzle.tiles[id].letter===e.key.toUpperCase());if(ids.length){e.preventDefault();pickTile(ids[(ids.indexOf(selectedTile)+1)%ids.length]);}}
});
tileDrag=installTileDrag({
  board:$('#board'),rack:$('#rack'),announce,
  isPlaying:()=>!game.won&&!modal.open,
  canMove:id=>Number.isInteger(id)&&id>=0&&id<9&&!game.won&&!modal.open&&!game.locked.includes(game.board.indexOf(id)),
  canDrop:(id,position)=>!game.locked.includes(position),
  onStart:()=>{
    selectedTile=null;selectedCell=null;activeLine=null;
    document.querySelectorAll('.selected,.target,.line-highlight').forEach(el=>el.classList.remove('selected','target','line-highlight'));
    document.querySelectorAll('[aria-pressed="true"]').forEach(el=>el.setAttribute('aria-pressed','false'));
  },
  onCellDrop:place,
  onRackDrop:(id,beforeId)=>{
    if(beforeId!==null&&beforeId!==id){order.splice(order.indexOf(id),1);order.splice(order.indexOf(beforeId),0,id);}
    const source=game.board.indexOf(id);
    if(source!==-1)changed(removeTile(game.board,source,game.locked),'Back on the rack. Try another spot.');
    else { render();announce('Your tiles, your order.'); }
    $(`[data-tile="${id}"]`)?.focus({preventScroll:true});
  }
});
setInterval(()=>{const now=performance.now();if(game.started&&!game.won&&!document.hidden&&!modal.open){game.elapsed+=(now-lastTick)/1000;$('#timer').textContent=fmt(game.elapsed);save();}lastTick=now;},1000);
document.addEventListener('visibilitychange',()=>{lastTick=performance.now();save();});
render();if(game.won)announce('Eight words. Perfect numbers. Ready for another?');

// The same actions are available to browsers that support WebMCP.
if(document.modelContext?.registerTool){
  const lifecycle=new AbortController();
  const state=()=>({round:game.round+1,board:game.board.map(id=>id===null?null:puzzle.tiles[id]),available:puzzle.tiles.filter(t=>!game.board.includes(t.id)),hintsRemaining:game.hints,lockedCells:[...game.locked],...evaluateBoard(game.board,puzzle)});
  const tools=[
    {name:'get_grid_blitz_state',description:'Read the current Grid Blitz board, available tiles, and word/number progress.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true},execute:()=>state()},
    {name:'place_grid_blitz_tile',description:'Move one available or placed tile into a square. Occupied squares swap or return a tile to the rack. Tile IDs and positions are zero-based. Green center and hint tiles are permanently locked.',inputSchema:{type:'object',properties:{tileId:{type:'integer',minimum:0,maximum:8},position:{type:'integer',minimum:0,maximum:8}},required:['tileId','position'],additionalProperties:false},annotations:{readOnlyHint:false},execute:input=>{if(game.won)throw new Error('Puzzle is complete.');const next=moveTile(game.board,input.tileId,input.position,game.locked);changed(next,'Tile placed.',input.position);return state();}},
    {name:'check_grid_blitz',description:'Validate all eight words and the number constraints, and finish the puzzle if solved.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:false},execute:()=>{if(!game.won)check();return state();}}
  ];
  for(const tool of tools){try{Promise.resolve(document.modelContext.registerTool(tool,{signal:lifecycle.signal})).catch(()=>{});}catch{}}
  window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true});
}

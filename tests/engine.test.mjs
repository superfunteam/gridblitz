import test from 'node:test';
import assert from 'node:assert/strict';
import { PUZZLES, getPuzzle, newGame, evaluateBoard, moveTile, removeTile, hintMove, preserveLockedTiles, validSavedGame, restoreGame } from '../dist/engine.js';

test('every puzzle and all digit variations satisfy eight words and six number rules', () => {
  for (let round=0; round<PUZZLES.length*6; round++) {
    const result = evaluateBoard([0,1,2,3,4,5,6,7,8], getPuzzle(round));
    assert.equal(result.solved, true, `Round ${round+1}: ${result.words.filter(w=>!w.valid).map(w=>w.word)}`);
    assert.equal(result.wordCount, 8);
  }
});
test('placing, replacing, swapping, and removing preserve tile identity and the fixed center', () => {
  let board = newGame().board;
  board=moveTile(board,0,1);board=moveTile(board,1,2);
  board=moveTile(board,0,2);assert.equal(board[1],1);assert.equal(board[2],0);
  board=moveTile(board,2,2);assert.equal(board[2],2);assert.equal(board.includes(0),false);
  board=removeTile(board,1);assert.equal(board[1],null);assert.equal(board[4],4);
  assert.throws(()=>moveTile(board,4,1));assert.throws(()=>moveTile(board,1,4));assert.throws(()=>moveTile(board,-1,1));assert.throws(()=>removeTile(board,4));
});
test('word checks do not require a target tile identity when duplicate tiles are equivalent', () => {
  const board=[0,1,2,3,4,7,6,5,8];
  assert.equal(evaluateBoard(board,getPuzzle(0)).solved,true);
});
test('repeated numbers and invalid diagonal words prevent completion', () => {
  const board=[0,1,2,3,4,5,6,7,8];
  const puzzle=getPuzzle(0);puzzle.tiles[0].number=2;
  assert.equal(evaluateBoard(board,puzzle).solved,false);
  assert.equal(evaluateBoard(board,puzzle).numbers[0].duplicate,true);
  const bad=getPuzzle(0);bad.tiles[0].letter='Z';
  assert.equal(evaluateBoard(board,bad).words[6].valid,false);
  assert.equal(evaluateBoard(board,bad).solved,false);
});
test('hints converge to a valid solution and never duplicate or lose a fixed tile', () => {
  for(let round=0;round<PUZZLES.length*6;round++) {
    for (const random of [()=>0,()=>.49,()=>.999]) {
      const puzzle=getPuzzle(round);let board=[8,7,6,5,4,3,2,1,0],locked=[4];
      for(let i=0;i<9;i++) {
        const hint=hintMove(board,puzzle,locked,random);if(!hint)break;
        locked.forEach(cell=>assert.equal(hint.board[cell],board[cell]));
        board=hint.board;locked=hint.locked;
        assert.equal(new Set(board.filter(x=>x!==null)).size,board.filter(x=>x!==null).length);assert.equal(board[4],4);
      }
      assert.equal(evaluateBoard(board,puzzle).solved,true,`Round ${round}`);
    }
  }
});
test('saved games reject malformed, duplicate, and fixed-center-corrupt data', () => {
  assert.equal(validSavedGame(newGame()),true);
  for(const patch of [{board:[0,0,null,null,4,null,null,null,null]},{hints:4},{round:-1},{board:Array(9).fill(null)},{elapsed:Infinity},{moves:'bad'}])assert.equal(validSavedGame({...newGame(),...patch}),false);
});
test('hints randomly choose an unfilled or incorrect square and protect both sides of every move', () => {
  const game=newGame(),puzzle=getPuzzle(0);
  const targets=Array.from({length:8},(_,i)=>hintMove(game.board,puzzle,game.locked,()=>i/8).target);
  assert.deepEqual(targets,[0,1,2,3,5,6,7,8]);
  const hint=hintMove(game.board,puzzle,game.locked,()=>.999);
  assert.equal(hint.board[8],8);assert.deepEqual(hint.locked,[4,8]);
  assert.throws(()=>moveTile(hint.board,8,0,hint.locked));
  assert.throws(()=>moveTile(hint.board,0,8,hint.locked));
  assert.throws(()=>removeTile(hint.board,8,hint.locked));
  assert.equal(moveTile(hint.board,0,1,hint.locked)[8],8);
});
test('equivalent hint tiles stay locked while another matching tile fills the other square', () => {
  const board=newGame().board;board[5]=7;
  const hint=hintMove(board,getPuzzle(0),[4,5],()=>.99);
  assert.equal(hint.board[5],7);
  const next=hintMove(hint.board,getPuzzle(0),hint.locked,()=>.99);
  assert.equal(next.target,7);assert.equal(next.board[7],5);assert.equal(next.board[5],7);
});
test('undo preserves every hint, removes duplicate historical tile IDs, and returns displaced tiles to the rack', () => {
  let before=moveTile(newGame().board,0,8);
  before=moveTile(before,1,0);
  const hint=hintMove(before,getPuzzle(0),[4],()=>0);
  assert.equal(hint.target,0);assert.equal(hint.board[0],0);assert.equal(hint.board[8],1);
  const undo=preserveLockedTiles(before,hint.board,hint.locked);
  assert.equal(undo[0],0);assert.equal(undo[8],null);assert.equal(undo.includes(1),false);
  const earliest=preserveLockedTiles(newGame().board,hint.board,hint.locked);
  assert.deepEqual(earliest,[0,null,null,null,4,null,null,null,null]);
  assert.equal(new Set(undo.filter(id=>id!==null)).size,undo.filter(id=>id!==null).length);
});
test('hint locks persist in saved games and old saves migrate without losing progress', () => {
  let game=newGame();const h=hintMove(game.board,getPuzzle(0),game.locked,()=>0);
  game={...game,board:h.board,locked:h.locked,hints:2,moves:1};
  assert.deepEqual(restoreGame(JSON.parse(JSON.stringify(game))),game);
  for(const locked of [[4,4],[4,8],[0],[4,9],[4,'0']])assert.equal(validSavedGame({...game,locked}),false);
  assert.equal(validSavedGame({...game,hints:3}),false);
  const legacy={...game,version:1};delete legacy.locked;
  assert.deepEqual(restoreGame(legacy),{...game,locked:[4]});
  assert.deepEqual(newGame(game.round).locked,[4]);
  assert.deepEqual(newGame(game.round+1).locked,[4]);
});

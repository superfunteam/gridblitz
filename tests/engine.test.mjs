import test from 'node:test';
import assert from 'node:assert/strict';
import { PUZZLES, getPuzzle, newGame, evaluateBoard, moveTile, removeTile, hintMove, validSavedGame } from '../dist/engine.js';

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
  for(let round=0;round<PUZZLES.length;round++) {
    const puzzle=getPuzzle(round);let board=[8,7,6,5,4,3,2,1,0];
    for(let i=0;i<9;i++) { const hint=hintMove(board,puzzle);if(!hint)break;board=hint.board;assert.equal(new Set(board.filter(x=>x!==null)).size,board.filter(x=>x!==null).length);assert.equal(board[4],4); }
    assert.equal(evaluateBoard(board,puzzle).solved,true,`Round ${round}`);
  }
});
test('saved games reject malformed, duplicate, and fixed-center-corrupt data', () => {
  assert.equal(validSavedGame(newGame()),true);
  for(const patch of [{board:[0,0,null,null,4,null,null,null,null]},{hints:4},{round:-1},{board:Array(9).fill(null)},{elapsed:Infinity},{moves:'bad'}])assert.equal(validSavedGame({...newGame(),...patch}),false);
});

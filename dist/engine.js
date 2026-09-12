export const LINES = [
  { name: 'Row 1', cells: [0, 1, 2], direction: 'Across' },
  { name: 'Row 2', cells: [3, 4, 5], direction: 'Across' },
  { name: 'Row 3', cells: [6, 7, 8], direction: 'Across' },
  { name: 'Column 1', cells: [0, 3, 6], direction: 'Down' },
  { name: 'Column 2', cells: [1, 4, 7], direction: 'Down' },
  { name: 'Column 3', cells: [2, 5, 8], direction: 'Down' },
  { name: 'Diagonal 1', cells: [0, 4, 8], direction: 'Diagonal ↘' },
  { name: 'Diagonal 2', cells: [2, 4, 6], direction: 'Diagonal ↙' },
];
// Every authored layout forms words along all eight lines. The digits form a
// Latin square across rows and columns; diagonal digits are unconstrained.
export const PUZZLES = [
  { rows: ['BOP', 'EAR', 'DRY'], title: 'THE WARM-UP', clues: ['Dance to a catchy beat', 'What you hear with', 'The opposite of wet', 'A place to sleep', 'A tool for rowing a boat', 'To open with a lever', 'A sheltered part of the sea', 'A cushion, or a place to jot notes'] },
  { rows: ['ADO', 'LID', 'LED'], title: 'LITTLE BY LITTLE', clues: ['Fuss or commotion', 'The top of a jar', 'Guided the way (past tense)', 'Every single one', 'One cube from a pair of dice', 'Not even', 'Help or assistance', 'What you might cook with'] },
  { rows: ['DOC', 'EAR', 'WRY'], title: 'TURN A CORNER', clues: ['A doctor, for short', 'What you hear with', 'Dryly amusing', 'Morning drops on the grass', 'A tool for rowing a boat', 'Shed a tear', 'Twenty-four hours', 'The call of a crow'] },
  { rows: ['HOP', 'OAR', 'TRY'], title: 'IN THE GROOVE', clues: ['A little jump', 'A tool for rowing a boat', 'Give it a go', 'The opposite of cold', 'A tool for rowing a boat', 'To open with a lever', 'Dried grass for horses', 'A gentle tap'] },
  { rows: ['BAT', 'ORE', 'YEA'], title: 'CROSS YOUR WORDS', clues: ['A flying mammal', 'Rock that contains metal', 'An affirmative vote', 'A sheltered part of the sea', 'You ___ here', 'A drink made with leaves', 'A supportive undergarment', 'Give it a go'] },
  { rows: ['ITS', 'COO', 'YEN'], title: 'A FRESH ANGLE', clues: ['Belonging to it', 'A soft sound a dove makes', 'Japanese currency', 'Covered in frozen water', 'One of ten on your feet', 'A male child', 'An electrically charged atom', 'A bean used to make tofu'] },
  { rows: ['LOW', 'EAR', 'DRY'], title: 'FIND YOUR FLOW', clues: ['Close to the ground', 'What you hear with', 'The opposite of wet', 'Guided the way (past tense)', 'A tool for rowing a boat', 'Dryly amusing', 'Put something down', 'A small bundle of paper'] },
  { rows: ['HOT', 'OAR', 'PRY'], title: 'THINK SIDEWAYS', clues: ['The opposite of cold', 'A tool for rowing a boat', 'To open with a lever', 'A little jump', 'A tool for rowing a boat', 'Give it a go', 'Dried grass for horses', 'A light touch'] },
  { rows: ['BOW', 'EAR', 'DRY'], title: 'THE LAST STRETCH', clues: ['A ribbon tied in loops', 'What you hear with', 'The opposite of wet', 'A place to sleep', 'A tool for rowing a boat', 'Dryly amusing', 'A sheltered part of the sea', 'A small bundle of paper'] },
  { rows: ['BIT', 'ORE', 'YEA'], title: 'BIG BRAIN ENERGY', clues: ['A small piece', 'Rock that contains metal', 'An affirmative vote', 'A young male person', 'Anger', 'A drink made with leaves', 'A supportive undergarment', 'Give it a go'] },
  { rows: ['DOC', 'OAR', 'TRY'], title: 'CONNECT THE DOTS', clues: ['A doctor, for short', 'A tool for rowing a boat', 'Give it a go', 'A tiny round mark', 'A tool for rowing a boat', 'Shed a tear', 'Twenty-four hours', 'A whiskered house pet'] },
  { rows: ['LOP', 'EAR', 'DRY'], title: 'ONE MORE AHA', clues: ['Cut off a branch', 'What you hear with', 'The opposite of wet', 'Guided the way (past tense)', 'A tool for rowing a boat', 'To open with a lever', 'Put something down', 'A cushion, or a place to jot notes'] },
];
export const WORDS = new Set(`ACE ACT ADD ADO ADS AFT AGE AGO AID AIM AIR ALE ALL AMP AND ANT ANY APE APP APT ARC ARE ARK ARM ART ASH ASK ATE AWE AWL AXE AYE BAD BAG BAN BAR BAT BAY BED BEE BEG BET BIB BID BIG BIN BIT BOA BOB BOG BOP BOW BOX BOY BRA BUD BUG BUM BUN BUS BUT BUY BYE CAB CAD CAM CAN CAP CAR CAT CAW COB COD COG CON COO COP COT COW COY CRY CUB CUE CUP CUR CUT DAB DAD DAM DAY DEN DEW DID DIE DIG DIM DIP DOC DOE DOG DON DOT DRY DUB DUD DUE DUG DUN DUO DYE EAR EAT EBB EEL EGG EGO ELF ELK ELM EMU END ERA ERR EVE EWE EYE FAB FAD FAN FAR FAT FAX FED FEE FEW FEZ FIB FIG FIN FIR FIT FIX FLY FOB FOE FOG FOR FOX FRY FUN FUR GAB GAG GAP GAS GAY GEL GEM GET GIG GIN GNU GOB GOD GOO GOT GUM GUN GUT GUY GYM HAD HAG HAM HAS HAT HAY HEM HEN HER HEW HEX HEY HID HIM HIP HIS HIT HOB HOG HOP HOT HOW HUB HUE HUG HUH HUM HUT ICE ICY ILL IMP INK INN ION IRE IRK ITS IVY JAB JAG JAM JAR JAW JAY JET JIG JOB JOG JOT JOY JUG JUT KEY KID KIN KIT LAB LAD LAG LAP LAW LAX LAY LED LEG LET LID LIE LIP LIT LOG LOP LOT LOW LOX LUG LYE MAD MAN MAP MAR MAT MAW MAY MEN MET MEW MID MIX MOB MOD MOM MOO MOP MOW MUD MUG MUM NAB NAG NAP NET NEW NIB NIL NIP NIT NOD NON NOR NOT NOW NUB NUN NUT OAF OAK OAR OAT ODD ODE OFF OFT OIL OLD ONE OPT ORB ORC ORE OUR OUT OVA OWE OWL OWN PAD PAL PAN PAR PAT PAW PAY PEA PEG PEN PEP PER PET PEW PIE PIG PIN PIT PLY POD POP POT POW PRO PRY PUB PUG PUN PUP PUT RAD RAG RAM RAN RAP RAT RAW RAY RED REF REP RIB RID RIG RIM RIP ROB ROD ROE ROT ROW RUB RUE RUG RUM RUN RUT RYE SAD SAG SAP SAT SAW SAY SEA SEE SET SEW SHE SHY SIN SIP SIR SIT SIX SKI SKY SLY SOB SOD SON SOP SOW SOY SPA SPY SUB SUE SUM SUN SUP TAB TAD TAG TAN TAP TAR TAT TAX TEA TED TEE TEN THE THY TIC TIE TIN TIP TOE TON TOO TOP TOT TOW TOY TRY TUB TUG TUT TWO UGH UMP URN USE VAN VAT VET VEX VIA VIE VOW WAD WAG WAR WAS WAX WAY WEB WED WEE WET WHO WHY WIG WIN WIT WOE WOK WON WOO WOW WRY YAK YAM YAP YAW YAY YEA YEN YES YET YEW YIN YIP YOU ZAG ZAP ZED ZEN ZIG ZIP ZIT ZOO`.split(/\s+/));

export function getPuzzle(round) {
  const index = ((round % PUZZLES.length) + PUZZLES.length) % PUZZLES.length;
  const source = PUZZLES[index];
  const cycle = Math.floor(round / PUZZLES.length) % 6;
  const permutations = [[1,2,3],[2,3,1],[3,1,2],[1,3,2],[2,1,3],[3,2,1]];
  const numbers = permutations[cycle];
  return { ...source, tiles: source.rows.join('').split('').map((letter, id) => ({ id, letter, number: numbers[(Math.floor(id / 3) + id % 3) % 3] })) };
}
export function newGame(round = 0) {
  const board = Array(9).fill(null); board[4] = 4;
  return { version: 2, round, board, locked: [4], hints: 3, moves: 0, elapsed: 0, started: false, won: false };
}
export function evaluateBoard(board, puzzle) {
  const words = LINES.map(line => {
    const word = line.cells.map(i => board[i] === null ? '·' : puzzle.tiles[board[i]].letter).join('');
    return { ...line, word, complete: !word.includes('·'), valid: WORDS.has(word) };
  });
  const numbers = LINES.slice(0, 6).map(line => {
    const filled = line.cells.filter(i => board[i] !== null);
    const values = filled.map(i => puzzle.tiles[board[i]].number);
    return { cells: line.cells, duplicate: new Set(values).size !== values.length, valid: values.length === 3 && new Set(values).size === 3 };
  });
  return { words, numbers, placed: board.filter(id => id !== null).length, wordCount: words.filter(w => w.valid).length, solved: words.every(w => w.valid) && numbers.every(n => n.valid) };
}
export function moveTile(board, tileId, destination, locked = [4]) {
  if (!Number.isInteger(tileId) || tileId < 0 || tileId > 8 || !Number.isInteger(destination) || destination < 0 || destination > 8) throw new Error('Choose a valid tile and square.');
  const source = board.indexOf(tileId);
  if (tileId === 4 || locked.includes(source) || locked.includes(destination)) throw new Error('Green tiles are locked in place.');
  const next = [...board];
  if (source === destination) return next;
  if (source !== -1) next[source] = next[destination];
  next[destination] = tileId;
  return next;
}
export function removeTile(board, position, locked = [4]) {
  if (!Number.isInteger(position) || position < 0 || position > 8 || locked.includes(position)) throw new Error('Green tiles are locked in place.');
  const next = [...board]; next[position] = null; return next;
}
export function hintMove(board, puzzle, locked = [4], random = Math.random) {
  const same = (id, cell) => id !== null && puzzle.tiles[id].letter === puzzle.tiles[cell].letter && puzzle.tiles[id].number === puzzle.tiles[cell].number;
  const targets = board.flatMap((id, cell) => !locked.includes(cell) && !same(id, cell) ? [cell] : []);
  if (!targets.length) return null;
  const target = targets[Math.min(targets.length - 1, Math.max(0, Math.floor(random() * targets.length)))];
  const candidates = puzzle.tiles.filter(tile => !locked.includes(board.indexOf(tile.id)) && same(tile.id, target));
  // Equivalent tiles may share a letter and number. Prefer an unused tile,
  // then a misplaced one, so a correct or permanently locked tile stays put.
  const tile = candidates.find(t => !board.includes(t.id)) ?? candidates.find(t => !same(t.id, board.indexOf(t.id))) ?? candidates[0];
  if (!tile) return null;
  return { board: moveTile(board, tile.id, target, locked), target, locked: [...locked, target] };
}
export function preserveLockedTiles(snapshot, currentBoard, locked) {
  // Undo still reverses earlier ordinary moves, but never removes a hint or
  // reintroduces its tile elsewhere. Displaced historical tiles return to the rack.
  const fixedIds = new Set(locked.map(cell => currentBoard[cell]));
  return snapshot.map((id, cell) => locked.includes(cell) ? currentBoard[cell] : fixedIds.has(id) ? null : id);
}
export function validSavedGame(value) {
  if (!value || ![1, 2].includes(value.version) || !Number.isInteger(value.round) || value.round < 0 || value.round > 100000 || !Array.isArray(value.board) || value.board.length !== 9 || value.board[4] !== 4) return false;
  const ids = value.board.filter(x => x !== null);
  if (!(ids.every(x => Number.isInteger(x) && x >= 0 && x < 9) && new Set(ids).size === ids.length && Number.isInteger(value.hints) && value.hints >= 0 && value.hints <= 3 && Number.isInteger(value.moves) && value.moves >= 0 && Number.isFinite(value.elapsed) && value.elapsed >= 0 && typeof value.won === 'boolean' && typeof value.started === 'boolean')) return false;
  if (value.version === 1) return true;
  const locked = value.locked;
  if (!Array.isArray(locked) || !locked.includes(4) || locked.length > 4 - value.hints || new Set(locked).size !== locked.length) return false;
  const puzzle = getPuzzle(value.round);
  return locked.every(cell => Number.isInteger(cell) && cell >= 0 && cell < 9 && value.board[cell] !== null && puzzle.tiles[value.board[cell]].letter === puzzle.tiles[cell].letter && puzzle.tiles[value.board[cell]].number === puzzle.tiles[cell].number);
}
export function restoreGame(value) {
  if (!validSavedGame(value)) return null;
  return { ...value, version: 2, board: [...value.board], locked: value.version === 1 ? [4] : [...value.locked] };
}

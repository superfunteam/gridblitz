// Browser-native HTML drag/drop for mouse input; Pointer Events for direct
// touch and pen gestures. Both commit through the same game actions.
export function installTileDrag({ board, rack, canMove, canDrop, isPlaying, onStart, onCellDrop, onRackDrop, announce }) {
  const doc = board.ownerDocument;
  const win = doc.defaultView;
  const MIME = 'application/x-grid-blitz-tile';
  let drag = null, pointer = null, highlighted = null, preview = null;
  let frame = 0, suppressUntil = 0, lastFrame = 0;

  function sourceFrom(element) {
    const source = element?.closest?.('[data-tile], [data-cell]');
    if (!source || !(board.contains(source) || rack.contains(source))) return null;
    const tileId = Number(source.dataset.tile ?? source.dataset.occupant);
    if (!Number.isInteger(tileId) || !canMove(tileId)) return null;
    return { source, tileId };
  }
  function targetFrom(element) {
    const cell = element?.closest?.('[data-cell]');
    if (cell && board.contains(cell)) return { element: cell, position: Number(cell.dataset.cell), valid: canDrop(drag.tileId, Number(cell.dataset.cell)) };
    if (element && rack.contains(element)) return { element: rack, beforeId: element.closest('[data-tile]')?.dataset.tile, valid: true };
    return null;
  }
  function clearHighlight() {
    highlighted?.element.classList.remove('drop-target', 'drop-blocked');
    highlighted?.element.removeAttribute('data-drop-label');
    highlighted = null;
  }
  function highlight(target) {
    if (highlighted?.element === target?.element && highlighted?.valid === target?.valid) { highlighted = target; return; }
    clearHighlight();
    highlighted = target;
    if (!target) return;
    target.element.classList.add(target.valid ? 'drop-target' : 'drop-blocked');
    const occupied = target.element.dataset.occupant !== undefined;
    const text = !target.valid ? 'Locked' : target.element === rack ? 'Return to rack' : occupied ? 'Swap' : 'Place';
    target.element.dataset.dropLabel = text;
    announce(!target.valid ? 'Green tiles stay put. Choose another square.' : target.element === rack ? 'Drop in your rack.' : `${text} in row ${Math.floor(target.position / 3) + 1}, column ${target.position % 3 + 1}.`);
  }
  function makePreview(source) {
    const bounds = source.getBoundingClientRect();
    const clone = source.cloneNode(true);
    clone.removeAttribute('id'); clone.removeAttribute('data-tile'); clone.removeAttribute('data-cell');
    clone.removeAttribute('data-occupant'); clone.removeAttribute('aria-pressed');
    clone.setAttribute('aria-hidden', 'true'); clone.setAttribute('tabindex', '-1'); clone.draggable = false;
    clone.classList.remove('selected', 'target', 'line-highlight', 'invalid', 'pop', 'drag-origin');
    clone.classList.add('drag-preview');
    clone.style.setProperty('--drag-width', `${bounds.width}px`);
    clone.style.setProperty('--drag-height', `${bounds.height}px`);
    doc.body.append(clone);
    return clone;
  }
  function updatePreview(x, y) {
    preview?.style.setProperty('--drag-x', `${x}px`);
    preview?.style.setProperty('--drag-y', `${y - 34}px`);
  }
  function begin(source, tileId, mode) {
    onStart();
    drag = { source, tileId, mode, token: `${Date.now()}-${Math.random()}` };
    doc.body.classList.add('is-dragging');
    source.classList.add('drag-origin');
    announce('Drop on a square to place or swap. Drop in the rack to return.');
  }
  function suppressClick() { suppressUntil = Date.now() + 400; }
  function clean() {
    const capture = pointer;
    pointer = null;
    if (frame) win.cancelAnimationFrame(frame);
    frame = 0; lastFrame = 0;
    clearHighlight();
    preview?.remove(); preview = null;
    drag?.source.classList.remove('drag-origin');
    doc.body.classList.remove('is-dragging');
    drag = null;
    if (capture?.source.hasPointerCapture?.(capture.id)) capture.source.releasePointerCapture(capture.id);
  }
  function cancel(message = 'Move cancelled. Your tile stayed put.') {
    const moving = !!drag;
    clean();
    if (moving) { suppressClick(); announce(message); }
  }
  function commit(target) {
    const tileId = drag.tileId;
    const valid = !!target?.valid && isPlaying() && canMove(tileId);
    clean(); suppressClick();
    if (!valid) { announce(target && !target.valid ? 'Green tiles are locked. Your tile stayed put.' : 'Move cancelled. Your tile stayed put.'); return; }
    if (target.position !== undefined) onCellDrop(tileId, target.position);
    else onRackDrop(tileId, target.beforeId === undefined ? null : Number(target.beforeId));
  }
  function autoScroll(time) {
    if (!drag || drag.mode !== 'pointer' || !pointer) return;
    const dt = lastFrame ? Math.min(32, time - lastFrame) : 16;
    lastFrame = time;
    const edge = 64;
    const velocity = pointer.y < edge ? -Math.min(1, (edge - pointer.y) / edge) : pointer.y > win.innerHeight - edge ? Math.min(1, (pointer.y - win.innerHeight + edge) / edge) : 0;
    if (velocity) win.scrollBy({ top: velocity * dt * .65, behavior: 'instant' });
    highlight(targetFrom(doc.elementFromPoint(pointer.x, pointer.y)));
    frame = win.requestAnimationFrame(autoScroll);
  }

  doc.addEventListener('dragstart', event => {
    const item = sourceFrom(event.target);
    if (!item || !isPlaying() || pointer || drag || !event.dataTransfer) { event.preventDefault(); return; }
    begin(item.source, item.tileId, 'native');
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData(MIME, drag.token);
    event.dataTransfer.setData('text/plain', item.source.getAttribute('aria-label') || 'Grid Blitz tile');
    preview = makePreview(item.source);
    const rect = item.source.getBoundingClientRect();
    // A rendered clone keeps the native drag image crisp, even while the
    // original tile is dimmed. Remove it only after the browser captures it.
    preview.style.setProperty('--drag-x', `${rect.left + rect.width / 2}px`);
    preview.style.setProperty('--drag-y', `${rect.top + rect.height / 2}px`);
    preview.classList.add('native-preview');
    event.dataTransfer.setDragImage(preview, rect.width / 2, rect.height / 2);
    win.requestAnimationFrame(() => { if (drag?.mode === 'native') { preview?.remove(); preview = null; } });
  });
  for (const type of ['dragenter', 'dragover']) doc.addEventListener(type, event => {
    if (drag?.mode !== 'native') return;
    const target = targetFrom(event.target);
    highlight(target);
    // Cancelling dragover enables dropping. Invalid squares still accept the
    // event for feedback, but expose the native forbidden drop cursor.
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = target?.valid ? 'move' : 'none';
  });
  doc.addEventListener('dragleave', event => {
    if (drag?.mode === 'native' && !event.relatedTarget) clearHighlight();
  });
  doc.addEventListener('drop', event => {
    if (drag?.mode !== 'native') return;
    event.preventDefault();
    if (event.dataTransfer?.getData(MIME) !== drag.token) { cancel(); return; }
    commit(targetFrom(event.target));
  });
  doc.addEventListener('dragend', () => { if (drag?.mode === 'native') cancel(highlighted && !highlighted.valid ? 'Green tiles are locked. Your tile stayed put.' : undefined); });

  doc.addEventListener('pointerdown', event => {
    if (event.pointerType === 'mouse') return;
    if (pointer || !event.isPrimary) { if (pointer) cancel(); return; }
    if (event.button !== 0 || !isPlaying()) return;
    const item = sourceFrom(event.target);
    if (!item) return;
    pointer = { ...item, id: event.pointerId, x: event.clientX, y: event.clientY, startX: event.clientX, startY: event.clientY };
  });
  doc.addEventListener('pointermove', event => {
    if (!pointer || event.pointerId !== pointer.id) return;
    pointer.x = event.clientX; pointer.y = event.clientY;
    if (!drag && Math.hypot(pointer.x - pointer.startX, pointer.y - pointer.startY) >= 7) {
      begin(pointer.source, pointer.tileId, 'pointer');
      pointer.source.setPointerCapture?.(pointer.id);
      preview = makePreview(pointer.source);
      frame = win.requestAnimationFrame(autoScroll);
    }
    if (!drag) return;
    event.preventDefault();
    updatePreview(pointer.x, pointer.y);
    highlight(targetFrom(doc.elementFromPoint(pointer.x, pointer.y)));
  }, { passive: false });
  doc.addEventListener('pointerup', event => {
    if (!pointer || event.pointerId !== pointer.id) return;
    if (!drag) { pointer = null; return; } // A short tap uses ordinary buttons.
    event.preventDefault();
    commit(targetFrom(doc.elementFromPoint(event.clientX, event.clientY)));
  });
  for (const type of ['pointercancel', 'lostpointercapture']) doc.addEventListener(type, event => {
    if (pointer?.id === event.pointerId) cancel();
  });
  doc.addEventListener('click', event => {
    if (event.detail && Date.now() < suppressUntil && event.target.closest('.game')) {
      event.preventDefault(); event.stopImmediatePropagation(); suppressUntil = 0;
    }
  }, true);
  doc.addEventListener('keydown', event => {
    if (event.key === 'Escape' && (drag || pointer)) { event.preventDefault(); event.stopImmediatePropagation(); cancel(); }
  }, true);
  doc.addEventListener('contextmenu', event => { if (sourceFrom(event.target)) event.preventDefault(); });
  doc.addEventListener('visibilitychange', () => { if (doc.hidden) cancel(); });
  win.addEventListener('blur', () => cancel());
  win.addEventListener('pagehide', () => clean());
  return { cancel, get active() { return !!drag; } };
}

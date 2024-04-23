class Rect {
  constructor(l = 0, t = 0, w = 0, h = 0) {
    this.l = l;
    this.t = t;
    this.w = w;
    this.h = h;
  }
}

class Point {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
}

function pointInRect(p, r) {
  return p.x > r.l && p.x < r.l + r.w && p.y > r.t && p.y < r.t + r.h;
}

const my_id = Math.random(); // quick and dirty id

let shared;

function preload() {
  partyConnect("wss://demoserver.p5party.org", "stickies");
  shared = partyLoadShared("shared");
}

function setup() {
  createCanvas(400, 400).parent("canvas-wrap");

  noStroke();

  if (partyIsHost()) {
    shared.items = [];
    shared.items.push(initItem(new Point(100, 100), "#ffff66", "untitled 1"));
  }

  const createItemSubmit = document.getElementById("create-item-submit");
  createItemSubmit.addEventListener("click", onCreateItem);
}

function onCreateItem() {
  const label = document.getElementById("create-item-label").value;
  if (!label) return;
  document.getElementById("create-item-label").value = "";
  shared.items.push(initItem(new Point(100, 100), "#ffff66", label));
}

function draw() {
  background("#cc6666");
  shared.items.forEach(stepItem);
  shared.items.forEach(drawItem);
}

function mousePressed() {
  for (const s of shared.items.slice().reverse()) {
    if (mousePressedItem(s)) break;
  }
}

function mouseReleased() {
  shared.items.forEach((s) => mouseReleasedItem(s));
}

function initItem(p = new Rect(), color = "red", label = "untitled") {
  push();
  const s = {};
  const width = textWidth(label) + 30;
  s.rect = new Rect(p.x - width * 0.5, p.y - 10, width, 40);
  s.color = color;
  s.label = label;
  pop();
  return s;
}

function stepItem(item) {
  if (item.inDrag && item.owner === my_id) {
    item.rect.l = mouseX + item.dragOffset.x;
    item.rect.t = mouseY + item.dragOffset.y;
  }
}

function drawItem(item) {
  push();

  //draw note
  fill(item.color);
  noStroke();
  rect(item.rect.l, item.rect.t, item.rect.w, item.rect.h);

  // draw border
  if (item.inDrag) {
    noFill();
    strokeWeight(3);
    stroke("black");
    rect(item.rect.l, item.rect.t, item.rect.w, item.rect.h);
  }

  // draw label
  noStroke();
  fill("black");
  textAlign(CENTER, CENTER);

  text(
    item.label,
    item.rect.l + 0.5 * item.rect.w,
    item.rect.t + 0.5 * item.rect.h
  );
  pop();
}

function mousePressedItem(item) {
  // @todo this probably needs a guard against two clients dragging notes at the same time, like drag2
  if (pointInRect(new Point(mouseX, mouseY), item.rect)) {
    item.inDrag = true;
    item.owner = my_id;
    item.dragOffset = new Point(item.rect.l - mouseX, item.rect.t - mouseY);

    const i = shared.items.indexOf(item);
    shared.items.splice(i, 1);
    shared.items.push(item);
    return true;
  }
  return false;
}

function mouseReleasedItem(item) {
  item.inDrag = false;
  item.owner = null;
}

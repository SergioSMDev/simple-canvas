class Box {
  constructor(width) {
    this.width = 50; // box width
    this.height = 50;
    this.endPosY = 0;
    this.startPosX = Box.getRandom(0, width - this.width);
    this.startPosX -= this.startPosX % this.width; // avoid unequal overlapping
    this.speed = Box.getRandom(1, 4); // range of possible speed
    this.color = {
      r: Box.getRandom(150, 256), // avoid very dark colors
      g: Box.getRandom(0, 256),
      b: Box.getRandom(0, 256)
    };
  }
  static getRandom(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}

class Controller {
  constructor(canvas) {
    this.canvas = canvas.link;
    this.context = this.canvas.getContext("2d", { alpha: false });

    this.widthCanvas = this.canvas.width;
    this.score = document.getElementById("score");

    this.tick = 0; // frame quantity
    this.click = 0; // click quantity
    this.clickCoords = null;
    this.boxArray = [];
    this.isStop = true;
    this.idFrame;
  }
  handleClick(evt) {
    this.clickCoords = this.getClickPos(this.canvas, evt);
  }
  getClickPos(canvs, evt) {
    const rect = canvs.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
  }

  start() {
    if (this.isStop) {
      this.isStop = false;
      this.score.innerText = this.click = 0;
      this.boxArray.push(new Box(this.widthCanvas));
      this.canvas.addEventListener("click", this.handleClick.bind(this));
      this.animate.call(this);
    }
  }

  stop() {
    this.isStop = true;
    this.boxArray.length = 0;
    this.canvas.removeEventListener("click", this.handleClick.bind(this));
  }

  animate() {
     this.context.clearRect(
      0,
      0,
      this.canvas.clientWidth,
      this.canvas.clientHeight
    );
    if (this.isStop) {
      cancelAnimationFrame(this.idFrame);
      return;
    }
    //delete by clicking
    if (this.clickCoords) {
      let multiClick = this.boxArray.length;
      this.boxArray = this.boxArray.filter(box => {
        if (
          this.clickCoords.x >= box.startPosX &&
          this.clickCoords.x <= box.startPosX + box.width &&
          (this.clickCoords.y >= box.endPosY &&
            this.clickCoords.y <= box.endPosY + box.height)
        ) {
          return false;
        }
        return true;
      });
      multiClick -= this.boxArray.length; // to count all deleted boxes
      this.click += multiClick;
      this.score.innerText = this.click;
      this.clickCoords = null;
    }

    let rangeOfTicksToCreateBox = Box.getRandom(10, 200);
    if (rangeOfTicksToCreateBox < this.tick) {
      this.boxArray.push(new Box(this.widthCanvas));
      this.tick = 0;
    }
    this.tick++;
    this.boxArray.forEach(box => {
      this.context.fillStyle = `rgb(${box.color.r},${box.color.g},${box.color.b})`;
      this.context.fillRect(
        box.startPosX,
        (box.endPosY += box.speed),
        box.width,
        box.height
      );
    });

    this.idFrame = requestAnimationFrame(this.animate.bind(this));
  }
}

let controller = new Controller(_canvas);

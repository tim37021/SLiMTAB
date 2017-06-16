class MovingElement {
  constructor(dom_element, speed=2) {
    this.element = dom_element;
    this.speed = speed;
    this.element.setAttribute("x", "0");
    this.element.setAttribute("y", "0");

    // destination
    this.x = 0;
    this.y = 0;

    this.func = null;
  }

  moveTo(x, y) {
    this.x = x;
    this.y = y;

    this.func = setInterval(this.onTick.bind(this), 10);
  }

  onTick() {
    var x = parseFloat(this.element.getAttribute("x"));
    var y = parseFloat(this.element.getAttribute("y"));
    var dx = (this.x - x)*this.speed;
    var dy = (this.y - y)*this.speed;
    var destX = x+dx*0.01;
    var destY = y+dy*0.01;
    if (dx*dx+dy*dy < 1) {
        destX = this.x;
        destY = this.y;
        clearInterval(this.func);
    }
    this.element.style.transformOrigin = "0% 0%";
    this.element.style.transform = `translate(${destX}px, ${destY}px)`;
    this.element.setAttribute("x", `${destX}`);
    this.element.setAttribute("y", `${destY}`);
  }
}

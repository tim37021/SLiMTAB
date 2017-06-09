class tabStrip {
  constructor() {
    this.container = [];
    this.content = document.createElement("div");
    this.content.style.position = "relative";
    this.content.style.width = "100%";
    this.content.style.height = "28px";
    this.content.addEventListener("click", () => {
      for (let i = 0; i < this.container.length; i++) {
        if (this.container[i].paper) this.container[i].paper.content.style.display = "none";
        this.container[i].content.style.backgroundColor = "#252525";
        this.container[i].content.style.color = "#808080";
        this.container[i].content.style.borderTop = "1px solid #474747";
      }
      this.operTb.active();
    });
    this.tagWidth = 290;
    this.zooming = 1.0;
    document.addEventListener("mouseup", this.alignTag.bind(this));
  }
  addTag(tag) {
    for (let i = 0; i < this.container.length; i++) {
      this.container[i].paper.content.style.display = "none";
      this.container[i].content.style.backgroundColor = "#252525";
      this.container[i].content.style.color = "#808080";
      this.container[i].content.style.borderTop = "1px solid #474747";
    }
    tag.setX(this.tagWidth * this.container.length);
    tag.paper.setDisplayer(this.paperDisplayer);
    tag.manager = this;
    this.operTb = tag;
    this.container.push(tag);
    this.content.appendChild(tag.content);
    this.paperDisplayer.appendChild(tag.paper.content);
    tag.active();
  }
  setPaperDisplayer(pd) {
    this.paperDisplayer = pd;
  }
  setTagDisplayer(pd) {
    this.tagDisplayer = pd;
    pd.appendChild(this.content);
  }
  alignTag() {
    for (let i = 0; i < this.container.length; i++) {
      if (this.container[i].x + this.tagWidth / 2 > (i + 1) * this.tagWidth || this.container[i].x + this.tagWidth / 2 < i * this.tagWidth) {
        let x = Math.floor((this.container[i].x + this.tagWidth / 2) / this.tagWidth);
        if (x < 0) x = 0;
        if (x >= this.container.length) x = this.container.length - 1;
        if (x > i) {
          this.container.splice(x + 1, 0, this.container[i]);
          this.container.splice(i, 1);
        } else {
          this.container.splice(x, 0, this.container[i]);
          this.container.splice(i + 1, 1);
        }
        break;
      }
    }
    for (let i = 0; i < this.container.length; i++) {
      this.container[i].content.style.transition = "left 200ms linear";
      this.container[i].setX(i * this.tagWidth);
    }
  }
  setZooming(val) {
    this.operTp.setScale(val);
    this.operTp.zoom(val);
    this.zooming = val;
  }
}

class tabTag {
  constructor(tabname = "New Tab", paper = null) {
    this.paper = paper;
    if (!paper) {
      this.paper = new TabPaper(tabname);
      this.paper.load([[[4, -1]]]);
    }
    this.x = 0;
    this.content = document.createElement("div");
    this.content.onselectstart = function() {
      return false;
    };
    this.content.innerHTML = tabname;
    this.content.setAttribute("class","page")
    this.content.setAttribute(
      "style",
      `
			border-right:1px solid black;
			padding-left:9px;
			line-height:27px;
			height:26px;
			width:280px;
			position:absolute;
		`
    );
    this.content.addEventListener("click", () => {
      this.manager.operTb = this;
    });
    this.content.addEventListener("mousedown", this.startDrag.bind(this));
    this.moveTag = e => {
      this.setX(this.x + e.screenX - this.mx);
      this.mx = e.screenX;
    };
  }
  active() {
    this.paper.content.style.display = "inline";
    this.paper.render();
    this.content.style.backgroundColor = "#474747";
    this.content.style.color = "cccccc";
    this.content.style.borderTop = "1px solid #666666";
    this.paper.displayer.scrollTop = this.paper.st;
    this.paper.displayer.scrollLeft = this.paper.sl;
    this.manager.operTb = this;
  }
  load(data) {
    this.paper.load(data);
  }
  setX(x) {
    this.content.style.left = x + "px";
    this.x = x;
  }
  startDrag(e) {
    this.mx = e.screenX;
    this.content.style.zIndex = 999;
    this.content.style.transition = "none";
    document.addEventListener("mousemove", this.moveTag);
    document.addEventListener("mouseup", () => {
      this.content.style.zIndex = 1;
      document.removeEventListener("mousemove", this.moveTag);
    });
  }
}

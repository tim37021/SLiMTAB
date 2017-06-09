class TabPaper {
  constructor(title = "Untitled", w = 900, h = 900 * 1.41, bps = 4, bl = 4, lw = 840, lh = 140) {
    this.width = w;
    this.height = h;
    this.lineHeight = lh;
    this.lineWidth = lw;
    this.beatLength = bl;
    this.beatPerSection = bps;
    this.vHTML = "";
    this.st = 0;
    this.scale = 1;
    this.content = document.createElement("div");
    this.content.style.outline = "none";
    this.content.onselectstart = function() {
      return false;
    };
    this.content.setAttribute("tabindex", "1");
    this.content.addEventListener("click", this.ckEvent.bind(this));
    this.content.addEventListener("keydown", this.kdEvent.bind(this));
    this.data = null;
    this.title = title;
    this.sel = [];
    this.check();
  }
  check() {
    if (this.width < 500) this.width = 500;
    if (this.height < 500) this.height = 500;
    if (this.lineHeight > 300) this.lineHeight = 120;
    if (this.lineWidth > this.width) this.lineWidth = this.width - 60;
  }
  render() {
    var checkY = function() {
      if (iy + 130 > this.height) {
        iy = 60;
        this.vHTML += `</svg></div><div style="overflow:hidden;padding:3px;padding-top:20px;">
				<svg width="${this.width}" height="${this.height}" 
				style="background:#FFFFFF";>`;
      }
    }.bind(this);
    let nx = (this.width - this.lineWidth) / 2,
      ix = nx,
      iy = 80;
    if (!this.data) {
      this.drawLine(ix, iy);
      this.vHTML =
        `<div style="overflow:hidden;padding:3px;padding-top:20px;">
			<svg width="${this.width}" height="${this.height}" 
			style="background:#FFFFFF";>` +
        this.vHTML +
        "</svg></div>";
      this.content.innerHTML = this.vHTML;
      this.zoom();
      return;
    }

    this.vHTML = `<div style="overflow:hidden;padding:3px;padding-top:20px;">
		<svg width="${this.width}" height="${this.height}" 
		style="background:#FFFFFF";>`;
    this.drawTitle(ix, iy);
    iy += 40;
    this.drawLine(ix, iy, true);
    ix += 80;
    this.counter = 0;

    var note_distance = 80;
    var distance_ratio = 1.0;
    var notes_four_sections = 0;
    var calc_beats = function(beatLength, arr) {
      var ret = 0;
      for(let i=0; i<arr.length; i++)
        ret += beatLength / arr[i][0];
      return ret;
    };
    for (let i = 0; i < this.data.length; i++) {
      let totaltime = 0;
      // estimate note  section

      if (i % 4 == 0) {
        for (let j = i; j < i + 4 && j < this.data.length; j++) {
            notes_four_sections += this.data[j].length;
        }
      }

      var section_width = (this.lineWidth-80) * (this.data[i].length / notes_four_sections)
      var beat_width = section_width / calc_beats(this.beatLength, this.data[i]);

      for (let j = 0; j < this.data[i].length; j++) {
        if(i%4!=0 || j!=0)
          ix += beat_width * (this.beatLength / this.data[i][j][0]) / 2;
        this.drawNote(ix, iy, i, j, this.data[i][j][0], this.data[i][j].slice(1));
        ix += beat_width * (this.beatLength / this.data[i][j][0]) / 2;
        totaltime += 1 / this.data[i][j][0] * this.beatLength;
      }
      if (totaltime != this.beatPerSection) this.drawAlert(ix, iy);
      if (i % 4 < 3) this.drawBar(ix, iy);
      if (i % 4 == 3) {
        (ix = nx), (iy += this.lineHeight);
        checkY();
        this.drawLine(ix, iy);
        ix += 80;
      }
      
    }
    this.vHTML += "</svg></div>";
    this.content.innerHTML = this.vHTML;
    this.zoom();
    this.noteTextList = this.content.getElementsByClassName("notetext");
    this.noteCircleList = this.content.getElementsByClassName("notecircle");
    this.vHTML = "";
  }

  setDisplayer(e) {
    this.displayer = e;
  }

  zoom() {
    for (let i = 0; i < this.content.children.length; i++) {
      this.content.children[i].style.width = this.width * this.scale + 6 + "px";
      this.content.children[i].style.height = this.height * this.scale + 6 + "px";
      this.content.children[i].style.margin = "auto";
      this.content.children[i].children[0].style.transformOrigin = "0% 0%";
      this.content.children[i].children[0].style.transform = `scale(${this.scale},${this.scale})`;
    }
  }

  selNote(section, pos, id, ln) {
    this.sel[0] = [section, pos, id, ln];
    for (let i = 0; i < this.noteCircleList.length; i++) this.noteCircleList[i].setAttribute("fill", "rgb(255,255,255)");
    this.noteCircleList[ln].setAttribute("fill", "rgb(80,255,80)");
  }

  ckEvent(e) {
    if (e.target.getAttribute("data-type") == "nt") {
      var section = e.target.getAttribute("section");
      var pos = e.target.getAttribute("pos");
      var id = e.target.getAttribute("i");
      this.selNote(section, pos, id, e.target.getAttribute("ln"));
    }
  }

  setScale(s) {
    if (s <= 2.0 && s >= 0.3) this.scale = s;
  }

  kdEvent(e) {
    if (e.keyCode == 107) {
      if (this.sel.length > 0) {
        this.data[this.sel[0][0]][this.sel[0][1]][this.sel[0][2] * 2 + 1 + 1]++;
        this.noteTextList[this.sel[0][3]].innerHTML = this.data[this.sel[0][0]][this.sel[0][1]][this.sel[0][2] * 2 + 1 + 1];
      }
    }
    if (e.keyCode == 109) {
      if (this.sel.length > 0) {
        if (this.data[this.sel[0][0]][this.sel[0][1]][this.sel[0][2] * 2 + 1 + 1] > 0) {
          this.data[this.sel[0][0]][this.sel[0][1]][this.sel[0][2] * 2 + 1 + 1]--;
          this.noteTextList[this.sel[0][3]].innerHTML = this.data[this.sel[0][0]][this.sel[0][1]][this.sel[0][2] * 2 + 1 + 1];
        }
      }
    }
    if (e.keyCode == 87) {
      if (this.sel.length > 0) {
        let temp = this.sel[0];
        if (this.data[this.sel[0][0]][this.sel[0][1]][this.sel[0][2] * 2 + 1] > 1) {
          this.data[this.sel[0][0]][this.sel[0][1]][this.sel[0][2] * 2 + 1]--;
          let ory = this.noteTextList[temp[3]].getAttribute("y");
          let orcy = this.noteCircleList[temp[3]].getAttribute("cy");
          this.noteTextList[temp[3]].setAttribute("y", `${Number(ory) - 14}`);
          this.noteCircleList[temp[3]].setAttribute("cy", `${Number(orcy) - 14}`);
        }
      }
    }
    if (e.keyCode == 83) {
      if (this.sel.length > 0) {
        let temp = this.sel[0];
        if (this.data[this.sel[0][0]][this.sel[0][1]][this.sel[0][2] * 2 + 1] < 6) {
          this.data[this.sel[0][0]][this.sel[0][1]][this.sel[0][2] * 2 + 1]++;
          let ory = this.noteTextList[temp[3]].getAttribute("y");
          let orcy = this.noteCircleList[temp[3]].getAttribute("cy");
          this.noteTextList[temp[3]].setAttribute("y", `${Number(ory) + 14}`);
          this.noteCircleList[temp[3]].setAttribute("cy", `${Number(orcy) + 14}`);
        }
      }
    }
  }

  load(data) {
    this.data = data;
  }

  drawTitle(x, y) {
    this.vHTML += `<text x="${this.width / 2}" y="${y}" fill="black" text-anchor="middle" font-size="28">${this.title}</text>`;
  }

  drawBar(x, y) {
    this.vHTML += `<path d='M${x} ${y} l0 70' 
		style='stroke:black;stroke-width:1'></path>`;
  }

  drawAlert(x, y) {
    this.vHTML += `<circle cx='${x}' cy='${y - 14}' r='5' 
		fill='red' stroke-width='0' stroke='red'></circle>`;
  }

  drawLine(x, y, first=false) {
    this.vHTML += '<svg  stroke-linecap="square" >';
    for (let i = 0; i < 6; i++) {
      this.vHTML += `<line x1='${x}' y1='${y + i * 14}' x2='${x + this.lineWidth}' y2='${y + i * 14}'
				style="stroke:black;stroke-width:1"
			></line>`;
    }
    this.vHTML += `<text style='fill:black;font:bold 22px Sans-serif'>
		<tspan x='${x + 10}' y='${y + 21}'>T</tspan>
		<tspan x='${x + 10}' y='${y + 21 + 21}'>A</tspan>
		<tspan x='${x + 10}' y='${y + 42 + 21}'>B</tspan>
		</text>`;
    if(first) {
      this.vHTML += `<text style='fill:black;font:bold 24px serif'>
		  <tspan x='${x + 33}' y='${y + 28}'>${this.beatPerSection}</tspan>
		  <tspan x='${x + 33}' y='${y + 23 + 28}'>${this.beatLength}</tspan>
		  </text>`;
    }
    this.vHTML += `<path d='M${x} ${y} l0 70 M${x + this.lineWidth} ${y} l0 70' 
		style='stroke:black;stroke-width:1'></path>`;
    this.vHTML = this.vHTML + "</svg>";
  }

  drawNote(x, y, section, pos, length, data) {
    this.vHTML += "<svg>";
    for (let i = 0; i < data.length / 2; i++) {
      this.vHTML += `<circle class="notecircle" cx='${x}' cy='${y + 14 * (data[i * 2] - 1)}' r='5'
			fill='white' stroke-width='0' stroke='black' style='cursor:pointer;'></circle>`;
      this.vHTML += `<text class="notetext" ln=${this.counter} data-type="nt" section="${section}" pos="${pos}" i="${i}" x='${x - 4}' y='${y +
        14 * (data[i * 2] - 1) +
        5}'
			fill='black' style='font-size:14px;cursor:pointer;'>${data[i * 2 + 1]}</text>`;
      this.counter++;
    }

    this.vHTML += `<path d='M${x} ${y + 78} l0 25' stroke-width='1' stroke='black'></path>`;
    if (length > this.beatLength) {
      this.vHTML += `<path d='M${x} ${y + 102} l6 1' stroke-width='2' stroke='black'></path>`;
    }
    if (length > this.beatLength * 2) {
      var j = 1;
      for (let i = this.beatLength * 2; i < length; i *= 2) {
        this.vHTML += `<path d='M${x} ${y + 102 - 4 * j} l6 1' stroke-width='1' stroke='black'></path>`;
        j++;
      }
    }
    this.vHTML += "</svg>";
  }
}

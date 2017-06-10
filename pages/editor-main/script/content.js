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
    this.content.addEventListener("keypress", this.kpEvent.bind(this));
    this.data = null;
    this.title = title;
    this.cursor = [0, 0, 1];
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
      for (let i = 0; i < arr.length; i++) ret += beatLength / arr[i][0];
      return ret;
    };
    for (let i = 0; i < this.data.length; i++) {
      let totaltime = 0;
      // estimate note  section

      if (i % 4 == 0) {
        notes_four_sections = 0;
        for (let j = i; j < i + 4 && j < this.data.length; j++) {
          notes_four_sections += this.data[j].length;
        }
      }

      var section_width = (this.lineWidth - 80) * (this.data[i].length / notes_four_sections);
      var beat_width = Math.min(section_width / calc_beats(this.beatLength, this.data[i]), 48);

      for (let j = 0; j < this.data[i].length; j++) {
        if (i % 4 != 0 || j != 0) ix += beat_width * (this.beatLength / this.data[i][j][0]) / 2;
        if (i == this.cursor[0] && j == this.cursor[1]) this.drawCursor(ix, iy);
        this.drawNote(ix, iy, i, j, this.data[i][j][0], this.data[i][j].slice(1));
        ix += beat_width * (this.beatLength / this.data[i][j][0]) / 2;
        totaltime += 1 / this.data[i][j][0] * this.beatLength;
      }
      if (totaltime != this.beatPerSection) this.drawAlert(ix, iy);

      if (i % 4 == 3) {
        (ix = nx), (iy += this.lineHeight);
        this.drawBar(nx + this.lineWidth, iy);
        checkY();
        this.drawLine(ix, iy);
        ix += 80;
      } else this.drawBar(ix, iy);
    }
    this.vHTML += "</svg></div>";
    this.content.innerHTML = this.vHTML;
    this.zoom();
    this.vHTML = "";
	this.content.focus();
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


  ckEvent(e) {
    if (e.target.getAttribute("data-type") == "nt") {
      var section = parseInt(e.target.getAttribute("section"));
      var pos = parseInt(e.target.getAttribute("pos"));
      var id = parseInt(e.target.getAttribute("i"));
      this.cursor = [section, pos, this.data[section][pos][1 + 2 * id]];
      this.render();
    }
  }

  setScale(s) {
    if (s <= 2.0 && s >= 0.3) this.scale = s;
  }

  kdEvent(e) {
    Math.clamp = function(number, min, max) {
      return Math.max(min, Math.min(number, max));
    };
    var is_move_event = false;
    var is_inserting = this.data[this.cursor[0]][this.cursor[1]].length == 2;
    var is_inserting_tab = this.data[this.cursor[0]].length == 1 && is_inserting;
    switch (e.keyCode) {
      case 87:
        this.cursor[2] -= 1;
        break;
      case 83:
        this.cursor[2] += 1;
        break;
      case 65:
        this.cursor[1] -= 1;
        is_move_event = true;
        break;
      case 68:
        this.cursor[1] += 1;
        is_move_event = true;
        break;
      case 107: // page up
        this.data[this.cursor[0]][this.cursor[1]][0] *= 2;
        this.data[this.cursor[0]][this.cursor[1]][0] = Math.clamp(this.data[this.cursor[0]][this.cursor[1]][0], 1, 32);
        break;
      case 109: // page down
        this.data[this.cursor[0]][this.cursor[1]][0] /= 2;
        this.data[this.cursor[0]][this.cursor[1]][0] = Math.clamp(this.data[this.cursor[0]][this.cursor[1]][0], 1, 32);
        break;
    }
    this.cursor[2] = Math.clamp(this.cursor[2], 1, 6);
  
    if (this.cursor[1] == -1 && !is_inserting) {
      this.data[this.cursor[0]].splice(0, 0, [4, -1]);
      this.cursor[1] = 0;
    }
    if (this.cursor[1] == this.data[this.cursor[0]].length && !is_inserting) {
      this.data[this.cursor[0]].splice(this.data[this.cursor[0]].length, 0, [4, -1]);
    }
    if (is_inserting && is_move_event) {
      if (this.cursor[1] == this.data[this.cursor[0]].length) {
        //if(this.cursor[0]<this.data.length-1) {
        if(!is_inserting_tab) {
          this.cursor[0]++;
          this.cursor[1]=0;
          this.data[this.cursor[0] - 1].splice(this.data[this.cursor[0] - 1].length - 1, 1);
          if (this.cursor[0] == this.data.length) {
            this.data.splice(this.cursor[0], 0, [[4, -1]]);
          }
        } else {
          this.cursor[1] = this.data[this.cursor[0]].length-1;
        }
        //} else
        //  this.cursor[1]=this.data[this.cursor[0]].length-1
      } else if (this.cursor[1] == -1) {
        if (this.cursor[0] > 0) {
          this.cursor[0]--;
          this.cursor[1] = this.data[this.cursor[0]].length - 1;
          this.data[this.cursor[0] + 1].splice(0, 1);
          if(is_inserting_tab)
            this.data.splice(this.cursor[0]+1, 1)
        } else this.cursor[1] = 0;
      } else {
        if (e.keyCode == 68) {
          this.data[this.cursor[0]].splice(0, 1);
          this.cursor[1] = 0;
        } else {
          this.data[this.cursor[0]].splice(this.data[this.cursor[0]].length - 1, 1);
          this.cursor[1] = this.data[this.cursor[0]].length - 1;

        }
      }
    }
   
    this.render();
  }

  kpEvent(e) {
    if(e.key>='0'&&e.key<='9') {
      var d = this.data[this.cursor[0]][this.cursor[1]].slice(1);
      var res = -1;
      if(d.length == 1) {
        res = 0;
      } else {
        for(let i=0; i<d.length/2; i++) {
          if(d[i*2]==this.cursor[2]) {
            res = i*2;
            break;
          }
        }
      }
      if(res != -1) {
        this.data[this.cursor[0]][this.cursor[1]][res+1] = this.cursor[2];
        this.data[this.cursor[0]][this.cursor[1]][res+2] = e.key-'0';
      } else {
        this.data[this.cursor[0]][this.cursor[1]].splice(this.data[this.cursor[0]][this.cursor[1]].length, 0, this.cursor[2]);
        this.data[this.cursor[0]][this.cursor[1]].splice(this.data[this.cursor[0]][this.cursor[1]].length, 0, e.key-'0');
      }

      this.render()

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
		style='stroke-width:1'></path>`;
  }

  drawAlert(x, y) {
    this.vHTML += `<circle cx='${x}' cy='${y - 14}' r='5' 
		fill='red' stroke-width='0' stroke='red'></circle>`;
  }

  drawLine(x, y, first = false) {
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

    if (first) {

      this.vHTML += `<text style='fill:black;font:bold 24px serif'>
		  <tspan x='${x + 33}' y='${y + 28}'>${this.beatPerSection}</tspan>
		  <tspan x='${x + 33}' y='${y + 23 + 28}'>${this.beatLength}</tspan>
		  </text>`;
    }
    this.vHTML += `<path d='M${x} ${y} l0 70 M${x + this.lineWidth} ${y} l0 70' 
		stroke-width='1'></path>`;
    this.vHTML = this.vHTML + "</svg>";
  }

  drawCursor(x, y) {
    this.vHTML += `<circle class="notecircle" cx='${x}' cy='${y + 14 * (this.cursor[2] - 1)}' r='5'
			fill='#F39800' stroke-width='0' stroke='black' style='cursor:pointer;'></circle>`;
  }

  drawNote(x, y, section, pos, length, data) {
    this.vHTML += "<svg>";
    var is_blank = false;
    if (data.length == 1) {
      // pass
      // [length 0] is rest note
      // [4 -1] is blank, means inserting...
      if(data[0]==-1)
        is_blank = true;
    } else {
      for (let i = 0; i < data.length / 2; i++) {
        this.vHTML += `<text class="notetext" ln=${this.counter} data-type="nt" section="${section}" pos="${pos}" i="${i}" x='${x - 4}' y='${y +
          14 * (data[i * 2] - 1) +5}'>${data[i * 2 + 1]}</text>`;
        this.counter++;
      }
    }

    if(!is_blank) {
      this.vHTML += `<path d='M${x} ${y + 78} l0 25' stroke-width='1'></path>`;
      if (length > this.beatLength) {
        this.vHTML += `<path d='M${x} ${y + 102} l6 1' stroke-width='2'></path>`;
      }
      if (length > this.beatLength * 2) {
        var j = 1;
        for (let i = this.beatLength * 2; i < length; i *= 2) {
          this.vHTML += `<path d='M${x} ${y + 102 - 4 * j} l6 1' stroke-width='1'></path>`;
          j++;
        }
      }
    }
    this.vHTML += "</svg>";
  }
}

class TabPaper {
  constructor(title = "Untitled", event = null, w = 900, h = 900 * 1.41, bps = 4, bl = 4, lw = 840, lh = 140) {
    this.width = w;
    this.height = h;
    this.lineHeight = lh;
    this.lineWidth = lw;
    this.beatLength = bl;
    this.beatPerSection = bps;
    this.vHTML = "";
    this.scale = 1;
    this.content = document.createElement("div");
    this.content.style.outline = "none";
    this.inputing = 0;
    this.content.onselectstart = function() {
      return false;
    };
    this.defaultNoteLength = 4;
    this.st = 0; //scroll top ,just record, will cause any effect if be changed
    this.sl = 0; //scroll left
    this.content.setAttribute("tabindex", "1");
    this.content.addEventListener("click", this.ckEvent.bind(this));
    this.content.addEventListener("keydown", this.kdEvent.bind(this));
    this.content.addEventListener("keypress", this.kpEvent.bind(this));
    this.event = event != null
      ? event
      : {
          cursormove: null
        };
    this.data = null;
    this.title = title;
    this.cursor = [0, 0, 1];
    this.playingCursor = [0, 0];
    this.check();
    Math.clamp = function(number, min, max) {
      return Math.max(min, Math.min(number, max));
    };
  }
  check() {
    if (this.width < 500) this.width = 500;
    if (this.height < 500) this.height = 500;
    if (this.lineHeight > 300) this.lineHeight = 120;
    if (this.lineWidth > this.width) this.lineWidth = this.width - 60;
  }

  partialRender(line) {
    let vobj = {
      vHTML: "",
      cursor: this.cursor,
      lineHeight: this.lineHeight,
      lineWidth: this.lineWidth,
      beatLength: this.beatLength,
      beatPerSection: this.beatPerSection
    };
    let targetElement = document.getElementById("line_" + line);
    if (!targetElement) {
      this.render();
      return;
    }
    let ix = Number(targetElement.getAttribute("ix")),
      iy = Number(targetElement.getAttribute("iy"));

    let notes_four_sections = 0;
    var calc_beats = function(beatLength, arr) {
      var ret = 0;
      for (let i = 0; i < arr.length; i++) ret += beatLength / arr[i][0];
      return ret;
    };
    for (let i = line * 4; i < line * 4 + 4 && i < this.data.length; i++) {
      if (i % 4 == 0) {
        notes_four_sections = 0;
        for (let j = i; j < i + 4; j++) {
          if (j < this.data.length) notes_four_sections += Math.clamp(this.data[j].length, 4, 6);
          else notes_four_sections += 4;
        }
      }
      var section_width = (this.lineWidth - 80) * (Math.clamp(this.data[i].length, 4, 6) / notes_four_sections);
      var beats = calc_beats(this.beatLength, this.data[i]);
      var beat_width = Math.min(section_width / beats, (this.lineWidth - 80) / (this.beatPerSection * 4));
      var oix = ix;
      var actual_section_width = beat_width * beats;

      ix += (section_width - actual_section_width) / 2;

      // draw note background first
      let tix = ix;
      for (let j = 0; j < this.data[i].length; j++) {
        tix += beat_width * (this.beatLength / this.data[i][j][0]) / 2;
        this.drawNoteBackground.call(vobj, tix, iy, this.data[i][j].slice(1));
        tix += beat_width * (this.beatLength / this.data[i][j][0]) / 2;
      }

      var pos = vobj.vHTML.length - 1;
      for (let j = 0; j < this.data[i].length; j++) {
        ix += beat_width * (this.beatLength / this.data[i][j][0]) / 2;
        if (i == this.cursor[0] && j == this.cursor[1] && !this.hideCursor) this.drawCursor.call(vobj, ix, iy);
        if (i == this.playingCursor[0] && j == this.playingCursor[1] && this.hideCursor) this.drawPlayingCursor.call(vobj, ix, iy);
        this.drawNote.call(vobj, ix, iy, i, j, this.data[i][j][0], this.data[i][j].slice(1));
        ix += beat_width * (this.beatLength / this.data[i][j][0]) / 2;
      }
      ix = oix + section_width;
      if (beats != this.beatPerSection && this.cursor[0] != i ) this.drawAlert.call(vobj, ix - section_width, iy, section_width, pos);
      if (i % 4 != 3) this.drawBar.call(vobj, ix, iy);
    }
    targetElement.innerHTML = vobj.vHTML;
  }

  isInserting() {
    return this.data[this.cursor[0]][this.cursor[1]][1] == -1;
  } 
  
  isInsertingTab() {
    return this.data[this.cursor[0]].length == 1 && this.isInserting();
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

    var note_distance = 80;
    var distance_ratio = 1.0;
    var notes_four_sections = 0;
    var calc_beats = function(beatLength, arr) {
      var ret = 0;
      for (let i = 0; i < arr.length; i++) ret += beatLength / arr[i][0];
      return ret;
    };
    for (let i = 0; i < this.data.length; i++) {
      // estimate note  section

      if (i % 4 == 0) {
        this.vHTML += `<svg class="tab_line" id='line_${i / 4}' ix=${ix} iy=${iy}>`;
        notes_four_sections = 0;
        for (let j = i; j < i + 4; j++) {
          if (j < this.data.length) notes_four_sections += Math.clamp(this.data[j].length, 4, 6);
          else notes_four_sections += 4;
        }
      }

      var section_width = (this.lineWidth - 80) * (Math.clamp(this.data[i].length, 4, 6) / notes_four_sections);
      var beats = calc_beats(this.beatLength, this.data[i]);
      var beat_width = Math.min(section_width / beats, (this.lineWidth - 80) / (this.beatPerSection * 4));
      var oix = ix;
      var actual_section_width = beat_width * beats;

      ix += (section_width - actual_section_width) / 2;

      // draw note background first
      let tix = ix;
      for (let j = 0; j < this.data[i].length; j++) {
        tix += beat_width * (this.beatLength / this.data[i][j][0]) / 2;
        this.drawNoteBackground(tix, iy, this.data[i][j].slice(1));
        tix += beat_width * (this.beatLength / this.data[i][j][0]) / 2;
      }

      var pos = this.vHTML.length - 1;

      for (let j = 0; j < this.data[i].length; j++) {
        ix += beat_width * (this.beatLength / this.data[i][j][0]) / 2;
        if (i == this.cursor[0] && j == this.cursor[1] && !this.hideCursor) this.drawCursor(ix, iy);
        if (i == this.playingCursor[0] && j == this.playingCursor[1] && this.hideCursor) this.drawPlayingCursor(ix, iy);
        this.drawNote(ix, iy, i, j, this.data[i][j][0], this.data[i][j].slice(1));
        ix += beat_width * (this.beatLength / this.data[i][j][0]) / 2;
      }
      ix = oix + section_width;
      if (beats != this.beatPerSection && this.cursor[0] != i) this.drawAlert(ix - section_width, iy, section_width, pos);
      if (i % 4 != 3) this.drawBar(ix, iy);
      if (i % 4 == 3 || i == this.data.length - 1) this.vHTML += "</svg>";
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
    this.vHTML = "";
    this.content.focus();

    if(this.event['change-length']!=null)
      this.event['change-length'](this, this.defaultNoteLength);
  }

  setDisplayer(e) {
    this.displayer = e;
    this.displayer.addEventListener("scroll", this.scrollEvent.bind(this));
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

  scrollEvent() {
    if (this.content.innerHTML.length != 0) {
      this.st = this.displayer.scrollTop;
      this.sl = this.displayer.scrollLeft;
    }
  }

  ckEvent(e) {
    if (e.target.getAttribute("data-type") == "nt") {
      var section = parseInt(e.target.getAttribute("section"));
      var pos = parseInt(e.target.getAttribute("pos"));
      var id = parseInt(e.target.getAttribute("i"));
      var oldsection = this.cursor[0];
      if(this.isInserting()) {
        if(this.isInsertingTab())
          this.data.splice(this.cursor[0], 1);
        else
          this.data[this.cursor[0]].splice(this.cursor[1], 1);
      }
      this.cursor = [section, pos, this.data[section][pos][1 + 2 * id]];
      this.partialRender(Math.floor(oldsection / 4));
      this.partialRender(Math.floor(this.cursor[0] / 4));
      if (this.event["move-cursor"] != null) this.event["move-cursor"](this);
    }
  }

  setScale(s) {
    if (s <= 2.0 && s >= 0.3) this.scale = s;
  }

  kdEvent(e) {
    let oriline = Math.floor(this.cursor[0] / 4);
    var is_move_event = false;
    var is_cursor_moved = false;
    var is_inserting = this.data[this.cursor[0]][this.cursor[1]][1] == -1;
    var is_inserting_tab = this.data[this.cursor[0]].length == 1 && is_inserting;
    //if (!is_inserting) this.defaultNoteLength = this.data[this.cursor[0]][this.cursor[1]][0];
    switch (e.keyCode) {
      case 87:
        this.cursor[2] -= 1;
        this.inputing = 0;
        is_cursor_moved = true;
        break;
      case 83:
        this.cursor[2] += 1;
        this.inputing = 0;
        is_cursor_moved = true;
        break;
      case 65:
        this.cursor[1] -= 1;
        is_move_event = true;
        this.inputing = 0;
        is_cursor_moved = true;
        break;
      case 68:
        this.cursor[1] += 1;
        is_move_event = true;
        this.inputing = 0;
        is_cursor_moved = true;
        break;
      case 107: // page up
        this.data[this.cursor[0]][this.cursor[1]][0] *= 2;
        this.data[this.cursor[0]][this.cursor[1]][0] = Math.clamp(this.data[this.cursor[0]][this.cursor[1]][0], 1, 32);
        this.defaultNoteLength = Math.clamp(this.data[this.cursor[0]][this.cursor[1]][0], 1, 32);
        if(this.event['change-length']!=null) {
          this.event['change-length'](this, this.data[this.cursor[0]][this.cursor[1]][0]);
        }
        break;
      case 109: // page down
        this.data[this.cursor[0]][this.cursor[1]][0] /= 2;
        this.data[this.cursor[0]][this.cursor[1]][0] = Math.clamp(this.data[this.cursor[0]][this.cursor[1]][0], 1, 32);
        this.defaultNoteLength = Math.clamp(this.data[this.cursor[0]][this.cursor[1]][0], 1, 32);
        if(this.event['change-length']!=null) {
          this.event['change-length'](this, this.data[this.cursor[0]][this.cursor[1]][0]);
        }
        break;
      case 46: // delete
      case 8: // backspace
        this.deleteNote();
        break;
      case 73: //insert I
        if (!is_inserting) {
          this.data[this.cursor[0]].splice(this.cursor[1], 0, [this.defaultNoteLength, -1]);
          if(this.event['insert']!=null)
            this.event['insert'](this);
        }
        break;
      // TODO: refine this
      case 188: // ,
        if ((!is_inserting || is_inserting_tab) && this.cursor[0] > 0) {
          this.data[this.cursor[0]].splice(0, 0, [this.defaultNoteLength, -1]);
          this.cursor[1] = -1;
          is_inserting = true;
          is_move_event = true;
          is_cursor_moved = true;
        }
        break;
      case 190: // .
        if (!is_inserting) {
          this.data[this.cursor[0]].splice(this.data[this.cursor[0]].length, 0, [this.defaultNoteLength, -1]);
          this.cursor[1] = this.data[this.cursor[0]].length;
          is_inserting = true;
          is_move_event = true;
          is_cursor_moved = true;
        }
        break;
    }
    this.cursor[2] = Math.clamp(this.cursor[2], 1, 6);

    if (this.cursor[1] == -1 && !is_inserting) {
      this.data[this.cursor[0]].splice(0, 0, [this.defaultNoteLength, -1]);
      this.cursor[1] = 0;
      if(this.event['insert']!=null)
        this.event['insert'](this);
    }
    if (this.cursor[1] == this.data[this.cursor[0]].length && !is_inserting) {
      this.data[this.cursor[0]].splice(this.data[this.cursor[0]].length, 0, [this.defaultNoteLength, -1]);
      if(this.event['insert']!=null)
        this.event['insert'](this);
    }
    if (is_inserting && is_move_event) {
      if (this.cursor[1] == this.data[this.cursor[0]].length) {
        //if(this.cursor[0]<this.data.length-1) {
        if (!is_inserting_tab) {
          this.cursor[0]++;
          this.cursor[1] = 0;
          this.data[this.cursor[0] - 1].splice(this.data[this.cursor[0] - 1].length - 1, 1);
          if (this.cursor[0] == this.data.length) {
            this.data.splice(this.cursor[0], 0, [[this.defaultNoteLength, -1]]);
          }
        } else {
          this.cursor[1] = this.data[this.cursor[0]].length - 1;
        }
        //} else
        //  this.cursor[1]=this.data[this.cursor[0]].length-1
      } else if (this.cursor[1] == -1) {
        if (this.cursor[0] > 0) {
          this.cursor[0]--;
          this.cursor[1] = this.data[this.cursor[0]].length - 1;
          this.data[this.cursor[0] + 1].splice(0, 1);
          if (is_inserting_tab) this.data.splice(this.cursor[0] + 1, 1);
        } else this.cursor[1] = 0;
      } else {
        if (e.keyCode == 68) {
          this.data[this.cursor[0]].splice(this.cursor[1] - 1, 1);
          this.cursor[1] = this.cursor[1] - 1;
        } else {
          this.data[this.cursor[0]].splice(this.cursor[1] + 1, 1);
        }
      }
    }
    if (is_cursor_moved && this.event["move-cursor"] != null) this.event["move-cursor"](this);
    let moveline = Math.floor(this.cursor[0] / 4);
    if (moveline != oriline) this.partialRender(oriline);
    this.partialRender(moveline);
  }

  kpEvent(e) {
    if (e.key >= "0" && e.key <= "9") {
      var d = this.data[this.cursor[0]][this.cursor[1]].slice(1);
      var res = -1;
      var ins_pos = 0;
      if (d.length != 1) {
        for (let i = 0; i < d.length / 2; i++) {
          if (d[i * 2] == this.cursor[2]) {
            res = i * 2;
            break;
          }
        }
        if (res != -1) {
          this.data[this.cursor[0]][this.cursor[1]][res + 1] = this.cursor[2];
          this.data[this.cursor[0]][this.cursor[1]][res + 2] = this.inputing*10+(e.key - "0");
          this.data[this.cursor[0]][this.cursor[1]][res + 2] = Math.clamp(this.data[this.cursor[0]][this.cursor[1]][res + 2], 0, 22)
        } else {
          this.data[this.cursor[0]][this.cursor[1]].splice(this.data[this.cursor[0]][this.cursor[1]].length, 0, this.cursor[2]);
          this.data[this.cursor[0]][this.cursor[1]].splice(this.data[this.cursor[0]][this.cursor[1]].length, 0, e.key - "0");
        }
      } else {
        this.data[this.cursor[0]][this.cursor[1]][1] = this.cursor[2];
        this.data[this.cursor[0]][this.cursor[1]].push(e.key - "0");
      }
      this.inputing = e.key - "0";
      this.partialRender(Math.floor(this.cursor[0] / 4));
    }
  }

  setNoteLength(length) {
    this.data[this.cursor[0]][this.cursor[1]][0] = length;
    this.defaultNoteLength = length;
    this.event['change-length'](this, length);
    this.partialRender(Math.floor(this.cursor[0] / 4));
  }

  load(data) {
    this.data = data;
  }

  drawTitle(x, y) {
    this.vHTML += `<text x="${this.width / 2}" y="${y}" fill="black" text-anchor="middle" font-size="28">${this.title}</text>`;
  }

  drawBar(x, y) {
    this.vHTML += `<line x1='${x}' y1='${y}' x2='${x}' y2='${y + 70}' style="stroke:black;stroke-width:1"></line>`;
  }

  drawAlert(x, y, sectionWidth, pos = -1) {
    var src = "";
    if (pos == -1) {
      for (let i = 0; i < 6; i++) {
        src += `<line class="no-print" x1='${x}' y1='${y + i * 14}' x2='${x + sectionWidth}' y2='${y + i * 14}'
          style="stroke:red;stroke-width:1.5"></line>`;
      }
      this.vHTML = src + this.vHTML;
    } else {
      for (let i = 0; i < 6; i++) {
        src += `<line class="no-print" x1='${x}' y1='${y + i * 14}' x2='${x + sectionWidth}' y2='${y + i * 14}'
          style="stroke:red;stroke-width:1.5"></line>`;
      }
      this.vHTML =this.vHTML.slice(0, pos + 1) + src +this.vHTML.slice(pos);
    }
  }

  drawPlayingCursor(x, y) {
    this.vHTML += `<rect class="no-print" x='${x+10}' y='${y-10}' width='2' height='125' style="fill: #3333FF"></rect>`;
  }

  drawLine(x, y, first = false) {
    this.vHTML += '<svg stroke-linecap="square" >';
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
    this.drawBar(x, y);
    this.drawBar(x + this.lineWidth, y);
    this.vHTML = this.vHTML + "</svg>";
  }

  drawCursor(x, y) {
    this.vHTML += `<circle class="no-print notecircle" cx='${x}' cy='${y + 14 * (this.cursor[2] - 1)}' r='8'
			fill='#F39800' stroke-width='0' stroke='black' style='cursor:pointer;'></circle>`;
  }

  deleteNote() {
    var is_inserting = this.data[this.cursor[0]][this.cursor[1]].length == 2;
    if (is_inserting) return;
    var d = this.data[this.cursor[0]][this.cursor[1]].slice(1);
    var res = -1;
    if (d.length == 1) {
      res = 0;
    } else {
      for (let i = 0; i < d.length / 2; i++) {
        if (d[i * 2] == this.cursor[2]) {
          res = i * 2;
          break;
        }
      }
    }
    if (res != -1) {
      this.data[this.cursor[0]][this.cursor[1]].splice(res + 1, 2);
    }
    if (this.data[this.cursor[0]][this.cursor[1]].length == 1) {
      this.data[this.cursor[0]].splice(this.cursor[1], 1);
    }

    this.partialRender(Math.floor(this.cursor[0] / 4));
  }

  drawNoteBackground(x, y, data) {
    if (data.length != 1) {
      for (let i = 0; i < data.length / 2; i++) {
        this.vHTML += `<circle class="no-print notecircle" cx='${x}' cy='${y + 14 * (data[i * 2] - 1)}' r='5'
			fill='white' stroke-width='0' stroke='black' style='cursor:pointer;'></circle>`;
      }
    }
  }

  drawNote(x, y, section, pos, length, data) {
    this.vHTML += "<svg>";
    var is_blank = false;
    var last = 78;
    if (data.length == 1) {
      // pass
      // [x 0] is rest note
      // [x -1] is blank, means inserting...
      if (data[0] == -1) is_blank = true;
    } else {
      for (let i = 0; i < data.length / 2; i++) {
        this.vHTML += `<text class="notetext" data-type="nt" section="${section}" pos="${pos}" i="${i}" x='${x - 4}' y='${y +
          14 * (data[i * 2] - 1) +
          5}'>${data[i * 2 + 1]}</text>`;
        if(i==0)
          last = 14 * (data[i * 2] - 1) + 8;
        else
          last = Math.max(14 * (data[i * 2] - 1) + 8, last);
      }
    }

    //if(!is_blank) {
    if (length > 1) {
      if (length == 2) this.vHTML += `<path d='M${x} ${y + 88} l0 15' stroke-width='1'></path>`;
      if (length >= 4) this.vHTML += `<path d='M${x} ${y + last} l0 ${102 - last}' stroke-width='1'></path>`;
      if (length > 4) {
        this.vHTML += `<path d='M${x} ${y + 102} l6 1' stroke-width='2'></path>`;
      }
      if (length > 8) {
        var j = 1;
        for (let i = 8; i < length; i *= 2) {
          this.vHTML += `<path d='M${x} ${y + 102 - 4 * j} l6 1' stroke-width='1'></path>`;
          j++;
        }
      }
    }
    //}
    this.vHTML += "</svg>";
  }

  play(bpm=120, ac) {
    this.playingCursor = [this.cursor[0], this.cursor[1]];
    var spb = 1.0/(bpm/60);

    this.playCursorTime = 0;
    var repeat = function() {
      if(this.playingCursor[0] >= this.data.length) {
        clearInterval(this.func);
        this.hideCursor = false;
        if(this.event['play-finished'] != null)
          this.event['play-finished'](this);
        this.render();
        return;
      }
      if(ac.currentTime - this.playCursorTime >= (this.beatLength / this.data[this.playingCursor[0]][this.playingCursor[1]][0]) * spb) {
        this.playCursorTime += (this.beatLength / this.data[this.playingCursor[0]][this.playingCursor[1]][0]) * spb;
        this.playingCursor[1] += 1;
        if(this.playingCursor[1] >= this.data[this.playingCursor[0]].length) {
          this.playingCursor[0] = this.playingCursor[0]+1;
          if((this.playingCursor[0]-1)/4!=this.playingCursor[0]/4)
            this.partialRender(this.playingCursor[0]/4)
          this.playingCursor[1] = 0;
        }
        this.partialRender(this.playingCursor[0]/4);
      }
    }
    this.hideCursor = true;
    //this.render();
    this.func = setInterval(repeat.bind(this), 10);
  }

  outputSequence(bpm=120) {
    var ret = []
    var midi_note = function(string_num, number) {
      return [52, 47, 43, 38, 33, 28][string_num-1]+number;
    }
  
    var spb = 1.0/(bpm/60);
    var totaltime = 0;
    for(let i=this.cursor[0]; i<this.data.length; i++) {
		let j=0;
		if(i==this.cursor[0])j=this.cursor[1];
      for(; j<this.data[i].length; j++) {
        var sec = (this.beatLength / this.data[i][j][0]) * spb;
        if(this.data[i][j][1] >= 1) {
          for(let k=1; k<this.data[i][j].length; k+=2) {
            ret.push({'time':totaltime, 'duration':sec, 'note': midi_note(this.data[i][j][k], this.data[i][j][k+1])});
          }
        }

        totaltime += sec;
      }
    }

    return ret;
  }
}

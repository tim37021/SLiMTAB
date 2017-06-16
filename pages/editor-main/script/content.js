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
	this.displayer=null;
	this.manager=null;
    this.content.onselectstart = function() {
      return false;
    };
    this.defaultNoteLength = 4;
    this.st = 0; //scroll top ,just record, will not cause any effect if be changed
    this.sl = 0; //scroll left
    this.dragStart = null;
    this.content.setAttribute("tabindex", "1");
    this.content.addEventListener("mousedown", this.mdEvent.bind(this));
    this.content.addEventListener("mousemove", this.mvEvent.bind(this));
    this.content.addEventListener("mouseup", this.muEvent.bind(this));
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
    this.selectedNotes = null;
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
    var tie_begin_ix = -1
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
      if(this.data[i] == [[4, -1]])
        this.drawFakeElement.call(vobj, ix, iy, i);
      for (let j = 0; j < this.data[i].length; j++) {
        ix += beat_width * (this.beatLength / this.data[i][j][0]) / 2;
        if (i == this.cursor[0] && j == this.cursor[1] && !this.hideCursor) this.drawCursor.call(vobj, ix, iy);
        if (i == this.playingCursor[0] && j == this.playingCursor[1] && this.hideCursor) this.drawPlayingCursor.call(vobj, ix, iy);
        this.drawNote.call(vobj, ix, iy, i, j, this.data[i][j][0], this.data[i][j].slice(1));
        if(this.data[i][j][this.data[i][j].length-1]=='c' && tie_begin_ix==-1) {
          tie_begin_ix = ix;
        }
        if(this.data[i][j][this.data[i][j].length-1]=='e') {
          if(tie_begin_ix == -1)
            tie_begin_ix = ix;
          this.drawTiePath.call(vobj, tie_begin_ix, ix, iy);
          tie_begin_ix = -1;
        }
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
  drawSectionMark(ix,iy,s){
	  this.vHTML+=`<text x="${ix}" y="${iy}" fill="black" font-size="12">section ${s}</text>`;
  }
  render() {
    var checkY = function() {
      if (iy + 130 > this.height) {
		this.height+=this.lineHeight;
      }
    }.bind(this);
    let nx = (this.width - this.lineWidth) / 2,
      ix = nx,
      iy = 80;
    if (!this.data) {
	  this.drawSectionMark(ix,iy-10,1);
      this.drawLine(ix, iy);
      this.vHTML =
        `<div style="overflow:hidden;padding:3px;padding-top:20px;" id='pg0'>
			<svg width="${this.width}" height="${this.height}" 
			style="background:#FFFFFF">` +
        this.vHTML +
        "</svg></div>";
      this.content.innerHTML = this.vHTML;
      this.zoom();
      return;
    }
	
    this.drawTitle(ix, iy);
    iy += 40;
	this.drawSectionMark(ix,iy-10,1);
    this.drawLine(ix, iy, true);
    ix += 80;

    var note_distance = 80;
    var distance_ratio = 1.0;
    var notes_four_sections = 0;
    var tie_begin_ix = -1;
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

      this.drawFakeElement(ix, iy, i);
      for (let j = 0; j < this.data[i].length; j++) {
        ix += beat_width * (this.beatLength / this.data[i][j][0]) / 2;
        if (i == this.cursor[0] && j == this.cursor[1] && !this.hideCursor) this.drawCursor(ix, iy);
        if (i == this.playingCursor[0] && j == this.playingCursor[1] && this.hideCursor) this.drawPlayingCursor(ix, iy);
        this.drawNote(ix, iy, i, j, this.data[i][j][0], this.data[i][j].slice(1));
        if(this.data[i][j][this.data[i][j].length-1]=='c' && tie_begin_ix==-1) {
          tie_begin_ix = ix;
        }
        if(this.data[i][j][this.data[i][j].length-1]=='e') {
          if(tie_begin_ix == -1)
            tie_begin_ix = ix;
          this.drawTiePath(tie_begin_ix, ix, iy);
          tie_begin_ix = -1;
        }
        ix += beat_width * (this.beatLength / this.data[i][j][0]) / 2;
      }
      ix = oix + section_width;
      if (beats != this.beatPerSection && this.cursor[0] != i) this.drawAlert(ix - section_width, iy, section_width, pos);
      if (i % 4 != 3) this.drawBar(ix, iy);
      if (i % 4 == 3 || i == this.data.length - 1) this.vHTML += "</svg>";
      if (i % 4 == 3) {
        (ix = nx), (iy += this.lineHeight);
        checkY();
		if(i%8==7)this.drawSectionMark(ix,iy-10,i+2);
        this.drawLine(ix, iy);
        ix += 80;
      }
    }
	this.vHTML = `<div style="overflow:hidden;padding:3px;padding-top:20px;" id='pg0'>
		<svg width="${this.width}" height="${this.height}" 
		style="background:#FFFFFF" id="svg_container"><rect id="select-area" width="0" height="0" style="fill:blue;stroke:pink;stroke-width:5;fill-opacity:0.1;stroke-opacity:0.9"></rect>`+this.vHTML+"</svg></div>";
    this.content.innerHTML = this.vHTML;
    this.selectAreaRect = document.getElementById('select-area');
    this.zoom();
    this.vHTML = "";
    this.content.focus();

    if(this.event['change-length']!=null)
      this.event['change-length'](this, this.defaultNoteLength);
  }

  setDisplayer(e) {
    this.displayer = e;
	this.displayer.addEventListener("scroll",this.scrollEvent.bind(this));
  }

  zoom() {
      this.content.children[0].style.width = this.width * this.scale + 6 + "px";
      this.content.children[0].style.height = this.height * this.scale + 6 + "px";
      this.content.children[0].style.margin = "auto";
      this.content.children[0].children[0].style.transformOrigin = "0% 0%";
      this.content.children[0].children[0].style.transform = `scale(${this.scale},${this.scale})`;
  }

  scrollEvent() {
    if (this.content.innerHTML.length != 0) {
      this.st = this.displayer.scrollTop;
      this.sl = this.displayer.scrollLeft;
    }
  }

  insertNotes(lst, pos=null) {
    if(pos == null)
      pos = this.cursor;
    if(this.isInserting()) {
      this.data[pos[0]].splice(pos[1], 1);
    }
    // calc current beat length
    var current_beats = 0;
    for(let i=0; i<this.data[pos[0]].length; i++) {
      if(i<pos[1])
        current_beats += this.beatLength / this.data[pos[0]][i][0]
      else
        lst.push(this.data[pos[0]][i])
    }
    this.data[pos[0]].splice(pos[1], this.data[pos[0]].length)
    var current_section = pos[0];
    for(let i=0; i<lst.length; i++) {
      current_beats += this.beatLength / lst[i][0];
      this.data[current_section].splice(this.data[current_section].length, 0, lst[i]);
      if(current_beats >= this.beatPerSection) {
        current_section+=1;
        current_beats=0;
        this.data.splice(current_section, 0, []);
      }
    }
    if(this.data[current_section].length == 0)
      this.data.splice(current_section, 1);
    this.render();
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
        else {
          this.data[this.cursor[0]].splice(this.cursor[1], 1);
          if(section==this.cursor[0])
            pos = this.cursor[1]<pos?pos-1:pos;
        }
      }
      this.cursor = [section, pos, this.data[section][pos][1 + 2 * id]];
      //this.selectedNotes = [[section, pos, this.data[section][pos][1 + 2 * id], this.data[section][pos][0]], this.data[section][pos][1 + 2 * id]]
      this.partialRender(Math.floor(oldsection / 4));
      this.partialRender(Math.floor(this.cursor[0] / 4));
      if (this.event["move-cursor"] != null) this.event["move-cursor"](this);
    } else {
      var pg0 = this.content.children[0];
      var abs_x = (e.clientX-pg0.offsetLeft) / this.scale;
      var abs_y = (e.clientY-pg0.offsetTop-20+this.displayer.scrollTop) / this.scale;
      // find which note is nearby and insert
      var nearest = null;
      var dist_n = 0;
      Array.from(document.getElementsByClassName('notetext')).forEach(note => {
        var x = note.getAttribute('x');
        var y = note.getAttribute('y');
        var dist = (x-abs_x)*(x-abs_x);
        if(nearest==null || dist < dist_n) {
          nearest = note;
          dist_n = dist;
        }
      });
      var dx = abs_x - nearest.getAttribute('x');
      var dy = abs_y - nearest.getAttribute('y');
      var dstring = Math.ceil(dy/14);
      var section = parseInt(nearest.getAttribute("section"));
      var string = parseInt(nearest.getAttribute('string'));
      var pos = parseInt(nearest.getAttribute('pos'));
      if(string+dstring>=1 && string+dstring<=6) {
        if(this.isInserting()) {
          if(this.isInsertingTab()) {
            if(section != this.cursor[0])
            this.data.splice(this.cursor[0], 1);
          } else {
            this.data[this.cursor[0]].splice(this.cursor[1], 1);
            if(section==this.cursor[0])
              pos = this.cursor[1]<pos?pos-1:pos;
          }
        }
        this.cursor[0] = section;
        this.cursor[1] = pos;
        this.cursor[2] = string + dstring;

        this.partialRender(Math.floor(this.cursor[0]/4));
      }
    }
  }

  mdEvent(e) {
    if(!this.manager.grab)if(e.button==0) {
      var pg0 = this.content.children[0];
      this.dragStart = [e.clientX-pg0.offsetLeft, e.clientY-pg0.offsetTop-20+this.displayer.scrollTop];
      this.selectAreaRect.setAttribute('width', `0`);
      this.selectAreaRect.setAttribute('height', `0`);
    }
  }

  mvEvent(e) {
    if(this.dragStart!=null) {
      var pg0 = this.content.children[0];
      var pos = [e.clientX-pg0.offsetLeft, e.clientY-pg0.offsetTop-20+this.displayer.scrollTop];
      var left_top = [Math.min(pos[0], this.dragStart[0]), Math.min(pos[1], this.dragStart[1])]
      var right_bottom = [Math.max(pos[0], this.dragStart[0]), Math.max(pos[1], this.dragStart[1])]
      this.selectAreaRect.setAttribute('x', `${left_top[0]/this.scale}`);
      this.selectAreaRect.setAttribute('y', `${left_top[1]/this.scale}`);
      this.selectAreaRect.setAttribute('width', `${(right_bottom[0]-left_top[0])/this.scale}`);
      this.selectAreaRect.setAttribute('height', `${(right_bottom[1]-left_top[1])/this.scale}`);
    }
  }

  muEvent(e) {
    if(e.button==0&&this.dragStart!=null) {
      var startx = this.selectAreaRect.getAttribute('x');
      var starty = this.selectAreaRect.getAttribute('y');
      var width = this.selectAreaRect.getAttribute('width');
      var height = this.selectAreaRect.getAttribute('height');
      this.selectedNotes = []
      Array.from(document.getElementsByClassName('notetext')).forEach(node => {
        if(!node.classList.contains('fake')) {
          var x = parseInt(node.getAttribute('x'));
          var y = parseInt(node.getAttribute('y'));
          if(x>=startx && x-startx<width) {
            if(y>=starty && y-starty<height) {
              this.selectedNotes.push([parseInt(node.getAttribute('section')), parseInt(node.getAttribute('pos')), parseInt(node.getAttribute('string')), 
              parseFloat(node.getAttribute('length')), parseInt(node.innerHTML)])
            }
          }
        }
      });
      this.dragStart = null;
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
      case 67:
        if(e.ctrlKey) {
          // ctrl c
          if(this.event['copy-notes']!=null) {
            this.event['copy-notes'](this, this.getSelectedNotes());
          }
        }
        break;
      case 88:
        if(e.ctrlKey) {
          // ctrl c
          if(this.event['copy-notes']!=null) {
            this.event['copy-notes'](this, this.getSelectedNotes());
          }
          this.deleteNotes();
        }
        break;
      case 86:
        if(e.ctrlKey) {
          if(this.event['paste-notes']!=null) {
            this.insertNotes(this.event['paste-notes'](this));
          }
        }
        break;
      case 68:
        this.cursor[1] += 1;
        is_move_event = true;
        this.inputing = 0;
        is_cursor_moved = true;
        break;
      case 107: // page up
      case 187:
        this.data[this.cursor[0]][this.cursor[1]][0] *= 2;
        this.data[this.cursor[0]][this.cursor[1]][0] = Math.clamp(this.data[this.cursor[0]][this.cursor[1]][0], 1, 32);
        this.defaultNoteLength = Math.clamp(this.data[this.cursor[0]][this.cursor[1]][0], 1, 32);
        if(this.event['change-length']!=null) {
          this.event['change-length'](this, this.data[this.cursor[0]][this.cursor[1]][0]);
        }
        break;
      case 109: // page down
      case 189:
        this.data[this.cursor[0]][this.cursor[1]][0] /= 2;
        this.data[this.cursor[0]][this.cursor[1]][0] = Math.clamp(this.data[this.cursor[0]][this.cursor[1]][0], 1, 32);
        this.defaultNoteLength = Math.clamp(this.data[this.cursor[0]][this.cursor[1]][0], 1, 32);
        if(this.event['change-length']!=null) {
          this.event['change-length'](this, this.data[this.cursor[0]][this.cursor[1]][0]);
        }
        break;
      case 46: // delete
      case 8: // backspace
        if(this.selectedNotes == null || this.selectedNotes.length==0)
          this.deleteNotes([[this.cursor[0], this.cursor[1], this.cursor[2]]]);
        else
          this.deleteNotes();
        return;
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
    if (is_cursor_moved && this.event["move-cursor"] != null) {
      this.event["move-cursor"](this);
    }
    let moveline = Math.floor(this.cursor[0] / 4);
    this.partialRender(moveline);
	if (moveline != oriline){
		this.partialRender(oriline);
		this.displayer.scrollTop+=this.lineHeight*(moveline-oriline)*this.scale;
	}
  }

  kpEvent(e) {
    if (e.key >= "0" && e.key <= "9") {
      var d = this.data[this.cursor[0]][this.cursor[1]].slice(1);
      var res = -1;
      var ins_pos = 0;
      if (d.length != 1) {
        for (let i = 0; i < Math.floor(d.length / 2); i++) {
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
          if(this.data[this.cursor[0]][this.cursor[1]][d.length]=='c' || this.data[this.cursor[0]][this.cursor[1]][d.length] == 'e') 
            res = d.length;
          else
            res = d.length+1;
          this.data[this.cursor[0]][this.cursor[1]].splice(res, 0, this.cursor[2]);
          this.data[this.cursor[0]][this.cursor[1]].splice(res+1, 0, e.key - "0");
        }
      } else {
        this.data[this.cursor[0]][this.cursor[1]][1] = this.cursor[2];
        this.data[this.cursor[0]][this.cursor[1]].push(e.key - "0");
      }
      this.inputing = e.key - "0";
      this.partialRender(Math.floor(this.cursor[0] / 4));
    }
  }
  
  cpEvent(e) {
    console.log('fuck')
  }

  setNoteLength(length) {
    this.data[this.cursor[0]][this.cursor[1]][0] = length;
    this.defaultNoteLength = length;
    this.event['change-length'](this, length);
    this.partialRender(Math.floor(this.cursor[0] / 4));
  }

  drawTiePath(x1, x2, y) {
    this.vHTML += `<path style="stroke-width: 1; fill: none;" d="M ${x1},${y+105} S ${(x1+x2)/2},${y+120},${x2},${y+105}"/>`;
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
      this.vHTML += `<line class="line" x1='${x}' y1='${y + i * 14}' x2='${x + this.lineWidth}' y2='${y + i * 14}'
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
			fill='#F39800' stroke-width='0' stroke='black'></circle>`;
  }

  deleteNote(target=null, no_render=false) {
    if(target==null)
      target = this.cursor;
    //var is_inserting = this.data[target[0]][target[1]].length == 2;
    //f (is_inserting) return;
    var d = this.data[target[0]][target[1]].slice(1);
    var res = -1;
    if (d.length == 1) {
      res = 0;
    } else {
      for (let i = 0; i < Math.floor(d.length / 2); i++) {
        if (d[i * 2] == target[2]) {
          res = i * 2;
          break;
        }
      }
    }
    if (res != -1) {
      this.data[target[0]][target[1]].splice(res + 1, 2);
      if(this.data[target[0]][target[1]].slice(-1)[0]=='c'||this.data[target[0]][target[1]].slice(-1)[0]=='e')
        this.data[target[0]][target[1]].splice(-1, 2);
    }
    if (this.data[target[0]][target[1]].length <= 1) {
      this.data[target[0]].splice(target[1], 1);
    }
    if(!no_render)
      this.partialRender(Math.floor(target[0] / 4));
  }

  getSelectedNotes() {
    var ret = []
    var last_section = -1;
    var last_pos = -1;
    var acc = [0];
    // section pos string length block
    for(let i=0; i<this.selectedNotes.length; i++) {
      if(this.selectedNotes[i][0]!=last_section || this.selectedNotes[i][1]!=last_pos) {
        if(last_pos!=-1) {
          ret.push(acc);
          acc = [0];
        }
      }
      acc[0] = this.selectedNotes[i][3];
      acc.push(this.selectedNotes[i][2]);
      acc.push(this.selectedNotes[i][4]);
      last_pos = this.selectedNotes[i][1];
      last_section = this.selectedNotes[i][0];
    }
    ret.push(acc);
    return ret;
  }

  deleteNotes(lst=null, no_render=false) {
    if(lst==null)
      lst = this.selectedNotes;
    for(let i=lst.length-1; i>=0; i--) {
      this.deleteNote([lst[i][0], lst[i][1], lst[i][2]], true);
    }
    for(let i=this.data.length-1; i>=0; i--) {
      if(this.data[i].length==0)
        this.data.splice(i, 1);
    }
    if(this.data.length == 0) {
      this.data = [[[4, -1]]];
      this.cursor = [0, 0, 1];
    }
    if(this.cursor[0]>=this.data.length) {
      this.cursor[0] = this.data.length-1;
      this.cursor[1] = this.data[this.cursor[0]].length-1;
    }
    if(this.cursor[1] >= this.data[this.cursor[0]].length) {
      this.cursor[1] = this.data[this.cursor[0]].length-1;
    }
    this.render();
  }

  switchType(type) {
    if(type=='n') {
      if(this.data[this.cursor[0]][this.cursor[1]]==2)
        this.data[this.cursor[0]][this.cursor[1]] = [this.data[this.cursor[0]][this.cursor[1]][0], -1];
    }
    if(type=='r') {
      this.data[this.cursor[0]][this.cursor[1]] = [this.data[this.cursor[0]][this.cursor[1]][0], 0];
    }
    this.partialRender(Math.floor(this.cursor[0]/4));
  }

  drawNoteBackground(x, y, data) {
    if (data.length != 1) {
      for (let i = 0; i < Math.floor(data.length / 2); i++) {
        this.vHTML += `<circle class="no-print notecircle" cx='${x}' cy='${y + 14 * (data[i * 2] - 1)}' r='5'
			fill='white' stroke-width='0' stroke='black' style='cursor:pointer;'></circle>`;
      }
    }
  }

  drawFakeElement(x, y, section) {
    this.vHTML += `<text class="notetext fake" section="${section}" pos="${0}" string="1" x='${x - 4}' y='${y+5}' style="display: none;">1</text>`;
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
      for (let i = 0; i < Math.floor(data.length / 2); i++) {
        this.vHTML += `<text class="notetext" data-type="nt" length="${length}" section="${section}" pos="${pos}" string="${data[i * 2]}" i="${i}" x='${x - 4}' y='${y +
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

  stop() {
    clearInterval(this.func);
    this.hideCursor = false;
    this.partialRender(this.playingCursor[0]/4);
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
    this.render();
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
    var acctime = 0;
		if(i==this.cursor[0])j=this.cursor[1];
      for(; j<this.data[i].length; j++) {
        var sec = (this.beatLength / this.data[i][j][0]) * spb;
        acctime += sec;
        if(this.data[i][j][1] >= 1 || this.data[i][j][this.data[i][j].length-1]=='e') {
          for(let k=1; k<this.data[i][j].length; k+=2) {
            if(k == this.data[i][j].length-1)
              break;
            ret.push({'time':totaltime, 'duration': acctime, 'note': midi_note(this.data[i][j][k], this.data[i][j][k+1])});
          }
        }
        if(!(this.data[i][j][1] >= 1 && this.data[i][j][this.data[i][j].length-1]=='c')) {
          totaltime += acctime;
          acctime = 0;
        }
      }
    }

    return ret;
  }
}

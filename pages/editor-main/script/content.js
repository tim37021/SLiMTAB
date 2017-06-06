class TabPaper{
	constructor(w=900,h=900*1.41,bps=4,bl=4,lw=840,lh=140){
		this.width=w;
		this.height=h;
		this.lineHeight=lh;
		this.lineWidth=lw;
		this.beatLength=bl;
		this.beatPerSection=bps;
		this.vHTML="";
		this.st=0;
		this.scale=1;
		this.animatInfo=[0,0,0];//start time,elapsed time,frame
		this.content=document.createElement('div');
		this.content.style.outline="none";
		this.content.onselectstart=function(){return false;}
		this.content.setAttribute('tabindex','1');
		this.grab=(function(e){
			this.displayer.scrollTop+=this.my-e.screenY;
			this.displayer.scrollLeft+=this.mx-e.screenX;
			this.my=e.screenY;
			this.mx=e.screenX;
			this.st=this.displayer.scrollTop;
			this.sl=this.displayer.scrollLeft;
		}).bind(this);
		this.content.addEventListener("mousedown",(e)=>{
			this.my=e.screenY;
			this.mx=e.screenX;
			console.log("fuck");
			this.content.addEventListener("mousemove",this.grab);
		});
		document.addEventListener("mouseup",()=>{
			this.content.removeEventListener("mousemove",this.grab);
		});
		this.content.addEventListener("click",this.ckEvent.bind(this));
		this.content.addEventListener("keydown",this.kdEvent.bind(this));
		this.data=null;
		this.sel=[];
		this.check();
	}
	check(){
		if(this.width<500)this.width=500;
		if(this.height<500)this.height=500;
		if(this.lineHeight>300)this.lineHeight=120;
		if(this.lineWidth>this.width)this.lineWidth=this.width-60;
	}	
	render(){
		this.vHTML="";
		let nx=(this.width-this.lineWidth)/2,ix=nx,iy=60,time=0;
		if(!this.data){
			this.drawLine(ix,iy);
			this.vHTML=`<div style="overflow:hidden;padding:3px;">
			<svg width="${this.width}" height="${this.height}" 
			style="background:#FFFFFF";>`
			+this.vHTML+"</svg></div>";
			this.content.innerHTML=this.vHTML;
			this.zoom();
			return;
		}
		this.drawLine(ix,iy);
		ix+=80;
		
		for(let i=0;i<this.data.length;i++){
			this.drawNote(ix,iy,i,this.data[i][0],this.data[i].slice(1));
			time+=this.beatLength/this.data[i][0];
			if(time>this.beatPerSection){
				this.drawAlert(ix,iy);
				time=this.beatPerSection;
			}
			if(time==this.beatPerSection){
				ix+=20;
				if(ix<nx+this.lineWidth)this.drawBar(ix,iy);
				ix+=20;
				time=0;
			}else{
				ix+=80*this.beatLength/this.data[i][0];
			}
			if(ix>=nx+this.lineWidth){
				ix=nx,iy+=this.lineHeight;
				this.drawLine(ix,iy);
				ix+=80;
			}
		}
		this.vHTML=`<div style="overflow:hidden;padding:3px;">
				<svg width="${this.width}" height="${this.height}" 
			style="background:#FFFFFF";>`
			+this.vHTML+"</svg></div>";
		this.content.innerHTML=this.vHTML;
		this.zoom();
	}
	
	setDisplayer(e){
		this.displayer=e;
	}
	
	zoom(){
		for(let i=0;i<this.content.children.length;i++){
			this.content.children[0].style.width=this.width*this.scale+6+"px";
			this.content.children[0].style.height=this.height*this.scale+6+"px";
			this.content.children[0].style.margin="auto";
			this.content.children[0].children[0].style.transformOrigin="0% 0%";
			this.content.children[0].children[0].style.transform=`scale(${this.scale},${this.scale})`;
		}
	}
	
	animate(){
		this.animatInfo=[0,0,0];
		requestAnimationFrame(this.animateFrame.bind(this));
	}
	
	animateFrame(t){
		var frametime=500;
		if(this.animatInfo[0]==0){
			this.animatInfo[0]=t;
			this.aData=this.data;
			this.data=[];
		}
		this.animatInfo[1]=t-this.animatInfo[0]-this.animatInfo[2]*frametime;
		if(this.animatInfo[1]>=frametime){
			this.animatInfo[1]=0;
			this.animatInfo[2]++;
			this.data=this.aData.slice(0,this.animatInfo[2]);
			this.render();
		}
		if(this.data.length!=this.aData.length){requestAnimationFrame(this.animateFrame.bind(this));}
		else{console.log("animation end");}
	}
	
	selNote(pos,id){
		this.sel[0]=[pos,id];
		this.render();
	}
	
	ckEvent(e){
		if(e.target.getAttribute('data-type')=='nt'){
			var pos=e.target.getAttribute('data-pos');
			var id=e.target.getAttribute('data-i');
			this.selNote(pos,id);
		}
	}
	
	zoomIn(){
		if(this.scale<2.0){
			this.scale+=0.1;
			this.zoom();
		}
	}
	
	zoomOut(){
		if(this.scale>0.3){
			this.scale-=0.1;
			this.render();
		}
	}
	
	setScale(s){
		if(s<=2.0 && s>=0.3)this.scale=s;
	}
	
	kdEvent(e){
		if(e.keyCode==107){
			if(this.sel.length>0){
				this.data[this.sel[0][0]][this.sel[0][1]*2+1+1]++;
				this.render();
			}
		}
		if(e.keyCode==109){
			if(this.sel.length>0){
				var p=this.sel[0][0];
				var id=this.sel[0][1];
				if(this.data[p][id*2+1+1]>0)this.data[p][id*2+1+1]--;
				this.render();
			}
		}
		if(e.keyCode==87){
			if(this.sel.length>0){
				var p=this.sel[0][0];
				var id=this.sel[0][1];
				if(this.data[p][id*2+1]>1)this.data[p][id*2+1]--;
				this.render();
			}
		}
		if(e.keyCode==83){
			if(this.sel.length>0){
				var p=this.sel[0][0];
				var id=this.sel[0][1];
				if(this.data[p][id*2+1]<6)this.data[p][id*2+1]++;
				this.render();
			}
		}
	}
	
	load(data){
		this.data=data;
	}
	
	drawBar(x,y){
		this.vHTML+=`<path d='M${x} ${y} l0 70' 
		style='stroke:black;stroke-width:1'></path>`;
	}
	
	drawAlert(x,y){
		this.vHTML+=`<circle cx='${x}' cy='${y-14}' r='5' 
		fill='red' stroke-width='0' stroke='red'></circle>`;
	};
	
	drawLine(x,y){
		this.vHTML+='<svg  stroke-linecap="square" >'
		for(let i=0;i<6;i++){
			this.vHTML+=`<line x1='${x}' y1='${y+i*14}' x2='${x+this.lineWidth}' y2='${y+i*14}'
				style="stroke:black;stroke-width:1"
			></line>`;
		}
		this.vHTML+=`<text style='fill:black;font:bold 22px Sans-serif'>
		<tspan x='${x+10}' y='${y+21}'>T</tspan>
		<tspan x='${x+10}' y='${y+21+21}'>A</tspan>
		<tspan x='${x+10}' y='${y+42+21}'>B</tspan>
		</text>`;
		this.vHTML+=`<text style='fill:black;font:bold 24px serif'>
		<tspan x='${x+33}' y='${y+28}'>${this.beatPerSection}</tspan>
		<tspan x='${x+33}' y='${y+23+28}'>${this.beatLength}</tspan>
		</text>`;
		this.vHTML+=`<path d='M${x} ${y} l0 70 M${x+this.lineWidth} ${y} l0 70' 
		style='stroke:black;stroke-width:1'></path>`;
		this.vHTML=this.vHTML+'</svg>';
	}
	
	drawNote(x,y,pos,length,data){//data=[chord,block,chord,block.....]
		this.vHTML+='<svg>';
		for(let i=0;i<data.length/2;i++){
			this.vHTML+=`<circle cx='${x}' cy='${y+14*(data[i*2]-1)}' r='5' data-type="nt" data-pos="${pos}" data-i="${i}"
			fill='white' stroke-width='0' stroke='black' style='cursor:pointer;'></circle>`;
			this.vHTML+=`<text data-type="nt" data-pos="${pos}" data-i="${i}" x='${x-4}' y='${y+14*(data[i*2]-1)+5}'
			fill='black' style='font-size:14px;cursor:pointer;'>${data[i*2+1]}</text>`;
		}
		
		this.vHTML+=`<path d='M${x} ${y+78} l0 25' stroke-width='1' stroke='black'></path>`;
		if(length>this.beatLength){
			this.vHTML+=`<path d='M${x} ${y+102} l6 1' stroke-width='2' stroke='black'></path>`;
		}
		if(length>this.beatLength*2){
			var j=1;
			for(let i=this.beatLength*2;i<length;i*=2){
				this.vHTML+=`<path d='M${x} ${y+102-4*j} l6 1' stroke-width='1' stroke='black'></path>`;
				j++;
			}
		}
		for(let i=0;i<this.sel.length;i++){
			if(this.sel[i][0]==pos){
				this.vHTML+=`<circle cx='${x}' cy='${y+14*(data[(this.sel[i][1])*2]-1)}' r='7' fill='rgb(80,255,80)' stroke-width='0' stroke='black'></circle>`;
				this.vHTML+=`<text data-type="nt" data-pos="${pos}" data-i="${i}" x='${x-4}'
					y='${y+14*(data[(this.sel[i][1])*2]-1)+5}' fill='black' style='font-size:14px'>
					${data[(this.sel[i][1])*2+1]}</text>`;
			}
		}
		this.vHTML+='</svg>';
	}
}
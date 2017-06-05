class tabStrip{
	constructor(){
		this.container=[];
		this.content=document.createElement("div");
		this.content.style.position="relative";
		this.content.style.width="100%";
		this.content.style.height="22px";
		this.content.addEventListener("click",()=>{
			for(let i=0;i<this.container.length;i++){
				if(this.container[i].paper)this.container[i].paper.content.style.display="none";
				this.container[i].content.style.backgroundColor="#252525";
				this.container[i].content.style.color="#808080";
				this.container[i].content.style.borderTop="1px solid #474747";
			}
		},true);
		this.tagWidth=290;
		document.addEventListener("mouseup",this.render.bind(this));
	}
	addTag(tag){
		tag.setX(this.tagWidth*(this.container.length));
		this.container.push(tag);
		this.content.appendChild(tag.content);
	}
	render(){
		for(let i=0;i<this.container.length;i++){
			if(this.container[i].x+this.tagWidth/2>(i+1)*this.tagWidth || 
			this.container[i].x+this.tagWidth/2<i*this.tagWidth){
				let x=Math.floor((this.container[i].x+this.tagWidth/2)/this.tagWidth);
				if(x<0)x=0;
				if(x>=this.container.length)x=this.container.length-1;
				if(x>i){
					this.container.splice(x+1,0,this.container[i]);
					this.container.splice(i,1);
				}
				else{
					this.container.splice(x,0,this.container[i]);
					this.container.splice(i+1,1);
				}
				break;
			}
		}
		for(let i=0;i<this.container.length;i++){
			this.container[i].content.style.transition="left 200ms linear";
			this.container[i].setX(i*this.tagWidth);
		}
	}
}

class tabTag{
	constructor(tabname="New Tab",paper=null){
		this.paper=paper;
		this.x=0;
		this.content=document.createElement('div');
		this.content.onselectstart=function(){return false;}
		this.content.innerHTML=tabname;
		this.content.setAttribute("style",`
			background:#252525;
			border:1px solid #000;
			border-top:1px solid #474747;
			color:#CCCCCC;
			padding-top:2px;
			padding-left:8px;
			width:280px;
			position:absolute;
		`);
		this.content.addEventListener("click",()=>{
			if(this.paper)this.paper.content.style.display="inline";
			this.content.style.backgroundColor="#474747";
			this.content.style.color="cccccc";
			this.content.style.borderTop="1px solid #666666";
		},true);
		this.content.addEventListener("mousedown",this.startDrag.bind(this));
		this.moveTag=(e)=>{
			this.setX(this.x+e.screenX-this.mx);
			this.mx=e.screenX;
		}
	}
	setX(x){
		this.content.style.left=x+"px";
		this.x=x;
	}
	bindPaper(paper){
		this.paper=paper;
	}
	startDrag(e){
		this.mx=e.screenX;
		this.content.style.zIndex=999;
		this.content.style.transition="none";
		document.addEventListener("mousemove",this.moveTag);
		document.addEventListener("mouseup",()=>{
			this.content.style.zIndex=1;
			document.removeEventListener("mousemove",this.moveTag);
		});
	}
	
}

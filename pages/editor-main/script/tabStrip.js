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
		for(let i=0;i<this.container.length-1;i++){
			for(let j=0;j<this.container.length-i-1;j++){
				if(this.container[j].x+this.tagWidth/2>this.container[j+1].x){
					let temp=this.container[j];
					this.container[j]=this.container[j+1];
					this.container[j+1]=temp;
				}
			}
		}
		if(this.container[0].x+this.tagWidth/2>this.container[0+1].x){
			let temp=this.container[0];
			this.container[0]=this.container[0+1];
			this.container[0+1]=temp;
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
		this.content.style.backgroundColor="#252525";
		this.content.style.border="1px solid #000";
		this.content.style.borderTop="1px solid #474747";
		this.content.style.color="#CCCCCC";
		this.content.style.paddingTop="2px";
		this.content.style.paddingLeft="8px";
		this.content.style.width="280px";
		this.content.style.position="absolute";
		this.content.addEventListener("click",()=>{
			if(this.paper)this.paper.content.style.display="inline";
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

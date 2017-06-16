let tab_ctxmenu={
	content:null,
	itemNum:0,
	init:function(e){
		this.content=document.createElement('div');
		this.content.setAttribute('class','ctxmenu');
		this.content.setAttribute('style','clip:rect(0px,300px,0px,0px);transition:clip 100ms;position:fixed;top:20px;z-index:99');
		this.content.innerHTML='<ul></ul>';
		e.appendChild(this.content);
		e.addEventListener('contextmenu',(e)=>{
			this.content.style.left=e.clientX+'px';
			this.content.style.top=e.clientY+'px';
			this.content.style.clip=`rect(0px,300px,${30*this.itemNum+20}px,0px)`;
			this.content.style.display = null;
		});
		document.addEventListener('click',()=>{this.close()});
	},
	addItem:function(name, cls){
		this.itemNum++;
		let newitem=document.createElement('li');
		newitem.classList.add(cls);
		newitem.innerHTML=name;
		this.content.children[0].appendChild(newitem);
	},
	close:function(){
		this.content.style.clip=`rect(0px,300px,0px,0px)`;
	}
}
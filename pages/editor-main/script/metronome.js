//usage: 
//tab_metro.setUp(bpm , the element you want to attach metronome);<=must do this
//tab_metor.play();
//you can use setBpm to change bpm, and attachTo() to attach metronome on more element
//Don't use like :document.addEventListener('click',tab_metor.play)
//Use like :document.addEventListener('click',function(){ tab_metor.play(); })
let tab_metro={
	bpm:120,
	setUp:function(b=120,e=null){
		this.bpm=b;
		this.content=document.createElement('div');
		this.content.setAttribute('style',`
			width:420px;height:250px;
			background:URL('./img/tick_bg.png') #565656;
			text-align:center;
			position:relative;`);
		this.content.innerHTML=`<div style="font-size:120px;margin-top:30px;margin-left:30px;color:#DDD;display:inline-block">${this.bpm}</div>
			<div style="font-size:18px;display:inline-block;color:#DDD;">bpm</div>
			<img src="./img/tickbar.png" style="position:absolute;top:190px;left:13px"/>
			<img id="tickdot" src="./img/tickdot.png" 
			style="position:absolute;left:9px;top:184px;transform:translateX(0px)"/>`;
		this.tick=(function(){this.content.children[3].style.transform="translateX(0px)";}).bind(this);
		this.tock=(function(){this.content.children[3].style.transform="translateX(390px)";}).bind(this);
		this.attachTo(e);
	},
	attachTo:function(e){
		this.displayer=e;
		e.appendChild(this.content);
	},
	setBpm:function(b){
		this.bpm=b;
		this.content.children[0].innerHTML=this.bpm;
	},
	play:function(){
		let spb=60000/this.bpm;
		this.content.children[3].style.transition=`transform ${spb}ms linear`;
		this.content.children[3].style.transform="translateX(390px)";
		setTimeout(()=>{
			this.content.children[3].style.transform="translateX(0px)";
			setInterval(this.tick,spb*2);
		},spb);
		setInterval(this.tock,spb*2);
	}
};
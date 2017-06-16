let note_svg={
	notes:`<defs>
	<path id='rest_eighth' d="M477.4,268.5c0,0-3.9,0.1-3.9,4.4c0,4.3,5.1,4,5.1,4s2.3-0.1,4.5-1.6c0.1-0.1,0.3,0,0.2,0.2l-3.9,15
	c-0.1,0.6,0.3,1.2,0.9,1.2h0c0.4,0,0.8-0.3,0.9-0.7l5.2-20c0.1-0.3-0.2-0.7-0.5-0.7l0,0c-0.2,0-0.3,0.1-0.4,0.2
	c-0.5,0.7-2.1,2.8-4.1,3.7c-0.6,0.3-1.2-0.2-1.2-0.9C480.5,271.5,480.4,268.6,477.4,268.5z"/>
	
	<path id='rest_quarter' d="M478.5,261.7c0.8,0.6,1.2,0.9,1.7,1.5l6,6.8c0.4,0.5,0.4,1.2,0,1.6c0,0-4.7,4.3-4.5,9.3c0.1,3.3,3,7.1,4.4,8.8
	c0.2,0.3,0,0.7-0.3,0.6c-9.1-1.7-6.9,5.1-5.7,7.9c0.2,0.4-0.3,0.7-0.6,0.5c-2-1.3-6-4.4-6-8.4c0-4.5,5.5-4.3,7.4-4.2
	c0.2,0,0.4-0.2,0.2-0.4l-6-7.8c-0.4-0.5-0.3-1.2,0.2-1.7c4.3-4.7,2.8-12,1.9-14.2C477.2,262.1,476.5,260.2,478.5,261.7z"/>

	<path id='rest_sixteenth' d="M487.2,265.2c-0.2,0-0.3,0.1-0.4,0.2c-0.5,0.7-2.1,2.8-4.1,3.7c-0.6,0.3-1.2-0.2-1.2-0.9c0.2-1.7,0.1-4.7-2.9-4.8
	c0,0-3.9,0.1-3.9,4.4c0,4.3,5.1,4,5.1,4s1.9,0,4.1-1.1c0.1-0.1,0.3,0,0.2,0.2l-0.3,1.1c-0.8,2.9-2.1,7.4-3.4,8.2
	c-0.6,0.3-1.3-0.1-1.3-0.7c0-1.8-0.5-4.7-3.4-4.4c0,0-3.9,0.6-3.4,4.8c0.5,4.3,5.5,3.6,5.5,3.6s1.6-0.2,3.4-2.2
	c0.1-0.1,0.3,0,0.3,0.1l-3.4,13.9c-0.1,0.6,0.3,1.2,0.9,1.2c0.4,0,0.8-0.3,0.9-0.7l7.8-30C487.8,265.6,487.5,265.2,487.2,265.2z"/>
	
	<path id='rest_thirtysecong' d="M30,30c-0.1,0.6,0.3,1.2,0.9,1.2c0.4,0,0.8-0.3,0.9-0.7l9.9-39.6c0.1-0.3-0.2-0.7-0.5-0.7c-0.2,0-0.3,0.1-0.4,0.2
	c-0.5,0.7-2.1,2.8-4.1,3.7c-0.6,0.3-1.2-0.2-1.2-0.9c0.2-1.7,0.1-4.7-2.9-4.8c0,0-3.9,0.1-3.9,4.4c0,4.3,5.1,4,5.1,4s1.9,0,4.1-1.1
	c0.1-0.1,0.3,0,0.2,0.2l-0.3,1.1c-0.8,2.9-2.1,7.4-3.4,8.2c-0.6,0.3-1.3-0.1-1.3-0.7c0-1.8-0.5-4.7-3.4-4.4c0,0-3.9,0.6-3.4,4.8
	c0.5,4.3,5.5,3.6,5.5,3.6s1.6-0.2,3.4-2.2c0.1-0.1,0.3,0,0.3,0.1l-1.9,7.8c-0.2,0.7-0.5,1.5-1,2c-0.2,0.3-0.4,0.4-0.4,0.4
	c-0.6,0.3-1.3-0.1-1.3-0.7c0-1.8-0.5-4.7-3.4-4.4c0,0-3.9,0.6-3.4,4.8c0.3,2.1,1.6,3.1,3,3.4c0,0,2.6,1,5.7-2c0.1-0.1,0.2,0,0.2,0.1
	L30,30z"/>
	
	<rect id='rest_whole' x="471.3" y="276.6" width="17.4" height="6.5"/>
	</defs>`,
	
	rest_eighth:function(x,y, section, pos){y+=8;return `<use class="notetext" section="${section}" pos="${pos}" length="8" string="3" i="0" x="${x}" y="${y+14*3-10}" href="#rest_eighth" style='transform:scale(0.6) translate(-477.4px, -278.5px); transform-origin: ${x}px ${y}px'/>`},
	rest_quarter:function(x,y, section, pos){y+=2;return `<use class="notetext" section="${section}" pos="${pos}" length="4" string="3" i="0" x="${x}" y="${y+14*3-10}" href="#rest_quarter" style='transform:scale(0.6) translate(-478.5px, -271.7px);transform-origin: ${x}px ${y}px'/>` },
	rest_sixteenth:function(x,y, section, pos){y+=5;return `<use class="notetext" section="${section}" pos="${pos}" length="16" string="3" i="0" x="${x}" y="${y+14*3-10}" href="#rest_sixteenth" style='transform:scale(0.6) translate(-477px, -275.2px);transform-origin: ${x}px ${y}px'/>` },
	rest_thirtysecong:function(x,y, section, pos){y+=27;return `<use class="notetext" section="${section}" pos="${pos}" length="32" string="3" i="0" x="${x}" y="${y}" href="#rest_thirtysecong" style='transform:scale(0.6) translate(-30px, -15px);transform-origin: ${x}px ${y}px'/>` },
	rest_second:function(x,y, section, pos){return `<use class="notetext" section="${section}" pos="${pos}" length="2" string="3" i="0" x="${x}" y="${y+14*3-10}" href="#rest_whole" style='transform:scale(0.6) translate(-478.3px, -266.6px);transform-origin: ${x}px ${y}px'/>` },
	rest_whole:function(x,y, section, pos){return `<use class="notetext" section="${section}" pos="${pos}" length="1" string="3" i="0" x="${x}" y="${y+14*3-10}" href="#rest_whole" style='transform:scale(0.6) translate(-479.3px, -262.6px);transform-origin: ${x}px ${y}px'/>` },
	
}
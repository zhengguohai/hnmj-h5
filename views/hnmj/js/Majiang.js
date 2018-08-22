function Majiang() {
	g1.call(this);
	this.mod = "majiang";
}
cL.fE.majiang=Majiang;
(function() {
	var Super = function() {};
	Super.prototype = g1.prototype;
	Majiang.prototype = new Super();
})();
p = Majiang.prototype;
p.cA = function(d, parent) {
	this.bg.dA = this.dA = d.id;
	this.fM = d;
	this.c7 = parent;
	this.bg.c7 = this;
	this.name = parent.name + "." + this.dA + (this.index > -1 ? "[" + this.index + "]" : "");
	this.E3 = parent == cL ? this : parent.E3;
	this.style = dX.c8(this);
	this.position = this.style.position;
	this.container.x = this.container.y = 0;
	this.c9();
	this.data=d.data||null;
	if(this._editMode)this.bV(W.bU(this.data));
	//this.flex();
	this.b3(d, this.style);
	cL.d0(this);
}
p.bV = function(v) {
	var ed = this._editMode,
	c = this.fM.childNodes,
		ss = this.style,
		o = this.cX;
	for(let n = o.length - 1; n >= 0; n--) {
		o[n].clear();
	}
	o.length = 0;
	if(!v) {
		if(ed) v = [{}];
		else return;
	}
	if(!c) return;
		for(let n in c) {
			var m = c[n];
			break;
		}
		var dd=[];
		for(var n=0,l=v.length;n<l;n++){
			if(!v[n])continue;
			if(v[n].type==9) dd.push(v[n]);
			else if(v[n].type==1){
				 dd.push(v[n]);dd.push(v[n]);dd.push(v[n]);
			}else if(v[n].type==2){
				dd.push(v[n]);dd.push(v[n]);dd.push(v[n]);dd.push(v[n]);
			} else if(v[n].type==3){
				dd.push(v[n]);dd.push(v[n]);dd.push(v[n]);dd.push(v[n]);
			} else if(v[n].type==5){
				dd.push(v[n]);dd.push(v[n]);dd.push(v[n]);dd.push(v[n]);
			} 
		}
		
		var _x=0,c=0,w,h,_y=0,fd=ss.flexDirection,l = ed ? 3 : dd.length;
		for( n = 0; n < l; n++) {
				var i = cL.d5(m.mod);
				i.index = !ed ? n : -1;
				i._editMode = ed;
				
				o.push(i);
			this.container.addChild(i);
			i.cA(m, this);
			i.visible=true;
			w=i.style.width+ss.lineWidth;
			h=i.style.height+ss.lineHeight;
			i.position = "relative";
			if(ed)continue;
			if(c==3){
				fd=="column"?_y+=8:_x+=10;
				t=dd[n].type;
				c=0;
			}
			i.y=6;
			if(dd[n].type==9 || dd[n].type==1){//纰板悆
				if(fd=="column"){
					i.y=_y;
					_y+=h;
				}else{
					i.x=_x;
					//i.y=0;
			 		_x+=w;
				}
			 	c++;
			}else if(dd[n].type==2 || dd[n].type==4 || dd[n].type==3){//鏉�
				fd=="column"?i.y=_y:i.x=_x;
				
				c++;
				if(c==3 && dd[n+1]==dd[n]){
					c--;
					if(fd=="column"){
						i.y-=h+16;
					}else{
						i.y-=i.style.width<60?12:20;
						i.x-=w;
					}
					
				}else{
					fd=="column"?_y+=h:_x+=w;
				}
			} else if(dd[n].type==5){//鏆楁潬
				fd=="column"?i.y=_y:i.x=_x;
				
				c++;
				if(c==3 && dd[n+1]==dd[n]){
					c--;
					if(fd=="column"){
						i.y-=h+16;
					}else{
						i.y-=i.style.width<60?12:20;
						i.x-=w;
					}
					dd[n+1].eff=null;
				}else{
					if(fd=="column"){
						_y+=h;
						dd[n].eff="p222";
					}else{
						_x+=w;
						dd[n].eff=i.style.width<60?"p32":"p12";
					}
				}
			}
			if(!ed) i.bV(dd[n]);
		}
	
		ss.width = l>0?_x:1;
		ss.height =l>0? _y:1;
		this.c9();
	this.mask=null;
}
p.c9 = function(s = null) {
	fY.prototype.c9.call(this, s);
}

Majiang.sort=function(name){
	var d=W.bU(name);
	d=d.sort(function(o1,o2){
		return o1.id>o2.id?1:-1;
	})
	
}
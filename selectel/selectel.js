steal.plugins('jquery/controller', 'funcit/mask')
	.then(function($){

$.Controller("Funcit.Selectel", {
		select: function(callback){
			$("iframe:first").mask();
			$('.controls_overlay').funcit_selectel(callback);
		}
	},{
		// this.element is a mask over the iframe
		init: function(){
			this.selecting = false;
			this.iframe = $("iframe:first");
			this.document = this.iframe[0].contentDocument;
		},
		update: function(callback){
			this.iframe.mask().show();
			Funcit.Tooltip.open($.View('//funcit/selectel/views/tooltip', {}))
			this.lastInspecting = 0;
			this.callback = callback;
			this.selecting = true;
			$('#select-path').fadeIn().html('');
		},
		mousemove: function(el, ev){
			if(!this.selecting) return;
			// throttle this function a little
			Funcit.Tooltip.close(500);
			if (new Date().getTime() - this.lastInspecting > 30) {
				this.element.hide();
				this.highlightedEl = this.document.elementFromPoint(ev.clientX, ev.clientY);
				this.element.show();
				this.elementPath(this.highlightedEl)
				if(this.highlightedEl) {
					$(this.highlightedEl).highlight();
				}
			}
			this.lastInspecting = new Date().getTime();
		},
		mouseup: function(el, ev){
			if(!this.selecting) return;
			this.element.hide();
			$(this.highlightedEl).unhighlight();
			this.callback(this.highlightedEl, ev);
			this.selecting = false;
			$('#select-path').fadeOut().html('');
		},
		elementPath: function(el){
			if(this.currentEl != el){
				this.currentEl = el;
				var path = [];
				var parents = $(el).parents().toArray();
				parents.unshift(el);
				var i = parents.length - 1;
				while(i > -1){
					var elem = parents[i].tagName.toLowerCase();
					var $el = $(parents[i]);
					var c = $el.attr('class');
					var id = $el.attr('id');
					if(id != "")
						elem += "#" + id;
					if(c != "")
						elem += "." + c.replace(/ /g, '.');
					path.push(elem);
					i--;
				}
				$('#select-path').html(path.join(' > '));
			}
		}
	})

});
steal.plugins('jquery')
	.then(function(){
		var getWindow = function( element ) {
			return element.defaultView || element.ownerDocument.defaultView || element.ownerDocument.parentWindow
		};
		$.fn.prettySelector= function() {
			var target = this[0];
			if(!target){
				return null
			}
			
			var selector = target.nodeName.toLowerCase();
			//always try to get an id
			if(target.id){
				var id = target.id;
				if(parseInt("header-123123".match(/[0-9]+/)) > 100 || target.id.length > 15){
					return "#"+target.id;
				}
			}else{
				var parent = target.parentNode;
				while(parent){
					if(parent.id){
						selector = "#"+parent.id+" "+selector;
						break;
					}else{
						parent = parent.parentNode
					}
				}
			}
			if(target.className){
				selector += "."+target.className.split(" ")[0]
			}
			var others = $(selector, getWindow(target).document); //jquery should take care of the #foo if there
			
			if(others.length > 1){
				return selector+":eq("+others.index(target)+")";
			}else{
				return selector;
			}
		};
	})

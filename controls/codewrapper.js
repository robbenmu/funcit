steal.plugins('jquery/controller', 'jquery/controller/subscribe')
	.then(function($){

$.Controller("Funcit.Codewrapper", {
	init: function(){
		this.textarea = this.find('textarea');
		this.editor = $('#editor').controllers(Funcit.Editor)[0];
		this.rowHeight = this.textarea.rowheight();
	},
	".rec click": function(el){
		this.toggleRecord(!el.hasClass("recording"));
	},
	// runs test up to current cursor's statement
	// grabs the entire textarea string up to the cursor and passes this testname as a filter to QUnit
	// since the text isn't modified, the highlighting still works
	// TODO there has to be a better way to do this
	".sync click": function(){
		//get an empty function or last statement
		var stmntOrFunc = this.editor.funcStatement();
		
		if(stmntOrFunc[0].arity == 'function'){
			// handle this
		}else{ // statement
			// get test up to current statement
			var endChar = stmntOrFunc.end(), 
				test = this.textarea.val().substr(0,endChar)+"\n});";
				
		}
		var testName = stmntOrFunc[0].func.parent[0].value;
		QUnit.config.filters = [testName];
		
		// add the opaque mask
		this.mask = $("iframe:first").mask().addClass('syncing');
		this.run(test, this.callback('runDone'));
	},
	toggleRecord: function(record){
		var el = this.find(".rec");
		if(!record){ // turn off recording
			el.removeClass("recording")
			this.publish("funcit.record", {recording: false});
		} else {
			el.addClass("recording")
			this.publish("funcit.record", {recording: true});
		}
	},
	openResultsTab: function(){
		$("#tabs li:eq(1)").trigger("activate");
	},
	run: function(test, doneCb){
		this.toggleRecord(false);
		this.lineCounter = {};
		$("iframe").funcit_runner(test, this.callback('runnerCallback'), doneCb);
	},
	runDone: function(){
		this.mask.remove();
	},
	// start running a test because someone clicked the run button
	".runtest click": function(el, ev){
		this.openResultsTab();
		// get test name
		var testName = el.data('testName');
		QUnit.config.filters = [testName];
		this.run(this.textarea.val());
	},
	/**
	 * Assumes you have only one module.  Grabs that module and returns the string of its text
	 */
	// called by the runner module right before a statement is run
	// highlights the statement in the textarea as its being run
	runnerCallback: function(lineCount, stmnt){
		console.log("run0 "+stmnt.line);
		// any line that should be highlighted will call the runnerCallback >1x
		// the first pass should be ignored (the synchronous pass)
		// the second pass should run the highlight
		var count = 0;
		if(this.lineCounter[lineCount.toString()]){
			count = this.lineCounter[lineCount.toString()];
		}
		this.lineCounter[lineCount.toString()] = count+1;
		
		// skip the first statement, because it will always be the synchronous statement
		if (count == 0) {
			return;
		}
		
		// places cursor at the end of the given statement
		var chains = (new Funcit.Parse(stmnt)).statement().chains(),
			$st = chains.eq(count-1);
			
		if(!$st.length) return;
		
		var start = {line: $st[0].line, from: $st[0].thru},
			end = {line: $st[0].line, from: $st[0].thru+$st[0].second.length};
			
		this.textarea.lastselection('highlight', start, end);
	},
	// call the method that adds run buttons
	"textarea keyup": function(){
		var self = this;
		if(this.keydownTimeout){
			clearTimeout(this.keydownTimeout);
		}
		this.keydownTimeout = setTimeout(function(){
			self.addTestButton();
		}, 300)
	},
	// 1. parse the textarea and find tests
	// 2. render test buttons in the right spots
	addTestButton: function(){
		var tests = this.editor.tests(),
			lineheight = this.rowHeight,
			wrapper = this.find(".wrapper"), 
			buttonTop, testName;
			
		// TODO implement caching for this, so you're not removing/creating these buttons every time
		this.find(".runtest").remove();
		tests.each(function(i, val){
			buttonTop = (val.line-1)*lineheight-4;
			testName = val.parent.second[0].value;
			$("<div class='runtest'></div>")
				.appendTo(wrapper)
				.data('testName', testName)
				.css('top', buttonTop);
		})
	}
})

});
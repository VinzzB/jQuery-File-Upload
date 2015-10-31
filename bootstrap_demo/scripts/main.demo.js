/**
 * DEMO 
 * @author VinzzB
 * Some minor changes were made in the jquery.fileupload-ui.css stylesheet
 * Use with custom.fileupload-ui.js.
 */
/** VARS **/

//LOAD FILEUPLOAD
$(function () {
    'use strict'; 
    $("*").createButtons(); //beautify checkbox and radiobuttons
	//init fileUpload
    $('#fileupload').fileupload({ 
		autoLoad: true,
    	acceptFileTypes: /(\.|\/)(gif|jpe?g|png|txt|zip)$/i, 
    	prependFiles: true,
    	renderTemplate: function(r) { 		
			//custom style the rendered template.
	        r.createButtons("i");
		},		
    	confirmDeletion: function(e,data) {			
			//make list with filenames (shown in dialog)
    		var m = '';
    		for (var i = 0; i < data['files'].length; i++) {    			
				m += (i+1) + ". " + data.files[i].filename + '</br>';
			}  
			
    		var doct = 'file' + (data.files.length != 1 ? "s" : "");
	    	var txt = '<strong>' + doct +':</strong></br>' + m + '</br><strong>Do you want to continue?</strong>';
	    	msgYesNo('delete ' + data.files.length + ' ' + doct +  '?', txt, msgBtnsDel(function() {
				//user clicked delete button
		  		e.doDelete(); //perform delete 
		  	}));    		
    	}
    });    
    // Enable iframe cross-domain access via redirect option:
    $('#fileupload').fileupload(
        'option',
        'redirect',
        window.location.href.replace(
            /\/[^\/]*$/,
            '/cors/result.html?%s'
        )
    );

});

/**
 * ------------------------------------------------
 * OPTIONAL FUNCTIONS (FOR DEMO)
 * -------------------------------------------------
 **/
 
 /***
 * createButtons(): bootstrap checkbox and radiobuttons.
 * A simple jQuery function that transforms input checkbox and radio elements into bootstrap buttons. 
 * (styled like jQuery-UI buttonset)
 * @param elType The element container type (default: span) (eg.: i) 
 * @author VinzzB
 * @CreatedOn 2015/10/27
 */
$.fn.createButtons = function(elType) {	
	elType = elType||"span";
	$('.buttongroup', this).each(function() {
		var btnGroup = $(this);
		$("input[type=checkbox], input[type=radio]" ,btnGroup).each(function() {			
			var inp = $(this);
			elType = inp.data("glyph-el-type")||elType;
			inp.addClass("hidden"); //hide input, only style label...
			var lbl = $("label[for=" + inp.attr('id') + "]", btnGroup);
			lbl.addClass("btn btn-default");
			var currVal = inp.prop("checked") || inp.val() == inp.attr('name');
			lbl.prepend(createGlyph(currVal ? 'check' : 'unchecked',false,elType));
			inp.on('change', function() { 
				var currVal = inp.prop("checked");
				$(elType + ".glyphicon",lbl).remove();
			    // Reset icons on all buttons if type is radio button
				if (inp.attr("type") == "radio"){					
					var inputs = $("input[type=radio]",btnGroup).not("input[value="+ inp.val() +"]");
					$(inputs).each(function() {
						var lb = $("label[for=" + $(this).attr('id') + "]", btnGroup);
						$(elType + ".glyphicon",lb).remove();
						lb.prepend(createGlyph('unchecked', false, elType));						
					});					
				}
				lbl.prepend(createGlyph(currVal ? 'check' : 'unchecked',false,elType));			
			});	
			//re-style label when input is disabled/enabled
			inp.bind("change", function() { lbl.attr("disabled", inp.prop("disabled") ); });
		});		
	});
}

createGlyph = function(name,spin,elType){
	elType = elType||"span";
	if (name)
		return '<' + elType + ' class="glyphicon glyphicon-'+name+ (spin ? " fa-spin" : "") + '" aria-hidden="true"></' + elType + '>';
	return "";
};

createBtnUrl = function(text, type, href, dismiss) {
	text = text||"Ja"; 	href = href||"#"; type = type||"default"; 
	return '<a href="'+ href +'" class="btn btn-'+ type +'"'+ (dismiss ? 'data-dismiss="modal"':'') +'>'+ text +'</a>';
};

createBtnJs  = function(text, type, event, dismiss) {
	text = text||"Ja"; 	type = type||"default";
	var r = $('<button type="button" value="'+ text+'" class="btn btn-'+type+'" '+(dismiss ? 'data-dismiss="modal"':'')+'>'+ text + '</button>');
	r.on('click',event);
	return r;
}; 

/***
 * Create a modal messagebox
 * @param title Header text of modal dialog
 * @param text The main text to show in the dialog.
 * @param buttons a jQuery object containg one or more buttons.
 */
msgYesNo = function(title, text, buttons){
	var tmp = $(tmpl("tmplModalDialog", { title: title, text: text, buttons: buttons}));
	$('div.modal-footer',tmp).prepend(buttons);
	tmp.appendTo("body").modal('show').on('hidden.bs.modal',function() { $(this).remove(); });	
};

msgBtnsDel = function(onDel){	
	var r = $("<span></span>");
	r.append(createBtnUrl('Annuleren','default','#',true));
	r.append(createBtnJs('Verwijderen','danger',onDel,true))
	return r;
};

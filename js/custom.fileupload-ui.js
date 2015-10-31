/**
 * Extension CreatedBy: VinzzB (Github)
 * Extends the jQuery file upload widget from blueimp.
 * 
 * Added to widget:
 * - 'o.unid' variable in templates. This hold the last used UniqueId. (append it with the incrementor to create unique objects)
 * - Show modal (dialog) delete messages. (one message on multiple selected files)
 * - a rendered template can be custom rendered before injecting it into the DOM. (jQuery-Ui / Custom styling)
 * - buttons are disabled when action can not be performed.
 * - select all checkbox gets checked/unchecked when one of its related checkboxes changes.  
 * 
 * New options:
 * autoLoad (true / false): load existing data from server on widget initialize. Url specified on form element (data-url attribute).
 * delButtons (selector): selector to retrieve the delete buttons inside the table. 
 * delAllButtons (selector): a selector that retrieves the deleteAll buttons
 * renderTemplate (function(r)): a callback function to render the template before being inserted in the DOM.
 * confirmDeletion (function(e,data)): a callback function to display a non-blocking message. use e.doDelete() to perform the delete. data param holds data from the delete buttons)
 **/

$.widget( "blueimp.fileupload", $.blueimp.fileupload, {
	options: {
		autoLoad: true,
		delButtons: "button.delete",
		delAllButtons: "button.selDelete",
		renderTemplate: function(r) { } ,
		confirmDeletion: function(e,data) { e.doDelete(); } //delete immediately if confirmDeletion is not set by user.
	},
	_unid: 0, //private counter for files.
	_create: function() {
		var me = this;
		this._hookDeleteAllButton();
		this._hookCheckboxToggleAll();
		this._super();
		$(this.options.delAllButtons,this.element).prop("disabled", true); 	
		$(".toggleAll").prop('checked',false).change();
				
	    $(this.element).bind('fileuploadadded', function() { me._checkBarButtons();})
	    	.bind("fileuploaddestroyed", function() { me._checkBarButtons(); })
	    	.bind("fileuploadfinished", function() { me._checkBarButtons();})
	    	.bind("fileuploadprocessalways", function() { me._checkBarButtons();});
		//alert('ee')		
		if (this.options.autoLoad)
			this._loadFiles();
		this._checkBarButtons();
	},	
	
	//OVERRIDDEN METHOD!
    _renderTemplate: function (func, files) {
    	console.log(files);
        if (!func) {
            return $();
        }        
        //RENDER TEMPLATE
        var result = $(func({
        	unid: this._unid,
            files: files,
            formatFileSize: this._formatFileSize,
            options: this.options
        }));
        //add unique ids to global counter
        this._unid += files.length;
        //RENDER STYLES (juery-UI / Bootstrap styles by user function)
        this._hookCheckboxRows(result);
        //Custom styling by user...
        this.options.renderTemplate(result);
        //if (result instanceof $) { return result; }        
        return $(this.options.templatesContainer).html(result).children();
    },
    
    //OVERRIDDEN METHOD!
    //Handles deletion per file. (triggers confirmation if not confirmed yet)
    _deleteHandler: function (e) {
        e.preventDefault();        
        var button = $(e.currentTarget);        
        //fire trigger for user confirmation (if not confirmed yet)
        if (!button.data('delete')) {
        	var row = button.closest("." + this.options.downloadTemplateId);
        	this._triggerConfirmDelete(e, [row], button);
        	return false;
        }
        //removing document!
        button.removeData("delete"); //remove confirmed flag (=reset when delete fails)
        this._trigger('destroy', e, $.extend({
            context: button.closest("." + this.options.downloadTemplateId),
            type: 'DELETE'
        }, button.data()));
    },
    
    _loadFiles: function() {
    	var me = this, $me = $(this);
        $me.addClass('fileupload-processing');
        $.ajax({
            // Uncomment the following to send cross-domain cookies:
            //xhrFields: {withCredentials: true},
            url: me.options.url,
            dataType: 'json',
            context: me.element
        }).always(function () {
            $me.removeClass('fileupload-processing');
        }).done(function (result) {
        	me.options.done.call(this, $.Event('done'), {result: result});
        });        
    },
    
    _triggerConfirmDelete: function(e, rows, buttons) {    	
    	var files = [];
    	//create a list with selected files
    	buttons.each(function(i) {
    		files[files.length] = $(this).data();
    	});
    	
        e.doDelete = function() { buttons.data("delete", "confirmed").trigger('click'); }	
        this._trigger('confirmDeletion', e,{ files: files, rows: rows } );
    },
    
    _hookDeleteAllButton : function() {
    	var me = this;
        //Hook click on button: delete all selected
        $(this.options.delAllButtons, this.element).on('click',function(e) {
           	
        	e.preventDefault();
        	var selRows = $("input.toggle[type=checkbox]:checked", me.element).closest("." + me.options.downloadTemplateId);    	
        	var delBtns = $(me.options.delButtons, selRows);
        	if (delBtns.length) {

    	    	//trigger confirmation message
    	    	me._triggerConfirmDelete(e, selRows, delBtns )  
        	}
        });
    },
    
    _hookCheckboxToggleAll: function() {
    	var me = this;
        //(un-)select all checkboxes when selectAll box is changed
        $('input.toggleAll[type=checkbox]', this.element).on('click', function() {        	
        	//-> DO NOT USE preventDefault here, this would break the select all button!
        	var val = $(this).prop("checked");
        	$("input.toggle[type=checkbox]", $("tbody",me.element)).not(":disabled").prop("checked",val).change();
        })
    },
    
    _hookCheckboxRows: function(tm) {
    	var me = this;
		$("input.toggle[type=checkbox]",tm).on('change', function() {
			var btns = $("input.toggle[type=checkbox]",tm).not(":disabled"); //get all non disabled buttons
			var selBtns = $("input.toggle[type=checkbox]:checked",tm).not(":disabled"); //get all checked buttons that are not disabled.
			$(".toggleAll",me.element).prop("checked", selBtns.length == btns.length).change() //equals checks? 
			$(me.options.delAllButtons,me.element).prop("disabled", !selBtns.length); //enable or disable 'delete all' button		
		});		
    },
	
    _checkBarButtons: function() {    	
    	var allRows = $('.' + this.options.downloadTemplateId + ', .' + this.options.uploadTemplateId, this.element);
    	var upRows = $('.' + this.options.uploadTemplateId,  this.element);
    	var downRows = $('.' + this.options.downloadTemplateId,  this.element);
    	var starts = $("button.start:enabled", upRows);
    	var cancels = $("button.cancel:enabled", allRows);
    	var selected = $("input.toggle[type=checkbox]:checked:not(:disabled)",downRows);
    	$(".toggleAll",this.element)
    		.prop("disabled",!downRows.length)
    		.prop("checked", downRows.length != 0 && selected.length == downRows.length)
    		.change();
    	$(".fileupload-buttonbar button.start", this.element).prop('disabled',!starts.length);
    	$(".fileupload-buttonbar button.cancel", this.element).prop('disabled',!cancels.length);
    	$(this.options.delAllButtons, this.element).prop("disabled", !selected.length);
    }

});

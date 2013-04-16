// Copyright 2013 Web Notes Technologies Pvt Ltd
// License: MIT. See license.txt

// wn._("Form")

wn.ui.AppFrame = Class.extend({
	init: function(parent, title, module) {
		this.set_document_title = true;
		this.buttons = {};
		this.$w = $('<div class="span12"></div>').prependTo(parent);
				
		$('<div>\
			<ul class="breadcrumb" style="height: 32px;">\
				<span class="appframe-right pull-right">\
					<span class="btn-group"></span>\
				</span>\
			</ul>\
		</div>\
		<div class="title-button-area pull-right" style="margin-top: 10px;"></div>\
		<div class="title-area"></div>\
		<div class="sub-title-area muted small" \
			style="margin-top: -15px; margin-bottom: 5px;"></div>\
		').appendTo(this.$w);
		
		this.$w.find('.close').click(function() {
			window.history.back();
		})
		
		if(title) 
			this.set_title(title);
			
	},
	get_title_area: function() {
		return this.$w.find(".title-area");
	},
	set_title: function(txt, full_text) {
		this.title = txt;
		this.$w.find(".breadcrumb .appframe-title").html(txt);
		$("<h3 style='display: inline-block'>")
			.html(txt).appendTo(this.get_title_area().empty());
	},
	set_sub_title: function(txt) {
		this.$w.find(".sub-title-area").html(txt);
	},
	clear_breadcrumbs: function() {
		this.$w.find(".breadcrumb").empty();
	},
	add_breadcrumb: function(icon, link, title) {
		if(link) {
			$(repl('<li style="margin-top: 5px;"><a href="#%(link)s" title="%(title)s"><i class="%(icon)s"></i></a>\
			  	<span class="divider">/</span></li>', {
				icon: icon,
				link: link,
				title: wn._(title)
			})).appendTo(this.$w.find(".breadcrumb"));
		} else {
			$(repl("<li style='margin-top: 5px;' class='active'><i class='%(icon)s'></i> \
				<span class='appframe-title'></span>\
				<span class='appframe-subject'></span></li>", {
				icon: icon,
			})).appendTo(this.$w.find(".breadcrumb"));
			if(this.title) this.set_title(this.title);
		}
	},
	add_home_breadcrumb: function() {
		this.add_breadcrumb("icon-home", wn.home_page, "Home");
	},
	add_list_breadcrumb: function(doctype) {
		this.add_breadcrumb("icon-list", "List/" + encodeURIComponent(doctype), doctype + " List");
	},
	add_module_breadcrumb: function(module) {
		var module_info = wn.modules[module];
		if(module_info) {
			this.add_breadcrumb(module_info.icon, module_info.link,
				module_info.label || module);
		}
	},
	
	set_views_for: function(doctype, active_view) {
		this.doctype = doctype;
		var me = this;
		var views = [{
				icon: "icon-file-alt",
				route: "",
				type: "form",
				set_route: function() {
					if(wn.views.formview[me.doctype]) {
						wn.set_route("Form", me.doctype, wn.views.formview[me.doctype].frm.docname);
					} else {
						new_doc(doctype);
					}
				}
			}];
		
		if(!locals.DocType[doctype].issingle) {
			views.push({
				icon: "icon-list",
				route: "List/" + doctype,
				type: "list"
			});
		}
		
		if(locals.DocType[doctype].__calendar_js) {
			views.push({
				icon: "icon-calendar",
				route: "Calendar/" + doctype,
				type: "calendar"
			});
		}
		
		if(wn.model.can_get_report(doctype)) {
			views.push({
				icon: "icon-table",
				route: "Report2/" + doctype,
				type: "report"
			});
		}
		
		this.set_views(views, active_view);
	},
	
	set_views: function(views, active_view) {
		var me = this;
		$right = this.$w.find(".appframe-right .btn-group");
		$.each(views, function(i, e) {
			var btn = $(repl('<button class="btn" data-route="%(route)s">\
				<i class="%(icon)s"></i></button>', e))
				.click(e.set_route || function() {
					window.location.hash = "#" + $(this).attr("data-route");
				})
				.css({
					width: "39px"
				})
				.attr("title", wn._(toTitle(e.type)))
				.appendTo($right);
				
			if(e.type==active_view) {
				btn.addClass("btn-inverse");
			}
		});
	},
	
	add_help_button: function(txt) {
		this.add_toolbar();
		$('<button class="btn" button-type="help">\
			<b>?</b></button>')
			.data('help-text', txt)
			.click(function() { msgprint($(this).data('help-text'), 'Help'); })
			.appendTo(this.toolbar);			
	},

	clear_buttons: function() {
		this.toolbar && this.toolbar.empty();
	},

	add_toolbar: function() {
		if(!this.toolbar) {
			this.toolbar = $('<div class="navbar">\
			  <div class="navbar-inner">\
			    <ul class="nav">\
			    </ul>\
			  </div>\
			</div>').appendTo(this.$w).find(".nav");
		}
	},
	add_button: function(label, click, icon) {
		this.add_toolbar();
		args = { label: label, icon:'' };
		if(icon) {
			args.icon = '<i class="'+icon+'"></i>';
		}
		this.buttons[label] = $(repl('<li><a>\
			%(icon)s %(label)s</a></li>', args))
			.appendTo(this.toolbar)
			.find("a")
			.click(click);
		return this.buttons[label];
	},
	add_title_button: function(label, click, icon) {
		args = { label: label, icon:'' };
		if(icon) {
			args.icon = '<i class="'+icon+'"></i>';
		}
		this.buttons[label] = $(repl('<button class="btn btn-primary">\
			%(icon)s %(label)s</button>', args))
			.appendTo(this.$w.find(".title-button-area"))
			.click(click);
		return this.buttons[label];
	},
	add_dropdown: function(label) {
		this.add_toolbar();
		this.buttons[label] = $('<li class="dropdown">\
			<a href="#" class="dropdown-toggle" data-toggle="dropdown">'
			+label+' <b class="caret"></b></a>\
			<ul class="dropdown-menu"></ul>')
			.appendTo(this.toolbar);
		this.buttons[label].find(".dropdown-toggle").dropdown();
		return this.buttons[label];
		
	},
	add_dropdown_button: function(parent, label, click, icon) {
		var menu = this.buttons[parent].find(".dropdown-menu");
		return $('<li><a><i class="'+icon+'"></i> '+label+'</a></li>')
			.appendTo(menu)
			.find("a")
			.click(function() {
				click();
				return false;
			});
	},
	add_label: function(label) {
		return $("<span class='label'>"+label+" </span>")
			.appendTo($("<li>").appendTo(this.toolbar));
	},
	add_select: function(label, options) {
		this.add_toolbar();
		return $("<select class='span2' style='margin-top: 5px;'>")
			.add_options(options)
			.appendTo($("<li>").appendTo(this.toolbar));
	},
	add_data: function(label) {
		this.add_toolbar();
		return $("<input class='span2' style='margin-top: 5px;' type='text' placeholder='"+ label +"'>")
			.appendTo($("<li>").appendTo(this.toolbar));
	}, 
	add_date: function(label, date) {
		this.add_toolbar();
		return $("<input class='span2' style='margin-top: 5px;' type='text'>").datepicker({
			dateFormat: sys_defaults.date_format.replace("yyyy", "yy"),
			changeYear: true,
		}).val(dateutil.str_to_user(date) || "")
			.appendTo($("<li>").appendTo(this.toolbar));
	},
	add_check: function(label) {
		this.add_toolbar();
		return $("<label style='display: inline;'><input type='checkbox' \
			style='margin-top: 5px;'/> " + label + "</label>")
			.appendTo($("<li>").appendTo(this.toolbar))
			.find("input");
	},
	add_ripped_paper_effect: function(wrapper) {
		if(!wrapper) var wrapper = wn.container.page;
		var layout_main = $(wrapper).find('.layout-main');
		if(!layout_main.length) {
			layout_main = $(wrapper).find('.layout-main-section');
		}
		layout_main.css({"padding-top":"25px"});
		$('<div class="ripped-paper-border"></div>')
			.prependTo(layout_main)
			.css({"width": $(layout_main).width()});
	}
});

// parent, title, single_column
// standard page with appframe

wn.ui.make_app_page = function(opts) {
	if(opts.single_column) {
		$('<div class="appframe span12">\
			<div class="layout-appframe row"></div>\
			<div class="layout-main"></div>\
		</div>').appendTo(opts.parent);
	} else {
		$('<div class="appframe span12">\
			<div class="layout-appframe row"></div>\
			<div class="row">\
				<div class="layout-main-section span9"></div>\
				<div class="layout-side-section span3"></div>\
			</div>\
		</div>').appendTo(opts.parent);
	}
	opts.parent.appframe = new wn.ui.AppFrame($(opts.parent).find('.layout-appframe'));
	if(opts.set_document_title!==undefined)
		opts.parent.appframe.set_document_title = opts.set_document_title;
	if(opts.title) opts.parent.appframe.set_title(opts.title);
}
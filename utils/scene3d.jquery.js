/*
* scene3d - X3DOM jQuery wrapper for x3DOM geometry
*
* Aleksandar Radovanovic (2014)
* http://www.livereference.org/scene3d
*
* Licensed under the MIT license:
* http://www.opensource.org/licenses/mit-license.php
*
*
* Based on X3DOM (http://www.x3dom.org)
*
*/
(function ( $ ) {
	
	$.fn.scene3d = function( options ) {
		var options = $.extend( {}, $.fn.scene3d.defaults, options );
		return this.each(function() {			
			var element = $( this );
			x3domInit(element, options);
		});
	};
	
	/* private constants
	--------------------------------------------------------------------------*/
	var NODE_COLOR = "#cccccc";
	var FONT_COLOR = "#000000";
	var FONT_FAMILY = 'SERIF';
	var FONT_SIZE = .5;
	var RADIUS = .1;
	var MIN_RADIUS = 0.00001;
	var ANIMATION_CODE = '<timeSensor DEF="clock" cycleInterval="16" loop="true"></timeSensor>\
		<OrientationInterpolator DEF="spinThings" key="0 0.25 0.5 0.75 1" keyValue="0 1 0 0  0 1 0 1.57079  0 1 0 3.14159  0 1 0 4.71239  0 1 0 6.28317"></OrientationInterpolator>\
        <ROUTE fromNode="clock" fromField="fraction_changed" toNode="spinThings" toField="set_fraction"></ROUTE>\
    	<ROUTE fromNode="spinThings" fromField="value_changed" toNode="rotationArea" toField="set_rotation"></ROUTE>';

	/* private functions
	--------------------------------------------------------------------------*/
	/* Vector algebra
	-----------------------------------------------------------------------------*/
	function Vector(x, y, z) {
		this.x = x; this.y = y; this.z = z; 
	}
	Vector.prototype.add = function(V) { 
		return new Vector(this.x + V.x, this.y + V.y, this.z + V.z); 
	}
	Vector.prototype.subtract = function(V) {
		return new Vector(this.x - V.x, this.y - V.y, this.z - V.z); 
	}
	Vector.prototype.multiply = function(n) { 
		return new Vector(this.x * n, this.y * n, this.z * n); 
	}
	Vector.prototype.divide = function(n) { 
		return new Vector(this.x / n, this.y / n, this.z / n); 
	}
	Vector.prototype.radius = function() {
	 return Math.max(MIN_RADIUS, Math.sqrt(this.x*this.x + this.y*this.y + this.z*this.z)); 
	 }
	Vector.prototype.normalise = function() {
		return this.divide(this.radius()); 
	};
	Vector.prototype.maximum = function(V) {
		return new Vector (Math.max(this.x, V.x), Math.max(this.y, V.y), Math.max(this.z, V.z));
	}
	Vector.prototype.minimum = function(V) {
		return new Vector (Math.min(this.x, V.x), Math.min(this.y, V.y), Math.min(this.z, V.z));
	}

	Vector.prototype.coordTranslate = function( width, height, depth, min, max ) {
		return new Vector (
			max.x == min.x ? max.x : (((this.x - min.x) * (width)) / ( max.x - min.x ) ) - width/2,
			max.y == min.y ? max.y : (((this.y - min.y) * (height)) / ( max.y - min.y ) ) - height/2,
			max.z == min.z ? max.z : (((this.z - min.z) * (depth)) / ( max.z - min.z ) ) - depth/2
		);
	}
		
	// hex to RGB converter
	function hex2rgb( hex ) {
		hex = (hex.substr(0,1)=="#") ? hex.substr(1) : hex;
		return [parseInt(hex.substr(0,2), 16)/255, parseInt(hex.substr(2,2), 16)/255, parseInt(hex.substr(4,2), 16)/255];
	};	
	
	function x3domInit(elem, options) {
		var animationCode = options.sceneAnimation ? ANIMATION_CODE : '';
		var xmlx3d = $($.parseXML( '\
		<x3d id="x3dElement" width="150px" height="150px" showStat="false" showLog="false">\
		<Scene><transform DEF="rotationArea"><Background skyColor="1 1 1"/><Viewpoint orientation="0,0,0,1" position="0,0,10" /></transform>'
		+animationCode+'</Scene>\
		</x3d>' ));			

		xmlx3d.find('x3d').attr('width', options.width);		
		xmlx3d.find('x3d').attr('height', options.height);
		xmlx3d.find('x3d').attr('showStat', options.showStat);
		xmlx3d.find('x3d').attr('showLog', options.showLog);		
		xmlx3d.find('Background').attr('skyColor', hex2rgb(options.background));
		xmlx3d.find('Background').attr('backurl',options.backurl);
		xmlx3d.find('Background').attr('topurl',options.topurl);
		xmlx3d.find('Background').attr('bottomurl',options.bottomurl);
		xmlx3d.find('Background').attr('fronturl',options.fronturl);
		xmlx3d.find('Background').attr('lefturl',options.lefturl);
		xmlx3d.find('Background').attr('righturl',options.righturl);
		xmlx3d.find('Viewpoint').attr('orientation', options.ViewpointOrientation);
		xmlx3d.find('Viewpoint').attr('position', options.ViewpointPosition);
		var x3dElem = (new XMLSerializer()).serializeToString(xmlx3d[0]);
		FONT_FAMILY = options.fontFamily;
		FONT_SIZE = options.fontSize;
		elem.append(x3dElem);
	};
	function rndNumber (min, max)
	{
		return (Math.random() * (max - min)) + min;
	}	
	
	/* DRAWING
	------------------------------------------------------------------------ */

	function createGroup ( id ) {
		return $('<group id="'+id+'"></group>');
	}
	
	function setLabel ( oLabelAttr ) {
		var z = oLabelAttr.z + oLabelAttr.labeloffset;
		var label = '\
			<transform translation="' + oLabelAttr.x + ' ' + oLabelAttr.y + ' ' + z + '">\<shape>\
			<appearance>\
				<material diffuseColor="'+hex2rgb(oLabelAttr.fontColor)+'" ></material>\
			</appearance>\
			<text string="'+oLabelAttr.label+'">\
				<fontstyle family="'+oLabelAttr.fontFamily+'" size="'+oLabelAttr.fontSize+'"></fontstyle>\
			</text>\
			</shape></transform>';
			return label;
  	}

	function drawText( oArg) {
		var oAttr = {
			x:0, y:0, z:0, label:'',
			fontFamily:FONT_FAMILY, fontColor:FONT_COLOR, fontSize:FONT_SIZE};
		if (oArg != null) { $.extend(true, oAttr, oArg); }
		
		var gObj = $('\
			<transform translation="' + oAttr.x + ',' + oAttr.y + ',' + oAttr.z + '">\<shape>\
			<appearance>\
				<material diffuseColor="'+hex2rgb(oAttr.fontColor)+'" ></material>\
			</appearance>\
			<text string="'+oAttr.label+'">\
				<fontstyle family="'+oAttr.fontFamily+'" size="'+oAttr.fontSize+'"></fontstyle>\
			</text>\
			</shape></transform>');
			return gObj;
  		}
	function drawLine( oArg ) {
		var oAttr = {
			x1:0, y1:0, z1:0,
			x2:0, y2:0, z2:0,
			linewidth:1, linetype:1,
			color:NODE_COLOR,
			label:'', labeloffset: 0.1,
			fontFamily:FONT_FAMILY,
			fontColor:FONT_COLOR,
			fontSize:FONT_SIZE
		};
		$.extend(true, oAttr, oArg);
		var oText = oAttr;
		oText.x = (oAttr.x1+oAttr.x2) / 2;
		oText.y = (oAttr.y1+oAttr.y2) / 2;
		oText.z = (oAttr.z1+oAttr.z2) / 2;
		var label = (oAttr.label.length > 0) ? setLabel ( oText ) : '';
		var gObj = $('\
			<transform><shape>\
			<appearance><material emissiveColor="'+hex2rgb(oAttr.color)+'"></material>\
			<LineProperties linetype="'+oAttr.linetype+'" linewidthScaleFactor="'+oAttr.linewidth+'" applied="true" containerField="lineProperties"></LineProperties>\
			</appearance>\
			<LineSet>\
				<Coordinate point="' + oAttr.x1 + ' ' + oAttr.y1 + ' ' + oAttr.z1 + ' ' + oAttr.x2 + ' ' + oAttr.y2 + ' ' + oAttr.z2 +'"/>\
			</LineSet>\
			</shape></transform>'+label);
		if (oAttr.id) { $(gObj).find('shape').attr("id", oAttr.id); } 
		if (oAttr.onclick) { $(gObj).find('shape').attr("onclick", oAttr.onclick); } 
		$.each( oAttr, function( key, value ) {
			if (key.match("^data-")) { $(gObj).find('shape').attr(key, value); }
		});
		return gObj;
	}
	
	function drawSphere ( oArg) {
		var oAttr = {
			x:0, y:0, z:0, radius:.1, color:NODE_COLOR,
			label:'', labeloffset: 0.1,
			fontFamily:FONT_FAMILY, fontColor:FONT_COLOR, fontSize:FONT_SIZE
		};
		$.extend(true, oAttr, oArg);
		var label = (oAttr.label.length > 0) ? setLabel ( oAttr ) : '';
		var gObj = $('\
			<transform translation="' + oAttr.x + ' ' + oAttr.y + ' ' + oAttr.z + '">\
			<shape><appearance><material diffuseColor="'+hex2rgb(oAttr.color)+'"></material></appearance>\
			<Sphere radius="'+oAttr.radius+'"></Sphere></shape>\
			</transform>'+label);
		if (oAttr.id) { $(gObj).find('shape').attr("id", oAttr.id); } 
		if (oAttr.class) { $(gObj).find('shape').attr("class", oAttr.class); } 
		if (oAttr.onclick) { $(gObj).find('shape').attr("onclick", oAttr.onclick); } 
		// find data-* attribute
		$.each( oAttr, function( key, value ) {
			if (key.match("^data-")) { $(gObj).find('shape').attr(key, value); }
		});
		return gObj;
	}

	function drawCylinder ( oArg) {
		var oAttr = {
			x:0, y:0, z:0, radius:.1, height:1, color:NODE_COLOR,
			label:'', labeloffset: 0.1,
			fontFamily:FONT_FAMILY, fontColor:FONT_COLOR, fontSize:FONT_SIZE
		};
		$.extend(true, oAttr, oArg);
		var label = (oAttr.label.length > 0) ? setLabel ( oAttr ) : '';
		var gObj = $('\
			<transform translation="' + oAttr.x + ' ' + oAttr.y + ' ' + oAttr.z + '">\
			<shape><appearance><material diffuseColor="'+hex2rgb(oAttr.color)+'"></material></appearance>\
			<Cylinder radius="'+oAttr.radius+' "height="'+oAttr.height+'"></Cylinder></shape>\
			</transform>'+label);
		if (oAttr.id) { $(gObj).find('shape').attr("id", oAttr.id); } 
		if (oAttr.onclick) { $(gObj).find('shape').attr("onclick", oAttr.onclick); } 
		$.each( oAttr, function( key, value ) {
			if (key.match("^data-")) { $(gObj).find('shape').attr(key, value); }
		});
		return gObj;
	}
	
	function drawCone ( oArg) {
		var oAttr = {
			x:0, y:0, z:0, height:1, bottomRadius:1.0,topRadius:0, color:NODE_COLOR,
			label:'', labeloffset: 0.1,
			fontFamily:FONT_FAMILY,fontColor:FONT_COLOR,fontSize:FONT_SIZE
		};
		$.extend(true, oAttr, oArg);
		var label = (oAttr.label.length > 0) ? setLabel ( oAttr ) : '';
		var gObj = $('\
			<transform translation="' + oAttr.x + ' ' + oAttr.y + ' ' + oAttr.z + '">\
			<shape><appearance><material diffuseColor="'+hex2rgb(oAttr.color)+'"></material></appearance>\
			<Cone  height="'+oAttr.height+'" bottomRadius="'+oAttr.bottomRadius+'" topRadius="'+oAttr.topRadius+'"></Cone></shape>\
			</transform>'+label);
		if (oAttr.id) { $(gObj).find('shape').attr("id", oAttr.id); } 
		if (oAttr.onclick) { $(gObj).find('shape').attr("onclick", oAttr.onclick); } 
		$.each( oAttr, function( key, value ) {
			if (key.match("^data-")) { $(gObj).find('shape').attr(key, value); }
		});
		return gObj;
	}

	function drawBox ( oArg) {
		var oAttr = {
			x:0, y:0, z:0, width:1, depth:1,height:1, color:NODE_COLOR,
			label:'', labeloffset: 0.1,
			fontFamily:FONT_FAMILY,fontColor:FONT_COLOR,fontSize:FONT_SIZE
		};
		$.extend(true, oAttr, oArg);
		var label = (oAttr.label.length > 0) ? setLabel ( oAttr ) : '';
		var gObj = $('\
			<transform translation="' + oAttr.x + ' ' + oAttr.y + ' ' + oAttr.z + '">\
			<shape><appearance><material diffuseColor="'+hex2rgb(oAttr.color)+'"></material></appearance>\
			<Box size="'+oAttr.width+','+oAttr.height+','+oAttr.depth+'"></Box></shape>\
			</transform>'+label);
		if (oAttr.id) { $(gObj).find('shape').attr("id", oAttr.id); } 
		if (oAttr.onclick) { $(gObj).find('shape').attr("onclick", oAttr.onclick); } 
		$.each( oAttr, function( key, value ) {
			if (key.match("^data-")) { $(gObj).find('shape').attr(key, value); }
		});
		return gObj;
	}
	function addInline ( oArg) {
		var oAttr = { x:0, y:0, z:0, url:'' };
		$.extend(true, oAttr, oArg);
		var gObj = $('\
			<transform translation="' + oAttr.x + ' ' + oAttr.y + ' ' + oAttr.z + '">\
			<Inline url="'+oAttr.url+'" />\
			</transform>');
		return gObj;
	}
	
	/* set cuboid coordinates for graph
	------------------------------------------------------------------------ */
	function cuboidGraph( oGraph, c_width, c_height, c_depth )
	{
		var x, y, z, dx, dy, dz;	
		var cellCount = 0;
		var divisions = [1, 1, 1];
		while ( cellCount < oGraph.node.length ) {
			var i = divisions.indexOf(Math.min.apply(Math, divisions));
			divisions[i]++;
			cellCount = divisions[0] * divisions[1] * divisions[2];
		}
		dx = c_width/divisions[0]; dy = c_height/divisions[1]; dz= c_depth/divisions[2];	
		var coordinates = {'coord':[]};
		var a = c_width/2, b = c_height/2, c = c_depth/2;
		for ( x = -a; x < a; x+=dx ) {
			for ( y = -b; y < b; y+=dy ) {
				for ( z = -c; z < c; z+=dz ) {
					coordinates.coord.push ([x+dx/2,y+dy/2,z+dz/2]);
					var xx = x+dx/2, yy = y+dy/2, zz = z+dz/2;
				}
			}
		}
		$.each(oGraph.node, function( index, node ) {
			var coords = coordinates.coord.pop();
			node.x = coords[0];
			node.y = coords[1];
			node.z = coords[2];
		});
		return oGraph;
	}
	/* draw graph
	------------------------------------------------------------------------ */
	
	function drawGraph ( oArg ) {
		var oGraph = oArg.data;
		var width = oArg.width == 'undefined' ? 1 : oArg.width/2;
		var height = oArg.height == 'undefined' ? 1 : oArg.height/2;
		var depth = oArg.depth == 'undefined' ? 1 : oArg.depth/2;
		var graph;
		var lineCoords = [];
		$.each(oGraph.node, function( index, node ) {
			var oAttr = {};
			oAttr = {	// set default values
				id: 'n-'+  parseInt(rndNumber( 1, 99999)),
				x: rndNumber( -width, width ),
				y: rndNumber( -height, height ),
				z: rndNumber( -depth, depth ),
				//radius: rndNumber( .1, .2),
				color: '#'+Math.floor(Math.random()*16777215).toString(16),
				label: '',
				fontFamily:FONT_FAMILY,
				fontColor:FONT_COLOR,
				fontSize:FONT_SIZE
			};
			$.extend(true, oAttr, oArg); // user's input overwrite defaults
			$.extend(true, oAttr, node); // node data overwrite user input 
			lineCoords.push( {id:oAttr.id, x:oAttr.x, y:oAttr.y, z:oAttr.z } );
			graph = $(graph).add($( drawSphere( oAttr )));
		});
		
		$.each(oGraph.edge, function( index, edge ) {
			var edgeSource = $.grep(lineCoords, function ( obj ) {
				return ( obj.id === edge.source );
			})[0];
			var edgeTarget = $.grep(lineCoords, function ( obj ) {
				return ( obj.id === edge.target );
			})[0];
			var oAttr = {};
			oAttr = {
				id: 'n-'+  parseInt(rndNumber( 1, 99999)),
				x1: edgeSource.x,
				y1: edgeSource.y,
				z1: edgeSource.z,
				x2: edgeTarget.x,
				y2: edgeTarget.y,
				z2: edgeTarget.z,
				linewidth: 0,
				color: NODE_COLOR,
				label: '',
				fontFamily:FONT_FAMILY,
				fontColor:FONT_COLOR,
				fontSize:FONT_SIZE
			}
			$.extend(true, oAttr, oArg); // user's input overwrite defaults
			$.extend(true, oAttr, edge); // edge data overwrite user input
			graph = $(graph).add($( drawLine( oAttr )));
		});
		return graph;
	}

	/* force directed graph functions
	--------------------------------------------------------------------------*/
	/* Force Directed Graph model
	-----------------------------------------------------------------------------*/
	// model settings
	function ForceDirectedSettings ( oSettings )
	{
		this.maxIterations = oSettings.maxIterations; 
		this.timestep = oSettings.timestep;
		this.timetick = oSettings.timetick;	// animation interval
		this.damping = oSettings.damping;	// damping constant, nodes lose velocity over time
		this.k = oSettings.k;	// Hooke's law spring attraction constant
		this.ke = oSettings.ke;	//Coulomb's repulsion constant
		this.m = oSettings.mass;	// node mass
		this.slength = oSettings.slength;	// spring length
		this.maxCoords = new Vector (Number.NEGATIVE_INFINITY,Number.NEGATIVE_INFINITY,Number.NEGATIVE_INFINITY);
		this.minCoords = new Vector (Number.POSITIVE_INFINITY,Number.POSITIVE_INFINITY,Number.POSITIVE_INFINITY);
	}
	
	function ForceDirected( position )
	{
		this.m = fdSettings.m;			// mass
		this.p = position;				// position
		this.v = new Vector(0, 0, 0);	// velocity
		this.f = new Vector(0, 0, 0);	// force
		this.l = [];					// list of links as node indexes (starting from 0)

		ForceDirected.nodes.push(this);
	}
	ForceDirected.nodes = [];


	ForceDirected.applyForces = function()
	{
		var delta;
		var radius;
		var directrion;
		var displacement;
		var force;
		
		ForceDirected.nodes.forEach(function(node1) 
		{
			// Coulomb's Law modified with node mass: ke * (x1-x2)/r^2 * 1/m
			ForceDirected.nodes.forEach(function(node2) 
			{
				if (node1 !== node2)
				{				
					delta = node1.p.subtract(node2.p);
					radius = delta.radius();
					force = delta.divide(radius * radius).multiply(fdSettings.ke)
					node1.f = node1.f.add(force.divide(node1.m));
					node2.f = node2.f.subtract(force.divide(node2.m));										
				}
			});
			// Hooke's Law: k * (length-radius) * (x1-x2)/r^2
			node1.l.forEach(function(node) 
			{		
				delta = ForceDirected.nodes[node].p.subtract(node1.p); 
				radius = delta.radius();
				displacement = fdSettings.slength - radius;
				force = delta.divide(radius * radius).multiply(fdSettings.k * displacement);
				node1.f = node1.f.subtract(force);
				ForceDirected.nodes[node].f = ForceDirected.nodes[node].f.add(force);
			});			
			// update velocity
			node1.v = node1.v.add(node1.f.multiply(fdSettings.timestep)).multiply(fdSettings.damping);
			node1.f = new Vector(0,0,0);
		});
		
	}
		
	ForceDirected.updatePosition = function(timestep)
	{
		ForceDirected.nodes.forEach(function(node) 
		{
			node.p = node.p.add(node.v.multiply(timestep));
			fdSettings.maxCoords = fdSettings.maxCoords.maximum(node.p);
			fdSettings.minCoords = fdSettings.minCoords.minimum(node.p);
		});
	}
		
	/* end of Force Directed model
	------------------------------------------------------------------------ */
		
	/* public functions
	--------------------------------------------------------------------------*/

	$.fn.addText = function( oArg) {
		this.find('scene').append($(drawText( oArg )));
  	}
	$.fn.addLine = function( oArg ) {
		this.find('scene').append($(drawLine( oArg )));
	}

	$.fn.addCylinder = function( oArg) {
		this.find('scene').append( $( drawCylinder( oArg ) ) );
	};	
	$.fn.addSphere = function( oArg) {
		this.find('scene').append( $( drawSphere( oArg ) ) );
	};	
	$.fn.addCone = function( oArg ) {
		this.find('scene').append( $( drawCone( oArg ) ) );
	};	
	$.fn.addBox = function( oArg ) {
		this.find('scene').append( $( drawBox( oArg ) ) );
	};	
	$.fn.removeShape = function( id ) {
		$(id).parent().remove();
	};	
	
	$.fn.addGraph = function( oArg ) {
		oAttr = {	// set default values
				id: 'g-'+  parseInt(rndNumber( 1, 99999)),
				width: 1,
				height: 1,
				depth: 1,
				forcedirected: {
					maxIterations: 100,
					k: 300, 				// Hooke's law spring attraction constant
					ke: 200,				//Coulomb's repulsion constant
					mass: 5,				// node mass
					slength: 1,				// string length
					timetick:	50,			// animation interval
					timestep: 0.05,
					damping: 0.5, 			// damping constant, nodes lose velocity over time
				}
		};
		$.extend(true, oAttr, oArg);
		var oGraph = oAttr.data;
		var scene = this;
		if($('#'+oAttr.id).length == 0) {
			scene.find('scene').append($(createGroup(oAttr.id)));
		}
		$('#'+oAttr.id).empty();	// clear the graph
		switch ( oAttr.layout ) {
			case 'cuboid':
				oGraph = cuboidGraph( oGraph, oArg.width, oArg.height, oArg.depth );
				var graph = drawGraph ( oAttr );
				$('#'+oAttr.id).append(graph);
				break;
			case 'forcedirected':
				// make a ForceDirected model in a memory
				oAttr.radius = oAttr.radius ? oAttr.radius : Math.pow((oAttr.width * oAttr.height * oAttr.depth)/2000, 1/3);
				oAttr.fontSize = oAttr.fontSize ? oAttr.fontSize : oAttr.radius;
				oAttr.labeloffset = oAttr.labeloffset ? oAttr.labeloffset : oAttr.radius;
				fdSettings = new ForceDirectedSettings (oAttr.forcedirected);
				$.each(oGraph.node, function( index, node ) { 	
					new ForceDirected( new Vector(Math.random(), Math.random(), Math.random()));
					node.x = 0; node.y = 0; node.z = 0;			
				});
				$.each( oGraph.edge, function( i, e ) {
					var n1_id, n2_id;
					$.each( oGraph.node, function( i, n ) {
						if (n.id == e.source) { n1_id = i; }
						if (n.id == e.target) { n2_id = i; }
					}); 
					if(typeof n1_id != 'undefined' && typeof n2_id != 'undefined') {
						ForceDirected.nodes[n1_id].l.push( n2_id );
					}	
				});		
				// animation time loop
				var intervalId = setInterval(function() 
				{
					ForceDirected.applyForces();
					ForceDirected.updatePosition(fdSettings.timestep);
			
					// calculate kinetic energy of the system
					var E = 0.0;
					ForceDirected.nodes.forEach(function(p){
						var speed = p.v.radius();
						E += speed * speed;;
					});
					fdSettings.maxIterations--;
					// stop simulation when
					if ( E < 0.01 || fdSettings.maxIterations == 0)
					{
						clearInterval(intervalId);
					} 		
					// calc done - draw graph now
					$.each(oGraph.node, function( index, node ) { 
						var p = ForceDirected.nodes[index].p.coordTranslate(oAttr.width, oAttr.height, oAttr.depth, fdSettings.minCoords, fdSettings.maxCoords);
						node.x = p.x;
						node.y = p.y;
						node.z = p.z;
					});		
					$('#'+oAttr.id).empty();
					var graph = drawGraph ( oAttr );
					$('#'+oAttr.id).append(graph);	
					fdSettings.ready = false;			
				}, fdSettings.timetick);
				break;
			default:
				var graph = drawGraph ( oAttr );
				$('#'+oAttr.id).append(graph);
		}
		
	};
	
	$.fn.importX3D = function( oArg ) {
		this.find('scene').append($(addInline( oArg )));
	};
	
	$.fn.scene3d.defaults = {
		width:		"150px",
		height:		"150px",
		background:	"#ffffff",
		backurl:	"",
		bottomurl:	"",
		fronturl:	"",
		lefturl:	"",
		righturl:	"",
		topurl:		"",
		fontSize:	0.8,
		fontFamily:	'SERIF',
		sceneAnimation: false,
		ViewpointOrientation: '0,0,0,1',//"0.1,-0.2,-0.2,-0.1" 
		ViewpointPosition: '0,0,10',
		showStat:	false,
		showLog:	false,
		id:			"x3dElement"		
	};
}( jQuery ));

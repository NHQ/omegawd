this.obj = {}
this.obj._ = require('underscore')
this.obj.dumb = require('../sites/dummy');
this.obj.dumb();
console.log(this.obj.dumb()(3))
delete this.obj
console.log(this.obj)

/*

//////
// We're all used to seeing the following "don't mess with the global scope" setup
///

	var a = 1
	,	b = 2
	,	c = 3;

//////
// try this
///

	this.a = 1;
	this.b = 2;
	this.c = 3;
	this.obj = {};

//////
// What's up with this?
///

	this.obj.a = function(that){
	console.log(that.obj === this)
					 
// Now delete itself here, the following line is uncovinced. It's a scope thing, right, although  
// in the current scope *this* === that.obj. Not a surpise, but thems the scopes mang.

		delete that.obj;
//		delete this

//  	^^^^  You can't delete this scope while all up in this (itself), though doing so will delete it outside of its own scope
		
//		delete this.a; 

//  	^^^^	will delete this.a *within this scope* and outside of it

		console.log(that, this, that.obj, this.a) 
		
// not that.obj is undefined, while this, and this.a, are not, even tho we deleted 

//	the following will restore that.obj
//	that.obj = this;
	};
	
	this.d = this.obj.a; // set this.d for the truth test in this.obj.a

//call the function and pass "this"
	this.obj.a(this)

// but now this.obj is underfined cuz we deleted it
	console.log(this.obj)

*/
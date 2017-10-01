window.onload=function () {

//alert();

var menuItems = document.getElementsByClassName('menu_item');

var dividerNames = [];


for( var i = 0; i < menuItems.length; i++ ){
	menuItems[i].onclick = function() {
		var dividers = document.getElementsByClassName('content_box');
		for(var j = 0; j < dividers.length; j++){
			//~ console.log(dividers [j]);
			dividers[j].style.display="none";
		}
		document.getElementById( this.id.substring(10) ).style.display = "block";
	}
}

/*

var dividers = document.getElementsByClassName('content_box');
for(var j = 0; j < dividers.length; j++){
	dividers[j].style.display="none";
}

*/

document.getElementById('about').style.display = "block";

}

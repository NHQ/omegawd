

$(document).ready(function(){
	$("#fizorm").validate({
	  rules: {
			name:{
				required: true
			},
			quote:{
				required:true
			},
	    link: {
	      required: true,
	      url: true
	    },
			mug: {
				required: false,
				accept: "jpeg|gif|png"
			}
	  },
	messages:{
		mug: ".jpeg, .gif, or .png only",
		name: "",
		quote: "",
		link: ""
	}
	});
	$('#clear').click();
	$('#clear').click(function (){
		$('#elected').addClass('hide')
		$('#running').addClass('hide')
		$('.local_agency').addClass('hide')
		$('.fed_agency').addClass('hide')
	});
	
	$('#is_elected').change(function(){
		if($('#elected').hasClass('hide'))
			$('#elected').removeClass('hide').addClass('pop')
		else{
			$('#elected').addClass('hide').removeClass('pop')
		}
	})
	
	$('#is_running').change(function(){
		if($('#running').hasClass('hide'))
			$('#running').removeClass('hide').addClass('pop')
			
		else{
			$('#running').addClass('hide').removeClass('pop')
		}
	})
	$('#house').change(function(){
		if($('.house').hasClass('hide'))
			$('.house').removeClass('hide').addClass('pop')
		$('.senate').addClass('hide').removeClass('pop')
	})
	$('#senate').change(function(){
		if($('.senate').hasClass('hide'))
			$('.senate').removeClass('hide').addClass('pop')
			$('.house').addClass('hide').removeClass('pop')
	})
	$('#house_run').change(function(){
		if($('.house_run').hasClass('hide'))
			$('.house_run').removeClass('hide').addClass('pop')
		$('.senate_run').addClass('hide').removeClass('pop')
	})
	$('#senate_run').change(function(){
		if($('.senate_run').hasClass('hide'))
			$('.senate_run').removeClass('hide').addClass('pop')
			$('.house_run').addClass('hide').removeClass('pop')
	})
	$('#fed_agent').change(function(){
		if($('.fed_agency').hasClass('hide'))
			$('.fed_agency').removeClass('hide').addClass('pop')
		$('.local_agency').addClass('hide').removeClass('pop')
	})
	$('#local_agent').change(function(){
		if($('.local_agency').hasClass('hide'))
			$('.local_agency').removeClass('hide').addClass('pop')
			$('.fed_agency').addClass('hide').removeClass('pop')
			
	})
})
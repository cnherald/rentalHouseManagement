//$(function () {
//	alert("hello Mike!");
//});

$(function () {

//show tenants table
$('#tenantHrefId').click(function(){
	$.ajax({
		url:"tenant",
		type:'GET',
		dataType:'json',
		success:function(data_json){
		
		}
	
	
	
	});





});


//check in a tenant
	$('#checkinHrefId').click(function(){
		var tenantKey = $(this).data('tenant-key');
		
		$.ajax({
			url:"/checkin?tenant_key=" + tenantKey,
			type:'GET',
			//dataType:'json',
			dataType:'json',
			success:function(resp){
				if (resp.noVacancyResponse){
					alert(resp.noVacancyResponse);
				}else{
					var tenant_data,rooms_data;
					for (var i = 0; i < resp.length; i++) {
						//alert("in for loop!");
						//alert("resp.length:" + resp.length);
						tenant_data = resp[i].tenantProfile;
						rooms_data = resp[i].roomsProfile;
					}
					$('#tenantOrRoomProfile').html(checkinForm(tenantKey,tenant_data,rooms_data)).show();

				}
			}		
		
		});
		return false;
	});

	$('#checkoutHrefId').click(function(){		
		//alert("you click checkout");
		var tenantKey = $(this).data('tenant-key');
		$.ajax({
			url:"checkout?tenant_key=" + tenantKey,
			type:'GET',
			dataType:'json',
			success: function(data_json){
				$('#tenantOrRoomProfile').html(checkoutForm(tenantKey,data_json)).show();
			}
		});
		
			
	
	
	});
	
	//check out a tenant
	$('div.checkout button').click( function (){
		var tenantKey = $(this).data('tenant-key');
		var unpaidrent = $(this).data('tenant-unpaidrent');
		var firstName = $(this).data('tenant-firstname');
		var surname = $(this).data('tenant-surname');

		//var r = confirm("Warnning: Please make sure the rent is clear before checkout!");
		if (unpaidrent > 0 ){
			var r = confirm("Do you want to pay the unpaid rent now?");
			if (r){

				$('#tenantOrRoomProfile').html(payNowForm(tenantKey,firstName,surname)).show();
			}
			
		}else {		
			$.ajax({
				url:"/checkout?tenant_key=" + tenantKey,
				type: 'DELETE',
				success: function(resp) {
				alert(resp.checkoutSuccessNotice);
				window.location.replace("../tenants");				
				}

			});
			return false;		
		}
	
	});
	
	//delete a tenant
	$('#tenantDeletionHrefId').click(function(evt){
	//$('td.deleteTenant button').click(function (evt) {
		var tenantKey = $(this).data('tenant-key');
		alert(tenantKey);
		var r = confirm("Warnning: Do you want to delete this tenant?");
		if (r) {
			$.ajax({
				url: "/tenantDeletion?tenant_key=" + tenantKey,
				type: 'DELETE',
				success: $.proxy(function (resp) {
					if (resp.tenantDeletionSuccessNotice) {
					$(this).parentsUntil('tr').parent().remove();
					alert(resp.tenantDeletionSuccessNotice);
					} else {
					alert(resp.tenanIsNotCheckoutNotice);
					}
				}, this),
				error: $.proxy(function () {
					alert('failed');
				}, this)
			});
			return false;
		}
	});
	
//delete a room	
	$('td.deleteRoom button').click(function(evt){
		var key = $(this).data('room-key');
		var r = confirm("Warnning: Do you really want to delete this room?");
		if (r) {
			$.ajax({
				url:"/roomDeletion?room_key=" + key,
				type: 'DELETE',
				success: $.proxy(function(resp) {
					if (resp.roomDeletionSuccessNotice) {
						$(this).parentsUntil('tr').parent().remove();
					alert(resp.roomDeletionSuccessNotice);
					
					}else {
						alert(resp.roomIsOccupiedNotice);
					}
				}, this),
					
				error: $.proxy(function() {
					alert('The room was not deleted');
				}, this)
			});
			return false;
		}
		
	});
	
	
	$('#room_key').change(function () {		
		var roomKey = $('#room_key').val();
		var url = "roomInfo?room_key=" + roomKey;
		//$('#roomInfo').html(roomKey);
		//console.log(">>>" + url);
		$('#roomInfo').html('<iframe src="' + url + '">');
		return false;
	});
	
	//Get the profile of the room
	//$('#selectRoom').change(function(){
	$('.selectRoomClass select').change(function(){ //use container:"selectRoomClass" instead of id:#selectRoom
		//var roomKey = $('#selectRoom').val();
		var roomKey = $('.selectRoomClass select').val();
		$.ajax({
			//url: 'roomProfileData?room_key=' + roomKey,
			url: 'roomProfileData?room_key=' + roomKey, //get the selected room profile from the server side
			type: 'GET',
			dataType:'json',
			success: function(data_json){
			//alert("room info returned");
				$('#showRoomInfo').html(showRoomProfileForm(roomKey,data_json)).show();
				//$('.showRoomInfoClass span').html(showRoomProfileForm(roomKey,data_json)).show();
			//alert("after showRoomProfileForm method");
			}		
		
		});	
	});
	
		
	//$('#orderRoomForm :checkbox').change(function (evt) {
	//$('#showRoomInfo').on('change','#orderRoomForm :checkbox',function(evt){ //attaching "change" event to dynamic html elements
	$('#showRoomInfo').on('change','#orderRoomForm :radio',function(evt){	//attaching "change" event to dynamic html elements	
		var $this = $(this),
		checked = $this.is(':checked');		
		$this.parent().find('input[type="text"]').attr('disabled', !checked); //works,Tim's version		
		return false;
	});
	
	//reset inputs
	$('#checkInForm input[type = reset]').click(function(evt){
		alert("you reset");
		
		//$('#orderRoomForm .rent-input').attr('disabled', true);
		//$('#orderRoomForm :checkbox').prop('checked', false);
		$('#showRoomInfo').hide();
	
	});
	
	//reset 
	// $('#orderRoomForm input[type=reset]').click(function (evt) {
		// $('#orderRoomForm .rent-input').attr('disabled', true);
	// });
	//submit
	// $('#orderRoomForm').submit(function () {
		// var values = $('#orderRoomForm').serializeArray(),
			// data = {};
		// $.each(values, function (index, item) {
			// if (item.name == 'room_rentSingle' || item.name === 'room_rentDouble') {
				// data.actualRent = item.value;
				// console.log('>>>',data);
			// } else {
				// data[item.name] = item.value;
			// }
		// });
		// var dataStringJson = JSON.stringify(data);
		// $.ajax({
			// url : '/roomInfo',
			// type : 'POST',
			// data : dataStringJson,
			// success: function(resp) {
				// alert(resp.returnText);
			// }
		// });
		// return false;
	// });
		
//register a tenant	
			
		$(".tenantRegisterButton").click(function() {
			
			$('.error').hide();
			var firstName = $("input#firstName").val();
			if(firstName == null || firstName == "") {
				$("label#firstName_error").show();
				$("input#firstName").focus();
				return false;
			}
			
			var surname = $("input#surname").val();
			if(surname == null || surname == "") {
				$("label#surname_error").show();
				$("input#surname").focus();
				return false;
			}
			
			//var tenantGender = $("input#tenant_gender").val();
			
			if ($('input[name=tenant_gender]:checked').length == 0) {
				$("label#tenant_gender_error").show();
				//$("input#tenant_gender").focus();
				return false;
			}
			
			var tenant_age = $("input#tenant_age").val();
			if(tenant_age == null || tenant_age == "") {
				$("label#tenant_age_error").show();
				$("input#tenant_age").focus();
				return false;
			}
			
			var tenant_phoneNumber = $("input#tenant_phoneNumber").val();
			if(tenant_phoneNumber == null || tenant_phoneNumber == "") {
				$("label#tenant_phoneNumber_error").show();
				$("input#tenant_phoneNumber").focus();
				return false;
			}
			
			var contact_name = $("input#contact_name").val();
			if(contact_name ==null || contact_name == "") {
				$("label#contact_name_error").show();
				$("input#contact_name").focus();
				return false;
			}
			
			var contact_phoneNumber = $("input#contact_phoneNumber").val();
			if(contact_phoneNumber == null || contact_phoneNumber == "") {
				$("label#contact_phoneNumber_error").show();
				$("input#contact_phoneNumber").focus();
				return false;
			}
			
			var registerDate = $("input#registerDate").val();
			if(registerDate == null || registerDate == "") {
				$("label#registerDate_error").show();
				$("input#registerDate").focus();
				return false;
			}
		});
		
		$('#tenantRegister').submit(function() {
			var values = $('#tenantRegister').serializeArray(),
				data = {};
			$.each(values, function(index,item){
				if (item.name == 'firstName'){
					data.firstName = item.value;
				} else if (item.name == 'surname') {
					data.surname = item.value;
				} else if (item.name == 'tenant_age') {
					data.age = item.value;
				}else if (item.name == 'tenant_gender') {
					data.gender = item.value;
				} else if (item.name == 'tenant_phoneNumber') {
					data.phoneNumber = item.value;
				} else if (item.name == 'contact_name') {
					data.contactName = item.value;
				} else if (item.name == 'contact_phoneNumber') {
					data.contactPhoneNumber = item.value;
				} else if (item.name == 'register_date') {
					data.registerDate = item.value;
				}
			});
			var dataStringJson = JSON.stringify(data);
			console.log('>>>tenantRegister1',dataStringJson );
			$.ajax({			
				url:'tenantRegister',
				type: 'POST',
				data: dataStringJson,
 
				success: function(resp) {
					alert(resp.tenantRegisterMsg);
					window.location.replace("../tenants");
				 }

			});

			//console.log('>>>tenantRegister2');
			return false;		
		
		});
		

	
	// Register a New Tenant page
	$('#registerTenant').click(function(){
		//alert("you click register");
		$('#tenantOrRoomProfile').html(registerTenantPage()).show();
	
	});
	

	
	// Register a New Room page
	$('#registerRoom').click(function(){
		//alert("you click Room register");
		$('#tenantOrRoomProfile').html(registerRoomPage()).show();
	
	});
	

//register a room
	// $(function() {
		// $('.error').hide();
	// });
		$(".roomRegisterButton").click(function() {
			$('.error').hide();
			var roomNumber = $("input#room_number").val();
			if (roomNumber==null || roomNumber =="") {
				$("label#roomNumber_error").show();
				$("input#room_number").focus();
				return false;
			}
			
			var roomSize = $("input#room_size").val();
			if (roomSize==null || roomSize =="") {
				$("label#roomSize_error").show();
				$("input#room_size").focus();
				return false;
			}
			
			var rentSingle = $("input#room_rent_single").val();
			if (rentSingle==null || rentSingle =="") {
				$("label#rentSingle_error").show();
				$("input#room_rent_single").focus();
				return false;
			}
			
			var rentDouble = $("input#room_rent_double").val();
			if (rentDouble== null || rentDouble =="") {
				$("label#rentDouble_error").show();
				$("input#room_rent_double").focus();
				return false;
			}
		
		});
		//});
		
		$('#roomRegister').submit(function() {
		var values = $('#roomRegister').serializeArray(),
			data = { };
		$.each(values, function(index,item){
			if (item.name == 'room_number'){
				data.roomNumber = item.value;
				//console.log('>>>roomNumber', item.value);
			} else if (item.name == 'room_size') {
				data.roomSize = item.value;
			}else if (item.name == 'room_rent_single') {
				data.rentSingle = item.value;
			} else if (item.name == 'room_rent_double') {
				data.rentDouble = item.value;
			}
		
		});
		var dataStringJson = JSON.stringify(data);
			console.log('>>>roomRegister1',dataStringJson );
		$.ajax({			
			url:'/roomRegister',
			type: 'POST',
			data: dataStringJson,

			success: function(resp) {
				alert(resp.roomRegisterMsg);
				//window.location.replace("http://localhost:8080/rooms");
				window.location.replace("../rooms");
			}
		});

		console.log('>>>roomRegister2');
		return false;
	
	});
//check in	
	//checkin form validation
	//$(function() {
		$('.error').hide();
		$(".submitButton").click(function(){
		//alert("you click checkin");
			$('.error').hide();
			var startDate = $("input#tenant_startDate").val();
			if (startDate == ""){
				$("label#startDate_error").show();
				$("input#tenant_startDate").focus();
				return false;
			}
		});
	//});
		//console.trace();
	$('#checkInForm').submit(function() {
	
		//console.trace();
	//$('#submitButton').click(function() {
		//$('#submit_btn').attr('disabled', true);
		//console.log('>>>Here is SerializeArray');
		//debugger;
		//console.debug("debug");
 		var values = $('#checkInForm').serializeArray(),
			data = { };
		var valuesOrderRoomForm = $('#orderRoomForm').serializeArray();
			console.log('>>>values',values);
		$.each(values, function(index, item) {
			if (item.name == 'tenant_key'){
				data.tenantKey = item.value;
			}
			// if (item.name == 'tenant_room_key') {
				// data.roomKey = item.value;
			// }
			if (item.name == 'tenant_startDate') {
					data.startDate = item.value;
			}
			if (item.name == 'tenant_payPeriod') {
				data.payPeriod = item.value;
			}
		}); 
		var value = $('.selectRoomClass select').val();
		if(value == "title"){
			alert('please select a room first');
		}else if (!$('#singleRentRadioId').prop('checked')&& !$('#doubleRentRadioId').prop('checked')){
			alert('you did not tick the box');
		} else{
			//alert('Yes, you tick the box');
			$.each(valuesOrderRoomForm, function (index, item) {
		
				if (item.name == 'room_rentSingle' || item.name === 'room_rentDouble') {
				
					data.actualRent = item.value;
					//console.log('>>>',data);
				}else {			
					data[item.name] = item.value;
				}
			});
		
			console.log('>>>data',data);
			var dataStringJson = JSON.stringify(data);
			console.log('>>>ajax starts');
			var r = confirm("Do u really want to check in this room?");
			if(r) {
			$.ajax({
				url: '/checkin',
				type: 'POST',
				data: dataStringJson,
				success: function(resp) {				
					alert(resp.checkinSuccessMessage);
					window.location.replace("../tenants");
				} 
			});					
			return false;
			}
		}
		return false;
	});


	//New toggling the room profile
	$('td.roomNumberClass a').toggle(function() {
		var roomKey = $(this).data('room-key');
		var tenantState =$(this).data('tenant-state');
		$.ajax({
			url:"roomProfileData?room_key="+roomKey,
			type:'GET',
			dataType:'json',
			success: function(data_json){
				if(tenantState == "pending") { 
						$('#pendingTenantProfile').html(roomProfileTable(data_json)).show();				
				} else if (tenantState == "cleared") {
						$('#clearedTenantProfile').html(roomProfileTable(data_json)).show();
				} else {
						$('#tenantOrRoomProfile').html(roomProfileTable(data_json)).show();						
				} 							
			
			}
		});
	
	}, function(){
			$('#pendingTenantProfile').hide();
			$('#clearedTenantProfile').hide();
			$('#tenantOrRoomProfile').hide();
			return false;
	});
	
	
	
	//toggling the tenant's payment history
	$('td.paymentHistoryClass a').toggle(function() { 
		var tenantKey = $(this).data('tenant-key');
		var tenantState =$(this).data('tenant-state');
		$.ajax({
			url:"paymentHistory?tenant_key=" + tenantKey,
			type:'GET',
			dataType:'json',// this is important in order to secure the returned data type!!
			success: function(data_json){
				if(tenantState == "pending") { 
						$('#pendingTenantProfile').html(paymentHistoryTable(data_json)).show();
						//$('#pendingTenantProfile').html(jqTable).show();					
				} else if (tenantState == "cleared") {
						$('#clearedTenantProfile').html(paymentHistoryTable(data_json)).show();
			
				}
			}				
		});	
	},function() {
		$('#pendingTenantProfile').hide();
		$('#clearedTenantProfile').hide();
		return false;
	});
	
	//toggling the tenant'profile 
	// $('td.tenantProfileClass a').toggle(function() { 
		// var tenantKey = $(this).data('tenant-key');
		// var tenantState = $(this).data('tenant-state');
		// $.ajax({
			// url:"tenantProfile?tenant_key=" + tenantKey,
			// type:'GET',
			// success: function(html) {
				// if(tenantState == "pending") { 
						// $('#pendingTenantProfile').html($(html).find('table')).show();
					
				// } else if (tenantState == "cleared") {
						// $('#clearedTenantProfile').html($(html).find('table')).show();				
				// } else {
						// $('#tenantOrRoomProfile').html($(html).find('table')).show();				
				// } 
			// }				
		// });	
	// },function() {
		// $('#pendingTenantProfile').hide();
		// $('#clearedTenantProfile').hide();
		// $('#tenantOrRoomProfile').hide();
		// return false;
	// });
	
	//new toggling the tenant'profile
	$('td.tenantProfileClass a').toggle(function() { 
		var tenantKey = $(this).data('tenant-key');
		var tenantState = $(this).data('tenant-state');
		$.ajax({
			url:"tenantProfileData?tenant_key=" + tenantKey,
			type:'GET',
			dataType:'json',// this is important in order to secure the returned data type!!
			success: function(data_json){
				if(tenantState == "pending") { 
						$('#pendingTenantProfile').html(tenantInfoTable(data_json)).show();
						//$('#pendingTenantProfile').html(jqTable).show();					
				} else if (tenantState == "cleared") {
						//$('#clearedTenantProfile').html(jqTable).show();
						$('#clearedTenantProfile').html(tenantInfoTable(data_json)).show();
				} else {
						//$('#tenantOrRoomProfile').html(jqTable).show();
						$('#tenantOrRoomProfile').html(tenantInfoTable(data_json)).show();						
				} 							
		}
		});
		},function(){
			$('#pendingTenantProfile').hide();
			$('#clearedTenantProfile').hide();
			$('#tenantOrRoomProfile').hide();
			return false;
		});
		
	//toggling Tenant's Activities Table
	//$('#activityHrefId').toggle(function(){
	$('td.tenantActivityClass a').toggle(function() {
	//$('#tenantOrRoomProfile').on('toggle','#tenantActivityHrefId',function(evt){
	//$('#tenantActivityHrefId').toggle(function(){
		var tenantKey = $(this).data('tenant-key');
		alert("you click activity");
		$.ajax({
			url:"showActivity?tenant_key=" + tenantKey,
			type: 'GET',
			dataType: 'json',
			success: function(data_json){
				$('#showTenantActivities').html(tenantActivityTable(data_json)).show();
			}					
		});
	
	},function(){
			$('#showTenantActivities').hide();
			return false;
	});
		
		
	//toggling tenant history
	$('#tenantHistoryHrefId').toggle(function(){
		$.ajax({
			url:"tenantHistory",
			type:'GET',
			dataType:'json',// this is important in order to secure the returned data type!!
			success: function(data_json){
				$('#tenantOrRoomProfile').html(tenantHistoryTable(data_json)).show();		
			}
		});		
	},function(){
			$('#tenantOrRoomProfile').hide();
			return false;
	});	
	
	//toggling the tenant'profile Editor
	// $('td.tenantNameEditorClass a').toggle(function() { 
		// var tenantKey = $(this).data('tenant-key');		
		// $.ajax({
			// url:"tenantProfileEditor?tenant_key=" + tenantKey,
			// type:'GET',
			// success: function(html) {													
					// $('#tenantOrRoomProfile').html(html).show();								
			// }				
		// });
	
	// },function() {
		// $('#tenantOrRoomProfile').hide();
		
		// return false;
	// });
	
	//New toggling the tenant'profile Editor
	$('td.tenantNameEditorClass a').toggle(function(){
		var tenantKey = $(this).data('tenant-key');
		$.ajax({
			url:"tenantProfileData?tenant_key=" + tenantKey,
			type:'GET',
			dataType:'json',
			success: function(data_json){
				$('#tenantOrRoomProfile').html(tenantProfileEditorTable(tenantKey,data_json)).show();
			}
		});
	
	},function(){
			$('#tenantOrRoomProfile').hide();
			return false;
	});
	
	
	
	//New toggling the room'profile Editor
	$('td.roomNumberEditorClass a').toggle(function() {
		var roomKey = $(this).data('room-key');
		$.ajax({
			url:"roomProfileData?room_key=" + roomKey,
			type:'GET',
			dataType:'json',
			success: function(data_json){
				$('#tenantOrRoomProfile').html(roomProfileEditorTable(roomKey,data_json)).show();
			}
		});
	
	
	},function(){
			$('#tenantOrRoomProfile').hide();
			return false;
	});

	

	
	
	
	
	
	//$('td.payNow a').click(function(evt) {
	//$('#payNowHrefId').click(function(evt) {
	$('#payNowHrefId').bind("click", (function() {
	//alert("it workssss");
	
	//$('td.deleteTenant button').click(function (evt) {
		var tenantKey = $(this).data('tenant-key');
		var firstName = $(this).data('tenant-firstname');
		var surname = $(this).data('tenant-surname');
		$('#pendingTenantProfile').html(payNowForm(tenantKey,firstName,surname)).show();
		// $.ajax({
			// url:"paynow?tenant_key=" + tenantKey,
			// type:'GET',
			// dataType:'json',
			////success: function(html) {
				////$('#pendingTenantProfile').append(html);//works						
			////}						
			// success: function(data_json){
				// alert("it is here");
				// $('#pendingTenantProfile').html(payNowForm(tenantKey,firstName,surname,data_json)).show();
			// }
		// });
		// return false;
	}));

	//validate payNow form
	$('.error').hide();
	$(".payNowSubmitButton").click(function(){
	//alert("you click payNow");
		$('.error').hide();
		var payAmount = $("input#pay_Amount").val();
		if (payAmount == ""){
			$("label#payAmount_error").show();
			$("input#pay_Amount").focus();
			return false;
		}
		
		var payDate = $("input#pay_Date").val();
		if(payDate == ""){
			$("label#payDate_error").show();
			$("input#pay_Date").show();
		
			return false;
		}
	});
	
	
	
	$('#payNowForm').submit(function(){
	//$('#payNowSubmit_btn').click(function() {
	//$('payNowName').submit(function() {
		//$('#payNowSubmit_btn').attr('disabled', true);
		var values = $('#payNowForm').serializeArray(),
		
		data = {};
		$.each(values, function(index, item) {
			data[item.name] = item.value;
		}); 
		var dataStringJson = JSON.stringify(data);
		$.ajax({
			url:'/paynow',
			type:'POST',
			data: dataStringJson,
			success:function(resp){
				alert(resp.payNowSuccessNotice);
				window.location.replace("../");				
			}
		});				
		return false;
	});	

	// $('td.editClass a').click(function(){
		// alert("edit me");	
		// return false;		
	// });
	

	

//CSS style
	//tenant profile hover description
	$('.tenantProfileClass').mousemove(function(e) {
		var hovertext = $(this).attr('hovertext');
		$('#tenantHoverDiv').text(hovertext).show();
		$('#tenantHoverDiv').css('top', e.clientY+10).css('left',e.clientX+10);	
	}).mouseout(function(){ 
		$('#tenantHoverDiv').hide();
	});	
	
	//tenant profile Editor hover description
	$('.tenantNameEditorClass').mousemove(function(e) {
		var hovertext = $(this).attr('hovertext');
		$('#tenantHoverDiv').text(hovertext).show();
		$('#tenantHoverDiv').css('top', e.clientY+10).css('left',e.clientX+10);	
	}).mouseout(function(){ 
		$('#tenantHoverDiv').hide();
	});	
	

	
	//tenant activities hover description
	$('.tenantActivityClass').mousemove(function(e){
		var hovertext = $(this).attr('hovertext');
		$('#tenantActivityHoverDiv').text(hovertext).show();
		$('#tenantActivityHoverDiv').css('top',e.clientY+10).css('left',e.clientX+10);
	}).mouseout(function(){
		$('#tenantActivityHoverDiv').hide();	
	});
	
	//room profile hover description
	$('.roomNumberClass').mousemove(function(e) {
		var hovertext = $(this).attr('hovertext');
		$('#roomHoverDiv').text(hovertext).show();
		$('#roomHoverDiv').css('top', e.clientY+10).css('left',e.clientX+10);	
	}).mouseout(function(){ 
		$('#roomHoverDiv').hide();
	});
	
	//room profile Editor hover description
	$('.roomNumberEditorClass').mousemove(function(e) {
		var hovertext = $(this).attr('hovertext');
		$('#roomHoverDiv').text(hovertext).show();
		$('#roomHoverDiv').css('top', e.clientY+10).css('left',e.clientX+10);	
	}).mouseout(function(){ 
		$('#roomHoverDiv').hide();
	});	
	
	//payment history hover description
	$('.paymentHistoryClass').mousemove(function(e) { 
		var hovertext = $(this).attr('hovertext');
		$('#paymentHistoryHoverDiv').text(hovertext).show();
		$('#paymentHistoryHoverDiv').css('top', e.clientY+10).css('left',e.clientX+10);
	
	}).mouseout(function(){ 
		$('#paymentHistoryHoverDiv').hide();
	});
	
	/**
	 * @param [{"name": "Joe", "age": 36}, {"name": "Nick", "age": 12}]
	 */
	function tenantInfoTable(data_json) {		
		//alert("data para:" + data_json);//why display "[obj Object]"?
		var jqTable = $('<table><thead><tr><th>First Name</th><th>Surname</th><th>Gender</th><th>Age</th><th>Phone Number</th><th>Email</th><th>Contact Name</th><th>Contact Phone Number</th><th>Register Date</th></tr></thead><tbody></tbody></table>');
		var jqBody = jqTable.find('tbody');	

		// for (var i = 0; i < data_json.length; i++) {		
			// jqBody.append('<tr><td>' + data_json[i].firstName + '</td><td>' + data_json[i].surname + '</td></tr>');
		// }
				
		$.each(data_json,function(item){
			jqBody.append(
			'<tr><td>' + data_json[item].firstName
			+ '</td><td>' + data_json[item].surname 
			+ '</td><td>' + data_json[item].gender 
			+ '</td><td>'+ data_json[item].age 
			+ '</td><td>' + data_json[item].phoneNumber 
			+ '</td><td>' + data_json[item].email 
			+ '</td><td>' + data_json[item].contactName 
			+'</td><td>' + data_json[item].contactPhoneNumber 
			+ '</td><td>' + data_json[item].registerDate 
			+ '</td></tr>'
			);
		});		
		//$('body').append(jqTable);
		return jqTable;
	}
	
	
	
	
	function tenantProfileEditorTable(tenantKey,data_json) {
		var jqTable = $('<form id="tenantProfileForm" onsubmit="return false;"><table><thead><tr><th>First Name</th><th>Surname</th><th>Gender</th><th>Age</th><th>Phone Number</th><th>Email</th><th>Contact Name</th><th>Contact Phone Number</th><th>Register Date</th><th>Edit</th></tr></thead><tbody></tbody></table></form>');
		var jqBody = jqTable.find('tbody');	
		$.each(data_json,function(item){			
			jqBody.append(
				'<tr><input type="hidden" name="tenant_key" value=' +tenantKey + '>'
				+ '<td><input type="text" readonly="readonly" name="firstName" value=' + data_json[item].firstName 
				+ '></td><td><input type="text" readonly="readonly" name="surname" value=' + data_json[item].surname 
				+ '></td><td><input type="text" readonly="readonly" name="gender" value=' + data_json[item].gender 
				+ '></td><td><input type="text" readonly="readonly" name="age" value='+ data_json[item].age
				+ '></td><td><input type="text" readonly="readonly" name="phoneNumber" value=' + data_json[item].phoneNumber 
				+ '></td><td><input type="text" readonly="readonly" name="email" value=' + data_json[item].email 
				+ '></td><td><input type="text" readonly="readonly" name="contactName" value=' + data_json[item].contactName 
				+ '></td><td><input type="text" readonly="readonly" name="contactPhoneNumber" value=' + data_json[item].contactPhoneNumber 
				+ '></td><td>' + data_json[item].registerDate 
				+ '</td><td class="tenantEditClass" hovertext="click to Edit">'
				+ '<div id="tenantProfileEditorHover"></div>'
				+ '<input type="submit" id="tenantEdit" value="Edit">' 
				+ '</td></tr>'
			);			
		});
		$('body').append(jqTable);
		$('body').append('<script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.7.0/jquery.min.js"></script>');
		$('body').append('<script type="text/javascript" src="/scripts/app1.js"></script>');
		return jqTable;
	}
	
	function roomProfileTable(data_json) {		
		//alert("data para:" + data_json);//why display "[obj Object]"?
		var jqTable = $('<table><thead><tr><th>Number</th><th>Size</th><th>Single Rent</th><th>Double Rent</th><th>Actual Rent</th></tr></thead><tbody></tbody></table>');
		var jqBody = jqTable.find('tbody');	

		// for (var i = 0; i < data_json.length; i++) {		
			// jqBody.append('<tr><td>' + data_json[i].firstName + '</td><td>' + data_json[i].surname + '</td></tr>');
		// }
				
		$.each(data_json,function(item){
			jqBody.append(
			'<tr><td>' + data_json[item].roomNumber
			+ '</td><td>' + data_json[item].size 
			+ '</td><td>' + data_json[item].rentSingle 
			+ '</td><td>'+ data_json[item].rentDouble
			+ '</td><td>' + data_json[item].rentActual 
			+ '</td></tr>'
			);
		});		
		//$('body').append(jqTable);
		return jqTable;
	}
	
	
	
	function roomProfileEditorTable(roomKey,data_json) {
		var jqTable = $('<form id="roomProfileForm" onsubmit="return false;"><table><thead><tr><th>Number</th><th>Size</th><th>Single Rent</th><th>Double Rent</th><th>Actual Rent</th><th>Edit</th><tr></thead><tbody></tbody></table></form>');
		var jqBody = jqTable.find('tbody');
		$.each(data_json,function(item){
			jqBody.append(
				'<tr><input type="hidden" name="room_key" value=' + roomKey 
				+ '><td><input type="text" readonly="readonly" name="number" value=' + data_json[item].roomNumber
				+ '></td><td><input type="text" readonly="readonly" name="size" value=' + data_json[item].size
				+ '></td><td><input type="text" readonly="readonly" name="rentSingle" value=' + data_json[item].rentSingle
				+ '></td><td><input type="text" readonly="readonly" name="rentDouble" value=' + data_json[item].rentDouble
				+ '></td><td><input type="text" readonly="readonly" name="rentActual" value=' + data_json[item].rentActual
				+ '></td><td class = "roomEditClass" hovertext = "Click to Edit">'
				+ '<div id = "roomProfileEditorHover"></div>'
				+ '<input type = "submit" id = "roomEdit" value = "Edit">'												
				+ '</td></tr>'
			);
		});
		$('body').append(jqTable);
		//$('body').append('<script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.7.0/jquery.min.js"></script>');
		$('body').append('<script type="text/javascript" src="/scripts/app1.js"></script>');
		return jqTable;
		
	}

	function registerTenantPage(){
		var jqForm = $('<form id="tenantRegister" onsubmit="return false;">'
		+ '<div>'
		+ '<label for="firstName">First Name: </label>'
		+ '<input id="firstName" type="text" name="firstName">'
		+ '<label class="error" for="firstName" id="firstName_error">This field is required.</label>'
		+ '</div>'
		
		+ '<div>'
		+ '<label for="surname">Surname:</label>'
		+ '<input id="surname" type="test" name="surname">'
		+ '<label class="error" for="surname" id="surname_error">This field is required.</label>'
		+ '</div>'
		
		+ '<div>'
		+ '<label for="tenant_gender_male">Gender: </label>'
		+ '<input id="tenant_gender_male" type="radio" value="male" name="tenant_gender">'							
		+ '<label for="tenant_gender_male">Male</label>'
		+ '<input id="tenant_gender_female" type="radio" value="female" name="tenant_gender">'
		+ '<label for="tenant_gender_female">Female</label></br>'
		+ '<label class="error" for="tenant_gender" id="tenant_gender_error"> Please select a gender.</label>'						
		+ '</div>'
		
		+ '<div>'
		+ '<label for="tenant_age">Age:</label>'
		+ '<input id="tenant_age" type="number" name="tenant_age" min="1" max="100">'
		+ '<label class="error" for="tenant_age" id="tenant_age_error">This field is required.</label>'
		+ '</div>'
		
		+ '<div>'
		+ '<label for="tenant_phoneNumber">Phone Number:</label>'
		+ '<input id="tenant_phoneNumber" type="text" name="tenant_phoneNumber">'
		+ '<label class="error" for="tenant_phoneNumber" id="tenant_phoneNumber_error">This field is required.</label>'
		+ '</div>'
		
		+ '<div>'
		+ '<label> Emergency Contact:</label>'
		+ '<input id="contact_name" type="text" name="contact_name" />'
		+ '<label class="error" for="contact_name" id="contact_name_error">This field is required.</label>'
		+ '</div>'
		
		+ '<div>'
		+ '<label> Emergency Contact PhoneNumber:</label>'
		+ '<input id="contact_phoneNumber" type="text" name="contact_phoneNumber" />'
		+ '<label class="error" for="contact_phoneNumber" id="contact_phoneNumber_error">This field is required.</label>'
		+ '</div>'
		
		+ '<div>'
		+ '<label for="registerDate">Register Date:</label>'
		+ '<input id="registerDate" type="date" name="register_date" placeholder="Year-Month-Day">'
		+ '<label class="error" for="registerDate" id="registerDate_error">This field is required.</label>'
		+ '</div>'	
		
		+ '<div>'						
		+ '<input type="submit" name="submit" class="tenantRegisterButton" id="tenantRegister_btn" value="Submit" />'
		+ '<input type="reset" value="Reset" /></br>'
		+ '</div>'

		+ '</form>');
		$('body').append(jqForm);
		//$('body').append('<script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.7.0/jquery.min.js"></script>');
		$('body').append('<script type="text/javascript" src="/scripts/app.js"></script>');
		return jqForm;
	}
	
	function registerRoomPage(){
		var jqForm = $('<form id="roomRegister" onsubmit="return false;">'
		+ '<div>'
		+ '<div>'
		+ '<label for="room_number">Number:</label>'
		+ '<input id="room_number" type="text" name="room_number"/>'
		+ '<label class="error" for="room_number" id="roomNumber_error">This field is required.</label>'
		+ '</div>'
		+ '<div>'
		+ '<label for="room_size">Size:</label>'
		+ '<input id="room_size" type="number" name="room_size"/>'
		+ '<label class="error" for="room_size" id="roomSize_error">This field is required.</label>'
		+ '</div>'
		+ '<div>'
		+ '<label for="room_rent_single">Rent_Single:</label>'
		+ '<input id="room_rent_single" type="number" name="room_rent_single"/>'
		+ '<label class="error" for="room_rent_single" id="rentSingle_error">This field is required.</label>'
		+ '</div>'
		+ '<div>'
		+ '<label for="room_rent_double">Rent_Double:</label>'
		+ '<input id="room_rent_double" type="number" name="room_rent_double"/>'
		+ '<label class="error" for="room_rent_double" id="rentDouble_error">This field is required.</label>'
		+ '</div>'
	
		+ '</div>'		
		+ '<div>'		
		+ '<input type="submit" name="submit" class="roomRegisterButton" id="roomRegister_btn" value="Submit" />'
		+ '<input type="reset" value="Reset"/>'
		+ '</br>'
		+ '<a href="/">Main Page</a>'
		+ '</div>'
		+ '</form>');
		$('body').append(jqForm);
		//$('body').append('<script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.7.0/jquery.min.js"></script>');
		$('body').append('<script type="text/javascript" src="/scripts/app.js"></script>');
		return jqForm;
			
	}
	
	function tenantActivityTable(data_json){
		var jqTable = $('<label>Tenant Activities</label><table><thead><tr><th>Activity Number</th><th>Activity Name</th><th>Activity Date and Time</th></tr></thead><tbody></tbody></table>');
		var jqBody = jqTable.find('tbody');	
				
		$.each(data_json,function(item){
			jqBody.append('<tr><td>' 
			+ data_json[item].activityNumber 
			+ '</td><td>' + data_json[item].activityName 
			+ '</td><td>' + data_json[item].activityDate 
			+ '</td></tr>'
			);
		});		
		return jqTable;
	
	}
	
	function showRoomProfileForm(roomKey,data_json){
		var jqForm = $('<form id="orderRoomForm" onsubmit="return false;"></form>');
		$.each(data_json,function(item){
			jqForm.append(
				'<div>'
				+ '<input type="hidden" name="room_key" value=' + roomKey + ' />'
				+ '</div>'
				// + '<div>'
				// + '<p>Number:' + data_json[item].roomNumber +'</p>'
				// + '</div>'
				+ '<div>'
				+ '<p>Size:'+ data_json[item].size +'</p>'
				+ '</div>'
				+ '<div>'
				// '<input type="checkbox" id = "singleRentCheckBoxId" labelledby="singleRentLable" />'
				+ '<input type = "radio" id = "singleRentRadioId" name = "rent">'
				+ '<label id="singleRentLabel">Single Rent:</label>'						
				+ '<input  type="text" name="room_rentSingle" id="singleRentID" class="rent-input" value=' + data_json[item].rentSingle + ' disabled/>'
				+ '</div>'								
				+ '<div>'							
				//+ '<input type="checkbox" id = "doubleRentCheckBoxId" labelledby="doubleRentLabel" />'
				+ '<input type = "radio" id = "doubleRentRadioId" name = "rent">'
				+ '<label id="doubleRentLabel">Double Rent:</label>'
				+ '<input type="text" name="room_rentDouble" id="doubleRent" class="rent-input" value=' + data_json[item].rentSingle + ' disabled/>'
				+ '</div>'
				//+ '<div>'
				//+ '<input type="submit" value="Order this Room" />'
				//+ '<input type="reset" value="Reset the Order" />'
				//+ '</div>'
			
			
			);
		
		});
		$('body').append(jqForm);
		//$('body').append('<script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.7.0/jquery.min.js"></script>');
		//$('body').append('<script type="text/javascript" src="/scripts/app.js"></script>');
		return jqForm;
	}

	
	function checkinForm(tenantKey,tenant_data,rooms_data){		
		var roomNumberOptions = new Array();
		roomNumberOptions.push('<option value = "title"> Rooms </option>');
		$.each(rooms_data, function(item){
			roomNumberOptions.push('<option value="'+ rooms_data[item].roomKey + '">' + rooms_data[item].roomNumber + '</option>');
		});
		
		var payPeriodOptions = new Array();
		for (var i = 1; i < 13; i++) {		
			payPeriodOptions.push('<option value=' + i +'>' + i + "week" + '</option>');
		}
		
		var jqForm = $('<form id="checkInForm"></form>');
		$.each(tenant_data, function(item){
				jqForm.append(
					'<div>'
					+ '<label> Tenant Name: </label>'
					+ '<label>' + tenant_data[item].firstName + tenant_data[item].surname + '</label>'
					+ '<input type="hidden" name="tenant_key" value=' + tenantKey + ' />'
					+ '</div>'
					
					+ '<label>Please Select a Room:</label>'
					+ '<div  class="selectRoomClass" >'
					//+ '<div id="selectRoomDiv">'
					+ '<select id="selectRoom">'					
					+ '</select>'
					+ '</div>'
					//+ '</div>'
					//+ '<div class = "showRoomInfoClass">'
					//+ '<span id="showRoomInfo"></span>'
					//+ '<div>'
					+ '<span id="showRoomInfo"></span>'
					+ '<div>'
					+ '<label for="tenant_startDate">StartDate:</label>'
					+ '<input id="tenant_startDate" type="date" name="tenant_startDate" placeholder="Year-Month-Day">'
					+ '<label class="error" for="tenant_startDate" id="startDate_error">This field is required.</label>'
					+ '</div>'
					
					+ '<div>'
					+ '<label for="tenant_payPeriod">PayPeriod:</label>'
					+ '</div>'
					+ '<div class = "selectPayPeriodClass">'
					+ '<select id="tenant_payPeriod" name="tenant_payPeriod">'
					+ '</select>'
					+ '</div>'	
					
					+ '<div>'
					+ '<input type="submit" name="submit" class="submitButton" id="submit_btn" value="Check In" >'
					+ '<input type="reset" value="Reset" >'
					+ '</div>'
					
				);

		});
		var selectRoomTag = jqForm.find('.selectRoomClass select');			
		selectRoomTag.html(roomNumberOptions.join(''));

		
		var selectPayPeriodTag = jqForm.find('.selectPayPeriodClass select');
		selectPayPeriodTag.html(payPeriodOptions.join(''));
		
		$('body').append(jqForm);
		//$('body').append('<script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.7.0/jquery.min.js"></script>');
		$('body').append('<script type="text/javascript" src="/scripts/app.js"></script>');		
		return jqForm;
	}
	
	
	
	
	
	
	//function payNowForm(tenantKey,tenant_data){
	function payNowForm(tenantKey,firstName,surname) {
		
		var jqForm = $('<form id="payNowForm" onsubmit="return false;"></form>');
		//$.each(tenant_data,function(item){
			jqForm.append(
				
				'<div>'
				+ '<label> Pay Now Form for: </label>'
				+ '<label>' + firstName + '_' + surname + '</label>'
				+ '<input type="hidden" name="tenant_key" value=' + tenantKey + ' />'
				+ '</div>'
				
				+ '<div>'
				+ '<label for="payAmount">Paid Amount: </label>'
				+ '<input id="pay_Amount" type="number" name="payAmount" />'
				+ '<label class="error" for="payAmount" id="payAmount_error">Please type in the amount you want to pay.</label>'
				+ '</div>'
				
				+ '<div>'
				+ '<label for="payDate">Pay Date: </label>'
				+ '<input id="pay_Date" type="date" name="payDate" placeholder="Year-Month-Day"/>'
				+ '<label class="error" for="payDate" id="payDate_error">This field is required.</label>'
				+ '</div>'
	
				+ '<div>'		
				+ '<input type="submit" name="payNowName" class="payNowSubmitButton" id="payNowSubmit_btn" value="Submit"/>'
				+ '<input type="reset" value="Reset"/>'
				+ '</br>'
				//+ '<a href="/">Main Page</a>'
				+ '</div>'
				);
		//});
		$('body').append(jqForm);
		//$('body').append('<script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.7.0/jquery.min.js"></script>');
		$('body').append('<script type="text/javascript" src="/scripts/app.js"></script>');
		return jqForm;
	}
	
	
	//check out form
	function checkoutForm(tenantKey,data_json){
		var jqForm = $('<div></div>');
		$.each(data_json, function(item){
			jqForm.append(
				'<div><label>Check out</label>'
				+ '<div><label for="tenant_name">Tenant Name: </label>'
				+  data_json[item].firstName   +  data_json[item].surname  
				+ '<input type="hidden" name="tenant_key" value='
				+  tenantKey
				+ '/></div>'
				+ '<div><label for="tenant_roomNumber">Room Number: </label>'
				+ data_json[item].roomNumber
				+ '</div>'
				+ '<div><label for="tenant_startDate">Start Date: </label>'
				+ data_json[item].startDate
				+ '</div>'
				+ '<div><label for="tenant_livingPeriod">Living Period: </label>'
				+ data_json[item].livingPeriod
				+ '</div>'
				+ '<div><label for="tenant_rent">Rent: </label>'
				+ data_json[item].rent
				+ '</div>'
				+ '<div><label for="tenant_rentRate">Rent Rate: </label>'
				+ data_json[item].rentRate
				+ '</div>'
				+ '<div><label for="tenant_rentPaid">Total Paid Rent: </label>'
				+ data_json[item].totalPaidRent
					
				+ '</div>'
				+ '<div><label for="tenant_unpaidDays">Unpaid Days: </label>'
				+ data_json[item].unpaidDays
				+ '</div>'
				+ '<div><label for="tenant_rentUnpaid">Unpaid Rent: </label>'
				+ data_json[item].unpaidRent
				+ '</div>'
				//+ '<div><a href="/paynow">Pay Now</a></div>'
				// + '<div class=payNowClass>'
				// + '<a id = "payNowHrefId" href="#" data-tenant-key='
				// + tenantKey + ' data-tenant-firstname='
				// + data_json[item].firstName + ' data-tenant-surname='
				// + data_json[item].surname + ' >Pay Now</a>'
				// + '<div>'
				+ '<div class="checkout"><button data-tenant-key='
				+ tenantKey + ' data-tenant-unpaidrent='
				+ data_json[item].unpaidRent + ' data-tenant-firstname='
				+ data_json[item].firstName + ' data-tenant-surname='
				+ data_json[item].surname
				+ '>Check Out</button></br>'
				+ '</div>'
				+ '<div id="checkoutPayNowId"></div>'
		
		);
		
		
		});
		$('body').append(jqForm);
		//$('body').append('<script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.7.0/jquery.min.js"></script>');
		$('body').append('<script type="text/javascript" src="/scripts/app.js"></script>');
		return jqForm;
	
	
	}
	
	
	
	
	function paymentHistoryTable(data_json){
		var jqTable = $('<label>Payment History</label><table><thead><tr><th>Payment Number</th><th>Pay Date</th><th>Pay Amount</th></tr></thead><tbody></tbody></table>');
		var jqBody = jqTable.find('tbody');	
		$.each(data_json,function(item){
			
			if (data_json[item].totalPaidRent){
				jqBody.append(
				'<tr><td>Total Paid Rent</td><td></td><td>'
				+ data_json[item].totalPaidRent
				+ '</td></tr>'
				);
			}else {
				jqBody.append('<tr><td>' 
					+ data_json[item].paymentNumber 
					+ '</td><td>' + data_json[item].payDate 
					+ '</td><td>' + data_json[item].paidAmount 
					+ '</td></tr>'
				);
			
			}
		});	

		return jqTable;		
	}
	
	
	function tenantHistoryTable(data_json){
		var jqTable = $('<label>Tenant History</label><table><thead><tr><th>Tenant Number</th><th>Tenant name</th><th>Gender</th><th>Age</th><th>Phone Number</th><th>Contact Name</th><th>Contact Number</th><th>Email</th><th>Room Number</th><th>Rent</th><th>Checkin Date</th><th>Checkout Date</th><th>Total Paid Rent</th></tr></thead><tbody></tbody></table>');
		var jqBody = jqTable.find('tbody');	
		$.each(data_json,function(item){
			jqBody.append('<tr><td>' 
				+ data_json[item].tenantNumber 
				+ '</td><td class = "tenantActivityClass" hovertext = "Click to show activities of ' + data_json[item].firstName + "_" + data_json[item].surname 
				+ '">'
				+ '<div id = "tenantActivityHoverDiv"></div>'
				+ '<a id="tenantActivityHrefId" href="#" data-tenant-key =' + data_json[item].tenantKey 
				+ '>' + data_json[item].firstName + "_" + data_json[item].surname
				+ '</a></td><td>' + data_json[item].gender
				+ '</td><td>' + data_json[item].age
				+ '</td><td>' + data_json[item].phoneNumber
				+ '</td><td>' + data_json[item].contactName
				+ '</td><td>' + data_json[item].contactPhoneNumber
				+ '</td><td>' + data_json[item].email
				+ '</td><td>' + data_json[item].roomNumber
				+ '</td><td>' + data_json[item].rent
				+ '</td><td>' + data_json[item].startDate
				+ '</td><td>' + data_json[item].checkoutDate
				+ '</td><td>' + data_json[item].totalPaidRent
				+ '</td></tr>'
			);				
		});	
		$('body').append(jqTable);
	    //$('body').append('<script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.7.0/jquery.min.js"></script>');
		$('body').append('<script type="text/javascript" src="/scripts/app.js"></script>');
		return jqTable;		
	}
	
	
	
	
	
	
	
});
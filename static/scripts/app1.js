	// tenant profile editor hover description2
	$('.tenantEditClass').mousemove(function(e) { 
		var hovertext = $(this).attr('hovertext');
		$('#tenantProfileEditorHover').text(hovertext).show();
		$('#tenantProfileEditorHover').css('top', e.clientY+10).css('left',e.clientX+10);
	
	}).mouseout(function(){ 
		$('#tenantProfileEditorHover').hide();
	});
	
	// room profile editor hover description
		$('.roomEditClass').mousemove(function(e) { 
		var hovertext = $(this).attr('hovertext');
		$('#roomProfileEditorHover').text(hovertext).show();
		$('#roomProfileEditorHover').css('top', e.clientY+10).css('left',e.clientX+10);
	
	}).mouseout(function(){ 
		$('#roomProfileEditorHover').hide();
	});	
	
	
	
	// tenant editor 
	$('#tenantEdit').toggle(function() { 
		//alert("you clicked Edit");
		$('input').removeAttr('readonly');
		//$('#tenantEdit').text("Submit");
		$('#tenantEdit').attr('value','Submit');
	},function(){
		var r = confirm("Do you really make these changes to the tenant's profile?");
		if (r) {				
			//alert("you clicked again!");
			$('#tenantEdit').attr('value','Edit');
			$('input').attr('readonly','readonly');
			$('#tenantProfileForm').bind('submit',function(){
				//alert('u triggered');
				var values = $('#tenantProfileForm').serializeArray(),
				data = { };
				console.log('>>>mark1');
				console.log(values);
				$.each(values, function(index,item){
				if (item.name == 'tenant_key') {
					data.tenant_Key = item.value;
				} else if (item.name == 'firstName'){
					data.firstName = item.value;
					//console.log('>>>roomNumber', item.value);
				} else if (item.name == 'surname'){
					data.surname = item.value;
					//console.log('>>>roomNumber', item.value);
				} else if (item.name == 'gender') {
					data.gender = item.value;
				}else if (item.name == 'age') {
					data.age = item.value;
				} else if (item.name == 'phoneNumber') {
					data.phoneNumber = item.value;
				} else if (item.name == 'email') {
					data.email = item.value;
				} else if (item.name == 'contactName') {
					data.contactName = item.value;
				} else if (item.name == 'contactPhoneNumber') {
					data.contactPhoneNumber = item.value;
				} 
				
			});
				
			var dataStringJson = JSON.stringify(data);				
				$.ajax({			
				url:'/tenantProfileDataEditor',
				type: 'POST',
				data: dataStringJson,				
				success: function(resp) {
					alert(resp.profileUpdatedMsg);
					//window.location.replace("http://localhost:8080/rooms");
					
				}
			});
				console.log('>>>mark4');
				return false;
			
			});
			$('#tenantProfileForm').trigger('submit');
		}
	});
	
	
	//room editor
	$('#roomEdit').toggle(function() {
		$('input').removeAttr('readonly');
		$('#roomEdit').attr('value','Submit');
	},function(){
		var r = confirm("Do you really make these changes to the Room's profile?");
		if (r){
			$('#roomEdit').attr('value','Edit');
			$('input').attr('readonly','readonly');
			$('#roomProfileForm').bind('submit',function(){
				//alert('u triggered');
				var values = $('#roomProfileForm').serializeArray(),
				data = { };
				//console.log('>>>mark1');
				//console.log(values);
				$.each(values, function(index,item){
				if (item.name == 'room_key') {
					data.room_key = item.value;
				} else if (item.name == 'number'){
					data.number = item.value;
					//console.log('>>>roomNumber', item.value);
				} else if (item.name == 'size'){
					data.size = item.value;
					//console.log('>>>roomNumber', item.value);
				} else if (item.name == 'rentSingle') {
					data.rentSingle = item.value;
				}else if (item.name == 'rentDouble') {
					data.rentDouble = item.value;
				} else if (item.name == 'rentActual') {
					data.rentActual = item.value;
				} 
			});
				
			var dataStringJson = JSON.stringify(data);				
				$.ajax({			
				url:'/roomProfileDataEditor',
				type: 'POST',
				data: dataStringJson,
				
				success: function(resp) {
					alert(resp.profileUpdatedMsg);
					//window.location.replace("http://localhost:8080/rooms");					
				}
			});
				console.log('>>>mark4');
				return false;
			
			});
			$('#roomProfileForm').trigger('submit');
		}
	
	});
	
	
	
	
	

	
	

	
	
	
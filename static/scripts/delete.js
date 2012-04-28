
$(function () {
	alert("This is an example!");
});
$("#dialog").dialog({
    modal: true,
    autoOpen: false
});
$("a.TenantDeletionHandler").click(function(e) {
    e.preventDefault();
    var id = $(this).attr('id');
    $("#dialog").dialog('option', 'buttons', {
        "Delete": function() {
            $.post({
                url: {% /tenantDeletion %},
                data: {'id': id},
                success: function() {
                   # whatever you like, some fancy effect that removes the object
                }
            });
            $(this).dialog("close");
        },
        "Cancel": function() {
            $(this).dialog("close");
        }
    });
    $("#dialog").dialog("open");
    return false;
});

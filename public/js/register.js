$(function(){
    buttonSubmit = $(".submit")[0];
    buttonSubmit.disabled = true;

    $("#input-username, #input-id, #input-password, #input-rePassword").on("keyup", () => {
        const strUserName = $("#input-username").val();
        const strId = $("#input-id").val();
        const strPassword = $("#input-password").val();
        const strRePassword = $("#input-rePassword").val();
        if(strUserName && strId && strPassword && strRePassword){
            buttonSubmit.disabled = false;
        }else{
            buttonSubmit.disabled = true;
        }
    });
});
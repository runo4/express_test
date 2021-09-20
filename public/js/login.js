$(function(){
    buttonSubmit = $(".submit")[0];
    buttonSubmit.disabled = true;

    $("#input-id, #input-password").on("keyup", () => {
        const strId = $("#input-id").val();
        const strPassword = $("#input-password").val();
        if(strId && strPassword){
            buttonSubmit.disabled = false;
        }else{
            buttonSubmit.disabled = true;
        }
    });
});
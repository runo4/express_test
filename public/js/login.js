$(function(){
    $(".submit").disabled = true;

    $("#input-id, #input-password").on("keyup", () => {
        const strId = $("#input-id").val();
        const strPassword = $("#input-password").val();
        if(strId && strPassword){
            $(".submit").disabled = false;
        }else{
            $(".submit").disabled = true;
        }
    });
});
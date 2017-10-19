//登录验证
function validatorSignInForm() {
    var ret = true;
    if(!validator.isMobilePhone($("#login-tel").val(), "zh-CN"))
    {
        ret = false;
        alert("手机号码格式不正确！");
        $("#login-tel").focus();
        return false;
    }
    if(!validator.isLength($("#login-pwd").val(), {min: 6, max: 20}))
    {
        ret = false;
        alert("密码为6-20位");
        $("#login-pwd").focus();
        return false;
    }
    if(ret){
        signIn();
    }
}
function signIn(){
    var para = $("#signInForm").serialize();
    $.ajax({
        url: "/users/signin",
        async: true,
        type: "POST",
        data: para,
        success: function (res) {
            if(parseInt(res.code) === 1)
            {
               window.location.href = res.url;
            }
        }
    });
}
//刷新验证码
$("#getCode").click(function (e) {
    e.preventDefault();
    var captchaUrl = '/captcha?t=' + Date.now() +
        Math.random();
    $("#vcode").attr("src", captchaUrl);
});
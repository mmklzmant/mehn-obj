var phoneStatus = false,
    pwdStatus = false,
    repwdStatus = false,
    codeStatus = false;

//注册验证输入
$("#register_btn").click(function () {
    $("#phone").blur();
    $("#register_pwd").blur();
    $("#register_repwd").blur();
    $("#register_vcode").blur();
    if (phoneStatus && pwdStatus && repwdStatus && codeStatus) {
        signUp();
    }
});

//ajax请求
function signUp() {
    var para = $("#signUpform").serialize();
    $.ajax({
        url: "/users/signup",
        type: "POST",
        async: true,
        data: para,
        success: function (res) {
            if (parseInt(res.code) === 0) {
                $("#" + res.id).css("display", "block");
                $("#" + res.id).text(res.msg);
                $("#" + res.id).focus();
            }
            if (parseInt(res.code) === 1) {
                console.log("code:1");
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

//电话失去焦点
$("#phone").blur(function () {
    if (!validator.isMobilePhone($(this).val(), "zh-CN")) {
        phoneStatus = false;
        $(this).focus();
        $("#phone-error").css("display", "block");
    }
    else {
        phoneStatus = true;
        $("#phone-error").css("display", "none");
    }
});
//密码失去焦点
$("#register_pwd").blur(function () {
    if (!validator.isLength($(this).val(), {min: 6, max: 20})) {
        pwdStatus = false;
        $(this).focus();
        $("#pwd-error").css("display", "block");
    }
    else {
        pwdStatus = true;
        $("#pwd-error").css("display", "none");
    }
});
//重新输入密码失去焦点
$("#register_repwd").blur(function () {
    if (($(this).val().length === 0 || ($(this).val()) !== ($("#register_pwd").val()))) {
        repwdStatus = false;
        $("#repwd-error").css("display", "block");
        $(this).focus();
    }
    else {
        repwdStatus = true;
        $("#repwd-error").css("display", "none");
    }
});
//验证码失去焦点
$("#register_vcode").blur(function () {
    if ($(this).val().length !== 4) {
        codeStatus = false;
        $("#vcode-error").css("display", "block");
        $("#vcode-error").text("验证码必须是四位");
        $(this).focus();
    }
    else {
        codeStatus = true;
        $("#vcode-error").css("display", "none");
    }
})

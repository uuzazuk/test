var BASE_URL    = "http://yopmail.com/en/",
    mailListDom = $("#mailList"),
	API_OTP     = "http://localhost:5000/robot/mail/otp/",
	API_NEW_OTP     = "http://localhost:5000/robot/mail/new-otp/",
	YOPMAIL_DOMAIN = "@yopmail.com",
	API_KEY = "1qaz2wsx";

$(function(){
	translate();
	var customInputButton = $("#manualAddress"),
		customaddressInput = $("#customAddressInput");

    customInputButton.on("click", function () {
        customInputButton.hide();
        customaddressInput.show().focus();
    });
    customaddressInput.on("blur", function () {
        customInputButton.show();
        customaddressInput.hide();
        customaddressInput.val("");
    });
    customaddressInput.keypress(function(e) {
        if(e.which == 13) {
            var address = customaddressInput.val();
            if (address.indexOf('@yopmail.com') == -1) {
                address += '@yopmail.com';
            }
            chrome.runtime.sendMessage({action: "generateNewMail", value: address}, function(response) {
                if (response.message === "OK") {
					// customInputButton.show();
					// customaddressInput.hide();
					// customaddressInput.val("");
					customaddressInput.blur();
					loadMailList();
                }
            });
        }
    });
});


var mailList = [];
loadMailList();
function loadMailList() {
	chrome.runtime.sendMessage({action: "getMailList", value: ""}, function(response) {
		if (response.message === "OK") {
			mailList = response.mailList;
			init();
		}
	});
}

function init() {
	mailListDom.empty();
	for (var i = 0; i < mailList.content.length; i++) {
		addMailToDom(mailList.content[i]);
	}
}

function addMailToDom(mail) {
	var tr = $("<tr id='mail" + mail.id + "'></tr>");
	var td1 = $("<td class='mdl-data-table__cell--non-numeric' style='text-align: center'></td>");
	var a1 = $("<a href='" + BASE_URL + mail.name + "' target='_blank'>" + mail.address + "</a>");
	a1.on("click", function() {
		useMail(mail);
	});

	var mailOtpTdId = 'td_' + mail.id;
	var mailOtpId = 'loading_' + mail.id;
    var mailOtp = $("<td "+ "id='" + mailOtpTdId + "' style='text-align: center;'><img id='" + mailOtpId + "' src='img/ajax-loader.gif' alt=''></td>");

	//var lastUsed = mail.lastUsed === null ? chrome.i18n.getMessage('neverUsed') : new Date(mail.lastUsed);
	//var lastUse = $("<td class='mdl-data-table__cell--non-numeric' style='text-align: center'>" + lastUsed.toLocaleString() + "</td>");

	/*
	var oldOtpVal = chrome.i18n.getMessage('empty_OTP');
	var oldOTP = $("<td class='mdl-data-table__cell--non-numeric' style='text-align: center'>" + oldOtpVal.toLocaleString() + "</td>");

	var newOtpVal = chrome.i18n.getMessage('empty_OTP');
	var newOTP = $("<td class='mdl-data-table__cell--non-numeric' style='text-align: center'>" + newOtpVal.toLocaleString() + "</td>");
	*/

	getMailOTP(mail, false, function (otp) {
		mail.OTP = otp;
        $("#" + mailOtpId).remove();
		//mailOTP.append(otp);
		//newOTP.innerText = otp;
		mailOtp.append(otp);
    });

	var copy = $("<td class='mdl-data-table__cell--non-numeric' style='text-align: center'></td>");
	var a2 = $("<a href='#'><img width='24' height='24' title='' alt='' src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABmJLR0QAAAAAAAD5Q7t/AAAACXBIWXMAAABIAAAASABGyWs+AAAACXZwQWcAAAAYAAAAGAB4TKWmAAAAYElEQVRIx2NgoCPwYmBgeMTAwPCfREw0eEyG4SRZQLIGYgATtQ0kxQJy4uQRVB9RQURunDwm1gJy4gRDz4DGwagFoxaMFAtYkNiMQ9IHw9uCJ1Ca1OrzCQORgOoVDk0AAPQGWyAE8AECAAAAAElFTkSuQmCC'/></a>");
	a2.on("click", function() {
		//useMail(mail);
		//copyText(mail.address);
		copyOTP(mailOtpTdId);
	});

	var refresh = $("<td class='mdl-data-table__cell--non-numeric' style='text-align: center'></td>");
	var a3 = $("<a href='#'><img width='24' height='24' title='' alt='' src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAACoklEQVRIie2VsW/TQBTGn8/v7EROHMsmUiJRRSrQqgNIMMOGxICECgyw0IoJCRXxFwCFjrBU0L0SSweGLjAAOyNiQaJUjapGStLi6JTEjknPdwxJkGPsUEYQb3t+937fd8/SO4C/PdQjH1RVR9O0GUQsAQCXUvaidUJIRkoZxvuU30CLlmUt5XK5m4g4E61xzre63e4GY+wFIaQwNTX10ff9N41G48aRBEzTXHAcZ5UQYk0yIYRgnue9zOfz94QQrFqt2gAgJwo4jrNsWdaj6Dcp5XfO+Q4ASEScVhQlk9S7u7tb5pw3RjkmOY/COefbrVbrged5m0KIAGAwb8Mwrtq2/QQRT0b7KaWzUQESLaqqesxxnNVR3uv13u7t7Z3tdDobI/hwLMFQfCc6DgAATdNmo/nYDSzLWhrNnHO+3Wg0rgshukmjKBQKd3VdPx//Tik9lSqgadqZoSOl1Wo9TIMDAOzv798xDOOyqqolRCyrqlpWVdX2ff99Ws9AEbFsmuYCISQ78eD/+JMghGRN01xExHK8NvaTDcO45DjO0zAM3TAM65zzRhiGdc/zXvf7/c9pAoZhzBeLxXUAkL7vb9br9WuJAtls9iKl9DSlNA64UqvVLqS4z9u2vTJMlX6//yn1BoeHh19j/TIIgnftdns9BZ4rlUqvEPEEwGAvMcbWJgl8iTGUUTMhJBNbFfO2ba9EV4XruvfDMPw2BhhTQyxVKpV6klspZcA5rw7PTSuKokfrjLHHrusu/3LLaMI5b0opGQBAp9N5LoRgP50oSoZSOkcpnYvChRDs4OBgMQkOkPCi6bp+jlJaaTabtxljzwCgh4hlQogTM7PVbrfXms3mrSAIPiTBAZLfA4UQoke3J8DgyUTE40N4LQxDNw36b8UPvcglbDe304YAAAAASUVORK5CYII='/></a>");
	a3.on("click", function() {
		//$("#" + mailOtpTdId).innerText = "";
		$("#" + mailOtpTdId).html('&nbsp;');
		mailOtp.append("<img id='" + mailOtpId + "' src='img/ajax-loader.gif' alt=''>");
		getMailOTP(mail, true, function (otp) {
			mail.OTP = otp;
			$("#" + mailOtpId).remove();
			mailOtp.append(otp);
		});		
	});

	var del = $("<td class='mdl-data-table__cell--non-numeric' style='text-align: center'></td>");
	var a4 = $("<a href='#'><img width='24' height='24' title='' alt='' src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABmJLR0QAAAAAAAD5Q7t/AAAACXBIWXMAAABIAAAASABGyWs+AAAACXZwQWcAAAAYAAAAGAB4TKWmAAAAaElEQVRIx2NgGAUjFugwMDDsY2BgECVCrShUrQ4pFuxjYGD4z8DAcJmAJaJQNf+heogGyBpxWUKMGrItodhwfAZRzXBcllDVcGyWkGQ4E7VcMGiDiKaRTNNkSvOMRvOiguaF3SgYRgAA1bo+/as5g9sAAAAASUVORK5CYII='/></a>");
	a4.on("click", function() {
		$("#mail" + mail.id).remove();
		deleteMail(mail);
	});
	td1.append(a1);
	tr.append(td1);
    tr.append(mailOtp);
	//tr.append(lastUse);
/*
	tr.append(oldOTP);
	tr.append(newOTP);
*/
	copy.append(a2);
	refresh.append(a3);
	del.append(a4);
	tr.append(copy);
	tr.append(refresh);
	tr.append(del);
	mailListDom.append(tr);
	translate();
}

function translate() {
	$('[data-resource]').each(function() {
		var el = $(this);
		var resourceName = el.data('resource');
		var resourceText = chrome.i18n.getMessage(resourceName);
		el.text(resourceText);
	});
}

function copyText(text) {
    var textField = document.getElementById("taCopy");
    textField.innerText = text;
    textField.select();
    document.execCommand('copy');
}

function copyOTP(otpId) {
	var otpText = document.getElementById(otpId);
	window.getSelection().selectAllChildren(otpText);
    document.execCommand('copy');
}

function useMail(mail) {
	mail.lastUsed = Date.now();
	mail.usageCount++;
    updateMail(mail);
	init();
}

function deleteMail(mail) {
	chrome.runtime.sendMessage({action: "deleteMail", value: mail}, function(response) {
        mailList = response.mailList;
        resizePopup();
	});
}

function updateMail(mail) {
	chrome.runtime.sendMessage({action: "updateMail", value: mail}, function (response) {
        mailList = response.mailList;
    });
}

function resizePopup() {
	$('html').height($('#main').height());
}

function getMailCount(mail, callback) {
    var url = API_URL + mail.name;
    fetch(url)
        .then(function (resp) {
            return resp.json();
        })
        .then(function (response) {
            callback(response);
        })
}

function getMailOTP(mail, refresh, callback) {
	var id = mail.name.split("@")[0];
	var url = ""
	if (refresh)
		url = API_NEW_OTP;
	else
		url = API_OTP;
	url += id;

	fetch(url, {
		headers : {
			"X-API-KEY" : API_KEY
		}
	}).then(function (resp) {
            return resp.json();
        })
        .then(function (response) {
            callback(response.OTP);
        })
}
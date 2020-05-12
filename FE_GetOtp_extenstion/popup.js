class YpmOtp {
	constructor() {
		this.mailListDom = $("#mailList");
		this.mailList = [];
	}

	init() {
		let that = this;

		this.translate();

		let customInputButton = $("#manualAddress"),
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
				let address = customaddressInput.val();
				if (address.indexOf('@yopmail.com') == -1) {
					address += '@yopmail.com';
				}
				chrome.runtime.sendMessage({action: "generateNewMail", value: address}, (response) => {
					if (response.message === "OK") {
						customaddressInput.blur();
						that.loadMailList();
					}
				});
			}
		});
	}

	loadMailList() {
		chrome.runtime.sendMessage({action: "getMailList", value: ""}, (response) => {
			if (response.message === "OK") {
				console.log(response.mailList);
				this.mailList = response.mailList;
				this.popupInit();
			}
		});
	}

	popupInit() {
		this.mailListDom.empty();
		for (let i = 0; i < this.mailList.content.length; i++) {
			this.addMailToDom(this.mailList.content[i]);
		}
	}

	addMailToDom(mail) {
		let tr = $("<tr id='mail" + mail.id + "'></tr>");
		let td1 = $("<td class='mdl-data-table__cell--non-numeric' style='text-align: center'></td>");
		let a1 = $("<a href='" + this.BASE_URL + mail.name + "' target='_blank'>" + mail.address + "</a>");
		a1.on("click", () => {
			this.useMail(mail);
		});
	
		let mailOtpTdId = 'td_' + mail.id;
		let mailOtpId = 'loading_' + mail.id;
		let mailOtp = $("<td "+ "id='" + mailOtpTdId + "' style='text-align: center;'><img id='" + mailOtpId + "' src='img/ajax-loader.gif' alt=''></td>");
	
		//let lastUsed = mail.lastUsed === null ? chrome.i18n.getMessage('neverUsed') : new Date(mail.lastUsed);
		//let lastUse = $("<td class='mdl-data-table__cell--non-numeric' style='text-align: center'>" + lastUsed.toLocaleString() + "</td>");
	
		/*
		let oldOtpVal = chrome.i18n.getMessage('empty_OTP');
		let oldOTP = $("<td class='mdl-data-table__cell--non-numeric' style='text-align: center'>" + oldOtpVal.toLocaleString() + "</td>");
	
		let newOtpVal = chrome.i18n.getMessage('empty_OTP');
		let newOTP = $("<td class='mdl-data-table__cell--non-numeric' style='text-align: center'>" + newOtpVal.toLocaleString() + "</td>");
		*/
	
		this.getMailOTP(mail, false, function (otp) {
			mail.OTP = otp;
			$("#" + mailOtpId).remove();
			//mailOTP.append(otp);
			//newOTP.innerText = otp;
			mailOtp.append(otp);
		});
	
		let copy = $("<td class='mdl-data-table__cell--non-numeric' style='text-align: center'></td>");
		let a2 = $("<a href='#'><img width='24' height='24' title='' alt='' src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABmJLR0QAAAAAAAD5Q7t/AAAACXBIWXMAAABIAAAASABGyWs+AAAACXZwQWcAAAAYAAAAGAB4TKWmAAAAYElEQVRIx2NgoCPwYmBgeMTAwPCfREw0eEyG4SRZQLIGYgATtQ0kxQJy4uQRVB9RQURunDwm1gJy4gRDz4DGwagFoxaMFAtYkNiMQ9IHw9uCJ1Ca1OrzCQORgOoVDk0AAPQGWyAE8AECAAAAAElFTkSuQmCC'/></a>");
		a2.on("click", () => {
			//useMail(mail);
			//copyText(mail.address);
			this.copyOTP(mailOtpTdId);
		});
	
		let refresh = $("<td class='mdl-data-table__cell--non-numeric' style='text-align: center'></td>");
		let a3 = $("<a href='#'><img width='24' height='24' title='' alt='' src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAACoklEQVRIie2VsW/TQBTGn8/v7EROHMsmUiJRRSrQqgNIMMOGxICECgyw0IoJCRXxFwCFjrBU0L0SSweGLjAAOyNiQaJUjapGStLi6JTEjknPdwxJkGPsUEYQb3t+937fd8/SO4C/PdQjH1RVR9O0GUQsAQCXUvaidUJIRkoZxvuU30CLlmUt5XK5m4g4E61xzre63e4GY+wFIaQwNTX10ff9N41G48aRBEzTXHAcZ5UQYk0yIYRgnue9zOfz94QQrFqt2gAgJwo4jrNsWdaj6Dcp5XfO+Q4ASEScVhQlk9S7u7tb5pw3RjkmOY/COefbrVbrged5m0KIAGAwb8Mwrtq2/QQRT0b7KaWzUQESLaqqesxxnNVR3uv13u7t7Z3tdDobI/hwLMFQfCc6DgAATdNmo/nYDSzLWhrNnHO+3Wg0rgshukmjKBQKd3VdPx//Tik9lSqgadqZoSOl1Wo9TIMDAOzv798xDOOyqqolRCyrqlpWVdX2ff99Ws9AEbFsmuYCISQ78eD/+JMghGRN01xExHK8NvaTDcO45DjO0zAM3TAM65zzRhiGdc/zXvf7/c9pAoZhzBeLxXUAkL7vb9br9WuJAtls9iKl9DSlNA64UqvVLqS4z9u2vTJMlX6//yn1BoeHh19j/TIIgnftdns9BZ4rlUqvEPEEwGAvMcbWJgl8iTGUUTMhJBNbFfO2ba9EV4XruvfDMPw2BhhTQyxVKpV6klspZcA5rw7PTSuKokfrjLHHrusu/3LLaMI5b0opGQBAp9N5LoRgP50oSoZSOkcpnYvChRDs4OBgMQkOkPCi6bp+jlJaaTabtxljzwCgh4hlQogTM7PVbrfXms3mrSAIPiTBAZLfA4UQoke3J8DgyUTE40N4LQxDNw36b8UPvcglbDe304YAAAAASUVORK5CYII='/></a>");
		a3.on("click", () => {
			//$("#" + mailOtpTdId).innerText = "";
			//$("#" + mailOtpTdId).html('&nbsp;');
			$("#" + mailOtpTdId).html('');
			mailOtp.append("<img id='" + mailOtpId + "' src='img/ajax-loader.gif' alt=''>");
			this.getMailOTP(mail, true, function (otp) {
				mail.OTP = otp;
				$("#" + mailOtpId).remove();
				mailOtp.append(otp);
			});		
		});
	
		let del = $("<td class='mdl-data-table__cell--non-numeric' style='text-align: center'></td>");
		let a4 = $("<a href='#'><img width='24' height='24' title='' alt='' src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABmJLR0QAAAAAAAD5Q7t/AAAACXBIWXMAAABIAAAASABGyWs+AAAACXZwQWcAAAAYAAAAGAB4TKWmAAAAaElEQVRIx2NgGAUjFugwMDDsY2BgECVCrShUrQ4pFuxjYGD4z8DAcJmAJaJQNf+heogGyBpxWUKMGrItodhwfAZRzXBcllDVcGyWkGQ4E7VcMGiDiKaRTNNkSvOMRvOiguaF3SgYRgAA1bo+/as5g9sAAAAASUVORK5CYII='/></a>");
		a4.on("click", () => {
			$("#mail" + mail.id).remove();
			this.deleteMail(mail);
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
		this.mailListDom.append(tr);
		this.translate();
	}

	translate() {
		$('[data-resource]').each(function() {
			let el = $(this);
			let resourceName = el.data('resource');
			let resourceText = chrome.i18n.getMessage(resourceName);
			el.text(resourceText);
		});
	}

	copyOTP(otpId) {
		let otpText = document.getElementById(otpId);
		window.getSelection().selectAllChildren(otpText);
		document.execCommand('copy');
	}

	useMail(mail) {
		mail.lastUsed = Date.now();
		mail.usageCount++;
		this.updateMail(mail);
		this.popupInit();
	}

	deleteMail(mail) {
		chrome.runtime.sendMessage({action: "deleteMail", value: mail}, (response) => {
			this.mailList = response.mailList;
			this.resizePopup();
		});
	}

	updateMail(mail) {
		chrome.runtime.sendMessage({action: "updateMail", value: mail}, (response) => {
			this.mailList = response.mailList;
		});
	}
	
	resizePopup() {
		$('html').height($('#main').height());
	}
	
	getMailOTP(mail, refresh, callback) {
		let id = mail.name.split("@")[0];
		let url = ""
		if (refresh)
			url = this.API_NEW_OTP;
		else
			url = this.API_OTP;
		url += id;
	
		fetch(url, {
			headers : {
				"X-API-KEY" : this.API_KEY
			}
		}).then(function (resp) {
				return resp.json();
			})
			.then(function (response) {
				callback(response.OTP);
			})
	}
};


YpmOtp.prototype.BASE_URL		= "http://yopmail.com/en/";
YpmOtp.prototype.SERVER_ADDR	= "http://10.223.101.121:5010";
YpmOtp.prototype.API_OTP		= YpmOtp.prototype.SERVER_ADDR + "/robot/mail/otp/";
YpmOtp.prototype.API_NEW_OTP	= YpmOtp.prototype.SERVER_ADDR + "/robot/mail/new-otp/";
YpmOtp.prototype.YOPMAIL_DOMAIN	= "@yopmail.com";
YpmOtp.prototype.API_KEY		= "1qaz2wsx";


$(function(){
	let ypmOtp = new YpmOtp();
	ypmOtp.init();
	ypmOtp.loadMailList();
});

/*-------------------------------------------*/





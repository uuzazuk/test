class MailList {
	constructor() {}
	init() {
		chrome.storage.sync.get("yh_mailList", (data) => {
			if (data.yh_mailList) {
				this.content = data.yh_mailList.content;
				this.counter = data.yh_mailList.counter;
			} else {
				this.counter = counter ? counter : 0;
				this.content = [];
			}
		})
	}

	saveAndSync() {
		chrome.storage.sync.set({"yh_mailList": this});
	};

	updateValues(newArray) {
		this.content = newArray;
		this.saveAndSync();
	};

	deleteMail(mail) {
		for (let i = 0; i < this.content.length; i++) {
			if (this.content[i].id === mail.id)
				this.content.splice(i, 1);
		}
		this.saveAndSync();
	};
	addMail(mail) {
		this.content.push(mail);
		this.saveAndSync();
	};
	
	updateMail(mail) {
		for (let i = 0; i < this.content.length; i++) {
			if (this.content[i].id === mail.id) {
				this.content[i] = mail;
			}
		}
		this.saveAndSync();
	};
	
};

class Mail {
	constructor(customAddress, _mailList) {
		this.name = customAddress;
		this.address = customAddress;
		this.created = Date.now();
		this.lastUsed = null;
		this.id = _mailList.counter++;
		this.usageCount = 0;
		this.OTP = "";
		_mailList.addMail(this);
	}
};

let mailList = new MailList();
mailList.init();


chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		switch(request.action) {
			case "generateNewMail":
				let newMail = new Mail(request.value, mailList);
				sendResponse({message: "OK", mailList: mailList, newMail: newMail});
				break;
			case "updateMail":
				mailList.updateMail(request.value);
				sendResponse({mailList: mailList});
				break;
            case "updateMailList":
				mailList.updateValues(request.value.content);
				mailList.saveAndSync();
				break;
			case "getMailList":
				sendResponse({message: "OK", mailList: mailList});
				break;
			case "deleteMail":
				mailList.deleteMail(request.value);
				sendResponse({mailList: mailList});
				break;
		}
	}
);
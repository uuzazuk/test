import sys
import io

import pymysql
import json
import datetime
import requests

from app import app
from flask import flash, render_template, request, redirect, make_response, jsonify
from flask_cors import CORS, cross_origin
from flask import send_file
from bs4 import BeautifulSoup

CORS(app)

#sys.stdout = io.TextIOWrapper(sys.stdout.detach(), encoding='utf-8')
# sys.stderr = io.TextIOWrapper(sys.stdout.detach(), encoding='utf-8')
#sys.stdout = io.TextIOWrapper(sys.stdout.detach(), encoding='ISO-8859-1')
#sys.stderr = io.TextIOWrapper(sys.stdout.detach(), encoding='ISO-8859-1')

API_KEY = "1qaz2wsx"
YPM_BASE_URL = "http://www.yopmail.com/en/"
OTP_KEY_CLASS = "lms"
OTP_TEXT_VALUE = "LOGIN OTP Temporary Password"


####################################################################
# get OTP from yopmail
# http://localhost:5000/robot/mail/otp/snuh_dev
@app.route('/robot/mail/otp/<id>')
def	getOTP(id):
	retOTP = {"OTP" : "not Found"}

	apiKey = request.headers.get("X-API-Key")
	print("apiKey : ", apiKey)

	if apiKey != API_KEY:
		print("invalid api key : ", apiKey)
		retOTP["OTP"] = "invalid api key"
		return json.dumps(retOTP)

	print("getOTP()")
	print("id : ", id)

	#url = "http://www.yopmail.com/en/inbox.php?login=snuh_dev&p=r&d=&ctrl=&scrl=&spam=true&yf=115&yp=UZmN5ZGx0AmR5ZQZmAQD5AQN&yj=AAQR5ZmR4BQZ1ZwV3BQH0Zmt&v=3.1&r_c=&id="
	url = "http://www.yopmail.com/en/inbox.php?login=" + id + "&yp=UZmN5ZGx0AmR5ZQZmAQD5AQN&yj=AAQR5ZmR4BQZ1ZwV3BQH0Zmt&v=3.1"
	response = requests.get(url)
	#print("response encoding : ", response.encoding)

	otpMailUrl = ""

	if int(response.status_code) == 200 :
		#print("response :", response.text)
		bs = BeautifulSoup(response.text, "html.parser")

		tags = bs.findAll("span", attrs={"class" : OTP_KEY_CLASS})

		for tag in tags :
			if tag.text == OTP_TEXT_VALUE :
				#print(tag.parent.attrs['href'])
				otpMailUrl = YPM_BASE_URL + tag.parent.attrs["href"]
				print(otpMailUrl)
				break

		if otpMailUrl != "" :
			response = requests.get(otpMailUrl, cookies={"compte":id})
			bs = BeautifulSoup(response.text, "html.parser")
			tag = bs.find("td", attrs={"style" : "padding-top:30px;color:#d80546;font-size:28px;"})
			if tag is not None :
				print(tag.text)
				retOTP["OTP"] = tag.text
	else :
		print("status code :", response.status_code)

	return json.dumps(retOTP)

####################################################################
	
		
		
if __name__ == "__main__":
    #app.run()
	#app.run(host = '10.159.185.34', port=5000)
    app.run(host = '0.0.0.0', port=5000)
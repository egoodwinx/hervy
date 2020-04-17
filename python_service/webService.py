#	
#	FILE:			webService.py
#	PROJECT:		HeRVY (Capstone)
#	FIRST VERSION:	March 20, 2020
#	PROGRAMMER:		Emily Goodwin
#	DESCRIPTION:	Contains the code for the HeRVY webservice REST API calls.
#					Allows for calls to get the user's anxiety times and patterns.
#	

import cherrypy
import pandas as pd
import processor
import datetime
import cherrypy_cors
import json 
import traceback

# declare hervy processor 
p = processor.Processor()

# Class: 	WebService
# Purpose: 	Models the HeRVY REST API web service. Allows queries to get anxiety times,
#			daily patterns, weekly patterns, and writing heart rate data to the server.
#
class WebService(object):

	#
	# Method:		anxiety_from_date
	# Description:	Given the date, get the anxiety values for that day
	#				Writes results to anxiety file.  
	#
	# Parameters:
	# 	The date in JSON format.
	# 	example:
	#	{ "date": "2020-03-30"}
	# Return:		
	#	Returns the start and end times along with the anxiety values as a JSON object.	
	# 	example:
	#{"start times":{"0":"2020-04-12 14:25:00","1":"2020-04-12 14:30:00","2":"2020-04-12 14:40:00"},"end times":{"0":"2020-04-12 14:55:00","1":"2020-04-12 15:00:00","2":"2020-04-12 15:10:00"},"anxiety values":{"0":4,"1":4,"2":4}}
	@cherrypy.expose(alias='anxiety-from-date')
	@cherrypy.tools.json_in()
	def anxiety_from_date(self):
		if cherrypy.request.method == 'OPTIONS':
			# This is a request that browser sends in CORS prior to
			# sending a real request.
			# Set up extra headers for a pre-flight OPTIONS request.
			cherrypy_cors.preflight(allowed_methods=['GET', 'POST'])
		if cherrypy.request.method == 'POST':
			data = cherrypy.request.json
			fileToOpen = "./data/"+data["date"][:10]
			# add multiple users stuff later
			ret = json.dumps("")
			try:
				f = open(fileToOpen + ".json", "r")
				jsonData = json.load(f)
				f.close()
				if jsonData["heartRateValues"]:
					dataFrame = pd.DataFrame(jsonData["heartRateValues"])
					dataFrame["datetime"] = pd.to_datetime(jsonData["date"] + " " + dataFrame["time"])
					ret = p.find_anxious_times(dataFrame)
					self.write_file_anxiety_values(data["date"], ret)
			except Exception as e:
				traceback.print_exc()
			return ret
		return "Non-POST"


	#
	# Method:		anxiety
	# Description:	Given the heart rate data, return the anxious times and the values associated.
	#  				Writes results to anxiety file.
	#				
	# Parameters:
	# 	Data in JSON format. Contains the date, resting heart rate, and heart rate values with times.
	# 	example:
	#	{
    # "date": "2020-03-30",
    # "restingHeartRate": 66.00033570375531,
    # "heartRateValues": [
    #     {
    #         "value": 89,
    #         "time": "09:00:00"
    #     },
    #     {
    #         "value": 88,
    #         "time": "09:00:01"
    #     },
    #     {
    #         "value": 87,
    #         "time": "09:00:02"
    #     }
	# ]}
	# Return:		
	#	Returns the start and end times along with the anxiety values as a JSON object.	
	# 	example:
	#{"start times":{"0":"2020-04-12 14:25:00","1":"2020-04-12 14:30:00","2":"2020-04-12 14:40:00"},"end times":{"0":"2020-04-12 14:55:00","1":"2020-04-12 15:00:00","2":"2020-04-12 15:10:00"},"anxiety values":{"0":4,"1":4,"2":4}}
	@cherrypy.expose
	@cherrypy.tools.json_in()
	def anxiety(self):
		output = None
		data = cherrypy.request.json
		if data["heartRateValues"]:
			dataFrame = pd.DataFrame(data["heartRateValues"])
			dataFrame["datetime"] = pd.to_datetime(data["date"] + " " + dataFrame["time"])
			print(dataFrame)
			output = p.find_anxious_times(dataFrame)
			self.write_file_anxiety_values(data["date"], output)

		return output
	
	#
	# Method:		daily_pattern
	# Description:	Given a date range, analyze the daily pattern.
	#  				If there is no data for a day, that day is skipped.
	# Parameters:
	# 	startDate - the starting date 
	# 	endAte - the end date
	# 	example:
	# {
	# 	"startDate":"2020-03-20 12:25:00",
	# 	"endDate":"2020-04-12 12:25:00"
	# }
	# Return:		
	#	Returns the hourly data in JSON format.
	#	"{\"0\":0,\"1\":0,\"2\":0,\"3\":0,\"4\":0,\"5\":0,\"6\":0,\"7\":0,\"8\":0,\"9\":1,\"10\":0,\"11\":0,\"12\":0,\"13\":0,\"14\":0,\"15\":0,\"16\":0,\"17\":0,\"18\":0,\"19\":0,\"20\":0,\"21\":0,\"22\":0,\"23\":0}"
	@cherrypy.expose(alias='daily-pattern')
	@cherrypy.tools.json_out()
	@cherrypy.tools.json_in()
	def daily_pattern(self):
		# startDate
		# endDate
		if cherrypy.request.method == 'OPTIONS':
			# This is a request that browser sends in CORS prior to
			# sending a real request.
			# Set up extra headers for a pre-flight OPTIONS request.
			cherrypy_cors.preflight(allowed_methods=['GET', 'POST'])
		if cherrypy.request.method == 'POST':
			data = cherrypy.request.json
			startDate = pd.to_datetime(data["startDate"])
			endDate = pd.to_datetime(data["endDate"])
			print("Looking for files from ", startDate.strftime("%Y-%m-%d"), " to ", endDate.strftime("%Y-%m-%d"))
			dateRange = pd.date_range(start=startDate, end=endDate)
			dataFrame = pd.DataFrame()
			for date in dateRange:
				date = pd.to_datetime(date)
				tempDataFrame = pd.DataFrame()
				fileToOpen = "./data/"+date.strftime("%Y-%m-%d")
				try:
					f = open(fileToOpen + "-anxiety.json", "r")
					jsonData = json.load(f)
					f.close()
					tempDataFrame = pd.read_json(jsonData)
					print("Found data for date ", date.strftime("%Y-%m-%d"))
					if not(dataFrame.empty):
						dataFrame = dataFrame.append(tempDataFrame, ignore_index=True)
					else:
						dataFrame = tempDataFrame
				except FileNotFoundError:
					print("No data exists for date ", date.strftime("%Y-%m-%d"))
				except Exception:
					traceback.print_exc()
			print("final data to analyze for daily patterns", dataFrame)
			ret = p.daily_pattern(dataFrame)
			return ret

		return "Non-POST"

	#
	# Method:		weekly_pattern
	# Description:	Given a date range, analyze the weekly pattern.
	#  
	# Parameters:
	# 	startDate - the starting date 
	# 	endAte - the end date
	# 	example:
	# {
	# 	"startDate":"2020-03-20 12:25:00",
	# 	"endDate":"2020-04-12 12:25:00"
	# }
	# Return:		
	#	Returns the daily hourly data in JSON format.
	# "{\"0\":{\"0\":0,\"1\":0,\"2\":0,\"3\":0,\"4\":0,\"5\":0,\"6\":0,\"7\":0,\"8\":0,\"9\":1,\"10\":0,\"11\":0,\"12\":0,\"13\":0,\"14\":0,\"15\":0,\"16\":0,\"17\":0,\"18\":0,\"19\":0,\"20\":0,\"21\":0,\"22\":0,\"23\":0},\"1\":{\"0\":0,\"1\":0,\"2\":0,\"3\":0,\"4\":0,\"5\":0,\"6\":0,\"7\":0,\"8\":0,\"9\":0,\"10\":0,\"11\":0,\"12\":0,\"13\":0,\"14\":0,\"15\":0,\"16\":0,\"17\":0,\"18\":0,\"19\":0,\"20\":0,\"21\":0,\"22\":0,\"23\":0},\"2\":{\"0\":0,\"1\":0,\"2\":0,\"3\":0,\"4\":0,\"5\":0,\"6\":0,\"7\":0,\"8\":0,\"9\":0,\"10\":0,\"11\":0,\"12\":0,\"13\":0,\"14\":0,\"15\":0,\"16\":0,\"17\":0,\"18\":0,\"19\":0,\"20\":0,\"21\":0,\"22\":0,\"23\":0},\"3\":{\"0\":0,\"1\":0,\"2\":0,\"3\":0,\"4\":0,\"5\":0,\"6\":0,\"7\":0,\"8\":0,\"9\":0,\"10\":0,\"11\":0,\"12\":0,\"13\":0,\"14\":0,\"15\":0,\"16\":0,\"17\":0,\"18\":0,\"19\":0,\"20\":0,\"21\":0,\"22\":0,\"23\":0},\"4\":{\"0\":0,\"1\":0,\"2\":0,\"3\":0,\"4\":0,\"5\":0,\"6\":0,\"7\":0,\"8\":0,\"9\":0,\"10\":0,\"11\":0,\"12\":0,\"13\":0,\"14\":0,\"15\":0,\"16\":0,\"17\":0,\"18\":0,\"19\":0,\"20\":0,\"21\":0,\"22\":0,\"23\":0},\"5\":{\"0\":0,\"1\":0,\"2\":0,\"3\":0,\"4\":0,\"5\":0,\"6\":0,\"7\":0,\"8\":0,\"9\":0,\"10\":0,\"11\":0,\"12\":0,\"13\":0,\"14\":0,\"15\":0,\"16\":0,\"17\":0,\"18\":0,\"19\":0,\"20\":0,\"21\":0,\"22\":0,\"23\":0},\"6\":{\"0\":0,\"1\":0,\"2\":0,\"3\":0,\"4\":0,\"5\":0,\"6\":0,\"7\":0,\"8\":0,\"9\":0,\"10\":0,\"11\":0,\"12\":0,\"13\":0,\"14\":0,\"15\":0,\"16\":0,\"17\":0,\"18\":0,\"19\":0,\"20\":0,\"21\":0,\"22\":0,\"23\":0}}"	
	@cherrypy.expose(alias='weekly-pattern')
	@cherrypy.tools.json_out()
	@cherrypy.tools.json_in()
	def weekly_pattern(self):
		# startDate
		# endDate
		if cherrypy.request.method == 'OPTIONS':
			# This is a request that browser sends in CORS prior to
			# sending a real request.
			# Set up extra headers for a pre-flight OPTIONS request.
			cherrypy_cors.preflight(allowed_methods=['GET', 'POST'])
		if cherrypy.request.method == 'POST':
			data = cherrypy.request.json
			startDate = pd.to_datetime(data["startDate"])
			endDate = pd.to_datetime(data["endDate"])
			print("Looking for files from ", startDate.strftime("%Y-%m-%d"), " to ", endDate.strftime("%Y-%m-%d"))
			dateRange = pd.date_range(start=startDate, end=endDate)
			dataFrame = pd.DataFrame()
			for date in dateRange:
				date = pd.to_datetime(date)
				tempDataFrame = pd.DataFrame()
				fileToOpen = "./data/"+date.strftime("%Y-%m-%d")
				try:
					f = open(fileToOpen + "-anxiety.json", "r")
					jsonData = json.load(f)
					f.close()
					tempDataFrame = pd.read_json(jsonData)
					print("Found data for date ", date.strftime("%Y-%m-%d"))
					if not(dataFrame.empty):
						dataFrame = dataFrame.append(tempDataFrame, ignore_index=True)
					else:
						dataFrame = tempDataFrame
				except FileNotFoundError:
					print("No data exists for date ", date.strftime("%Y-%m-%d"))
				except Exception:
					traceback.print_exc()
			print("final data to analyze for weekly patterns", dataFrame)
			ret = p.weekly_pattern(dataFrame)
			return ret

		return "Non-POST"

	#
	# Method:		write_file
	# Description:	write the given heart rate data into a file labelled with the date
	#  
	# Parameters:
	# 	JSON object of the normal heart rate data is expected.
	# 	example:
	#	{
    # "date": "2020-03-30",
    # "restingHeartRate": 66.00033570375531,
    # "heartRateValues": [
    #     {
    #         "value": 89,
    #         "time": "09:00:00"
    #     },
    #     {
    #         "value": 88,
    #         "time": "09:00:01"
    #     },
    #     {
    #         "value": 87,
    #         "time": "09:00:02"
    #     }
	# ]}
	# Return:		
	#	Returns a message detailing the success or the error
	@cherrypy.expose(alias='write-file')
	@cherrypy.tools.json_in()
	def write_file(self):
		if cherrypy.request.method == 'OPTIONS':
		# This is a request that browser sends in CORS prior to
		# sending a real request.
		# Set up extra headers for a pre-flight OPTIONS request.
			cherrypy_cors.preflight(allowed_methods=['GET', 'POST'])

		if cherrypy.request.method == 'POST':
			data = cherrypy.request.json
			ret = ""
			try:
				f = open("./data/" + data["date"][:10] + ".json", "w")
				json.dump(data, f)
				f.close()
				ret = "Sucessfully wrote to file"
			except Exception as e:
				print("Error",e.__str__())
				ret = json.dumps({'error':e.__str__()})
			return ret
		return "Non-POST"

	#
	# Method:		is_user_anxious
	# Description:	Is the user anxious at the given time? Only works for 5 minutes at this time.
	#  
	# Parameters:
	# 	date - the date to use
	#	time - the time to use 
	#	example:
	# {
	#   "date": "2020-04-07T21:15:44.994Z",
	# 	"time": "07:40"
	# }
	# Return:	
	# boolean - if the user is anxious ot not
	# json in contains date and time to look at, time in format hh:mm
	@cherrypy.expose(alias='is-user-anxious')
	@cherrypy.tools.json_in()
	def is_user_anxious(self):
		if cherrypy.request.method == 'OPTIONS':
		# This is a request that browser sends in CORS prior to
		# sending a real request.
		# Set up extra headers for a pre-flight OPTIONS request.
			cherrypy_cors.preflight(allowed_methods=['GET', 'POST'])

		if cherrypy.request.method == 'POST':
			data = cherrypy.request.json
			fileToOpen = "./data/" + data["date"][:10]
			# add multiple users stuff later
			ret = ""
			try:
				f = open(fileToOpen + ".json", "r")
				jsonData = json.load(f)
				f.close()
				dataFrame = pd.DataFrame(jsonData["heartRateValues"])
				dataFrame["datetime"] = pd.to_datetime(jsonData["date"] + " " + dataFrame["time"])
				date = pd.to_datetime(data["date"])
				ret = p.is_user_anxious(dataFrame,date, data["time"])
			except Exception as e:
				traceback.print_exc()
				ret = traceback._cause_message
			return ret.__str__()
		return "Non-POST"

	#
	# Method:		write_file_anxiety_values
	# Description:	Write the start/end date anxiety data to a file labelled with the date appened by "anxiety" label.
	#				Not available to outside sources.
	#  
	# Parameters:
	# 	date - the date to label it with, needs to be in YYYY-mm-DD format
	#	data - the anxiety data to write to the file 
	#	example:
	#{"start times":{"0":"2020-04-12 14:25:00","1":"2020-04-12 14:30:00","2":"2020-04-12 14:40:00"},"end times":{"0":"2020-04-12 14:55:00","1":"2020-04-12 15:00:00","2":"2020-04-12 15:10:00"},"anxiety values":{"0":4,"1":4,"2":4}}
	# Return:	
	# boolean - if it succeeded or not 	
	def write_file_anxiety_values(self, date, data):
		ret = False
		try:
			f = open("./data/" + date[:10] + "-anxiety.json", "w")
			json.dump(data, f)
			f.close()
			ret= True
			print("Created anxiety file for " + date[:10])
		except Exception:
			traceback.print_exc()

		return ret

# start up server on localhost & on port 8080 with cors enabled		
if __name__ == '__main__':
   config = {'server.socket_host': '127.0.0.1',
	'server.socket_port':8080,
	'cors.expose.on': True,
	}

   cherrypy_cors.install()
   cherrypy.config.update(config)
   cherrypy.quickstart(WebService())
#	
#	FILE:			processor.py
#	PROJECT:		HeRVY (Capstone)
#	FIRST VERSION:	March 20, 2020
#	PROGRAMMER:		Emily Goodwin
#	DESCRIPTION:	Contains the actual heart rate processing methods that determine anxiety.
#	

import json
import pandas as pd
import datetime
from scipy import signal
import matplotlib.pyplot as plt
import numpy
import sys
import traceback

#	Class: 		Processor
#	Description:This class is the brains behind the HeRVY system.
#				When given heart rate data, the system will iterate through the 
# 				data and determine the times the user was anxious. If given anxious times
# 				the application can find daily and weekly patterns depending on the occurrence times
# 				
# 				This application was created as a prototype in a limited time frame and 
# 				there are many improvements that could be made.  
class Processor:

	#
	# Method:		find_anxious_times
	# Description:	Given a dataframe containing heart rate values for a time period,
	#				find the times they appear to be anxious. 
	# 				
	# 				Reads in 5 minute increments and decides based on an arbitrary
	# 				system devised from PhysioNet's Non-EEG heart rate data. 
	#  				To filter out noise, calculates based off of a fifteen minute increment's
	#				anxiety score. If the fifteen minute period has an anxiety score above 0.8,
	#				mark the user as anxious for the given time.
	#
	# Parameters:
	# 	dataFrame - the dataframe containing the heart rate values
	# 
	# 	example:
	#           time  value                  datetime
	# 0     07:39:00     70 2020-04-07 07:39:00+00:00
	# 1     07:39:05    101 2020-04-07 07:39:05+00:00
	# 2     07:39:10    108 2020-04-07 07:39:10+00:00
	# 3     07:39:15    118 2020-04-07 07:39:15+00:00
	# 4     07:39:20    117 2020-04-07 07:39:20+00:00
	# ...        ...    ...                       ...
	# 2033  16:46:20     70 2020-04-07 16:46:20+00:00
	# 2034  16:47:05     70 2020-04-07 16:47:05+00:00
	# 2035  16:47:20     70 2020-04-07 16:47:20+00:00
	# 2036  17:00:40     70 2020-04-07 17:00:40+00:00
	# 2037  17:00:55     70 2020-04-07 17:00:55+00:00
	#
	# Return:		
	#	Returns the start and end times of anxiety along with the anxiety score. 
	# 	example:
	#            start times            end times  anxiety values
	# 0  2020-04-12 14:25:00  2020-04-12 14:55:00               4
	# 1  2020-04-12 14:30:00  2020-04-12 15:00:00               4
	# 2  2020-04-12 14:40:00  2020-04-12 15:10:00               4
	def find_anxious_times (self, dataFrame):
		try:
			start = dataFrame["datetime"][0].replace(hour=0, minute=0, second=0)
			end = dataFrame["datetime"][0].replace(hour=0, minute=5, second=0)
			smoothedData = pd.DataFrame(signal.savgol_filter(dataFrame["value"], 5, 1, axis=0))
			smoothedData = smoothedData.dropna()
			dataFrame = dataFrame.assign(value=smoothedData)
			anxietyData = []
			restingAvg = dataFrame.min()["value"]
			while (start.date() == dataFrame["datetime"][0].date()):
				five_minute_data = dataFrame[(dataFrame["datetime"] > start) & (dataFrame["datetime"] < end)]
				if not five_minute_data.empty:
					mean = five_minute_data.loc[:,"value"].mean()
					mode = five_minute_data.loc[:,"value"].mode()[0]
					variance = five_minute_data.loc[:,"value"].var()
					# if mean & mode are near each other
					if ((mean - mode >=5) | (mode - mean >=5)):
						# and the current average is more than 8 higher than the resting average 
						if (float(float(mean) - float(restingAvg)) >= float(8)):
							# the user is anxious
							anxietyData.append(1)
						elif (variance > 30):
							# the user is probably anxious
							anxietyData.append(0.8)
					else:
						anxietyData.append(0)
				else:
					anxietyData.append(0)

				start = start + datetime.timedelta(0,5*60)
				end = end + datetime.timedelta(0,5*60)

			print(anxietyData)

			curIndex = 0
			lastHalfHour = pd.Series([0,0,0])
			seriesIndex = 0
			anxiousTimesStart = pd.Series(dtype="string")
			anxiousTimesEnd = pd.Series(dtype="string")
			lastAnxiousTimeEnd = None
			anxiousValues = pd.Series()
			anxiousDataFrame = pd.DataFrame()
			# so there are 6 pieces of data for every half an hour
			# if anxiety data is greater than 3.5, lets say they were anxious in that time period
			while (curIndex < len(anxietyData)):
				lastHalfHour[seriesIndex] = anxietyData[curIndex]
				seriesIndex = seriesIndex+1
				if (seriesIndex > 3):
					seriesIndex = 0
				if (lastHalfHour.sum() > 0.9):
					endTimeDelta = datetime.timedelta(seconds =((curIndex + 1) * 5 * 60)) # index + 1 *5 *60
					startTimeDelta = datetime.timedelta(seconds =(((curIndex + 1) * 5 * 60) - 15*60))
					if (lastAnxiousTimeEnd != None) and (startTimeDelta < lastAnxiousTimeEnd):
						anxiousTimesEnd.iloc[-1] = str(dataFrame["datetime"][0].replace(hour=0,minute=0,second=0,tzinfo=None)+ endTimeDelta)
						anxiousValues.iloc[-1] = (anxiousValues.iloc[-1]+lastHalfHour[seriesIndex])
					else:
						anxiousTimesEnd = anxiousTimesEnd.append(pd.Series([str(dataFrame["datetime"][0].replace(hour=0,minute=0,second=0,tzinfo=None)+ endTimeDelta)]), ignore_index = True)
						anxiousTimesStart = anxiousTimesStart.append(pd.Series([str(dataFrame["datetime"][0].replace(hour=0,minute=0,second=0,tzinfo=None)+ startTimeDelta)]), ignore_index = True)
						anxiousValues = anxiousValues.append(pd.Series([lastHalfHour.sum()]), ignore_index = True)
					lastAnxiousTimeEnd = endTimeDelta
				curIndex = curIndex+1

			anxiousDataFrame["start times"] = anxiousTimesStart
			anxiousDataFrame["end times"] = anxiousTimesEnd
			anxiousDataFrame["anxiety values"] = anxiousValues
			print(anxiousDataFrame)
			return anxiousDataFrame.to_json()
		except Exception:
			traceback.print_exc()
		return "error"

	#
	# Method:		daily_pattern
	# Description:	Given a dataframe containing anxious times, find the daily patterns.
	# 				Reads through the start times and tracks what hours there are anxious spells.
	# 				Only reads each hour for each day once since it may be continous anxiety.
	#  
	# Parameters:
	# 	dataFrame - the dataframe containing the start and end times to analyze
	# 	example:
	#            start times            end times  anxiety values
	# 0  2020-04-12 14:25:00  2020-04-12 14:55:00               4
	# 1  2020-04-12 14:30:00  2020-04-12 15:00:00               4
	# 2  2020-04-12 14:40:00  2020-04-12 15:10:00               4
	#
	# Return:		
	#	Returns all the hours in the day along with how many times they were anxious at that
	#	hour in the given data
	# 	example:
	# 	"{\"0\":0,\"1\":0,\"2\":0,\"3\":0,\"4\":0,\"5\":0,\"6\":0,\"7\":1,\"8\":1,\"9\":1,\"10\":1,\"11\":0,\"12\":1,\"13\":0,\"14\":0,\"15\":0,\"16\":0,\"17\":0,\"18\":0,\"19\":0,\"20\":0,\"21\":0,\"22\":0,\"23\":0}"
	#
	def daily_pattern(self, dataFrame):
		anxietyData = dataFrame

		anxiousDayTimes = pd.Series(0,numpy.arange(0,24))

		lastDateString = ""
		for index,row in anxietyData.iterrows():
			date = datetime.datetime.strptime(row[0], "%Y-%m-%d %H:%M:%S")
			# get datetime string up to the hour so we dont have repeats
			dateCompString = row[0][0:13]
			if (dateCompString != lastDateString ):
				anxiousDayTimes.loc[date.hour] = anxiousDayTimes.loc[date.hour] +1
				lastDateString = dateCompString
				print(lastDateString)
		
		print(anxiousDayTimes)
		return anxiousDayTimes.to_json()

	#
	# Method:		weekly_pattern
	# Description:	Given a dataframe containing anxious times, find the weekly patterns.
	# 				Reads through the start times and tracks what hours/days there are anxious spells.
	# 				Only reads each hour for each day once since it may be continous anxiety.
	#  
	# Parameters:
	# 	dataFrame - the dataframe containing the start and end times to analyze
	# 	example:
	#            start times            end times  anxiety values
	# 0  2020-04-12 14:25:00  2020-04-12 14:55:00               4
	# 1  2020-04-12 14:30:00  2020-04-12 15:00:00               4
	# 2  2020-04-12 14:40:00  2020-04-12 15:10:00               4
	#
	# Return:		
	#	Returns all the hours in the day for each day of the week along with
	#   how many times they were anxious at that hour in the given data
	# 	example:
	# 	"{\"0\":{\"0\":0,\"1\":0,\"2\":0,\"3\":0,\"4\":0,\"5\":0,\"6\":0,\"7\":0,\"8\":0,\"9\":0,\"10\":0,\"11\":0,\"12\":0,\"13\":0,\"14\":0,\"15\":0,\"16\":0,\"17\":0,\"18\":0,\"19\":0,\"20\":0,\"21\":0,\"22\":0,\"23\":0},\"1\":{\"0\":0,\"1\":0,\"2\":0,\"3\":0,\"4\":0,\"5\":0,\"6\":0,\"7\":1,\"8\":1,\"9\":1,\"10\":1,\"11\":0,\"12\":1,\"13\":0,\"14\":0,\"15\":0,\"16\":0,\"17\":0,\"18\":0,\"19\":0,\"20\":0,\"21\":0,\"22\":0,\"23\":0},\"2\":{\"0\":0,\"1\":0,\"2\":0,\"3\":0,\"4\":0,\"5\":0,\"6\":0,\"7\":0,\"8\":0,\"9\":0,\"10\":0,\"11\":0,\"12\":0,\"13\":0,\"14\":0,\"15\":0,\"16\":0,\"17\":0,\"18\":0,\"19\":0,\"20\":0,\"21\":0,\"22\":0,\"23\":0},\"3\":{\"0\":0,\"1\":0,\"2\":0,\"3\":0,\"4\":0,\"5\":0,\"6\":0,\"7\":0,\"8\":0,\"9\":0,\"10\":0,\"11\":0,\"12\":0,\"13\":0,\"14\":0,\"15\":0,\"16\":0,\"17\":0,\"18\":0,\"19\":0,\"20\":0,\"21\":0,\"22\":0,\"23\":0},\"4\":{\"0\":0,\"1\":0,\"2\":0,\"3\":0,\"4\":0,\"5\":0,\"6\":0,\"7\":0,\"8\":0,\"9\":0,\"10\":0,\"11\":0,\"12\":0,\"13\":0,\"14\":0,\"15\":0,\"16\":0,\"17\":0,\"18\":0,\"19\":0,\"20\":0,\"21\":0,\"22\":0,\"23\":0},\"5\":{\"0\":0,\"1\":0,\"2\":0,\"3\":0,\"4\":0,\"5\":0,\"6\":0,\"7\":0,\"8\":0,\"9\":0,\"10\":0,\"11\":0,\"12\":0,\"13\":0,\"14\":0,\"15\":0,\"16\":0,\"17\":0,\"18\":0,\"19\":0,\"20\":0,\"21\":0,\"22\":0,\"23\":0},\"6\":{\"0\":0,\"1\":0,\"2\":0,\"3\":0,\"4\":0,\"5\":0,\"6\":0,\"7\":0,\"8\":0,\"9\":0,\"10\":0,\"11\":0,\"12\":0,\"13\":0,\"14\":0,\"15\":0,\"16\":0,\"17\":0,\"18\":0,\"19\":0,\"20\":0,\"21\":0,\"22\":0,\"23\":0}}"
	#
	def weekly_pattern(self, dataFrame):
		anxietyData = dataFrame
		anxiousWeekTimes = pd.DataFrame(0,
			columns=numpy.arange(0,7), # 0 is monday, 6 is sunday
			index=numpy.arange(0,24)
		)
		lastDateString = ""
		for index,row in anxietyData.iterrows():
			date = datetime.datetime.strptime(row[0], "%Y-%m-%d %H:%M:%S")
			dateCompString = row[0][0:13]
			weekday = date.weekday()
			if (dateCompString != lastDateString ):
				anxiousWeekTimes.loc[date.hour, weekday] = anxiousWeekTimes.loc[date.hour, weekday]+1 
				lastDateString = dateCompString
				print(lastDateString)
		
		print(anxiousWeekTimes)
		return anxiousWeekTimes.to_json()

	#
	# Method:		is_user_anxious
	# Description:	Given a dataframe with heart rate data, a date, and the time, is the user anxious
	# 				at this time? 
	#				Hour must be in 00:00 format with preceeding 0 if under 10
	#  
	# Parameters:
	# 	dataFrame - the heart rate data
	#		example:
	#           time  value                  datetime
	# 0     07:39:00     70 2020-04-07 07:39:00+00:00
	# 1     07:39:05    101 2020-04-07 07:39:05+00:00
	# 2     07:39:10    108 2020-04-07 07:39:10+00:00
	# 3     07:39:15    118 2020-04-07 07:39:15+00:00
	# 4     07:39:20    117 2020-04-07 07:39:20+00:00
	# ...        ...    ...                       ...
	# 2033  16:46:20     70 2020-04-07 16:46:20+00:00
	# 2034  16:47:05     70 2020-04-07 16:47:05+00:00
	# 2035  16:47:20     70 2020-04-07 16:47:20+00:00
	# 2036  17:00:40     70 2020-04-07 17:00:40+00:00
	# 2037  17:00:55     70 2020-04-07 17:00:55+00:00
	#
	#	date - the date to analyze
	# 	time - the time to analyze
	#
	# Return:	
	#	returns a boolean true or false if the user is anxious or not.
	def is_user_anxious(self, dataFrame, date, time):
		anxious = False
		hour = int(time[:2])
		minute = int(time[3:5])
		start = date.replace(hour=hour, minute = minute, second=0)
		end = start + datetime.timedelta(seconds=(15*60)) # add fifteen minutes to time to check for
		dtRange = dataFrame.loc[dataFrame['datetime'].between(start, end, inclusive = True)]
		print(dtRange)

		dtRange = dtRange.reset_index()
		if (not dtRange.empty):
			results = json.loads(self.find_anxious_times(dtRange))
			print(results)
			if (len(results["anxiety values"])>= 1):
				anxious= True

		return anxious

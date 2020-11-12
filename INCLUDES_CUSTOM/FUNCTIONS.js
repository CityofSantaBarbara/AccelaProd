function addRefContactToRecord(refNum, cType) {
    itemCap = capId;
    if (arguments.length > 2)
        itemCap = arguments[2];
    var refConResult = aa.people.getPeople(refNum);
    if (refConResult.getSuccess()) {
        var refPeopleModel = refConResult.getOutput();
        if (refPeopleModel != null) {
            pm = refPeopleModel;
            pm.setContactType(cType);
            pm.setFlag("N");
            pm.setContactAddressList(getRefAddContactList(refNum));
            
            var result = aa.people.createCapContactWithRefPeopleModel(itemCap, pm);
            if (result.getSuccess()) {
                logDebug("Successfully added the contact");
            } else {
                logDebug("Error creating the applicant " + result.getErrorMessage());
            }
                      
        }
    }
}

//********************************************************************************************************
//Script 		settingsLookup
//Record Types:	?n/a
//
//Event: 		n/a
//
//Desc:			given a lookup table name (std choice table), lookupValue, and the application type, search 
// 				through the lookup table to see if the the value is found and return the corresponding result
//				this function will look for a match in the look up table by starting with the 
//				fully defined application type and if not found continue to apply a wild cards
//				until a match is made.  this strategy provides a heirarchial approach where 
//				fully identified apptypes definitions will take precidence over the wild card defoinitions.
//Created By: Silver Lining Solutions 
//********************************************************************************************************
// Change Log
//         		Date		Name			Modification
//				9/21/2018	Eric			Original Development
//********************************************************************************************************
function appTypePriorityLookup(lookupTableName,lookupValue,appType)
{
	logDebug("settingsLookup - Begin");
	
	var appTypeArray = appType.split("/");

		
	// start with full appType
	var lookupString = appTypeString + "|" + lookupValue;
	logDebug("lookupString = " + lookupString);
	var lookupResult = lookup(lookupTableName, lookupString);
	logDebug("Full lookupValue = " + lookupResult);

	// perform lookup with 1 levels of appType wild cards
	if (!lookupResult)
	{
		lookupString = appTypeArray[0] + "/" + appTypeArray[1] + "/" + appTypeArray[2] + "/*" + "|" + lookupValue;
		logDebug("lookupString = " + lookupString);
		lookupResult = lookup(lookupTableName, lookupString);
		logDebug("1 Wild lookupValue = " + lookupResult);	
	}
	
	// perform lookup with 2 levels of appType wild cards
	if (!lookupResult)
	{
		lookupString = appTypeArray[0] + "/" + appTypeArray[1] + "/*/*" + "|" + lookupValue;
		logDebug("lookupString = " + lookupString);
		lookupResult = lookup(lookupTableName, lookupString);
		logDebug("2 Wild lookupValue = " + lookupResult);	
	}
	
	// perform lookup with 3 levels of appType wild cards
	if (!lookupResult)
	{
		lookupString = appTypeArray[0] + "/*/*/*" + "|" + lookupValue;
		logDebug("lookupString = " + lookupString);
		lookupResult = lookup(lookupTableName, lookupString);
		logDebug("3 Wild lookupValue = " + lookupResult);	
	}

	// perform lookup with 4 levels of appType wild cards
	if (!lookupResult)
	{
		lookupString = "*/*/*/*|" + lookupValue;
		logDebug("lookupString = " + lookupString);
		lookupResult = lookup(lookupTableName, lookupString);
		logDebug("3 Wild lookupValue = " + lookupResult);	
	}

	logDebug("appTypePriorityLookup - End");
	return lookupResult;

}
//********************************************************************************************************
//Script 		Assessing Fees - Zero Balance Validation  *** Script # 7 
//Record Types:	?*/*/*/*
//
//Event: 		this script may be triggered from IRSB & WTUB
//
//Desc:			For all Inspection Results, lookup in the ValidationZeroBalance Standard Choice table
//				to see if a zeroBalance validation should be performed.  The lookup uses the following 
//				'|' delimeted format:
//
//				For Workflow:
//				format : appTypeString + "|" + wfTask + "|" + wfStatus
//				example: Fire/Alarm System/NA/NA|Application Submittal|Accepted
//				example: Building/Residential/New/NA|Permit Issuance|Issued
//				example: Fire/*/*/*|Permit Issuance|Issued
//
//				For Inspections:
//				format : appTypeString + "|" + inspGroup + "|" + InspType + "|" + inspResult
//				example: Fire/Alarm System/NA/NA|FIRE_SA|Final|Passed
//				example: Fire/*/*/*|FIRE_SA|Fire Final|Passed
//				example: Building/Residential/New/NA|BLD Residential|Building Final|OK for Service
//
//Created By: Silver Lining Solutions 
//********************************************************************************************************
// Change Log
//         		Date		Name			Modification
//				8/7/2018	Eric			Original Development
//				8/21/2018	Eric			Added code to allow for record type wild cards
//********************************************************************************************************
function assessingFeesZeroBalanceValidation(triggerEvent)
{
	showMessage = true;
	logDebug("Script Assessing Fees - Zero Balance Validation - Begin");
	logDebug("BalanceDue = " + balanceDue);
	logDebug("controlString = " + controlString);
	logDebug("triggerEvent = " + triggerEvent);
	
	var appTypeArray = appTypeString.split("/");
	
	// perform lookup with fully defined record type
	if (triggerEvent == "Workflow")
		{var lookupString = appTypeString + "|" + wfTask + "|" + wfStatus;}
	else if (triggerEvent == "Inspection")
		{var lookupString = appTypeString + "|" + inspGroup + "|" + inspType + "|" + inspResult;}

	logDebug("lookupString = " + lookupString);

	var lookupValue = lookup("ValidationZeroBalance", lookupString);
	logDebug("Full lookupValue = " + lookupValue);
	
	// perform lookup with 1 levels of wild cards
	if (!lookupValue)
	{
		logDebug("Script Assessing Fees - lookup with 1 wild card");
		if (triggerEvent == "Workflow")
			{var lookupString = appTypeArray[0] + "/" + appTypeArray[1] + "/" + appTypeArray[2] + "/*" + "|" + wfTask + "|" + wfStatus;}
		else if (triggerEvent == "Inspection")
			{var lookupString = appTypeArray[0] + "/" + appTypeArray[1] + "/" + appTypeArray[2] + "/*" + "|" + inspGroup + "|" + inspType + "|" + inspResult;}
		
		logDebug("lookupString = " + lookupString);

		lookupValue = lookup("ValidationZeroBalance", lookupString);
		logDebug("1 Wild lookupValue = " + lookupValue);	
	}

	// perform lookup with 2 levels of wild cards
	if (!lookupValue)
	{
		logDebug("Script Assessing Fees - lookup with 2 wild cards");
		if (triggerEvent == "Workflow")
			{var lookupString = appTypeArray[0] + "/" + appTypeArray[1] + "/*/*" + "|" + wfTask + "|" + wfStatus;}
		else if (triggerEvent == "Inspection")
			{var lookupString = appTypeArray[0] + "/" + appTypeArray[1] + "/*/*" + "|" + inspGroup + "|" + inspType + "|" + inspResult;}

		logDebug("lookupString = " + lookupString);

		lookupValue = lookup("ValidationZeroBalance", lookupString);
		logDebug("2 Wild lookupValue = " + lookupValue);	
	}

	// perform lookup with 3 levels of wild cards
	if (!lookupValue)
	{
		logDebug("Script Assessing Fees - lookup with 3 wild cards");
		if (triggerEvent == "Workflow")
			{var lookupString = appTypeArray[0] + "/*/*/*" + "|" + wfTask + "|" + wfStatus;}
		else if (triggerEvent == "Inspection")
			{var lookupString = appTypeArray[0] + "/*/*/*" + "|" + inspGroup + "|" + inspType + "|" + inspResult;}
		
		logDebug("lookupString = " + lookupString);

		lookupValue = lookup("ValidationZeroBalance", lookupString);
		logDebug("3 Wild lookupValue = " + lookupValue);	
	}

	if (lookupValue && balanceDue > 0)
	{
		logDebug("lookupValue matched in ValidationZeroBalance table");
		comment("This Action may not be completed while there is a Balance on the Record.");
		cancel = true;
	}

	logDebug("Script Assessing Fees - Zero Balance Validation - End");
}

// Script # &

function associateMessagesToRecords(messages)
{
	if(messages){
		var i = 0;  var len = messages.length; 
		logDebug("<br> PROCESSING "+len+" MESSAGES THIS TIME!");
		var assocSuccessCnt = 0;
		while(i < len)
		{
			logDebug("<br> Now processing message number:"+i);
			var message = messages[i];
			var content = message.getTitle();
			var cmId = message.getCmId();
			var altId = parseAltIdFromContent(content);
			var messageBody = message.getContent();
			var messageModel = message.getModel();
			var messageFrom = messageModel.getFromString();
			var messageTo = messageModel.getToString();
			
			if (altId)
			{
				var altIdResult= new String(parseAltIdFromContent(content));
				var altIdMatch = altIdResult.split(',');
				logDebug("<br> Subject: " + content);
				logDebug("<br> Record ID from the Subject Line: " + altIdMatch);
				logDebug("<br> msg from:"+messageFrom);
				logDebug("<br> msg Body:"+messageBody);
				
				var altIdStrArr = altIdMatch[1].split(' ');
				var altId = altIdStrArr[0].toUpperCase();

				aa.communication.associateEnities(cmId, altId, 'RECORD');
				logDebug("<br> Successfully associated message with Record: " + altId + " TO THE COMM ID:"+cmId);
				assocSuccessCnt += 1; 
				break;
			}
			else
			{
				logDebug("<br> Record ID not found, sending bounce back email.");
				email(messageTo, scriptAgencyEmailFrom, bouncebackSubject + ": " + content, bouncebackBody + ": <br><br>" + messageBody);
				break;
			}
			i++;
		}
	}
	if (sendDebugEmail)
	{
//		var bugDte = new Date();
		var bugDte = "11-09-2018 at the time I say";
		var debugTitle = "Debug log from INCLUDES CUSTOM CommunicationReceivingEmailAfter Event Script on " + bugDte;
		
		logDebug("<br>"+"trying to send an DEBUG email from inside .INCLUDES CUSTOM.associateMessagesToRecords");
		logDebug("<br>"+">>>>>>>>>>>>>> debugEmailAddress:"+debugEmailAddress);
		logDebug("<br>"+">>>>>>>>>>>>>> scriptAgencyEmailFrom:"+scriptAgencyEmailFrom);
		logDebug("<br>"+">>>>>>>>>>>>>> debugTitle:"+debugTitle);
		logDebug("<br>"+">>>>>>>>>>>>>> assocSuccessCnt:"+assocSuccessCnt);
		
		email(debugEmailAddress, scriptAgencyEmailFrom, "no debug date in INCLUDES CUSTOM.associateMessagesToRecords", debug);
//		email(debugEmailAddress, scriptAgencyEmailFrom, debugTitle, debug);
	}
	if ( assocSuccessCnt > 0 ) {
		return true;
	}
	else {
		return false;
	}
}

//********************************************************************************************************
//Script 		Check Fire Final Inspection
//Record Types:	Building/Commercial/New/NA  Building/Commercial/Addition/NA Building/Commercial/Alteration/NA
//
//Event: 		WTUB 
//
//Desc:			When user try to issue the Building records ,system will check wheather there is an Fire 
// 				Final Inspection or not and the status of inspection should be resulted as passed.  
//				
//
//Assumptions:
//				
//				
//
//Psuedo Code:	
// 				
//
//Created By: Civic Tech Pro
//********************************************************************************************************
// Change Log
//         		Date		Name			Modification
//				12/10/2018	Michael 		Initial Development
//				02/19/2019	Michael 		Bug Fixed
//                              03/6/2019       ash			use comment instead of logdebug
//				
//											
//********************************************************************************************************

function checkFireFinalInspection(){
	var inspArrObj = aa.inspection.getInspections(capId);
	if(inspArrObj.getSuccess()){

		inspArr = inspArrObj.getOutput();
		if(inspArr.length < 1){
			cancel = true;
			comment("<font color=red><b>You don't have a Fire Department Final Inspection, please add one.</b></font>");
		}
		
		var hasFireFinalInsp = false;
		for(var i=0;i<inspArr.length;i++){

			var inspModScript = inspArr[i];
			var inspMod = inspModScript.getInspection();
			//aa.print(inspMod.getInspectionGroup()+","+inspMod.getInspectionType())
			
			if(inspMod.getInspectionGroup() !="BLD GENERAL" && inspMod.getInspectionType() !="Fire Final" ){
				continue;
			}else{
				hasFireFinalInsp = true;
			}
			
			
			if(inspMod.getInspectionStatus()!="Passed"){
				cancel = true;
				//aa.print("<font color=red><b>Please result the Fire Department Final Inspection as Passed.</b></font>");
				comment("CapID = "+capId.getCustomID()+". Please result the Fire Department Final Inspection as Passed.");
			}
		}
		
		if(!hasFireFinalInsp){
			comment("<font color=red><b>You don't have a Fire Department Final Inspection, please add one.</b></font>");
		}
	}
}

/*
* Checks all agency holiday calendars for an event on the specified date
* Returns true if there is an event, else false
* date - javascript date object
*/
function checkHolidayCalendar(date){
	try {
		//check if this is a weekend and return true if yes
		var dayOfWeek = date.getDay();
		if (dayOfWeek == 0 || dayOfWeek == 6) return true;
		//now check the calendar
		var holiday = false;
		var calArr = new Array();
		var agency = aa.getServiceProviderCode()
		//get the holiday calendars
		var initialContext = aa.proxyInvoker.newInstance("javax.naming.InitialContext", null).getOutput();
		var ds = initialContext.lookup("java:/AA");
		var conn = ds.getConnection();
		var selectString = "select * from CALENDAR WHERE SERV_PROV_CODE = ? AND CALENDAR_TYPE='AGENCY HOLIDAY' AND  REC_STATUS='A'";
		var sStmt = conn.prepareStatement(selectString);
		sStmt.setString(1, agency);
		var rSet = sStmt.executeQuery();
		while (rSet.next()) {
			calArr.push(rSet.getString("CALENDAR_ID"));
		}
		sStmt.close();
		for (var c in calArr){
			var cal = aa.calendar.getCalendar(calArr[c]).getOutput();
			var events = aa.calendar.getEventSeriesByCalendarID(calArr[c], date.getYear()+1900, date.getMonth()+1).getOutput();
			for (var e in events){
				var event = events[e];
				var startDate = new Date(event.getStartDate().getTime());
				var startTime = event.getStartTime();
				var endDate = event.getEndDate();
				var allDay = event.isAllDayEvent();
				var duration = event.getEventDuration();
				if (dateDiff(startDate,date) >= 0  && dateDiff(startDate,date) < 1){
					holiday = true;
				}
			}
		}
		return holiday;
	}
	catch(r){ aa.print(r); logDebug(r) }
}

/*
* Checks all agency holiday calendars for an event on the specified date
* Returns true if there is an event, else false
* date - javascript date object
*/
function checkHolidayCalendarIgnoreWeekends(date){
	try{
	//check if this is a weekend and return true if yes
	//var dayOfWeek = date.getDay();
 	if (dayOfWeek == 0 || dayOfWeek == 6) return true;
 	
	//now check the calendar
	var holiday = false;
	var calArr = new Array();
	var agency = aa.getServiceProviderCode()
	//get the holiday calendars
	var initialContext = aa.proxyInvoker.newInstance("javax.naming.InitialContext", null).getOutput();
	var ds = initialContext.lookup("java:/AA");
	var conn = ds.getConnection();
	var selectString = "select * from CALENDAR WHERE SERV_PROV_CODE = ? AND CALENDAR_TYPE='AGENCY HOLIDAY' AND  REC_STATUS='A'";
	var sStmt = conn.prepareStatement(selectString);
	sStmt.setString(1, agency);
	var rSet = sStmt.executeQuery();
	while (rSet.next()) {
		calArr.push(rSet.getString("CALENDAR_ID"));
	}
	sStmt.close();
	for (var c in calArr){
		var cal = aa.calendar.getCalendar(calArr[c]).getOutput();
		var events = aa.calendar.getEventSeriesByCalendarID(calArr[c], date.getYear()+1900, date.getMonth()+1).getOutput();
		for (var e in events){
			var event = events[e];
			var startDate = new Date(event.getStartDate().getTime());
			var startTime = event.getStartTime();
			var endDate = event.getEndDate();
			var allDay = event.isAllDayEvent();
			var duration = event.getEventDuration();
			if (dateDiff(startDate,date) >= 0  && dateDiff(startDate,date) < 1){
				holiday = true;
			}
		}
	}
	return holiday;
	}
	catch(r){aa.print(r);}
}

/*
* Checks PLN_NON_WORKING_DAYS calendar for an event on the specified date
* Returns true if there is an event, else false
* date - javascript date object
*
* This is used to exclude days that planning dept is not open/working
*/
function checkHolidayCalendar_Planning(date){
	try {
		//check if this is a weekend and return true if yes
		var dayOfWeek = date.getDay();
		if (dayOfWeek == 0 || dayOfWeek == 6) return true;
		//now check the calendar
		var holiday = false;
		var calArr = new Array();
		var agency = aa.getServiceProviderCode()
		//get the holiday calendars
		var initialContext = aa.proxyInvoker.newInstance("javax.naming.InitialContext", null).getOutput();
		var ds = initialContext.lookup("java:/AA");
		var conn = ds.getConnection();
		var selectString = "select * from CALENDAR WHERE SERV_PROV_CODE = ? AND CALENDAR_NAME = 'PLN_NON_WORKING_DAYS'";
		
		var sStmt = conn.prepareStatement(selectString);
		sStmt.setString(1, agency);
		var rSet = sStmt.executeQuery();
		while (rSet.next()) {
			calArr.push(rSet.getString("CALENDAR_ID"));
		}
		sStmt.close();
		for (var c in calArr){
			var cal = aa.calendar.getCalendar(calArr[c]).getOutput();
			var events = aa.calendar.getEventSeriesByCalendarID(calArr[c], date.getYear()+1900, date.getMonth()+1).getOutput();
			for (var e in events){
				var event = events[e];
				var startDate = new Date(event.getStartDate().getTime());
				var startTime = event.getStartTime();
				var endDate = event.getEndDate();
				var allDay = event.isAllDayEvent();
				var duration = event.getEventDuration();
				if (dateDiff(startDate,date) >= 0  && dateDiff(startDate,date) < 1){
					holiday = true;
				}
			}
		}
		return holiday;
	}
	catch(r){ aa.print(r); logDebug(r) }
}

//********************************************************************************************************
//Script 		checkPBWRightOfWayConflicts
//
//Record Types:	Public Works Right of Way Management scripting
//
//Event: 		usually Fired at ACA and in PageFlow for these record types 
//
//Desc:			Find all open ROW records with conflicting work dates on same streets 
//
//Created By: Silver Lining Solutions
//********************************************************************************************************
// Change Log
//			Date		Name		Modification
//			01-16-2019	Chad		Created
//			01-16-2019	Chad		Added in publicUser logic
//			01-21-2019	Chad		Add condition when triggered from event
//			01-22-2019	Chad		More logic to get correct cap when called from aca
//			01-23-2019	Chad		capId is null coming into this in back office now too.
//			01-30-2019	Chad		added street direction logic
//			02-04-2019	Chad		Workflow task name change
//********************************************************************************************************
function checkPBWRightOfWayConflicts () {
logDebug("START checkPBWRightOfWayConflicts ");
logDebug(" checkpbwrow: public user is:"+publicUser);
if (typeof controlString != "undefined") { 
	logDebug(" checkpbwrow: control string is:"+controlString);
}
else {
	logDebug(" checkpbwrow: control string is: undefined");
}
logDebug(" checkpbwrow: capid is:"+capId);
logDebug(" checkpbwrow: work start date is:"+AInfo["Work Start Date"]);
logDebug(" checkpbwrow: work end date is:"+AInfo["Work End Date"]);

// get the ASIT and attach GIS objectds based on their values!
	var tpbwRowAddresses;
	
	if (!publicUser) {
		// force the cap Id to have something its getting reset somehow
		if (typeof(getCapId) != "undefined")
			capId = getCapId();

		if(capId == null){
			if(aa.env.getValue("CapId") != ""){
				sca = String(aa.env.getValue("CapId")).split("-");
				capId = aa.cap.getCapID(sca[0],sca[1],sca[2]).getOutput();
			}else if(aa.env.getValue("CapID") != ""){
				sca = String(aa.env.getValue("CapID")).split("-");
				capId = aa.cap.getCapID(sca[0],sca[1],sca[2]).getOutput();
			}
		}
		cap = aa.cap.getCap(capId).getOutput();

		var searchWorkStart = AInfo["Work Start Date"];
		var searchWorkEnd = AInfo["Work End Date"]
logDebug(" checkpbwrow: re loaded capid is:"+capId);
logDebug(" checkpbwrow: calling loadASITable");
		tpbwRowAddresses = loadASITable("PBW_ROWADDRESS", capId);
	}
	else if ( publicUser && (typeof controlString != "undefined") && controlString == "ConvertToRealCAPAfter")  {

// for some strange reason the capid and cap are getting reset so have to get them again
		if (typeof(getCapId) != "undefined")
			capId = getCapId();
		 
		if(capId == null){
			if(aa.env.getValue("CapId") != ""){
				sca = String(aa.env.getValue("CapId")).split("-");
				capId = aa.cap.getCapID(sca[0],sca[1],sca[2]).getOutput();
			}else if(aa.env.getValue("CapID") != ""){
				sca = String(aa.env.getValue("CapID")).split("-");
				capId = aa.cap.getCapID(sca[0],sca[1],sca[2]).getOutput();
			}
		}
		cap = aa.cap.getCap(capId).getOutput();


//		var cap = aa.env.getValue("CapModel");
//		var capId = cap.getCapID();
		var searchWorkStart = AInfo["Work Start Date"];
		var searchWorkEnd = AInfo["Work End Date"]
logDebug(" checkpbwrow: ctrca and re loaded capid is:"+capId);
logDebug(" checkpbwrow: public user but calling loadASITable");
		tpbwRowAddresses = loadASITable("PBW_ROWADDRESS", capId);
	}
	else if ( publicUser && (typeof controlString == "undefined")) {
		logDebug("you are public user and control string is not defined");
		var cap = aa.env.getValue("CapModel");
		var capId = cap.getCapID();
		var searchWorkStart = AInfo["Work Start Date"];
		var searchWorkEnd = AInfo["Work End Date"]
logDebug(" checkpbwrow: calling loadASITable4ACA");
		tpbwRowAddresses = loadASITable4ACA("PBW_ROWADDRESS",cap);
	}
	else { logDebug("END FALSE checkPBWRightOfWayConflicts "); return; }
	
	overLapRecs = [];
	
	if (tpbwRowAddresses && tpbwRowAddresses.length > 0) {
		for ( asitRow in tpbwRowAddresses ) {
			var asitStreetName = tpbwRowAddresses[asitRow]["Street Name"].toString().toUpperCase();
// street direction is not required so check for null
			if (tpbwRowAddresses[asitRow]["Direction"] && tpbwRowAddresses[asitRow]["Direction"].toString() != 'undefined' ) {
				var asitStreetDir = tpbwRowAddresses[asitRow]["Direction"].toString().toUpperCase();
			}
			else {
				var asitStreetDir = " ";
			}
			
			var asitStreetStartCheck = tpbwRowAddresses[asitRow]["Start Num"].toString().toUpperCase();
			var asitStreetEndCheck = tpbwRowAddresses[asitRow]["End Num"].toString().toUpperCase();

			var thisRowRecList = getROWOverlapStreetRecords( searchWorkStart, searchWorkEnd, asitStreetName, asitStreetDir, asitStreetStartCheck, asitStreetEndCheck );

			overLapRecs = overLapRecs.concat(thisRowRecList);
		}
	}
	else { 
		logDebug("no PBW_ROWADDRESS table information exists on this record:"+capId);
	}
	var unqOverLapRecs = [];
	if (overLapRecs.length > 0) unqOverLapRecs = uniqArray(overLapRecs);
	if (unqOverLapRecs.length > 0) {
		var checkMsg = "<Font Color=RED>Conflicting work in street may occur based upon application information."
						+"<br>Please verify dates, location, and traffic control description for further review."
						+"<br>OTHER project ids are:<br>     "+unqOverLapRecs.join("<br>     ")+"</Font Color>";
		comment(checkMsg);
		logDebug(checkMsg);
		
		//		if this is an event - it was called from asa or ctrca!
		
		if (typeof controlString != "undefined") { //must be an event...not a aca pageflow
		
			// place a condition on this record
			var conditionGroup = "PBW ROWM",
				conditionType = "Conflicting ROW Work",
				conditionName = "Conflicting ROW Work - Pre Record Submittal",
				conditionComment = "Conflicting work in street may occur based upon application information. Please verify dates, location, and traffic control description for further review.",
				impactCode = "Hold",
				condStatus = "Applied",
				auditStatus = "A",
				displayNotice = "Y",
				displayNoticeOnACA = "Y",
				condInheretible = "N",
				displayLongDesc = "Y";

			//Create new empty cap condition model and set the expected values.
			var newCondModel = aa.capCondition.getNewConditionScriptModel().getOutput();

			newCondModel.setCapID(capId);
			newCondModel.setConditionGroup(conditionGroup);
			newCondModel.setConditionType(conditionType);
			newCondModel.setConditionDescription(conditionName);
			newCondModel.setConditionComment(conditionComment);
			newCondModel.setLongDescripton(conditionComment);
			newCondModel.setDispConditionComment(conditionComment);
			newCondModel.setDispLongDescripton(displayLongDesc);
			newCondModel.setConditionStatus(condStatus);
			newCondModel.setEffectDate(sysDate);
			newCondModel.setIssuedDate(sysDate);
			newCondModel.setStatusDate(sysDate);
			newCondModel.setIssuedByUser(systemUserObj);
			newCondModel.setStatusByUser(systemUserObj);
			newCondModel.setAuditID(currentUserID);
			newCondModel.setAuditStatus(auditStatus);
			newCondModel.setDisplayConditionNotice(displayNotice);
			newCondModel.setDisplayNoticeOnACA(displayNoticeOnACA);
			newCondModel.setImpactCode(impactCode);
			newCondModel.setInheritable(condInheretible);
			newCondModel.setAdditionalInformation(checkMsg);

			aa.capCondition.createCapCondition(newCondModel);
			logDebug("ROWM Condition created!");
		}
	}
	else {
		if (typeof controlString != "undefined") { //must be an event...not a aca pageflow
			//advance the workflow  "Review of Conflicts" status of "Approved", comment "by EMSE"
			//advance the workflow "Review for Conflicts and Confirm Operating Division", comment "by EMSE"
			logDebug("closing workflow tasks");
			closeTask("Review for Conflicts","Approved","Closed by EMSE Script","");
			closeTask("Review for Conflicts and Confirm Operating Division","Approved","Closed by EMSE Script","");
			logDebug("done closing workflows");
		}
	}
logDebug("END checkPBWRightOfWayConflicts ");
}

//********************************************************************************************************
//Script 		script tracker 9 - Fire Sprinkler Monitoring
//Record Types:	Fire!Sprinkler System!Commercial - NFPA 13!NA 
//
//Event: 		this script may be triggered from WTUB and IRSA (b/c IRSA can close tasks and records)
//
//Desc:			If a NFPA 13 system has more than 6 sprinkler heads, the sprinkler permit cannot 
//				be finalled until a Fire Sprinkler Monitoring Alarm permit is finalled under the same
//				parent commercial building permit.
//
//Created By: Silver Lining Solutions
//********************************************************************************************************
// Change Log
//         		Date		Name			Modification
//			08-04-2018	Chad			Initial Draft
//			10-31-2018	Chad			Fixed bug where getChildren array was not handled properly
//********************************************************************************************************

function checkSprinklerHeadAndCancel() {
	logDebug("START of checkSprinklerHeadAndCancel");
	
	var numSprinklerHeads = AInfo["Total Number of Heads"] || 0;
	
	if (numSprinklerHeads > 6) {
		logDebug("checkSprinklerHeadAndCancel: number of sprinkler heads is greater than 6!");
		
		var sprkFireAlarmSys = getChildren("Fire/Alarm System/NA/NA");
		
		if (sprkFireAlarmSys) {
			var isSiblingFireSpklrMonitorAlarmClosed = taskStatus("Closed","",sprkFireAlarmSys[0]);
			logDebug("checkSprinklerHeadAndCancel: got Close wf status of:"+isSiblingFireSpklrMonitorAlarmClosed);

			if (isSiblingFireSpklrMonitorAlarmClosed != "Closed") {
				cancel = true;
				comment("<font color=red><b>Number of Sprinkler Heads is Greater than 6 AND Related Fire Alarm is Not Complete!</b></font>")
				logDebug("checkSprinklerHeadAndCancel: canceling!");
			}
		}
		else {
			cancel = true;
			comment("<font color=red><b>There is no Alarm System related to this Record! Please relate and update Inspection Workflow Task manually!</b></font>")
			logDebug("checkSprinklerHeadAndCancel: canceling!");
		}
	}
	logDebug("END of checkSprinklerHeadAndCancel");
	return cancel;
}

//********************************************************************************************************
//Script 		cloneREQToENF 
//Record Types:	?Enforcement/*/*/*
//
//Event: 		this script may be triggered from WorkflowTaskUpdateAfter.
//
//Desc:			When wfStatus = 'ENF Record Needed'  and wfTask = 'Request Received' create a case record 
//
//Created By: Silver Lining Solutions 
//********************************************************************************************************
// Change Log
//				Date		Name			Modification
//				06/24/2018	Chad			Original Development
//********************************************************************************************************
function cloneREQToENF()
{
	logDebug("about to clone ENF if wf is correct!");
	logDebug("wfstatus:"+wfStatus);
	logDebug("wfTask:"+wfTask)
			
	if ( wfStatus == "ENF Record Needed" && wfTask == "Request Status") {
		var newCaseID = createChild('Enforcement','Incident','Case','NA',capName);
		logDebug("new case:"+newCaseID);
		var newCaseIDGetCapResult = aa.cap.getCap(newCaseID);
		if (newCaseIDGetCapResult.getSuccess()) {
			var newCaseIDCap = newCaseIDGetCapResult.getOutput();
			var newCaseIDCapModel = newCaseIDCap.getCapModel();
			var dFileDateJava = convertDate(fileDate);
			newCaseIDCapModel.setFileDate(dFileDateJava);
			
			// owners are not copying correctly, so force it here
			copyOwner(capId, newCaseID);
// contacts are copying on create
//			copyContacts(capId, newCaseID);
			copyLicensedProf(capId, newCaseID);
/*cust*/	copyCapGISObjects(capId, newCaseID);
/*cust*/	copyAppSpecificInfo(capId, newCaseID);
			copyASITables(capId, newCaseID);
// copy the documents, yeah this a licencing function but it works!
			aa.cap.copyRenewCapDocument(capId, newCaseID,currentUserID);

			copyRecordAssignedStaff(capId, newCaseID);
			updateWorkDesc(workDescGet(capId),newCaseID);
		}
	}
}

//********************************************************************************************************
//Script 		copyAppSpecificInfo
//Event: 		
//Desc:			helper function to copy ASI  
//Created By: Silver Lining Solutions
//********************************************************************************************************
// Change Log
//         		Date        Name          Modification
//            07/10/2019	Chad          Created
//********************************************************************************************************
function copyAppSpecificInfo(srcCapId, targetCapId)
{
	//1. Get Application Specific Information with source CAPID.
	var  appSpecificResult = aa.appSpecificInfo.getByCapID(srcCapId);
	if (appSpecificResult.getSuccess()){
		appSpecificInfo = appSpecificResult.getOutput();
	}
	else return;
	
	if (appSpecificInfo == null || appSpecificInfo.length == 0)
	{
		return;
	}

	//2. Set target CAPID to source Specific Information.
	for (loopk in appSpecificInfo)
	{
		var sourceAppSpecificInfoModel = appSpecificInfo[loopk];
		sourceAppSpecificInfoModel.setPermitID1(targetCapId.getID1());
		sourceAppSpecificInfoModel.setPermitID2(targetCapId.getID2());
		sourceAppSpecificInfoModel.setPermitID3(targetCapId.getID3());	
		//3. Edit ASI on target CAP (Copy info from source to target)
		var appSpecEditOK = aa.appSpecificInfo.editAppSpecInfoValue(sourceAppSpecificInfoModel);
		if (appSpecEditOK.getSuccess()) {
			logDebug("app specific "+sourceAppSpecificInfoModel.checkboxDesc+" Added!");
		} else {
			logDebug("app specific "+sourceAppSpecificInfoModel.checkboxDesc+" NOT Added!");
		}
	}
}

//********************************************************************************************************
//Script 		copyCapGISObjects
//Event: 		
//Desc:			helper function to copy GIS Objects 
//Created By: Silver Lining Solutions
//********************************************************************************************************
// Change Log
//         		Date        Name          Modification
//            07/10/2019	Chad          Created
//********************************************************************************************************
function copyCapGISObjects(capIdFrom, capIdTo)
{
	var resultgetGISObjects = aa.gis.getCapGISObjects(capIdFrom);
	if (resultgetGISObjects.getSuccess()) {
		var fromCapGISObjects = resultgetGISObjects.getOutput();
		for (zz in fromCapGISObjects) {
			var thisGISServiceName = fromCapGISObjects[zz].gisServiceId;
			var thisGISLayer = fromCapGISObjects[zz].gisTypeId;
			var thisGisObjArray = fromCapGISObjects[zz].GISObjects;
			for (xx in thisGisObjArray) {
				var thisGISObjectGisId = thisGisObjArray[xx].gisId;
				var thisGISObjectObjectId = thisGisObjArray[xx].objectId;
				var addGISObjResult = aa.gis.addCapGISObject(capIdTo, thisGISServiceName, thisGISLayer, thisGISObjectGisId);
				if (addGISObjResult.getSuccess()) {
					logDebug("GIS Object "+thisGISServiceName+"."+thisGISLayer+"."+thisGISObjectGisId+" Added!");
				}
				else {
					logDebug("GIS Object NOT added: error:");
				}
			}
		}
	}	
}

//********************************************************************************************************
//Script 		copyRecordAssignedStaff
//Event: 		
//Desc:			helper function to copy record assigned staff value
//Created By: Silver Lining Solutions
//********************************************************************************************************
// Change Log
//         		Date        Name          Modification
//            07/10/2019	Chad          Created
//********************************************************************************************************
function copyRecordAssignedStaff(capIdFrom, capIdTo) {
	var cdScriptObjResult = aa.cap.getCapDetail(capIdFrom);
	if (!cdScriptObjResult.getSuccess()) {
		logDebug("**ERROR: No cap detail script object : " + cdScriptObjResult.getErrorMessage());
        return ""
	}
	var cdScriptObj = cdScriptObjResult.getOutput();
	if (!cdScriptObj) {
		logDebug("**ERROR: No cap detail script object");
		return ""
	}
	var cd = cdScriptObj.getCapDetailModel();
    var	userId=cd.getAsgnStaff();
	
	if ( userId ) {	assignCap(userId,capIdTo); }
	else { logDebug("No assigned user to copy"); }
}

function externalLP_CA_AT(licNum,rlpType,doPopulateRef,doPopulateTrx,itemCap)
	{

	/*
	Version: 3.2

	Usage:

		licNum			:  Valid CA license number.   Non-alpha, max 8 characters.  If null, function will use the LPs on the supplied CAP ID
		rlpType			:  License professional type to use when validating and creating new LPs
		doPopulateRef 	:  If true, will create/refresh a reference LP of this number/type
		doPopulateTrx 	:  If true, will copy create/refreshed reference LPs to the supplied Cap ID.   doPopulateRef must be true for this to work
		itemCap			:  If supplied, licenses on the CAP will be validated.  Also will be refreshed if doPopulateRef and doPopulateTrx are true

	returns: non-null string of status codes for invalid licenses

	examples:

	appsubmitbefore   (will validate the LP entered, if any, and cancel the event if the LP is inactive, cancelled, expired, etc.)
	===============
	true ^ cslbMessage = "";
	CAELienseNumber ^ cslbMessage = externalLP_CA(CAELienseNumber,CAELienseType,false,false,null);
	cslbMessage.length > 0 ^ cancel = true ; showMessage = true ; comment(cslbMessage)

	appsubmitafter  (update all CONTRACTOR LPs on the CAP and REFERENCE with data from CSLB.  Link the CAP LPs to REFERENCE.   Pop up a message if any are inactive...)
	==============
	true ^ 	cslbMessage = externalLP_CA(null,"CONTRACTOR",true,true,capId)
	cslbMessage.length > 0 ^ showMessage = true ; comment(cslbMessage);

	Note;  Custom LP Template Field Mappings can be edited in the script below
	*/

	var returnMessage = "";

	var workArray = new Array();
	if (licNum)
		workArray.push(String(licNum));

	if (itemCap)
		{
		var capLicenseResult = aa.licenseScript.getLicenseProf(itemCap);
		if (capLicenseResult.getSuccess())
			{
			var capLicenseArr = capLicenseResult.getOutput();  }
		else
			{ logDebug("**ERROR: getting lic prof: " + capLicenseResult.getErrorMessage()); return false; }

		if (capLicenseArr == null || !capLicenseArr.length)
			{ logDebug("**WARNING: no licensed professionals on this CAP"); }
		//else
			//{
			//for (var thisLic in capLicenseArr)
			//	if (capLicenseArr[thisLic].getLicenseType() == rlpType)
			//		workArray.push(capLicenseArr[thisLic]);
			//}
		}
	else
		doPopulateTrx = false; // can't do this without a CAP;

	for (var thisLic = 0; thisLic < workArray.length; thisLic++)
		{
		var licNum = workArray[thisLic];
		var licObj = null;
		var isObject = false;

		if (typeof(licNum) == "object")  // is this one an object or string?
			{
			licObj = licNum;
			licNum = licObj.getLicenseNbr();
			isObject = true;
			}

// Make the call to the California State License Board

		var document;
		var root;        
		var aURLArgList = "https://www2.cslb.ca.gov/IVR/License+Detail.aspx?LicNum=" + licNum;
		var vOutObj = aa.httpClient.get(aURLArgList);
		var isError = false;
		if(vOutObj.getSuccess()){
			var vOut = vOutObj.getOutput();
			var sr =  aa.proxyInvoker.newInstance("java.io.StringBufferInputStream", new Array(vOut)).getOutput();
			var saxBuilder = aa.proxyInvoker.newInstance("org.jdom.input.SAXBuilder").getOutput();
			document = saxBuilder.build(sr);
			root = document.getRootElement();
			errorNode = root.getChild("Error");
		}
		else{
			isError = true;
		}
		if (isError){
			logDebug("The CSLB web service is currently unavailable");
			continue;
		}
		else if (errorNode)
		{
			logDebug("Error for license " + licNum + " : " + errorNode.getText().replace(/\+/g," "));
			returnMessage+="License " + licNum +  " : " + errorNode.getText().replace(/\+/g," ") + " ";
			continue;
		}


		var lpBiz = root.getChild("BusinessInfo");
		var lpStatus = root.getChild("PrimaryStatus");
		var lpClass = root.getChild("Classifications");
		var lpBonds = root.getChild("ContractorBond");
		var lpWC = root.getChild("WorkersComp");

		// Primary Status
		// 3 = expired, 10 = good, 11 = inactive, 1 = canceled.   We will ignore all but 10 and return text.
		var stas = lpStatus.getChildren();
		for (var i=0 ; i<stas.size(); i++) {
			var sta = stas.get(i);

			if (sta.getAttribute("Code").getValue() != "10")
				returnMessage+="License:" + licNum + ", " + sta.getAttribute("Desc").getValue() + " ";
		}

		if (doPopulateRef)  // refresh or create a reference LP
			{
			var updating = false;

			// check to see if the licnese already exists...if not, create.

			var newLic = getRefLicenseProf(licNum)

			if (newLic)
				{
				updating = true;
				logDebug("Updating existing Ref Lic Prof : " + licNum);
				}
			else
				{
				var newLic = aa.licenseScript.createLicenseScriptModel();
				}

			if (isObject)  // update the reference LP with data from the transactional, if we have some.
				{
				if (licObj.getAddress1()) newLic.setAddress1(licObj.getAddress1());
				if (licObj.getAddress2()) newLic.setAddress2(licObj.getAddress2());
				if (licObj.getAddress3()) newLic.setAddress3(licObj.getAddress3());
				if (licObj.getAgencyCode()) newLic.setAgencyCode(licObj.getAgencyCode());
				if (licObj.getBusinessLicense()) newLic.setBusinessLicense(licObj.getBusinessLicense());
				if (licObj.getBusinessName()) newLic.setBusinessName(licObj.getBusinessName());
				if (licObj.getBusName2()) newLic.setBusinessName2(licObj.getBusName2());
				if (licObj.getCity()) newLic.setCity(licObj.getCity());
				if (licObj.getCityCode()) newLic.setCityCode(licObj.getCityCode());
				if (licObj.getContactFirstName()) newLic.setContactFirstName(licObj.getContactFirstName());
				if (licObj.getContactLastName()) newLic.setContactLastName(licObj.getContactLastName());
				if (licObj.getContactMiddleName()) newLic.setContactMiddleName(licObj.getContactMiddleName());
				if (licObj.getCountryCode()) newLic.setContryCode(licObj.getCountryCode());
				if (licObj.getEmail()) newLic.setEMailAddress(licObj.getEmail());
				if (licObj.getCountry()) newLic.setCountry(licObj.getCountry());
				if (licObj.getEinSs()) newLic.setEinSs(licObj.getEinSs());
				if (licObj.getFax()) newLic.setFax(licObj.getFax());
				if (licObj.getFaxCountryCode()) newLic.setFaxCountryCode(licObj.getFaxCountryCode());
				if (licObj.getHoldCode()) newLic.setHoldCode(licObj.getHoldCode());
				if (licObj.getHoldDesc()) newLic.setHoldDesc(licObj.getHoldDesc());
				if (licObj.getLicenseExpirDate()) newLic.setLicenseExpirationDate(licObj.getLicenseExpirDate());
				if (licObj.getLastRenewalDate()) newLic.setLicenseLastRenewalDate(licObj.getLastRenewalDate());
				if (licObj.getLicesnseOrigIssueDate()) newLic.setLicOrigIssDate(licObj.getLicesnseOrigIssueDate());
				if (licObj.getPhone1()) newLic.setPhone1(licObj.getPhone1());
				if (licObj.getPhone1CountryCode()) newLic.setPhone1CountryCode(licObj.getPhone1CountryCode());
				if (licObj.getPhone2()) newLic.setPhone2(licObj.getPhone2());
				if (licObj.getPhone2CountryCode()) newLic.setPhone2CountryCode(licObj.getPhone2CountryCode());
				if (licObj.getSelfIns()) newLic.setSelfIns(licObj.getSelfIns());
				if (licObj.getState()) newLic.setState(licObj.getState());
				if (licObj.getSuffixName()) newLic.setSuffixName(licObj.getSuffixName());
				if (licObj.getZip()) newLic.setZip(licObj.getZip());
				}

			// Now set data from the CSLB

			if (lpBiz.getChild("Name").getText() != "") newLic.setBusinessName(unescape(lpBiz.getChild("Name").getText()).replace(/\+/g," "));
			if (lpBiz.getChild("Addr1").getText() != "") newLic.setAddress1(unescape(lpBiz.getChild("Addr1").getText()).replace(/\+/g," "));
			if (lpBiz.getChild("Addr2").getText() != "") newLic.setAddress2(unescape(lpBiz.getChild("Addr2").getText()).replace(/\+/g," "));
			if (lpBiz.getChild("City").getText() != "") newLic.setCity(unescape(lpBiz.getChild("City").getText()).replace(/\+/g," "));
			if (lpBiz.getChild("State").getText() != "") newLic.setState(unescape(lpBiz.getChild("State").getText()).replace(/\+/g," "));
			if (lpBiz.getChild("Zip").getText() != "") newLic.setZip(unescape(lpBiz.getChild("Zip").getText()).replace(/\+/g," "));
			if (lpBiz.getChild("BusinessPhoneNum").getText() != "") newLic.setPhone1(unescape(stripNN(lpBiz.getChild("BusinessPhoneNum").getText()).replace(/\+/g," ")));
			newLic.setAgencyCode(aa.getServiceProviderCode());
			newLic.setAuditDate(sysDate);
			newLic.setAuditID(currentUserID);
			newLic.setAuditStatus("A");
			newLic.setLicenseType(rlpType);
			newLic.setLicState("CA");  // hardcode CA
			newLic.setStateLicense(licNum);

			if (lpBiz.getChild("IssueDt").getText()) newLic.setLicenseIssueDate(aa.date.parseDate(lpBiz.getChild("IssueDt").getText()));
			if (lpBiz.getChild("ExpireDt").getText()) newLic.setLicenseExpirationDate(aa.date.parseDate(lpBiz.getChild("ExpireDt").getText()));
			if (lpBiz.getChild("ReissueDt").getText()) newLic.setLicenseLastRenewalDate(aa.date.parseDate(lpBiz.getChild("ReissueDt").getText()));

			var wcs = root.getChild("WorkersComp").getChildren();

			for (var j=0 ; j<wcs.size(); j++) {
				wc = wcs.get(j);

				if (wc.getAttribute("PolicyNo").getValue()) newLic.setWcPolicyNo(wc.getAttribute("PolicyNo").getValue());
				if (wc.getAttribute("InsCoCde").getValue()) newLic.setWcInsCoCode(unescape(wc.getAttribute("InsCoCde").getValue()));
				if (wc.getAttribute("WCEffDt").getValue()) newLic.setWcEffDate(aa.date.parseDate(wc.getAttribute("WCEffDt").getValue()))
				if (wc.getAttribute("WCExpDt").getValue()) newLic.setWcExpDate(aa.date.parseDate(wc.getAttribute("WCExpDt").getValue()))
				if (wc.getAttribute("WCCancDt").getValue()) newLic.setWcCancDate(aa.date.parseDate(wc.getAttribute("WCCancDt").getValue()))
				if (wc.getAttribute("Exempt").getValue() == "E") newLic.setWcExempt("Y"); else newLic.setWcExempt("N");

				break; // only use first
				}

			//
			// Do the refresh/create and get the sequence number
			//
			if (updating)
				{
				var myResult = aa.licenseScript.editRefLicenseProf(newLic);
				var licSeqNbr = newLic.getLicSeqNbr();
				}
			else
				{
				var myResult = aa.licenseScript.createRefLicenseProf(newLic);

				if (!myResult.getSuccess())
					{
					logDebug("**WARNING: can't create ref lic prof: " + myResult.getErrorMessage());
					continue;
					}

				var licSeqNbr = myResult.getOutput()
				}

			logDebug("Successfully added/updated License No. " + licNum + ", Type: " + rlpType + " Sequence Number " + licSeqNbr);


			/////
			/////  Attribute Data -- first copy from the transactional LP if it exists
			/////


			if (isObject)  // update the reference LP with attributes from the transactional, if we have some.
				{
				var attrArray = licObj.getAttributes();

				if (attrArray)
					{
					for (var k in attrArray)
						{
						var attr = attrArray[k];
						editRefLicProfAttribute(licNum,attr.getAttributeName(),attr.getAttributeValue());
						}
					}
				}

			/////
			/////  Attribute Data
			/////
			/////  NOTE!  Agencies may have to configure template data below based on their configuration.  Please note all edits
			/////

			var cbs = root.getChild("Classifications").getChildren();
			for (var m=0 ; m<cbs.size(); m++) {
				cb = cbs.get(m);

				if (m == 0)
					{
					editRefLicProfAttribute(licNum,"CLASS CODE 1",cb.getAttribute("Code").getValue());
					editRefLicProfAttribute(licNum,"CLASS DESC 1",unescape(cb.getAttribute("Desc").getValue()).replace(/\+/g," "));
					}

				if (m == 1)
					{
					editRefLicProfAttribute(licNum,"CLASS CODE 2",cb.getAttribute("Code").getValue());
					editRefLicProfAttribute(licNum,"CLASS DESC 2",unescape(cb.getAttribute("Desc").getValue()).replace(/\+/g," "));
					}
				if (m == 2)
					{
					editRefLicProfAttribute(licNum,"CLASS CODE 3",cb.getAttribute("Code").getValue());
					editRefLicProfAttribute(licNum,"CLASS DESC 3",unescape(cb.getAttribute("Desc").getValue()).replace(/\+/g," "));
					}

				if (m == 3)
					{
					editRefLicProfAttribute(licNum,"CLASS CODE 4",cb.getAttribute("Code").getValue());
					editRefLicProfAttribute(licNum,"CLASS DESC 4",unescape(cb.getAttribute("Desc").getValue()).replace(/\+/g," "));
					}
				}

// dlh add in Status

	var stas = lpStatus.getChildren();
		for (var i=0 ; i<stas.size(); i++) {
			var sta = stas.get(i);

				if (sta.getAttribute("Desc").getValue()) editRefLicProfAttribute(licNum,"STATUS",unescape(sta.getAttribute("Desc").getValue()));
// cw: 01-07-2019 took this out, it appears the most recent is now the last status in the list
//				break; // only use first
				}
				
//  do this again for WC  

            var wcs = root.getChild("WorkersComp").getChildren();
			for (var j=0 ; j< wcs.size(); j++) {
				wc = wcs.get(j);

				if (wc.getAttribute("PolicyNo").getValue()) editRefLicProfAttribute(licNum,"WC POLICY NO",unescape(wc.getAttribute("PolicyNo").getValue()));

				if (wc.getAttribute("InsCoCde").getValue()) editRefLicProfAttribute(licNum,"WC CO CODE",unescape(wc.getAttribute("InsCoCde").getValue()));
			
				if (wc.getAttribute("InsCoName").getValue()) editRefLicProfAttribute(licNum,"WC CO NAME",unescape(wc.getAttribute("InsCoName").getValue()).replace(/\+/g," "));

				if (wc.getAttribute("WCEffDt").getValue()) editRefLicProfAttribute(licNum,"WC EFF DATE",unescape(wc.getAttribute("WCEffDt").getValue()));

				if (wc.getAttribute("WCExpDt").getValue()) editRefLicProfAttribute(licNum,"WC EXP DATE",unescape(wc.getAttribute("WCExpDt").getValue()));

				if (wc.getAttribute("WCCancDt").getValue()) editRefLicProfAttribute(licNum,"WC CAN DATE",unescape(wc.getAttribute("WCCancDt").getValue()));

				if (wc.getAttribute("Exempt").getValue() == "E") 
					editRefLicProfAttribute(licNum,"WC EXEMPT","Y"); 
				else 
					editRefLicProfAttribute(licNum,"WC EXEMPT","N");
					 
				break; // only use first
				}

// end dlh change update attribute WC data 

			var bos = root.getChild("ContractorBond").getChildren();

			for (var n=0 ; n<bos.size(); n++) {
				var bo = bos.get(n);
				if (bo.getAttribute("BondAmt").getValue()) editRefLicProfAttribute(licNum,"BOND AMOUNT",unescape(bo.getAttribute("BondAmt").getValue()).replace(/[$,]/g,""));
				if (bo.getAttribute("BondCancDt").getValue()) editRefLicProfAttribute(licNum,"BOND EXPIRATION",unescape(bo.getAttribute("BondCancDt").getValue()));

				// Currently unused but could be loaded into custom attributes.
				if (bo.getAttribute("SuretyTp").getValue()) editRefLicProfAttribute(licNum,"BOND SURETYTP",unescape(bo.getAttribute("SuretyTp").getValue()));

				if (bo.getAttribute("InsCoCde").getValue()) editRefLicProfAttribute(licNum,"BOND INSOCDE",unescape(bo.getAttribute("InsCoCde").getValue()).replace(/\+/g," "));

				if (bo.getAttribute("InsCoName").getValue()) editRefLicProfAttribute(licNum,"BOND ICONAME",unescape(bo.getAttribute("InsCoName").getValue()).replace(/\+/g," "));

				if (bo.getAttribute("BondNo").getValue()) editRefLicProfAttribute(licNum,"BOND NO",unescape(bo.getAttribute("BondNo").getValue()));

				if (bo.getAttribute("BondEffDt").getValue()) editRefLicProfAttribute(licNum,"BOND EFFDATE",unescape(bo.getAttribute("BondEffDt").getValue()));

	

/*
				aa.print("Bond Surety Type       : " + unescape(bo.getAttribute("SuretyTp").getValue()))
				aa.print("Bond Code              : " + unescape(bo.getAttribute("InsCoCde").getValue()))
				aa.print("Bond Insurance Company : " + unescape(bo.getAttribute("InsCoName").getValue()).replace(/\+/g," "))
				aa.print("Bond Number            : " + unescape(bo.getAttribute("BondNo").getValue()))
				aa.print("Bond Amount            : " + unescape(bo.getAttribute("BondAmt").getValue()))
				aa.print("Bond Effective Date    : " + unescape(bo.getAttribute("BondEffDt").getValue()))
				aa.print("Bond Cancel Date       : " + unescape(bo.getAttribute("BondCancDt").getValue()))
*/
				break; // only use first bond
				}

			if (doPopulateTrx)
				{
				var lpsmResult = aa.licenseScript.getRefLicenseProfBySeqNbr(servProvCode,licSeqNbr)
					if (!lpsmResult.getSuccess())
					{ logDebug("**WARNING error retrieving the LP just created " + lpsmResult.getErrorMessage()) ; }

				var lpsm = lpsmResult.getOutput();

				// Remove from CAP

				var isPrimary = false;

				for (var currLic in capLicenseArr)
					{
					var thisLP = capLicenseArr[currLic];
					if (thisLP.getLicenseType() == rlpType && thisLP.getLicenseNbr() == licNum)
						{
						logDebug("Removing license: " + thisLP.getLicenseNbr() + " from CAP.  We will link the new reference LP");
						if (thisLP.getPrintFlag() == "Y")
							{
							logDebug("...remove primary status...");
							isPrimary = true;
							thisLP.setPrintFlag("N");
							aa.licenseProfessional.editLicensedProfessional(thisLP);
							}
						var remCapResult = aa.licenseProfessional.removeLicensedProfessional(thisLP);
						if (capLicenseResult.getSuccess())
							{
							logDebug("...Success."); }
						else
							{ logDebug("**WARNING removing lic prof: " + remCapResult.getErrorMessage()); }
						}
					}

				// add the LP to the CAP
				var asCapResult= aa.licenseScript.associateLpWithCap(itemCap,lpsm)
				if (!asCapResult.getSuccess())
				{ logDebug("**WARNING error associating CAP to LP: " + asCapResult.getErrorMessage()) }
				else
					{ logDebug("Associated the CAP to the new LP") }

				// Now make the LP primary again
				if (isPrimary)
					{
					var capLps = getLicenseProfessional(itemCap);

					for (var thisCapLpNum in capLps)
						{
						if (capLps[thisCapLpNum].getLicenseNbr().equals(licNum))
							{
							var thisCapLp = capLps[thisCapLpNum];
							thisCapLp.setPrintFlag("Y");
							aa.licenseProfessional.editLicensedProfessional(thisCapLp);
							logDebug("Updated primary flag on Cap LP : " + licNum);

							// adding this return will cause the test script to work without error, even though this is the last statement executed
							//if (returnMessage.length > 0) return returnMessage;
							//else return null;

							}
						}
				}
			} // do populate on the CAP
		} // do populate on the REF
	} // for each license

	if (returnMessage.length > 0) return returnMessage;
	else return null;

} // end function

function getLPLicNum(pCapId) {
//Function find licensed professionals number
        var newLicNum = null;
	var licProf = aa.licenseProfessional.getLicensedProfessionalsByCapID(pCapId).getOutput();
	if (licProf != null)
		for(x in licProf)
		{
                        newLicNum = licProf[x].getLicenseNbr();
		        // logDebug("Found " + licProf[x].getLicenseNbr());
                        return newLicNum;
		}
	else
		// logDebug("No licensed professional on source");
                return null;
}


function getLPLicType(pCapId) {
//Function find licensed professionals number
	var newLicType = null;
	var licProf = aa.licenseProfessional.getLicensedProfessionalsByCapID(pCapId).getOutput();
	if (licProf != null)
	for(x in licProf)
	{
		newLicType = licProf[x].getLicenseType();
		// logDebug("Found " + licProf[x].getLicenseType());
		return newLicType;
	}
	else
	// logDebug("No licensed professional on source");
		return null;
}

function dateAddHC3(td, amt)
// perform date arithmetic on a string; uses the agency holiday calendar to test for business days
// td can be "mm/dd/yyyy" (or any string that will convert to JS date)
// amt can be positive or negative (5, -3) days
// if optional parameter #3 is present, use working days only
// 
// function corrected by SLS Eric Koontz
//     correctly adjust the target date to ensure that the date returned is a working day
//     correctly handle a zero date adjustment 
{
   	var useWorking = false;
	if (arguments.length == 3)
		useWorking = true;

	if (!td) {
		dDate = new Date();
	}
	else {
		dDate = convertDate(td);
	}
	if (amt == 0 && !checkHolidayCalendar(dDate)) {
		useWorking = false;
	}
	else {
		var i = 1;
	}
	var nonWorking = false;
	var failsafe = 0;

	// incorporate logic that will increment the date without counting non-working days
	if (useWorking){
		while (i <= Math.abs(amt) && failsafe < 600) {
			// handle positive date changes
			if (amt >= 0) {
				dDate = convertDate(dateAdd(dDate,1));
				if (!checkHolidayCalendar(dDate)){
					i++;
					failsafe++;
				}
				else {
					failsafe++;
				}
			} 
			// handle negative date changes
			else {
				dDate = convertDate(dateAdd(dDate,-1));
				if (!checkHolidayCalendar(dDate)){
					i++;
					failsafe++;
				}
				else {
					failsafe++;
				}
			}
		}
	}
	// ignore non-working days and simply use calendar days increment
	else{
		dDate.setDate(dDate.getDate() + parseInt(amt, 10));
	}
	var hcMM = (dDate.getMonth() + 1).toString();
	if (hcMM.length < 2)
		hcMM = "0" + hcMM;
	var hcDD = dDate.getDate().toString();
	if (hcDD.length < 2)
		hcDD = "0" + hcDD;

	retDateStr = hcMM + "/" + hcDD + "/" + dDate.getFullYear()

	logDebug("done going through HC3 and we now have:"+retDateStr);
	return retDateStr;
}

function dateAddHC3_Planning(td, amt)
// perform date arithmetic on a string; uses the agency holiday calendar to test for business days
// td can be "mm/dd/yyyy" (or any string that will convert to JS date)
// amt can be positive or negative (5, -3) days
// if optional parameter #3 is present, use working days only
// 
// function corrected by SLS Eric Koontz
//     correctly adjust the target date to ensure that the date returned is a working day
//     correctly handle a zero date adjustment 
{
   	var useWorking = false;
	if (arguments.length == 3)
		useWorking = true;

	if (!td) {
		dDate = new Date();
	}
	else {
		dDate = convertDate(td);
	}
	if (amt == 0 && !checkHolidayCalendar_Planning(dDate)) {
		useWorking = false;
	}
	else {
		var i = 1;
	}
	var nonWorking = false;
	var failsafe = 0;

	// incorporate logic that will increment the date without counting non-working days
	if (useWorking){
		while (i <= Math.abs(amt) && failsafe < 600) {
			// handle positive date changes
			if (amt >= 0) {
				dDate = convertDate(dateAdd(dDate,1));
				if (!checkHolidayCalendar_Planning(dDate)){
					i++;
					failsafe++;
				}
				else {
					failsafe++;
				}
			} 
			// handle negative date changes
			else {
				dDate = convertDate(dateAdd(dDate,-1));
				if (!checkHolidayCalendar_Planning(dDate)){
					i++;
					failsafe++;
				}
				else {
					failsafe++;
				}
			}
		}
	}
	// ignore non-working days and simply use calendar days increment
	else{
		dDate.setDate(dDate.getDate() + parseInt(amt, 10));
	}
	var hcMM = (dDate.getMonth() + 1).toString();
	if (hcMM.length < 2)
		hcMM = "0" + hcMM;
	var hcDD = dDate.getDate().toString();
	if (hcDD.length < 2)
		hcDD = "0" + hcDD;

	retDateStr = hcMM + "/" + hcDD + "/" + dDate.getFullYear()

	logDebug("done going through HC3 and we now have:"+retDateStr);
	return retDateStr;
}

//********************************************************************************************************
//Script 		doHttpGET.js
//
//Record Types:	any
//
//Event: 		 
//
//Desc:			helper function to process web service GET json query
//
//Created By: Silver Lining Solutions
//********************************************************************************************************
// Change Log
//			Date		Name		Modification
//			01-22-2019	Chad		created
//********************************************************************************************************
function doHttpGET(username, password, url, contentType) {
    logDebug("Enter doHttpGET()");
    logDebug("username: " + username);
    logDebug("password: " + password);
    logDebug("url: " + url);
    logDebug("contentType: " + contentType);

    var getRDun = new org.apache.commons.httpclient.methods.GetMethod(url);
    var client = new org.apache.commons.httpclient.HttpClient();

    // ---- Authentication ---- //
    if(username !== null && password !== null){
        var creds = new org.apache.commons.httpclient.UsernamePasswordCredentials(username, password);
        client.getParams().setAuthenticationPreemptive(true);
        client.getState().setCredentials(org.apache.commons.httpclient.auth.AuthScope.ANY, creds);
    }
    // -------------------------- //
    getRDun.setRequestHeader("Content-type", contentType);
    
    var status = client.executeMethod(getRDun);

    if(status >= 400){
        throw "HTTP Error: " + status;
    }
    
    var br = new java.io.BufferedReader(new java.io.InputStreamReader(getRDun.getResponseBodyAsStream()));
    var response = "";
    var line = br.readLine();
    while(line != null){
        response = response + line;
        line = br.readLine();
    }

    getRDun.releaseConnection();

    logDebug("Exit doHttpGET()");
    return response;
}

//********************************************************************************************************
//Script 		Email Applicant on Fee Invoice  ********* Script #27
//Record Types:	*/*/*/*
//
//Event: 		IFA
//
//Desc:			When a fee is invoiced let the Applicant know.
//
//Assumptions:
//				If an applicant does not have an email this script will return a warning to the User
//
//
//Created By: Silver Lining Solutions 
//********************************************************************************************************
// Change Log
//         		Date		Name		Modification
//			09/11/2018	Eric		orig
//			12/07/2018	Chad		took out "return null" when no staff found, send email anyway
//			02/12/2019	Chad		adding aca url to parameters for template - city can use this as example.
//			05/08/2020	Chad		new template, new parameters
//			06/01/2020	Chad		new requirement 05/27/2020 -check to see if the fee has been voided.  If so, do not send a notice!
//********************************************************************************************************
function emailApplicantOnFeeInvoice()
{
	logDebug("Script 27 Email Applicant on Fee Invoice - Begin");

	if (!publicUser) handleFeeInvoiceNotificationEmail();
	logDebug("Script 27 Email Applicant on Fee Invoice - End");
}

function getPayFeesACAUrl(){

	// returns the path to the record on ACA.  Needs to be appended to the site

	itemCap = capId;
	if (arguments.length == 1) itemCap = arguments[0]; // use cap ID specified in args
   	var acaUrl = "";
	var id1 = capId.getID1();
	var id2 = capId.getID2();
	var id3 = capId.getID3();
	var cap = aa.cap.getCap(capId).getOutput().getCapModel();

	acaUrl += "/urlrouting.ashx?type=1009";
	acaUrl += "&Module=" + cap.getModuleName();
	acaUrl += "&capID1=" + id1 + "&capID2=" + id2 + "&capID3=" + id3;
	acaUrl += "&agencyCode=" + aa.getServiceProviderCode();
	return acaUrl;
}

function handleFeeInvoiceNotificationEmail()
{
	var toEmail = "";
	var fromEmail = scriptAgencyEmailFrom;
	var ccEmail = "";
	var notificationTemplate = "INVOICED FEES";
	var reportFile = [];  // empty set for the file list
	var capID4Email = aa.cap.createCapIDScriptModel(capId.getID1(),capId.getID2(),capId.getID3());
	var emailParameters = aa.util.newHashtable();
	var staff = null;
	
	// prepare Notification parameters
	addParameter(emailParameters, "$$altID$$", cap.getCapModel().getAltID());
	addParameter(emailParameters, "$$recordAlias$$", cap.getCapType().getAlias());
	var acaSite = lookup("ACA_CONFIGS", "OFFICIAL_WEBSITE_URL");
	addParameter(emailParameters,"$$acaUrl$$",acaSite);
	var acaPayFeeUrl = acaSite + getPayFeesACAUrl();
	addParameter(emailParameters,"$$acaPayFeeUrl$$",acaPayFeeUrl);

	// fee invoice specific information: use these objects if you want to include fee info in email
	//	printObjProperties(FeeObjs); 
	//	printObjProperties(FeeObjs[0]);

	
	// ensure that we have an assigned staff that will be notified
/*	staff = getRecordAssignedStaffEmail();
	if (staff){ccEmail += "; " + staff; logDebug("ccEmail: " + ccEmail);}

	if (staff == "")
	{
		logDebug("No Staff identified for notification");
//		return null;
	}
*/
	// new requirement 05/27/2020
	// check to see if the fee has actually been voided.  If so, do not send a notice!


	var sendMsg = false;

	for (inv in InvoiceNbrArray) {
		thisInv = InvoiceNbrArray[inv];
		var myInvDataGet = aa.invoice.getFeeItemInvoiceByInvoiceNbr(thisInv);
		if (myInvDataGet.getSuccess() && myInvDataGet.getOutput()) {
			var myInvDataArr = myInvDataGet.getOutput();
			for (invFee in myInvDataArr) {
				var thisFeeStatus = myInvDataArr[invFee].getFeeitemStatus();
				if ( thisFeeStatus == 'INVOICED' ) {
					sendMsg = true;
				}
			}
		}
	}

	if (sendMsg) {
		// get the Applicant email
		var applicant = null;
		var contactType = "Applicant"
		var capContactResult = aa.people.getCapContactByCapID(capId);
		if (capContactResult.getSuccess())
		{
			var Contacts = capContactResult.getOutput();
			for (yy in Contacts)
			{
				if (contactType.equals(Contacts[yy].getCapContactModel().getPeople().getContactType()))
				{
					if (Contacts[yy].getEmail() != null)
					{
						toEmail = "" + Contacts[yy].getEmail();
						var conName = Contacts[yy].getCapContactModel().getPeople().getFullName();
						if (!conName) conName = "";
						addParameter(emailParameters, "$$ApplicantName$$", conName);
						// send Notification
						var sendResult = sendNotification(fromEmail,toEmail,ccEmail,notificationTemplate,emailParameters,reportFile,capID4Email);
						if (!sendResult) { logDebug("handleFeeInvoiceNotificationEmail:UNABLE TO SEND NOTICE!  ERROR: "+ sendResult); }
						else { logDebug("handleFeeInvoiceNotificationEmail:Sent Notification"); }  
					}
				}
			}
		}
	}
	else { logDebug("handleFeeInvoiceNotificationEmail: No Message send because no new Invoices where invoiced!"); }
}

function emailContact(mSubj,mText)   // optional: Contact Type, default Applicant
	{
	var replyTo = scriptAgencyEmailFrom;
	var contactType = "Applicant"
	var emailAddress = "";

	if (arguments.length == 3) contactType = arguments[2]; // use contact type specified

	var capContactResult = aa.people.getCapContactByCapID(capId);
	if (capContactResult.getSuccess())
		{
		var Contacts = capContactResult.getOutput();
		for (yy in Contacts)
			if (contactType.equals(Contacts[yy].getCapContactModel().getPeople().getContactType()))
				if (Contacts[yy].getEmail() != null)
					emailAddress = "" + Contacts[yy].getEmail();
		}

	if (emailAddress.indexOf("@") > 0)
		{
		aa.sendMail(replyTo, emailAddress, "", mSubj, mText);
		logDebug("Successfully sent email to " + contactType);
		}
	else
		logDebug("Couldn't send email to " + contactType + ", no valid email address");
	} 
// **** script # 27

//********************************************************************************************************
//Script 		Email Staff on Document Update
//Record Types:	?*/*/*/*
//
//Event: 		DUA
//
//Desc:			When a Revision Required Document gets resubmitted thru ACA. Email the Santa Barbara Staff 
// 				that is assigned to the Plan Distributed Workflow Task. Also set the Workflow Task Plans 
//				Distribution Status to Revisions Received.
//
//Assumptions:
//				Staff must always be assigned to Plans Distribution 
//				Staff must have a valid email defined in their User Profile
//
//Psuedo Code:	
// 				use Document Update Notification template
//
//Created By: Silver Lining Solutions 
//********************************************************************************************************
// Change Log
//         		Date		Name			Modification
//				08/15/2018	Eric 			Initial Development
//				09/11/2018	Eric			moved this code to incl custom and made mods to include all 
//											dept bus rules
//********************************************************************************************************
function emailStaffOnDocUpdate()
{
	logDebug("Script 31 Email Staff on Document Update - Begin");

	if (appMatch("Building/*/*/*"))
	{
		activateTask("Plans Distribution");
		updateTask("Plans Distribution","Revisions Received","auto updated by script","auto updated by script");
	}
	
	handleNotificationEmail();

	logDebug("Script 31 Email Staff on Document Update - End");
}

function handleNotificationEmail()
{
	var toEmail = "";
	var fromEmail = scriptAgencyEmailFrom;
	var ccEmail = "";
	var notificationTemplate = "DOCUMENT UPDATE";
	var reportFile = [];  // empty set for the file list
	var capID4Email = aa.cap.createCapIDScriptModel(capId.getID1(),capId.getID2(),capId.getID3());
	var emailParameters = aa.util.newHashtable();
	var staff = null;

	// ensure that we have an assigned staff that will be notified
	staff = getRecordAssignedStaffEmail();
	if (staff){toEmail += "; " + staff; logDebug("toEmail: " + toEmail);}
	staff = getTaskAssignedStaffEmail("Plans Distribution");
	if (staff){toEmail += "; " + staff; logDebug("toEmail: " + toEmail);}
	staff = getTaskAssignedStaffEmail("Application review");
	if (staff){toEmail += "; " + staff; logDebug("toEmail: " + toEmail);}
	staff = getTaskAssignedStaffEmail("Schedule and TTC Distribution");
	if (staff){toEmail += "; " + staff; logDebug("toEmail: " + toEmail);}
	staff = getTaskAssignedStaffEmail("Document Distribution");
	if (staff){toEmail += "; " + staff; logDebug("toEmail: " + toEmail);}
	staff = getTaskAssignedStaffEmail("Application Submittal");
	if (staff){toEmail += "; " + staff; logDebug("toEmail: " + toEmail);}
	staff = getTaskAssignedStaffEmail("ODLA Package Distribution");
	if (staff){toEmail += "; " + staff; logDebug("toEmail: " + toEmail);}
	staff = getTaskAssignedStaffEmail("Initial Application");
	if (staff){toEmail += "; " + staff; logDebug("toEmail: " + toEmail);}
	staff = getTaskAssignedStaffEmail("PreApp Assignment");
	if (staff){toEmail += "; " + staff; logDebug("toEmail: " + toEmail);}
	staff = getTaskAssignedStaffEmail("Sewer Lateral Inspection (SLIP) Video and Form submittal");
	if (staff){toEmail += "; " + staff; logDebug("toEmail: " + toEmail);}
	staff = getTaskAssignedStaffEmail("Map Review Distribution");
	if (staff){toEmail += "; " + staff; logDebug("toEmail: " + toEmail);}
	staff = getTaskAssignedStaffEmail("VLM Review Distribution");
	if (staff){toEmail += "; " + staff; logDebug("toEmail: " + toEmail);}
	staff = getTaskAssignedStaffEmail("Sewer Tap Application");
	if (staff){toEmail += "; " + staff; logDebug("toEmail: " + toEmail);}
	staff = getTaskAssignedStaffEmail("Sewer Service Abandonment Application");
	if (staff){toEmail += "; " + staff; logDebug("toEmail: " + toEmail);}
	staff = getTaskAssignedStaffEmail("Sewer Lateral installation/repair Permit request");
	if (staff){toEmail += "; " + staff; logDebug("toEmail: " + toEmail);}
	staff = getTaskAssignedStaffEmail("Routing Coordination");
	if (staff){toEmail += "; " + staff; logDebug("toEmail: " + toEmail);}
	staff = getTaskAssignedStaffEmail("Routing for Comments");
	if (staff){toEmail += "; " + staff; logDebug("toEmail: " + toEmail);}
	staff = getTaskAssignedStaffEmail("Routing Coordinator");
	if (staff){toEmail += "; " + staff; logDebug("toEmail: " + toEmail);}
	staff = getTaskAssignedStaffEmail("Route Resubmittal");
	if (staff){toEmail += "; " + staff; logDebug("toEmail: " + toEmail);}
	staff = getTaskAssignedStaffEmail("Initial Application Fees Paid");
	if (staff){toEmail += "; " + staff; logDebug("toEmail: " + toEmail);}

	var applicant = null;
	var contactType = "Applicant"
	var capContactResult = aa.people.getCapContactByCapID(capId);
	if (capContactResult.getSuccess())
	{
		var Contacts = capContactResult.getOutput();
		for (yy in Contacts)
			if (contactType.equals(Contacts[yy].getCapContactModel().getPeople().getContactType()))
				if (typeof(Contacts[yy]) != "undefined")
					if (Contacts[yy].getEmail() != null)
					{
						toEmail += ";" + Contacts[yy].getEmail();
						logDebug("toEmail: " + toEmail);
					}
	}
	if (toEmail == "")
	{
		logDebug("No Staff or Applicants identified for notification");
		return null;
	}
	// prepare Notification parameters
	addParameter(emailParameters, "$$altID$$", cap.getCapModel().getAltID());
	addParameter(emailParameters, "$$recordAlias$$", cap.getCapType().getAlias());
	var acaSite = lookup("ACA_CONFIGS", "OFFICIAL_WEBSITE_URL");
	addParameter(emailParameters,"$$acaUrl$$",acaSite);



	// identify the doc(s) that were just uploaded and for each doc, send a notification
	var docArray = documentModelArray.toArray();
	var err = 0;

	var documentModel = null;
	var fileName = null;

	for (i = 0; i < docArray.length; i++) {
		documentModel = docArray[i];
		addParameter(emailParameters, "$$docNo$$", documentModel.getDocumentNo());
		addParameter(emailParameters, "$$docType$$", documentModel.getDocType());
		addParameter(emailParameters, "$$docGroup$$", documentModel.getDocGroup());
		addParameter(emailParameters, "$$docFileName$$", documentModel.getFileName());
		addParameter(emailParameters, "$$docName$$", documentModel.getDocName());
		addParameter(emailParameters, "$$docCategory$$", documentModel.getDocCategory());
		addParameter(emailParameters, "$$docUploadBy$$", documentModel.getFileUpLoadBy());
		addParameter(emailParameters, "$$docUploadDate$$", documentModel.getFileUpLoadDate());


		// send Notification
		var sendResult = sendNotification(fromEmail,toEmail,ccEmail,notificationTemplate,emailParameters,reportFile,capID4Email);
		if (!sendResult) 
			{ logDebug("UNABLE TO SEND NOTICE!  ERROR: "+sendResult); }
		else
			{ logDebug("Sent Notification"); }  

	}
	
}

//********************************************************************************************************
//Script 		Email Staff on record creation
//Record Types:	Enforcement/Incident/Case/NA  Enforcement/Request/NA/NA
//
//Event: 		ASA CTRCA
//
//Desc:			When the record created in ACA, the system will email the Santa Barbara Staff 
// 				to inform them there the record has been created.  
//
// test comment
//
//Assumptions:
//				
//				Staff must have a valid email defined in their User Profile
//
//Psuedo Code:	
// 				
//
//Created By: Silver Lining Solutions 
//********************************************************************************************************
// Change Log
//         		Date		Name			Modification
//				10/15/2018	Michael 		Initial Development
//				
//											
//********************************************************************************************************
function emailToASIDepartmentUser(){
	var department = getAppSpecific("Department")
	aa.print("department = " + department)
	logDebug("department = " + department)
	
	if(!department) {
		logDebug("There is no department selected.");
		return false;
	}
	
	if(department.indexOf("BUILDING")>-1){
		department = "Building";
	}
	else if(department.indexOf("ARBORIST")>-1){
		department = "Arborist";
	}
	else if(department.indexOf("CREEKS")>-1){
		department = "Creeks";
	}
	else if(department.indexOf("ENV SERVICES")>-1){
		department = "Env Services";
	}
	else if(department.indexOf("FIRE")>-1){
		department = "Fire";
	}
	else if(department.indexOf("PUBLIC WORKS")>-1){
		department = "Public Works";
	}
	else if(department.indexOf("ZONING")>-1){
		department = "Zoning";
	}
	
	var lookupValue = lookup("ACA_DEPARTMENT_CONTACT_EMAIL", department);
	aa.print("lookupValue= "+ lookupValue);
	
	if(!lookupValue){
		logDebug("There is no contact email to be sent.");
		return false;	
	}

	//send Email to related user address
	var emailSubj=  "Record Creation : " + capIDString ;
	//var emailContent =" Please review this record " + "<a href=\"https:\//landuse-dt.santabarbaraca.gov\/CitizenAccessDev\/urlrouting.ashx?type=1000&agency=SANTABARBARA&capID1="+capId.getID1()+"&capID2="+capId.getID2()+"&capID3="+capId.getID3()+"&Module="+cap.getCapModel().getModuleName()+"&culture=en-US&FromACA=Y\">" + capIDString + "<\/a> with more detail."
	var emailContent =" Please review this record " + "<a href=\"https:\//landuse-web-dev.ch.sbcity.com\/portlets\/reports\/adHocReport.do?mode=deepLink&reportCommand=recordDetail&altID="+capIDString+"\">" +capIDString + "<\/a> with more detail."

	aa.sendMail(scriptAgencyEmailFrom, lookupValue, "", emailSubj,emailContent);

}

function getAddress(capId)
{
	var capAddresses = null;
	var theAddress = "";
	
	var s_result = aa.address.getAddressByCapId(capId);
	if(s_result.getSuccess())
	{
		capAddresses = s_result.getOutput();
		if (capAddresses == null || capAddresses.length == 0)
		{
			logDebug("WARNING: no addresses on this CAP:" + capId);
			capAddresses = null;
		}
		else
		{
			var theAddress = capAddresses[0].getDisplayAddress();
			logDebug("theAddress = " + theAddress);
		}
	}
	else
	{
		logDebug("Error: Failed to address: " + s_result.getErrorMessage());
		capAddresses = null;	
	}
	return theAddress;
}

//********************************************************************************************************
//Script 		getAssignedStaff
//
//Record Types:	function only
//
//Event: 		non 
//
//Desc:			Gets the Assigned Staff to a CapID 
//
//Created By: CW 8-30-2018
//********************************************************************************************************
// Change Log
//         		Date		Name			Modification
//				08-30-2018	Alec			Initial Draft
//********************************************************************************************************


function getAssignedStaff() {
                try {
                                var assignedStaff = "";
                                var cdScriptObjResult = aa.cap.getCapDetail(capId);
                                if (!cdScriptObjResult.getSuccess()) {
                                                aa.debug("**ERROR: No cap detail script object : ",
                                                                                cdScriptObjResult.getErrorMessage());
                                                return "";
                                }

                                var cdScriptObj = cdScriptObjResult.getOutput();
                                if (!cdScriptObj) {
                                                aa.debug("**ERROR: No cap detail script object", "");
                                                return "";
                                }
                                cd = cdScriptObj.getCapDetailModel();
                                assignedStaff = cd.getAsgnStaff();

                                return assignedStaff

                } catch (e) {
                                aa.debug("getAssignedStaff ", e);
                                return null;
                }
}

//*********************Begin********************//
//***** Written by Gray Quarter			//
//***** Deployed on 05/07/2020 			//
//***** Fees for online payment using CTRCA script//
//***** Updated on 05/22/2020 to include solar PV//
//********************End************************//
function getFeeRecsToProcess() {

    return [{
                "recType": ["Building/Demolition/NA/NA"],
                "feeSchedule": "BLD LINE ITEMS FY2021",
                "feeCode": "BLD_ITM_0015",
                "feeAmount": "100"
            },{
                "recType": ["Building/Reroof/NA/NA"],
                "feeSchedule": "BLD LINE ITEMS FY2021",
                "feeCode": "BLD_ITM_0015",
                "feeAmount": "100"
            }, {
                "recType": ["Building/EV Charging/NA/NA"],
                "feeSchedule": "BLD LINE ITEMS FY2021",
                "feeCode": "BLD_ITM_0015",
                "feeAmount": "100"
            }, {
                "recType": ["Building/Electrical/NA/NA"],
                "feeSchedule": "BLD LINE ITEMS FY2021",
                "feeCode": "BLD_ITM_0015",
                "feeAmount": "100"
            }, {
                "recType": ["Building/Mechanical/NA/NA"],
                "feeSchedule": "BLD LINE ITEMS FY2021",
                "feeCode": "BLD_ITM_0015",
                "feeAmount": "100"
            }, {
                "recType": ["Building/Plumbing/NA/NA"],
                "feeSchedule": "BLD LINE ITEMS FY2021",
                "feeCode": "BLD_ITM_0015",
                "feeAmount": "100"
            }, {
                "recType": ["Building/SolarWater/NA/NA"],
                "feeSchedule": "BLD LINE ITEMS FY2021",
                "feeCode": "BLD_ITM_0015",
                "feeAmount": "100"
            }, {
                "recType": ["Building/SolarPV/NA/NA"],
                "feeSchedule": "BLD LINE ITEMS FY2021",
                "feeCode": "BLD_ITM_0015",
                "feeAmount": "252"
            }, {
                "recType": ["Building/SolarPV/NA/NA"],
                "feeSchedule": "BLD LINE ITEMS FY2021",
                "feeCode": "BLD_ITM_5000",
                "feeAmount": "1"
            }, {
                "recType": ["Building/SolarPV/NA/NA"],
                "feeSchedule": "BLD LINE ITEMS FY2021",
                "feeCode": "BLD_ITM_5001",
                "feeAmount": ".50"
            }, {
                "recType": ["Building/SolarPV/NA/NA"],
                "feeSchedule": "BLD LINE ITEMS FY2021",
                "feeCode": "BLD_ITM_0018",
                "feeAmount": "18.64"
            }, {
                "recType": ["Building/BlackWall/NA/NA"],
                "feeSchedule": "BLD LINE ITEMS FY2021",
                "feeCode": "BLD_ITM_0015",
                "feeAmount": "100"
            }, {
                "recType": ["Building/RetainingWalls/NA/NA"],
                "feeSchedule": "BLD LINE ITEMS FY2021",
                "feeCode": "BLD_ITM_0015",
                "feeAmount": "100"
            }, {
                "recType": ["Building/PoolSpa/NA/NA"],
                "feeSchedule": "BLD LINE ITEMS FY2021",
                "feeCode": "BLD_ITM_0015",
                "feeAmount": "100"
            }, {
                "recType": ["Building/Sign/NA/NA"],
                "feeSchedule": "BLD LINE ITEMS FY2021",
                "feeCode": "BLD_ITM_0015",
                "feeAmount": "100"
            }, {
                "recType": ["Building/Miscellaneous/NA/NA"],
                "feeSchedule": "BLD LINE ITEMS FY2021",
                "feeCode": "BLD_ITM_0015",
                "feeAmount": "100"
            }, {
                "recType": ["Building/PreApplication/NA/NA"],
                "feeSchedule": "BLD NRS FY2021",
                "feeCode": "BLD_ITM_0015",
                "feeAmount": "100"
            }, {
                "recType": ["Building/SiteWork/Driveway/NA"],
                "feeSchedule": "BLD LINE ITEMS FY2021",
                "feeCode": "BLD_ITM_0015",
                "feeAmount": "100"
            }, {
                "recType": ["Buildling/SiteWork/Grading/NA"],
                "feeSchedule": "BLD LINE ITEMS FY2021",
                "feeCode": "BLD_ITM_0015",
                "feeAmount": "100"
            }, {
                "recType":["Building/Sitework/Paving/NA"],
                "feeSchedule": "BLD LINE ITEMS FY2021",
                "feeCode": "BLD_ITM_0015",
                "feeAmount": "100"
            }, {
                "recType": ["Building/Sitework/Restripe/NA"],
                "feeSchedule": "BLD LINE ITEMS FY2021",
                "feeCode": "BLD_ITM_0015",
                "feeAmount": "100"
            }, {
                "recType": ["Building/Sitework/Revision/NA"],
                "feeSchedule": "BLD LINE ITEMS FY2021",
                "feeCode": "BLD_ITM_0015",
                "feeAmount": "100"
            }, {
                "recType": ["Building/Commercial/Addition/NA"],
                "feeSchedule": "BLD NRS FY2021",
                "feeCode": "BLD_ITM_0015",
                "feeAmount": "1000"
            }, {
                "recType": ["Building/Commercial/Alteration/NA"],
                "feeSchedule": "BLD NRS FY2021",
                "feeCode": "BLD_ITM_0015",
                "feeAmount": "1000"
            }, {
                "recType": ["Building/Commercial/Miscellaneous/NA"],
                "feeSchedule": "BLD NRS FY2021",
                "feeCode": "BLD_ITM_0015",
                "feeAmount": "250"
            }, {
                "recType": ["Building/Commercial/New/NA"],
                "feeSchedule": "BLD NRS FY2021",
                "feeCode": "BLD_ITM_0015",
                "feeAmount": "1000"
            }, {
                "recType": ["Building/Commercial/Revison/NA"],
                "feeSchedule": "BLD NRS FY2021",
               "feeCode": "BLD_ITM_0015",
                "feeAmount": "250"
            }, {
                "recType": ["Building/Residential/Accessory/NA"],
                "feeSchedule": "BLD LINE ITEMS FY2021",
                "feeCode": "BLD_ITM_0015",
                "feeAmount": "1000"
            }, {
                "recType": ["Building/Residential/Addition/NA"],
                "feeSchedule": "BLD LINE ITEMS FY2021",
                "feeCode": "BLD_ITM_0015",
                "feeAmount": "1000"
            }, {
                "recType": ["Building/Residential/Alteration/NA"],
                "feeSchedule": "BLD LINE ITEMS FY2021",
                "feeCode": "BLD_ITM_0015",
                "feeAmount": "250"
            }, {
                "recType": ["Building/Residential/Miscellaneous/NA"],
                "feeSchedule": "BLD LINE ITEMS FY2021",
                "feeCode": "BLD_ITM_0015",
                "feeAmount": "250"
            }, {
                "recType": ["Building/Residential/New/NA"],
                "feeSchedule": "BLD NRS FY2021",
                "feeCode": "BLD_ITM_0015",
                "feeAmount": "1000"
            }, {
                "recType": ["Building/Residential/Revision/NA"],
                "feeSchedule": "BLD NRS FY2021",
                "feeCode": "BLD_ITM_0015",
                "feeAmount": "100"
            }, {
                "recType": ["Building/Admin/BFE/NA"],
                "feeSchedule": "BLD NRS FY2021",
                "feeCode": "BLD_ITM_0015",
                "feeAmount": "100"
            }, {
                "recType": ["Building/Admin/Appeal/NA"],
                "feeSchedule": "BLD NRS FY2021",
                "feeCode": "BLD_ITM_0015",
                "feeAmount": "250"
            }, {
                "recType": ["Building/Admin/CodeAlt/NA"],
                "feeSchedule": "BLD NRS FY2021",
                "feeCode": "BLD_ITM_0015",
                "feeAmount": "100"
            }, {
                "recType": ["Building/Admin/SpecialEvent/NA"],
                "feeSchedule": "BLD NRS FY2021",
                "feeCode": "BLD_ITM_0015",
                "feeAmount": "100"
            }
    
        ]
    }
    

/*--------------------------------------------------------------------------------------------------------------------/
| Start Fuction getGISInfo
/--------------------------------------------------------------------------------------------------------------------*/
function getGISInfo(svc,layer,attributename) // optional: numDistance, distanceType
{
	try{
	var numDistance = 0
	if (arguments.length >= 4) numDistance = arguments[3]; // use numDistance in arg list
	var distanceType = "feet";
	if (arguments.length == 5) distanceType = arguments[4]; // use distanceType in arg list

	var retString;
   	
	var bufferTargetResult = aa.gis.getGISType(svc,layer); // get the buffer target
	if (bufferTargetResult.getSuccess())
		{
		var buf = bufferTargetResult.getOutput();
		buf.addAttributeName(attributename);
		}
	else
		{ logDebug("**WARNING: Getting GIS Type for Buffer Target.  Reason is: " + bufferTargetResult.getErrorType() + ":" + bufferTargetResult.getErrorMessage()) ; return false }
			
	var gisObjResult = aa.gis.getCapGISObjects(capId); // get gis objects on the cap
	if (gisObjResult.getSuccess()) 	
		var fGisObj = gisObjResult.getOutput();
	else
		{ logDebug("**WARNING: Getting GIS objects for Cap.  Reason is: " + gisObjResult.getErrorType() + ":" + gisObjResult.getErrorMessage()) ; return false }

	for (a1 in fGisObj) // for each GIS object on the Cap.  We'll only send the last value
		{
		var bufchk = aa.gis.getBufferByRadius(fGisObj[a1], numDistance, distanceType, buf);

		if (bufchk.getSuccess())
			var proxArr = bufchk.getOutput();
		else
			{ logDebug("**WARNING: Retrieving Buffer Check Results.  Reason is: " + bufchk.getErrorType() + ":" + bufchk.getErrorMessage()) ; return false }	
		
		for (a2 in proxArr)
			{
			var proxObj = proxArr[a2].getGISObjects();  // if there are GIS Objects here, we're done
			for (z1 in proxObj)
				{
				var v = proxObj[z1].getAttributeValues()
				retString = v[0];
				}
			
			}
		}
	return retString;
	}
	catch (err) {
		logDebug("A JavaScript Error occurred: function getGISInfo: " + err.message);
		logDebug(err.stack);
	}
}
/*--------------------------------------------------------------------------------------------------------------------/
| End Function getGISInfo
/--------------------------------------------------------------------------------------------------------------------*/


/*------------------------------------------------------------------------------------------------------/
|
| Notes   : getGISInfo2ASB(svc,layer,attributename) // optional: numDistance, distanceType
|         : To be called on ApplicationSubmitBefore event
|         : PLEASE ADD COMMENTS HERE IF YOU UPDATE 
/------------------------------------------------------------------------------------------------------*/
/*===========================================
Title : getGISInfoASB2 
Purpose : Returns an attribute from a layer in GIS with proximity parameters 
Author : Paul Rose
Functional Area : GIS
Description : Note: To be used with ApplicationSubmitBefore only.
              Optional parameters for buffer distance allow you to shrink or enlarge the GIS feature
              on the record when overlaying the target layer in GIS. Using -1 "feet" will shrink the
              parcel shape to help eliminate touching features that the parcel is not actually within.
Reviewed By : 
Script Type : EMSE
General Purpose/Client Specific : General
Client developed for : 
Parameters : 
	svc: Text:  GIS service name, usually found on the map
	layer: Text: GIS layer name, found in GIS map layers list
	attributename: GIS field name value to be returned
	numDistance: Number: Optional, defaults to zero, distance from parcel to check
	distanceType: One of: feet, meters, miles
Example: getGISInfo2ASB("SANDIEGO", "City Boundaries", "JURISDICTION", -1, "feet");
=========================================== */
function getGISInfo2ASB(svc,layer,attributename) // optional: numDistance, distanceType
{
	try{	
		var numDistance = 0
		if (arguments.length >= 4) numDistance = arguments[3]; // use numDistance in arg list
		var distanceType = "feet";
		if (arguments.length == 5) distanceType = arguments[4]; // use distanceType in arg list
		var retString;
	   	
		var bufferTargetResult = aa.gis.getGISType(svc,layer); // get the buffer target
		if (bufferTargetResult.getSuccess())
		{
			var buf = bufferTargetResult.getOutput();
			buf.addAttributeName(attributename);
		}
		else
		{ logDebug("**ERROR: Getting GIS Type for Buffer Target.  Reason is: " + bufferTargetResult.getErrorType() + ":" + bufferTargetResult.getErrorMessage()) ; return false }
				
		var gisObjResult = aa.gis.getParcelGISObjects(ParcelValidatedNumber); // get gis objects on the parcel number
		if (gisObjResult.getSuccess()) 	
			var fGisObj = gisObjResult.getOutput();
		else
			{ logDebug("**ERROR: Getting GIS objects for Parcel.  Reason is: " + gisObjResult.getErrorType() + ":" + gisObjResult.getErrorMessage()) ; return false }
	
		for (a1 in fGisObj) // for each GIS object on the Parcel.  We'll only send the last value
		{
			var bufchk = aa.gis.getBufferByRadius(fGisObj[a1], numDistance, distanceType, buf);
	
			if (bufchk.getSuccess())
				var proxArr = bufchk.getOutput();
			else
				{ logDebug("**ERROR: Retrieving Buffer Check Results.  Reason is: " + bufchk.getErrorType() + ":" + bufchk.getErrorMessage()) ; return false }	
			
			for (a2 in proxArr)
			{
				var proxObj = proxArr[a2].getGISObjects();  // if there are GIS Objects here, we're done
				for (z1 in proxObj)
				{
					var v = proxObj[z1].getAttributeValues()
					retString = v[0];
				}
			}
		}
		
		return retString;
	}
	catch (err) {
		logDebug("A JavaScript Error occurred: function getGISInfo2ASB: " + err.message);
		logDebug(err.stack);
	}
}
/***************************************************************************/
/*===========================================
Title : getGISInfoArray2 
Purpose : Returns an array of attributes from a layer in GIS with proximity parameters 
Author : Paul Rose
Functional Area : GIS
Description : Optional parameters for buffer distance allow you to shrink or enlarge
              the GIS feature on the record when overlaying the target layer in GIS.
              Using -1 "feet" will shrink the parcel shape to help eliminate touching
              features that the parcel is not actually within.
Reviewed By : 
Script Type : EMSE
General Purpose/Client Specific : General
Client developed for : 
Parameters : 
	svc: Text:  GIS service name, usually found on the map
	layer: Text: GIS layer name, found in GIS map layers list
	attributename: GIS field name value to be returned
	numDistance: Number: Optional, defaults to zero, distance from parcel to check
	distanceType: One of: feet, meters, miles
Example: getGISInfoArray2("SANDIEGO", "FEMA Floodways & Floodplains","FLD_ZONE",-1,"feet");
=========================================== */
function getGISInfoArray2(svc,layer,attributename) // optional: numDistance, distanceType
{
	try{	
		var numDistance = 0
		if (arguments.length >= 4) numDistance = arguments[3]; // use numDistance in arg list
		var distanceType = "feet";
		if (arguments.length == 5) distanceType = arguments[4]; // use distanceType in arg list
		var retArray = new Array();
	   	
		var bufferTargetResult = aa.gis.getGISType(svc,layer); // get the buffer target
		if (bufferTargetResult.getSuccess())
			{
			var buf = bufferTargetResult.getOutput();
			buf.addAttributeName(attributename);
			}
		else
			{ logDebug("**WARNING: Getting GIS Type for Buffer Target.  Reason is: " + bufferTargetResult.getErrorType() + ":" + bufferTargetResult.getErrorMessage()) ; return false }
				
		var gisObjResult = aa.gis.getCapGISObjects(capId); // get gis objects on the cap
		if (gisObjResult.getSuccess()) 	
			var fGisObj = gisObjResult.getOutput();
		else
			{ logDebug("**WARNING: Getting GIS objects for Cap.  Reason is: " + gisObjResult.getErrorType() + ":" + gisObjResult.getErrorMessage()) ; return false }
	
		for (a1 in fGisObj) // for each GIS object on the Cap.  We'll only send the last value
			{
			var bufchk = aa.gis.getBufferByRadius(fGisObj[a1], numDistance, distanceType, buf);
	
			if (bufchk.getSuccess())
				var proxArr = bufchk.getOutput();
			else
				{ logDebug("**WARNING: Retrieving Buffer Check Results.  Reason is: " + bufchk.getErrorType() + ":" + bufchk.getErrorMessage()) ; return false }	
			
			for (a2 in proxArr)
				{
				var proxObj = proxArr[a2].getGISObjects();  // if there are GIS Objects here, we're done
				for (z1 in proxObj)
					{
					var v = proxObj[z1].getAttributeValues();
					retArray.push(v[0]);
					}
				
				}
			}
		return retArray;
	}
	catch (err) {
		logDebug("A JavaScript Error occurred: function getGISInfoArray2: " + err.message);
		logDebug(err.stack);
	}
}
/***************************************************************************/

function getGisObjectInfo(gisServer, layerID, queryString) {

	var jsonObject = null;
	var params = [];
	params.push("outFields=*");
	params.push("returnGeometry=false");
	params.push("f=pjson");
	params.push("geometryType=esriGeometryEnvelope");
	params.push("spatialRel=esriSpatialRelIntersects");
	params.push("returnTrueCurves=false");
	params.push("returnIdsOnly=false");
	params.push("returnCountOnly=false");
	params.push("returnZ=false");
	params.push("returnM=false");
	params.push("returnDistinctValues=false");
	params.push("returnExtentsOnly=false");
	params.push("where=" + encodeURIComponent(queryString));

	var u = gisServer + "/" + layerID + "/query?"
		var p = params.join("&")
		logDebug("getGisObjectInfo making GIS call: " + u + p);
	try {
		var postResult = aa.util.httpPost(u, p);
		if (postResult.getSuccess()) {
			//logDebug("Post 1 Successful");
			jsonOutput = postResult.getOutput();
			jsonObject = JSON.parse(jsonOutput);
			return jsonObject;
		}
	} catch (err) {
		logDebug("getGisObjectInfo returned error: " + err.message)
		return null;
	}
}

function getProximityAlert(svc,layer,attributeName, numDistance, distanceType )
{
	try {
		aa.print("getProximityAlert: param svc is:"+svc);
		aa.print("getProximityAlert: param layer is:"+layer);
		aa.print("getProximityAlert: param attributeName is:"+attributeName);
		aa.print("getProximityAlert: param numDistance is:"+numDistance);
		aa.print("getProximityAlert: param distanceType is:"+distanceType);

		var arrGIS = getGISInfoArray2(svc, layer, attributeName, numDistance, distanceType);
		var gisVal = null;
		if (arrGIS != null && arrGIS.length > 0) {
			gisVal = arrGIS.toString();
			aa.print("found value:"+gisVal)
		}
		else { 
			aa.print("the arrGIS is null or arrGIS length is zero or less") 
		}
		return(gisVal);
	}
	catch (err) {
		aa.print("A JavaScript Error occurred: function getProximityAlert: " + err.message);
		aa.print(err.stack);
	}	
}

//**************************************************************************
//Function		getRecordAssignedStaffEmail
//Desc:			return the staff email for the staff that has been
// 				assigned to the record or null if does not exist.
//
//input:		wfstr: the workflow task name (string)
//				process name (string) [optional]
//
//returns:		people object 
//
//Created By: Silver Lining Solutions
//**************************************************************************
//********************************************************************************************************
// Change Log
//         		Date		Name			Modification
//				09/11/2018	Eric 			Initial Development
//********************************************************************************************************

function getRecordAssignedStaffEmail() 
{
	var cdScriptObjResult = aa.cap.getCapDetail(capId);
	if (!cdScriptObjResult.getSuccess()) {
		logDebug("**ERROR: No cap detail script object : " + cdScriptObjResult.getErrorMessage());
        return ""
	}
	var cdScriptObj = cdScriptObjResult.getOutput();
	if (!cdScriptObj) {
		logDebug("**ERROR: No cap detail script object");
		return ""
	}
	var cd = cdScriptObj.getCapDetailModel();
    var	userId=cd.getAsgnStaff();
    if (userId==null) return "";
	var iNameResult = aa.person.getUser(userId);
	var iName = iNameResult.getOutput();
	var email=iName.getEmail();
	return email;
}
function getRefAddContactList(peoId){
    var conAdd = aa.proxyInvoker.newInstance("com.accela.orm.model.address.ContactAddressModel").getOutput();
    conAdd.setEntityID(parseInt(peoId));
    conAdd.setEntityType("CONTACT");
    var addList =  aa.address.getContactAddressList(conAdd).getOutput();
    var tmpList = aa.util.newArrayList();
    var pri = true;
    for(x in addList){
        if(pri){
            pri=false;
            addList[x].getContactAddressModel().setPrimary("Y");
        }
        tmpList.add(addList[x].getContactAddressModel());
    }
       
    return tmpList;
}
//********************************************************************************************************
//Script 		getROWOverlapStreetRecords
//
//Record Types:	Public Works Right of Way Management scripting
//
//Event: 		usually Fired at ACA and in PageFlow for these record types 
//
//Desc:			Find all open ROW records with conflicting work dates on same streets 
//
//Created By: Silver Lining Solutions
//********************************************************************************************************
// Change Log
//			Date        Name			Modification
//			01-16-2019  Chad			Created
//			01-16-2019  Chad			changed to check for b1_alt_id match
//			01-17-2019	Chad			Changes for ACA
//			01-30-2019	Chad			Added Street Direction Logic
//********************************************************************************************************
function getROWOverlapStreetRecords( lStartDate, lEndDate, lStreetName, lStreetDir, lStreetStartNum, lStreetEndNum ) {
logDebug("START getROWOverlapStreetRecords");
	try {
		var matchedRecList =[];
		
		var selectString = "EXEC DBO.sp_GetOverlapROWStreetRecords '"+lStartDate+"','"+lEndDate+"','"+lStreetName+"','"+lStreetDir+"','"+lStreetStartNum+"','"+lStreetEndNum+"';"
		logDebug("selectString="+selectString);

		var initialContext = aa.proxyInvoker.newInstance("javax.naming.InitialContext").getOutput();
		var ds = initialContext.lookup("java:/AA"); 
		var conn = ds.getConnection(); 
		var sStmt = conn.prepareStatement(selectString);
		var rSet = sStmt.executeQuery();
		logDebug("SQL Success!!!");
		var cntr = 0;

		var chkAltId = "";

		while (rSet.next()) {
/* Depending on what we really need here we could list out the rec IDs, OR just set a boolean and be done on the first pass */
			var mB1_Alt_id	= rSet.getString("B1_ALT_ID"); 
			var mWorkStart	= rSet.getString("workStart"); 
			var mWorkEnd	= rSet.getString("workEnd"); 
			var mStreetName	= rSet.getString("StrtName"); 
			var mStreetDir	= rSet.getString("StrtDir"); 
			var mStartNum	= rSet.getString("StartNum"); 
			var mEndNum		= rSet.getString("EndNum"); 

						
			if (!publicUser) chkAltId = cap.getCapModel().getAltID();
			else if ( publicUser && (typeof controlString != "undefined") && controlString == "ConvertToRealCAPAfter")  {
				chkAltId = cap.getCapModel().getAltID()
			}
				if (mB1_Alt_id != chkAltId) {
				matchedRecList.push(mB1_Alt_id);
				var msgStr	=	"Potential Right of Way Work Conflicts at record:"+mB1_Alt_id
							+	"<br>      starting:"+mWorkStart
							+	"<br>      ending:"+mWorkEnd
							+	"<br>      on street:"+mStreetName
							+	"<br>      street direction:"+mStreetDir
							+	"<br>      start address:"+mStartNum
							+	"<br>      end address:"+mEndNum;
				logDebug(msgStr);
			} else 
				logDebug("it is the same ID for getaltId >"+cap.getCapModel().getAltID()+"< and mb1alt >"+mB1_Alt_id);			
		cntr++;
		} 
		rSet.close(); 
		conn.close();
		logDebug("found :"+cntr+" records that are potential conflicts!");
	}
	catch(err){
		logDebug("Error on GoGetAnSQLDone function. Please contact administrator. Err: " + err);
	}
//	logDebug("your rec list is:"+matchedRecList);
	var unqRecMatches = uniqArray(matchedRecList);
//	logDebug("your UNIQUE rec list is:"+unqRecMatches);	
	logDebug("END getROWOverlapStreetRecords");
	return (unqRecMatches);
}

//**************************************************************************
//Function		getTaskAssignedStaff
//Desc:			given a workflow task, return the staff object that has been
// 				assigned to the task.
//
//input:		wfstr: the workflow task name (string)
//				process name (string) [optional]
//
//returns:		people object 
//
//Created By: Silver Lining Solutions
//**************************************************************************
//********************************************************************************************************
// Change Log
//         		Date		Name			Modification
//				08/15/2018	Eric 			Initial Development
//********************************************************************************************************

function getTaskAssignedStaff(wfstr) // optional process name
{
	logDebug("function getTaskAssignedStaff - Begin");

	var useProcess = false;
	var processName = "";
	if (arguments.length == 2) {
		processName = arguments[1]; // subprocess
		useProcess = true;
	}

	var workflowResult = aa.workflow.getTaskItems(capId, wfstr, processName, null, null, null);
	
	if (workflowResult.getSuccess()) {
		var wfObj = workflowResult.getOutput();
	}
	else {
		aa.print("**ERROR: Failed to get workflow object: " + workflowResult.getErrorMessage());
		logDebug("function getTaskAssignedStaff - End");
		return false;
	}

	for (i in wfObj) {
		var fTask = wfObj[i];

		if (fTask.getTaskDescription().toUpperCase().equals(wfstr.toUpperCase()) && (!useProcess || fTask.getProcessCode().equals(processName))) 
		{
			var aStaff = fTask.getAssignedStaff();
			var staffObj = aa.person.getUser(aStaff.firstName, "", aStaff.lastName).getOutput(); 

			logDebug("function getTaskAssignedStaff - End");
			return(staffObj);
		}
	}
}
//**************************************************************************
//Function		getTaskAssignedStaffEmail
//Desc:			given a workflow task, return the staff email for the staff that has been
// 				assigned to the task or null if does not exist.
//
//input:		wfstr: the workflow task name (string)
//				process name (string) [optional]
//
//returns:		people object 
//
//Created By: Silver Lining Solutions
//**************************************************************************
//********************************************************************************************************
// Change Log
//         		Date		Name			Modification
//				09/11/2018	Eric 			Initial Development
//********************************************************************************************************

function getTaskAssignedStaffEmail(wfstr) // optional process name
{
	logDebug("function getTaskAssignedStaff - Begin");
	
	var staffEmail = null;
	var useProcess = false;
	var processName = "";
	if (arguments.length == 2) {
		processName = arguments[1]; // subprocess
		useProcess = true;
	}

	var workflowResult = aa.workflow.getTaskItems(capId, wfstr, processName, null, null, null);
	
	if (workflowResult.getSuccess()) {
		var wfObj = workflowResult.getOutput();
	}
	else {
		aa.print("**ERROR: Failed to get workflow object: " + workflowResult.getErrorMessage());
		logDebug("function getTaskAssignedStaff - End");
		return false;
	}

	for (i in wfObj) {
		var fTask = wfObj[i];

		if (fTask.getTaskDescription().toUpperCase().equals(wfstr.toUpperCase()) && (!useProcess || fTask.getProcessCode().equals(processName))) 
		{
			var aStaff = fTask.getAssignedStaff();
			var staffObj = aa.person.getUser(aStaff.firstName, "", aStaff.lastName).getOutput(); 
			if (staffObj)
			{
				staffEmail = staffObj.getEmail();
				logDebug("StaffEmail: " + staffEmail);
				return staffEmail;
			}
			logDebug("function getTaskAssignedStaff - End");
			return staffEmail;			
		}
	}
}
function getWorkDescription(capId)
{
	var capAddresses = null;
	var workDesc = "";
	
	var workDescResult = aa.cap.getCapWorkDesByPK(capId);	
	var workDesObj = workDescResult.getOutput().getCapWorkDesModel();
	
	workDesc = workDesObj.getDescription();

	return workDesc;
}

/*------------------------------------------------------------------------------------------------------/
| Accela Automation
| Accela, Inc.
| Copyright (C): 2012
|
| Program : INCLUDES_CUSTOM.js
| Event   : N/A
|
| Usage   : Custom Script Include.  Insert custom EMSE Function below and they will be 
|	    available to all master scripts
|
| Notes   :  
|			06-26-2018: originally from bpt includes custom.  Now using EMSE 3.0 this script 
|						file has been renamed.
|
/------------------------------------------------------------------------------------------------------*/
function doScriptActions() {
	include(prefix + ":" + "*/*/*/*");
	if (typeof(appTypeArray) == "object") {
		include(prefix + ":" + appTypeArray[0] + "/*/*/*");
		include(prefix + ":" + appTypeArray[0] + "/" + appTypeArray[1] + "/*/*");
		include(prefix + ":" + appTypeArray[0] + "/" + appTypeArray[1] + "/" + appTypeArray[2] + "/*");
		include(prefix + ":" + appTypeArray[0] + "/*/" + appTypeArray[2] + "/*");
		include(prefix + ":" + appTypeArray[0] + "/*/" + appTypeArray[2] + "/" + appTypeArray[3]);
		include(prefix + ":" + appTypeArray[0] + "/*/*/" + appTypeArray[3]);
		include(prefix + ":" + appTypeArray[0] + "/" + appTypeArray[1] + "/*/" + appTypeArray[3]);
		include(prefix + ":" + appTypeArray[0] + "/" + appTypeArray[1] + "/" + appTypeArray[2] + "/" + appTypeArray[3]);
	}
}

function loadASITable4ACA(tname, cap) {
	var gm = cap.getAppSpecificTableGroupModel()
	var ta = gm.getTablesMap();
	var tai = ta.values().iterator();
	while (tai.hasNext()) {
	  var tsm = tai.next();
	  var tn = tsm.getTableName();

      	  if (!tn.equals(tname)) continue;
	  if (tsm.rowIndex.isEmpty()) {
			logDebug("Couldn't load ASI Table " + tname + " it is empty");
			return false;
		}

   	  var tempObject = new Array();
	  var tempArray = new Array();

  	  var tsmfldi = tsm.getTableField().iterator();
	  var tsmcoli = tsm.getColumns().iterator();
	  var numrows = 1;

	  while (tsmfldi.hasNext())  // cycle through fields
		{
		if (!tsmcoli.hasNext())  // cycle through columns
			{
			var tsmcoli = tsm.getColumns().iterator();
			tempArray.push(tempObject);  // end of record
			var tempObject = new Array();  // clear the temp obj
			numrows++;
			}
		var tcol = tsmcoli.next();
		var tval = tsmfldi.next();
		var readOnly = 'N';
		var fieldInfo = new asiTableValObj(tcol.getColumnName(), tval, readOnly);
		tempObject[tcol.getColumnName()] = fieldInfo;

		}
		tempArray.push(tempObject);  // end of record
	  }
	  return tempArray;
	}

function mapGISAttribToASI(svc,layer,attributeName,asiName) {
/* 
	for example: "SANTABARBARA", "High Fire Hazard Areas", "assessment", "In High Fire"
		will copy assessment value of High Fire Hazard Areas layer to "In High Fire" custom field
*/
	try {
		logDebug("mapGISAttribToASI: param svc is:"+svc);
		logDebug("mapGISAttribToASI: param layer is:"+layer);
		logDebug("mapGISAttribToASI: param attributeName is:"+attributeName);
		logDebug("mapGISAttribToASI: param asiName is:"+asiName);
		
		var arrGIS = getGISInfoArray2(svc, layer, attributeName, -2);
		if (arrGIS != null && arrGIS.length > 0) {
			var gisAttrforASI = arrGIS.toString();
			editAppSpecific(asiName,gisAttrforASI);
		}
		else { logDebug("mapGISAttribToASI: NO ATTRIBUTE FOUND FOR ATTRIB:"+attributeName); }
	}
	catch (err) {
		logDebug("A JavaScript Error occurred: function mapGISAttribToASI: " + err.message);
		logDebug(err.stack);
	}
}

//********************************************************************************************************
//Script 		mapGISStreetSegsFromROWMASIT
//
//Record Types:	Public Works Right of Way Management scripting
//
//Event: 		called by ACA and AA scripts to attach gis information to the record 
//
//Desc:			Find all parcels for every street segment listed in ASIT and attach them to the record 
//
//Created By: Silver Lining Solutions
//********************************************************************************************************
// Change Log
//			Date		Name		Modification
//			01-22-2019	Chad		created
//			01-31-2019	Chad		Added street Dir logic to esri query 
//			02-15-2019	Chad		Change needed for underscore street directions - do not use in query to ESRI
//********************************************************************************************************
function mapGISStreetSegsFromROWMASIT( streetsToFindArr, gisObjSearchType ) {
	logDebug("START of mapGISStreetSegsFromROWMASIT;");
	var keepAPNsToAdd = [];

	// for each line of the ASIT, go find the segments to add to our record.
	for ( asitRow in streetsToFindArr ) {
		if (gisObjSearchType == "PARCEL") {
			var asitStreetName = streetsToFindArr[asitRow]["Street Name"].toString().toUpperCase();
			var asitStreetStartCheck = streetsToFindArr[asitRow]["Start Num"].toString().toUpperCase();
			var asitStreetEndCheck = streetsToFindArr[asitRow]["End Num"].toString().toUpperCase();
			var asitStreetDirCheck = streetsToFindArr[asitRow]["Direction"].toString().toUpperCase(); 
			var sbESRIQuery = "where=APN+like++%27ROW%25%27+and+SStreet+%3D+%27"+asitStreetName.replace(/ /g, "+")+"%27";
			
			if (asitStreetDirCheck != "_") {
				sbESRIQuery += "+and+SDir%3D+%27"+asitStreetDirCheck+"%27";
			}
		}
		else {
			return false;
		}

		sbESRIQuery += "&text=&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope";
		sbESRIQuery += "&inSR=&spatialRel=esriSpatialRelIntersects&relationParam=";
		sbESRIQuery += "&outFields=APN%2C+ADLF%2C+ADLT%2C+ADRF%2C+ADRT";
		sbESRIQuery += "&returnGeometry=false";
		sbESRIQuery += "&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=&outSR=";
		sbESRIQuery += "&returnIdsOnly=false";
		sbESRIQuery += "&returnCountOnly=false";
		sbESRIQuery += "&orderByFields=&groupByFieldsForStatistics=&outStatistics=";
		sbESRIQuery += "&returnZ=false&returnM=false&gdbVersion=&returnDistinctValues=true";
		sbESRIQuery += "&resultOffset=&resultRecordCount=&queryByDistance=&returnExtentsOnly=false";
		sbESRIQuery += "&datumTransformation=";
		sbESRIQuery += "\u0026+parameterValues=&rangeValues=";
		sbESRIQuery += "&f=pjson";

		var url = lookup("ROWM_ESRI_PARCEL_QUERY_URL", "Parcel");
		
		url += sbESRIQuery;
		logDebug("url: " + url);

		var login = "";
		logDebug("login: " + login);

		var password = "";
		logDebug("password: " + password);
		try {

			//Create an instance of the ObjectMapper that we'll be using for serialization
			var objectMapper = new org.codehaus.jackson.map.ObjectMapper();
			var esriGETResult = doHttpGET(login, password, url, "application/json");
			var arrFromJson = JSON.parse( esriGETResult );

			for (feat in arrFromJson.features) {
//				logDebug("************ parcel "+feat+" Found! **********************");
				var esriFeatureList = arrFromJson.features[feat];
				for ( attrList in esriFeatureList ) {
					//    print all
					//for ( esriAddrAttrib in esriFeatureList[attrList]) {
					//logDebug("----> "+esriAddrAttrib+" is:"+esriFeatureList[attrList][esriAddrAttrib]);
					//}
												
					if (!esriFeatureList[attrList]["APN"]) continue; // no full address, we can't parse
					if (!esriFeatureList[attrList]["ADLF"] && !esriFeatureList[attrList]["ADRF"]) continue;  //no from number can't do this
					if (!esriFeatureList[attrList]["ADLT"] && !esriFeatureList[attrList]["ADRT"]) continue;  //no from number can't do this

					if ( esriFeatureList[attrList]["ADLF"] <= esriFeatureList[attrList]["ADRF"] ) {
						var streetSegStartAddNbr = esriFeatureList[attrList]["ADLF"];
					}
					else {
						var streetSegStartAddNbr = esriFeatureList[attrList]["ADRF"];	
					}

					if ( esriFeatureList[attrList]["ADLT"] >= esriFeatureList[attrList]["ADRT"] ) {
						var streetSegEndAddNbr = esriFeatureList[attrList]["ADLT"];
					}
					else {
						var streetSegEndAddNbr = esriFeatureList[attrList]["ADRT"];	
					}
					if	(  (streetSegStartAddNbr >= asitStreetStartCheck && streetSegStartAddNbr <= asitStreetEndCheck)
						|| (streetSegEndAddNbr >= asitStreetStartCheck && streetSegEndAddNbr <= asitStreetEndCheck)
						|| (asitStreetStartCheck >= streetSegStartAddNbr && asitStreetStartCheck <= streetSegEndAddNbr)
						|| (asitStreetEndCheck >= streetSegStartAddNbr && asitStreetEndCheck <= streetSegEndAddNbr) ) {
//						logDebug("we would keep this segment for later! >>>>>>>>>>"+esriFeatureList[attrList]["APN"]);
						keepAPNsToAdd.push(esriFeatureList[attrList]["APN"]);  // could put whole obj here though if needed!
					}
				}
			}
		} catch (exception) {
// we need to email PBW that this record could not link objects so they can investigate and fix!

			var subject = "getESRIStreetSegmentAddresses custom script function processing error alert";
			var message = "";

			try { message += "Exception caught in getESRIStreetSegmentAddresses custom script function\n" } catch (_exception) { }
			try { message += "exception: " + exception + "\n"; } catch (_exception) { }
			try { message += "exception.fileName: " + exception.fileName + "\n"; } catch (_exception) { }
			try { message += "exception.lineNumber: " + exception.lineNumber + "\n"; } catch (_exception) { }
			try { message += "exception.message: " + exception.message + "\n"; } catch (_exception) { }
			try { message += "exception.name: " + exception.name + "\n"; } catch (_exception) { }
			try { message += "exception.rhinoException: " + exception.rhinoException + "\n"; } catch (_exception) { }
			try { message += "exception.stack: " + exception.stack + "\n"; } catch (_exception) { }

			logDebug(message);
			return false;
		}
//		logDebug("For "+asitStreetStartCheck+"-"+asitStreetEndCheck+" "+asitStreetName);
//		logDebug("    we would keep:<br>     "+keepAPNsToAdd.join("<br>     "));
	}
	keepAPNsToAdd = keepAPNsToAdd.sort();
//	logDebug("AFTER ALL ASIT rows checked we would keep "+keepAPNsToAdd.length+" elements:<br>     "+keepAPNsToAdd.join("<br>     "));
	var unqArrForMe = uniqArray(keepAPNsToAdd);
	logDebug("AFTER UNIQUE keep "+unqArrForMe.length+" elements:<br>     "+unqArrForMe.join("<br>     "));

	var gisAttachErrors = null;
	for (addGisObjId in unqArrForMe) {
		var wParcels = aa.parcel.getParceListForAdmin(unqArrForMe[addGisObjId],
								null, //java.lang.String addressStart,
								null, //java.lang.String addressEnd,
								null, //java.lang.String direction,
								null, //java.lang.String streetName,
								null, //java.lang.String suffix,
								null, //java.lang.String unitStart,
								null, // java.lang.String unitEnd,
								null, //java.lang.String city,
								null //java.lang.String ownerName
								).getOutput();

		var wParcelModelToWarp = wParcels[0].getParcelModel();

		var capParModel = aa.parcel.warpCapIdParcelModel2CapParcelModel(capId,wParcelModelToWarp).getOutput()

		var createPMResult = aa.parcel.createCapParcel(capParModel);
		if (createPMResult.getSuccess())
			logDebug("created CAP Parcel");
		else
			{ logDebug("**WARNING: Failed to create the cap Parcel " + createPMResult.getErrorMessage()); }
		
		var upGisObs = aa.gis.addCapGISObject(capId, "SANTABARBARA", "Assessors Parcels", unqArrForMe[addGisObjId]);
		if (upGisObs) logDebug("ATTACHED GIS OBJECT SUCCESSFULLY! ----->"+unqArrForMe[addGisObjId]);
		else gisAttachErrors += "<br>FAILED TO ATTACHED GIS OBJECT! ----->"+unqArrForMe[addGisObjId];
	}
	if (gisAttachErrors) {
		// its not specified as biz requirement but in the future you could add an email send here.
		logDebug(gisAttachErrors);
	}
	logDebug("END of mapGISStreetSegsFromROWMASIT;");
	return true;
} // END mapGISStreetSegsFromROWMASIT

//********************************************************************************************************
//Script 		notification
//Record Types:	?*/*/*/*
//
//Event: 		WFTA
//
//Desc:			this script will provide the Agency with a 'configurable' strategy for sending 
//				emails to both internal users and contacts using the Notification templates
//
//
//				A standard choice table (NOTIFICATION_RULES) will be used with entries as follows
//		
//		lookup Value							
//		AppType|Task|Status					
//
//		lookup Result
//		NotificationTemplate|<toList>|<ccList>
//
//				the NotificationTemplate will then be used in the call to send and attach the emailParameters
//				the <toList> and <ccList> information will provide the ability to customize the list of people
//				to be contacted and will be parsed as follows:
//
//		<toList> = person,person,person...
//		where person may be:	AppStaff,WFStaff,Owner,ContactType
//
//			AppStaff: the user assigned to the recordAlias$$
//			WFStaff:  the user assigned to the WF task (will only work fow WF)
//			Owner:  the APO Owner
//			ContactType:  from the list of Contacts the contact type's email will be applied
//						for example - Applicant, Agent, etc.
//
//
// EXAMPLES
//	Fire/*/*/|Application Submittal|Submitted		SubmittalNotification|Applicant|AppStaff
//
//
//Created By: Silver Lining Solutions 
//********************************************************************************************************
// Change Log
//         		Date		Name			Modification
//				9/212018	Eric			Original Development
//				??			??				someone added the fromEmail lookup 
//				9/18/2019	Eric			Completed the script for workflow
//********************************************************************************************************
function notification(triggerEvent)
{

	var fromEmail = lookup("SCRIPT_EMAIL_FROM","AGENCY_FROM");	
	var toEmail = "";
	var ccEmail = "";
	var notificationTemplateName = "";
	var reportFile = [];  // empty set for the file list
	var capID4Email = aa.cap.createCapIDScriptModel(capId.getID1(),capId.getID2(),capId.getID3());
	var emailParameters = aa.util.newHashtable();
	var staff = null;
	var lookupTable = "NOTIFICATION_RULES";
	var lookupResult = null;
	var lookupValue = wfTask + "|" + wfStatus;

	showMessage = true;
// do not force the debug window open within scripts.  This should only be set in includes_custom_globals
// leaving showMessage for now, but this should be set to true to send the comment to the screen and then back to false when done
//	showDebug = true;
	logDebug("notification - Begin");
	logDebug("controlString = " + controlString);
	logDebug("triggerEvent = " + triggerEvent);
	logDebug("lookupTable = " + lookupTable);
	logDebug("lookupValue = " + lookupValue);
	logDebug("appTypeString = " + appTypeString);

	lookupResult = appTypePriorityLookup(lookupTable,lookupValue,appTypeString);
	
	if (lookupResult)
	{
		var lookupResultArray = lookupResult.split("|");
		notificationTemplateName = lookupResultArray[0];
		logDebug("template name = " + notificationTemplateName);
		var toEmailList=lookupResultArray[1];
		var ccEmailList=lookupResultArray[2];
		
		logDebug("calling notificationParamBuild");
		emailParameters = notificationParamBuild(emailParameters);
		logDebug("emailParameters = " + emailParameters);

		logDebug("calling notificationDistributionBuild");
		toEmail = notificationDistributionBuild(toEmailList);
		logDebug("toEmail = " + toEmail);

		logDebug("calling notificationDistributionBuild");
		ccEmail = notificationDistributionBuild(ccEmailList);
		logDebug("ccEmail = " + ccEmail);
	
		logDebug("email params = " + emailParameters);
	// send Notification
		logDebug("calling sendNotification");
		var sendResult = sendNotification(fromEmail,toEmail,ccEmail,notificationTemplateName,emailParameters,reportFile,capID4Email);
		logDebug("sendResult = " + sendResult);

		if (!sendResult) 
			{ logDebug("UNABLE TO SEND NOTICE!  ERROR: "+sendResult); }
		else
			{ logDebug("Sent Notification"); }  
	}		
	
	logDebug("notification - End");
}
function notificationParamBuild(emailParameters)
{
	addParameter(emailParameters, "$$altID$$", cap.getCapModel().getAltID());
	addParameter(emailParameters, "$$recordAlias$$", cap.getCapType().getAlias());
	addParameter(emailParameters, "$$wfComments$$", wfComment);
	addParameter(emailParameters, "$$recAddress$$", getAddress(capId));
	addParameter(emailParameters, "$$recDescription$$", getWorkDescription(capId));
	
	return emailParameters;
}

function notificationDistributionBuild(emailList)
{
	var email = "";
	var emailListArray = emailList.split(",");
	for (var i=0; i<emailListArray.length;i++)
	{
		if (emailListArray[i] == "AppStaff")
		{
			var staff = getRecordAssignedStaffEmail();
			if (staff){email += "; " + staff; logDebug("email: " + email);}
		}
		else if (emailListArray[i] == "WFStaff")
		{
			var staff = getTaskAssignedStaffEmail("Plans Distribution");
			if (staff){email += "; " + staff; logDebug("email: " + email);}
		}
		else
		{
			var contactType = emailListArray[i];
			var capContactResult = aa.people.getCapContactByCapID(capId);
			if (capContactResult.getSuccess())
			{
				var Contacts = capContactResult.getOutput();
				for (yy in Contacts)
					if (contactType.equals(Contacts[yy].getCapContactModel().getPeople().getContactType()))
						if (Contacts[yy].getEmail() != null)
						{
							email += ";" + Contacts[yy].getEmail();
							logDebug("email: " + email);
						}
			}
		}
	}

	return email;
}

function parseAltIdFromContent(content)
{       
		//This is just a sample.
		//Note, please customize the RegExp for actual AlternateID.
        var altIdFormat = /Record ID #(...\d+-\d+)+/ig;
//        var altIdFormat = /Record ID #(.*\w)+/; 		this is original from Accela
		var result = altIdFormat.exec(content);
		if(result){
			return result;
		}
		else {
			aa.print('No record id has been parsed from content.'+content);
			logDebug('No record id has been parsed from content. content was:'+content);
			return null;
		}
}

/*------------------------------------------------------------------------------------------------------/
| function: pop
|
| Desc: will provide both function and propery information for the class provided as a parameter.
|       this function is valuable for assisting a developer in researching the contents of an unknown
|       or undocumented class.
|
| Params: 	name 	= used for organizing the output and displaying the variable 
|			obj		= the object that will be defined
| Created By: Silver Lining Solutions
|------------------------------------------------------------------------------------------------------*/

function pop(name,obj){
	var idx;	var methArr = [];	var attArr = [];
	aa.print("*************************************************************************");
	aa.print("***** Start of " + name);
    if(obj.getClass != null){ aa.print("***** " + obj.getClass()); }
    else { aa.print("this is not an object with a class!"); }

	for(idx in obj){
		if (typeof (obj[idx]) == "function") {
			try {
				var methStr = "" + idx + "==>  " +obj[idx]();	methArr.push(methStr);
			} catch (ex) { }
		} else {
			
			var attStr = "" + idx + ": " +obj[idx]; attArr.push(attStr);
		}
	}

	if (methArr.length > 0)	{methArr.sort(); aa.print(methArr.length + " methods");	for (i = 0; i < methArr.length; i++){aa.print("     Method " + methArr[i]);	}}

	if (attArr.length > 0){attArr.sort(); aa.print(attArr.length + " attributes"); for (i = 0; i < attArr.length; i++) { aa.print("     Attrib " + attArr[i]);}}
	aa.print("***** END of " + name);
	aa.print("*************************************************************************");
}
//********************************************************************************************************
//Script 		printObjProperties
//Record Types:	helper function
//
//Event: 		na
//
//Desc:			print object contents
//
//Created By: Silver Lining Solutions
//********************************************************************************************************
// Change Log
//         		Date		Name			Modification
//				08-09-2018	Chad			Initial Draft
//********************************************************************************************************

function printObjProperties(obj){
    var idx;

    if(obj.getClass != null){
        logDebug("************* " + obj.getClass() + " *************");
    }
	else {
		logDebug("this is not an object with a class!");
	}

    for(idx in obj){
        if (typeof (obj[idx]) == "function") {
            try {
                logDebug(idx + "==>  " + obj[idx]());
            } catch (ex) { }
        } else {
            logDebug(idx + ":  " + obj[idx]);
        }
    }
}

//********************************************************************************************************
//Script 		SendDataTicketAdminCitationUploadedEmail 
//Record Types:	?Enforcement/*/*/*
//
//Event: 		this script may be triggered from DocumentUploadAfter.
//
//Desc:			When a user uploads a document that has "ADMIN CITATION" in its name, send 
//				dataticket.com an email notification and attach the new uploaded file.
//
//Created By: Silver Lining Solutions 
//********************************************************************************************************
// Change Log
//				Date		Name			Modification
//				06/24/2018	Chad			Original Development
//				10/31/2019	Chad			Added Admin Citation Appeal Staff Report doc type
//********************************************************************************************************
function SendDataTicketAdminCitationUploadedEmail()
{
	var toEmail = lookup("ADMIN_CITATION_UPLOADED_EMAIL", "EMAIL_TO");

	var fromEmail = scriptAgencyEmailFrom;
//	var fromEmail = 'AccelaDev@santabarbaraca.gov';
	var ccEmail = "";
	var notificationTemplate = "ADMIN CITATION UPLOADED";
	var reportFile = [];  // empty set for the file list
	var capID4Email = aa.cap.createCapIDScriptModel(capId.getID1(),capId.getID2(),capId.getID3());
	var emailParameters = aa.util.newHashtable();
	var staff = null;
	var lAltId = cap.getCapModel().getAltID();
	var lRecAlias = cap.getCapType().getAlias();

//	toEmail += " admincites@dataticket.com   ROLL THIS WHEN YOU ARE READY TO ACTUALL TEST
//	toEmail += "cweiffenbach@santabarbaraca.gov";
	

	//	spec says no aca as of 6-11-19
	//	var acaSite = lookup("ACA_CONFIGS", "OFFICIAL_WEBSITE_URL");
	//	addParameter(emailParameters,"$$acaUrl$$",acaSite);


	// identify the doc(s) that were just uploaded and for each doc, send a notification
	//chad add this line back when you are ready to roll
	//	var docArray = documentModelArray.toArray();
	// fake it out here
	docArray = documentModelArray.toArray();
	var err = 0;

	var documentModel = null;
	var fileName = null;

	// find the doc uploaded that has 'Appeal Request%' in the doc name 
	// - talk to biz about this, might be better to have docd type
	logDebug("document model array length is :"+docArray.length);
	for (i = 0; i < docArray.length; i++) {
		documentModel = docArray[i];
		var iDocFileName = documentModel.getDocName();
		iDocFileName = iDocFileName.toUpperCase();

		var iDocCat			= documentModel.getDocCategory();
		var iDocGroup		= documentModel.getDocGroup();
		
		// lateset criteria from Andrew 06/28/19
		// 		group must be 'ENF', doc cats must be in:
		//		"Admin Citation 1", 
		//		"Admin Citation 2", 
		//		"Admin Citation 3 or More", 
		//		"Admin Citation Appeal Request"
		
		
//		if (iDocFileName.indexOf("ADMIN CITATION") >= 0 ) {  // FOUND IT!
		if (iDocGroup == 'ENF' && (
				iDocCat == 'Admin Citation 1' ||
				iDocCat == 'Admin Citation 2' ||
				iDocCat == 'Admin Citation 3 or More' ||
				iDocCat == 'Admin Citation Appeal Staff Report'
			))
		{
		
			var iDocCustomID	= lAltId;
			var iDocEntityID	= documentModel.getEntityID();
			var iDocEntityType	= documentModel.getEntityType();
			var iDocType		= documentModel.getDocType();
			var iDocID			= documentModel.getDocumentNo();
			var iDocFileKey		= documentModel.getFileKey();
			var iDocFileName	= documentModel.getFileName();
			var iDocFileSize	= documentModel.getFileSize();
			var iDocUploadedBy	= documentModel.getFileUpLoadBy();
			var iDocUploadDate	= documentModel.getFileUpLoadDate();
			var iDocSource		= documentModel.getSource();

			var iDocFileName2 = encodeURI(iDocFileName);
			logDebug("doc name is:"+iDocFileName);
			logDebug("doc name uri:"+iDocFileName2);

			// prepare Notification parameters
			addParameter(emailParameters, "$$altID$$", lAltId);
			addParameter(emailParameters, "$$recordAlias$$", lRecAlias);
			addParameter(emailParameters, "$$docNo$$", iDocID);
			addParameter(emailParameters, "$$docType$$", iDocType);
			addParameter(emailParameters, "$$docGroup$$", iDocGroup);
			addParameter(emailParameters, "$$docFileName$$", iDocFileName);
			addParameter(emailParameters, "$$docName$$", iDocFileName);
			addParameter(emailParameters, "$$docCategory$$", iDocCat);
			addParameter(emailParameters, "$$docUploadBy$$", iDocUploadedBy);
			addParameter(emailParameters, "$$docUploadDate$$", iDocUploadDate);


			var iFilePathResult = aa.document.downloadFile2Disk(documentModel, documentModel.getModuleName(),"","",true);
			if(iFilePathResult.getSuccess())
			{
				var iFilePath = iFilePathResult.getOutput();
				logDebug("the file path is :"+iFilePath);
				reportFile.push(iFilePath);
				var sendResult = sendNotification(fromEmail,toEmail,ccEmail,notificationTemplate,emailParameters,reportFile,capID4Email);
				if (!sendResult) 
					{ logDebug("UNABLE TO SEND NOTICE!  ERROR: "+sendResult); }
				else
					{ logDebug("Sent Notification"); }  
			}
		}
	}
}

//********************************************************************************************************
//Script 		SendDataTicketAppealsRequestUploadedEmail 
//Record Types:	?Enforcement/*/*/*
//
//Event: 		this script may be triggered from DocumentUploadAfter.
//
//Desc:			When a user uploads a document that has "APPEAL REQUEST" in its name, send 
//				dataticket.com an email notification and attach the new uploaded file.
//
//Created By: Silver Lining Solutions 
//********************************************************************************************************
// Change Log
//				Date		Name			Modification
//				06/24/2018	Chad			Original Development
//********************************************************************************************************
function SendDataTicketAppealsRequestUploadedEmail()
{
	var toEmail = lookup("APPEALS_REQUEST_UPLOADED_EMAIL", "EMAIL_TO");

	var fromEmail = scriptAgencyEmailFrom;
//	var fromEmail = 'AccelaDev@santabarbaraca.gov';
	var ccEmail = "";
	var notificationTemplate = "APPEAL REQUEST UPLOADED";
	var reportFile = [];  // empty set for the file list
	var capID4Email = aa.cap.createCapIDScriptModel(capId.getID1(),capId.getID2(),capId.getID3());
	var emailParameters = aa.util.newHashtable();
	var staff = null;
	var lAltId = cap.getCapModel().getAltID();
	var lRecAlias = cap.getCapType().getAlias();

//	toEmail += " admincites@dataticket.com   ROLL THIS WHEN YOU ARE READY TO ACTUALL TEST
//	toEmail += "cweiffenbach@santabarbaraca.gov";
	

	//	spec says no aca as of 6-11-19
	//	var acaSite = lookup("ACA_CONFIGS", "OFFICIAL_WEBSITE_URL");
	//	addParameter(emailParameters,"$$acaUrl$$",acaSite);


	// identify the doc(s) that were just uploaded and for each doc, send a notification
	//chad add this line back when you are ready to roll
	//	var docArray = documentModelArray.toArray();
	// fake it out here
	docArray = documentModelArray.toArray();
	var err = 0;

	var documentModel = null;
	var fileName = null;

	// find the doc uploaded that has 'Appeal Request%' in the doc name 
	// - talk to biz about this, might be better to have docd type
	logDebug("document model array length is :"+docArray.length);
	for (i = 0; i < docArray.length; i++) {
		documentModel = docArray[i];
		var iDocFileName = documentModel.getDocName();
		iDocFileName = iDocFileName.toUpperCase();

		var iDocCat			= documentModel.getDocCategory();
		var iDocGroup		= documentModel.getDocGroup();
		
//		if (iDocFileName.indexOf("APPEAL REQUEST") >= 0 ) {  // FOUND IT!
		if (iDocGroup == 'ENF' && (iDocCat == 'Admin Citation Appeal Request')) {
			var iDocCustomID	= lAltId;
			var iDocEntityID	= documentModel.getEntityID();
			var iDocEntityType	= documentModel.getEntityType();
			var iDocCat			= documentModel.getDocCategory();
			var iDocGroup		= documentModel.getDocGroup();
			var iDocType		= documentModel.getDocType();
			var iDocID			= documentModel.getDocumentNo();
			var iDocFileKey		= documentModel.getFileKey();
			var iDocFileName	= documentModel.getFileName();
			var iDocFileSize	= documentModel.getFileSize();
			var iDocUploadedBy	= documentModel.getFileUpLoadBy();
			var iDocUploadDate	= documentModel.getFileUpLoadDate();
			var iDocSource		= documentModel.getSource();

			var iDocFileName2 = encodeURI(iDocFileName);
			logDebug("doc name is:"+iDocFileName);
			logDebug("doc name uri:"+iDocFileName2);

			// prepare Notification parameters
			addParameter(emailParameters, "$$altID$$", lAltId);
			addParameter(emailParameters, "$$recordAlias$$", lRecAlias);
			addParameter(emailParameters, "$$docNo$$", iDocID);
			addParameter(emailParameters, "$$docType$$", iDocType);
			addParameter(emailParameters, "$$docGroup$$", iDocGroup);
			addParameter(emailParameters, "$$docFileName$$", iDocFileName);
			addParameter(emailParameters, "$$docName$$", iDocFileName);
			addParameter(emailParameters, "$$docCategory$$", iDocCat);
			addParameter(emailParameters, "$$docUploadBy$$", iDocUploadedBy);
			addParameter(emailParameters, "$$docUploadDate$$", iDocUploadDate);


			var iFilePathResult = aa.document.downloadFile2Disk(documentModel, documentModel.getModuleName(),"","",true);
			if(iFilePathResult.getSuccess())
			{
				var iFilePath = iFilePathResult.getOutput();
				logDebug("the file path is :"+iFilePath);
				reportFile.push(iFilePath);
				var sendResult = sendNotification(fromEmail,toEmail,ccEmail,notificationTemplate,emailParameters,reportFile,capID4Email);
				if (!sendResult) 
					{ logDebug("UNABLE TO SEND NOTICE!  ERROR: "+sendResult); }
				else
					{ logDebug("Sent Notification"); }  
			}
		}
	}
}

//********************************************************************************************************
//Script 		Script tracker 3 - Technology Fee
//Record Types:	ALL
//
//Event: 		FAB and ASA
//
//Desc:			Whenever a fees are assessed, add an 8% technology fee before invoicing
//
//Created By: Silver Lining Solutions
//********************************************************************************************************
// Change Log
//				Date		Name			Modification
//				08-09-2018	Chad			Initial Draft
//				08-10-2018	Chad			Adding Lookup Logic
//********************************************************************************************************

function sumFeesAssessedBeforeInvoiceAndAddTechFee () {
	logDebug("start sumFeesAssessedBeforeInvoiceAndAddTechFee");

	var checkFeesArr = [], 
		techFeeTotal = 0,
		techFeeAmt = 0;
		
	checkFeesArr = loadFees();
	
	logDebug("printing check fees array -----------");
	
	var iTechFeeUpd = false;

	for (var x in checkFeesArr) {
		printObjProperties(checkFeesArr[x]);
		
		// here is where we check the fee schedule and fee code and add to our own techFeeTotal
		var iFeeAmt = null, iFeeSched = null, iFeeItem = null; iFeeStat = null; iFeeAmtPaid = null;
		
		iFeeAmt = checkFeesArr[x].amount;
		iFeeItem = checkFeesArr[x].code;
		iFeeSched = checkFeesArr[x].sched;
		iFeeStat = checkFeesArr[x].status;
		iFeeAmtPaid = checkFeesArr[x].amountPaid;
		
		if ( iFeeStat != 'NEW' ) {
			logDebug("Skipping fee because it is not NEW!");
			continue;
		}
		if ( iFeeAmtPaid > 0 ) {
			logDebug("Skipping fee because it has a paid amount!");
			continue;
		}
		if ( iFeeStat == 'NEW' && iFeeItem == 'PBW_TECH_FEE') iTechFeeUpd = true;
		
		// build the look up search, first the "all schedule"
		// if found, skip adding the fee.
			var lookupString = iFeeSched + "|*";		
			logDebug("lookupString = " + lookupString);

			var lookupValue = lookup("TechnologyFeeIgnoredFees", lookupString);
			logDebug("lookupValue = " + lookupValue);	

			if (lookupValue == '1') { logDebug("Ignore fee, "+lookupString+" in TechnologyFeeIgnoredFees standard choice"); continue; }
		
		// build the item look up search
		// if found, skip adding the fee.
			var lookupString = iFeeSched + "|" + iFeeItem;		
			logDebug("lookupString = " + lookupString);

			var lookupValue = lookup("TechnologyFeeIgnoredFees", lookupString);
			logDebug("lookupValue = " + lookupValue);	

			if (lookupValue == '1') { logDebug("Ignore fee, "+lookupString+" in TechnologyFeeIgnoredFees standard choice"); continue; }
		
			techFeeTotal += iFeeAmt;
		
	}
	comment("<font color=red><b>TECH FEE TOTAL = "+techFeeTotal+"</b></font>");
	
	if (techFeeTotal > 0) {
		
		// here we look up the apptype so we know what module we're dealing with
		// each dept will have different tech fee codes to apply.
		
		var thisModule = ""+ appTypeArray[0];
		logDebug("will assess fee for module="+thisModule);

		techFeeAmt = Number(techFeeTotal * 1).toFixed(2);
		
		switch(thisModule) {
			case "PublicWorks":
			case "PublicWorks":
			case "PublicWorks":
				logDebug("Public Works module... assessing fee of "+techFeeAmt);
				if (iTechFeeUpd) {
//					updateFee("PBW_TECH_FEE","PBW_TECH_FEE","FINAL", techFeeAmt, "N");
					removeFee("PBW_TECH_FEE","FINAL");
				}
				addFee("PBW_TECH_FEE","PBW_TECH_FEE","FINAL", techFeeAmt, "N");
				break;
			case "Building":
				logDebug("Building module... would assess fee but no spec...");
				break;
			default:
				logDebug("Module not included in tech fee assessment.");
		}
		
		
	} else { logDebug("no tech fee added"); }
	
	comment("<font color=red><b>TECH FEE AMOUNT = "+techFeeAmt+"</b></font>");
	logDebug("end sumFeesAssessedBeforeInvoiceAndAddTechFee");
}

function doConfigurableScriptActions(){
	var module = appTypeArray[0];
	
	rulesetName = "CONFIGURABLE_RULESET_" + module;
	rulesetName = rulesetName.toUpperCase();
	logDebug("rulesetName: " + rulesetName);
	
	 var configRuleset = getScriptText(rulesetName);
	 if (configRuleset == ""){
		 logDebug("No JSON file exists for this module.");
	 }else{
		var configJSON = JSON.parse(configRuleset);

	// match event, run appropriate configurable scripts
		settingsArray = [];
		if(configJSON[controlString]) {
			var ruleSetArray = configJSON[controlString];
			var scriptsToRun = ruleSetArray.StandardScripts;
			
			for (s in scriptsToRun){
				logDebug("doConfigurableScriptActions scriptsToRun[s]: " + scriptsToRun[s]);
				var script = scriptsToRun[s];
				var validScript = getScriptText(script);
				if (validScript == ""){
					logDebug("Configurable script " + script + " does not exist.");
				}else{
					eval(getScriptText(scriptsToRun[s]));
				}
			}
		}
	}
}

//********************************************************************************************************
//Script 		uniqArr
//Event: 		
//Desc:			helper function to eliminate dupes from an array 
//Created By: Silver Lining Solutions
//********************************************************************************************************
// Change Log
//         		Date        Name          Modification
//            01/10/2019	Chad          Created
//********************************************************************************************************
function uniqArray(a) {
    return a.sort().filter(function(item, pos, ary) {
        return !pos || item != ary[pos - 1];
    })
}

// ********************************************************************************************************
// Script 		updateAppNameWithAddress.js
// Record Types: PLN
//
// Event: 	ASA	
//
// Desc:	Update the application name to include address and zoning information
//			for Issue 30 of city issue tracking list
//
// Created By: Silver Lining Solutions
// ********************************************************************************************************
// Change Log
//         		Date		Name		Modification
//				10/17/2019	Chad		Orig
//				10/28/2019	Chad		Added Building, Fire, PublicWorks, Enforcement logic
//
// ********************************************************************************************************
function updateAppNameWithAddress() {
logDebug("start of updateAppNameWithAddress");
	var itemCap = null;

	if (arguments.length == 1) itemCap = arguments[0]; // use cap ID specified in args
	else var itemCapID = capId;
	
	var itemAltID			= itemCapID.getCustomID();
	var itemCap				= aa.cap.getCap(itemCapID).getOutput();
	var itemAppTypeResult	= itemCap.getCapType();
	var itemAppTypeString	= appTypeResult.toString();
	var itemAppTypeArray	= appTypeString.split("/");
	var appName				= itemCap.getSpecialText();
	var fcapAddressObj		= null;
	var addressAttrObj		= null;
	var lCapAddress			= "";
	var lAddrPrimary		= null;

   	var capAddressResult	= aa.address.getAddressWithAttributeByCapId(itemCapID);
   	if (capAddressResult.getSuccess()) {
   		var fcapAddressObj	= capAddressResult.getOutput();
	}
   	else {
     		logDebug("**ERROR: Failed to get Address object: " + capAddressResult.getErrorType() + ":" + capAddressResult.getErrorMessage())
	}

  	for (i in fcapAddressObj)
  	{
		lCapAddress = fcapAddressObj[i].getAddressDescription();
		lAddrPrimary = fcapAddressObj[i].getPrimaryFlag();
		
		if (lAddrPrimary) break;
	}	

	lCapAddress2 = lCapAddress;
	if (lCapAddress) {
		// for some reason the regex utils do not work with this address desc so... looping through old fashioned way!		
		var i = 0;
		while (lCapAddress2.indexOf(" ") >= 0 && i<100) {
			lCapAddress2 = lCapAddress2.replace("  "," ");
			i++;
			if (i == 99) break;  // don't ever want to get stuck here
		}
	}
	
	if (appName == null) { appName = ""; }
	if ( (appName.indexOf(lCapAddress) == -1) && (appName.indexOf(lCapAddress2) == -1) ) {
		//prevent multiple concatenation
		
		if ( itemAppTypeArray[0] == 'Building' ) {
			logDebug("update for Building!");
			appName = lCapAddress2 + ": " + appName;
		}
		else if ( itemAppTypeArray[0] == 'Planning' ) {
			logDebug("update for Planning!");
			if ( AInfo["ParcelAttribute.ZONING"] != "" ) {
				appName = lCapAddress2 + ", " + AInfo["ParcelAttribute.ZONING"] + " ZONE: " + appName;
			} else {
				appName = lCapAddress2 + ": " + appName;
				
			}
		}
		else if ( itemAppTypeArray[0] == 'Enforcement' ) {
			logDebug("update for Enforcement!");
			if ( AInfo["ParcelAttribute.ZONING"] != "" ) {
				appName = lCapAddress2 + ", " + AInfo["ParcelAttribute.ZONING"] + " ZONE: " + appName;
			} else {
				appName = lCapAddress2 + ": " + appName;
				
			}
		}
		else if ( itemAppTypeArray[0] == 'Fire' ) {
			logDebug("update for Fire!");
			appName = lCapAddress2 + ": " + appName;
		}
		else if ( itemAppTypeArray[0] == 'PublicWorks' ) {
			logDebug("update for PublicWorks!");
			appName = lCapAddress2 + ": " + appName;
		}
		else { //default
			appName = lCapAddress2 + ": " + appName;
		}
	}

	//only update if value was changed
	if (appName != cap.getSpecialText()) {
		editAppName(appName);
		logDebug("we would set the app name to:"+appName);
	}
	else {
		logDebug("app name update not required");
	}

logDebug("end of updateAppNameWithAddress");
	return true;
}

function updatePLNConditiontemplateDates() {
	logDebug("START updatePLNConditiontemplateDates");

	var myEntity = conditionObj.getEntityPK();
	var chkIssuedDate = conditionObj.getIssuedDate();
	var chkCondType = conditionObj.getConditionType();
	var chkCondDesc = conditionObj.getCapConditionModel().getConditionDescription();

	if (chkCondType == "PC Hearing" && chkIssuedDate && chkIssuedDate != "" && (
			chkCondDesc != "PC-Lunch Meeting" || 
			chkCondDesc != "PC-Substantial Conformance Lunch Meeting (Level 3)" ||
			chkCondDesc != "PC-Substantial Conformance Staff Review (Level 2)" ||
			chkCondDesc != "PC-Substantial Conformance Staff Review (Level 1)" ||
			chkCondDesc != "PC-Time Extension (Staff Review)"
			))
	{
		var thisTemplate = conditionObj.getTemplateModel();
		if (thisTemplate) { 
			thisTemplateFormsArrPtr = thisTemplate.getTemplateForms();
			var formGroups = thisTemplateFormsArrPtr.toArray();
			for (grp in formGroups) {
				var subgroupsObj = formGroups[grp].getSubgroups();
				if (subgroupsObj != null) {
					var subgroups = subgroupsObj.toArray();
					for (sgrp in subgroups) {
						var sgrpName = subgroups[sgrp].getSubgroupName();
						var fields = subgroups[sgrp].getFields().toArray();
						for (fld in fields) {
							logDebug(">>GTemplate ASI["+sgrpName + "." + fields[fld].getFieldName()+"] = "+ fields[fld].getDefaultValue() +"<<");

							// Look up the number of days to add or subtract
							var daysToAddToIssueDate = null;
							var theValueName = sgrpName + "." + fields[fld].getFieldName();
							daysToAddToIssueDate = lookup("PLN_PC_HEARING_GTMP_DATEADD", theValueName);
							
							if (daysToAddToIssueDate) {
								// create a new FieldPK object to use in the next aa.condition line
								var aFieldPK = new com.accela.aa.template.field.GenericTemplateFieldPK();
									aFieldPK.fieldName = fields[fld].getFieldName();
									aFieldPK.groupName = fields[fld].getGroupName();
									aFieldPK.subgroupName = fields[fld].getSubgroupName();
								
								//  PLN wants to initially just adjust the date
								//  based on the number of calendar days.  THEN check that date and if it falls on 
								//  a non-working day, move it one more (positive or negative).
								
								var newGTDate = dateAddHC3_Planning(chkIssuedDate,parseInt(daysToAddToIssueDate));
								var newGTmpDate = new Date(newGTDate);
								
								logDebug("okay before we check holidays the date is:"+newGTmpDate);
								if (checkHolidayCalendar_Planning(newGTmpDate)) {
									logDebug("OOPS that day is a Non Working Day Silly!");
									if (parseInt(daysToAddToIssueDate) > 0) {
										logDebug("The days to add is a positive number - Lets move FORWARD to a working day.");
										var newGTmpDate2 = dateAddHC3_Planning(newGTDate,1,"Y");
									}
									else {
										logDebug("The days to add is a negative number or zero - Lets move BACKWARD to a working day.");
										var newGTmpDate2 = dateAddHC3_Planning(newGTDate,-1,"Y");
									}
									newGTDate = newGTmpDate2;
								}
								
								// use dateAddHC3_Planning with the lookup days to set the date 
								
								logDebug("After ALL THOSE DATE CHECKS we have:"+newGTDate);
								
								// set the date 
								aa.condition.editField4TemplateForm(myEntity,aFieldPK, newGTDate);
							}
						}
					}
				}
			}
		}
	}
}


//********************************************************************************************************
//Script 		Lock Document
//Record Types:	All
//
//Event: 		DUB  DRUB  DRAB  DUTB  DDB DRDB
//
//Desc:			When user try to issue the Building records ,system will check wheather there is an Fire 
// 				Final Inspection or not and the status of inspection should be resulted as passed.  
//				
//
//Assumptions:
//				
//				
//
//Psuedo Code:	
// 				
//
//Created By: Civic Tech Pro
//********************************************************************************************************
// Change Log
//         		Date		Name			Modification
//				12/16/2018	Michael 		Initial Development
//				
//											
//********************************************************************************************************

function validateDocument(){
//cancel = true;
//comment(capStatus )
	if(capStatus && (capStatus == "Ready to Issue" || capStatus == "Revisions Required")){
		cancel = true;
		comment(" You can not edit the document because current records status is : " + capStatus );
	}
	
	
}

// added 11/6/19 JHS Gray Quarter, Inc.


function trim(strText) {
	return (String(strText).replace(/^\s+|\s+$/g, ''));
}

function handleFinalInspectionMap(itemCap) {
    var inspMapString = lookup("FINAL_INSPECTION_MAPPING", appTypeString);

    // sample:  [{"inspection":"Final Electrical","result":["Passed","Passed with Conditions"],"task":"taskName","status":"statusName","reportName":"InspectionReport"},{"inspection":"Final Plumbing","result":["Passed","Passed with Conditions"],"task":"taskName","status":"statusName","reportName":"InspectionReport"}]

    if (!inspMapString || inspMapString == "") {
        logDebug("no mapping found for " + appTypeString);
        return false;
    }

    try {
        var inspMap = JSON.parse(inspMapString);
    } catch (err) {
        logDebug("can't parse mapping for " + appTypeString + " result: " + err.message);
        return false;
    }

    for (var i in inspMap) { // once for each object
        var m = inspMap[i];
        if (((m.inspection instanceof Array) && m.inspection.indexOf(String(inspType)) >= 0) || (!(m.inspection instanceof Array) && m.inspection.equals(String(inspType)))) {
            logDebug("handleFinalInspectionMap 1: found matching inspType of " + inspType);
            if ((m.result instanceof Array && m.result.indexOf(String(inspResult)) >= 0) || (!(m.result instanceof Array) && m.result.equals(String(inspResult)))) {
                logDebug("handleFinalInspectionMap 2: found matching result of " + inspResult);
                if (m.task && m.status) {
                    resultWorkflowTask(m.task, m.status, "", "");
                }
                if (m.reportName) {
                     logDebug("report sample " + m.reportName);
                    runReportAsyncAttach(capId, m.reportName,"AGENCY_ALT_ID",capId.getCustomID());
                }
            }
        }
    }
}	
	
function handleGisObjectMapping(itemCap) {
	var gisService = "SANTABARBARA";
	var gisMapString = lookup("PW_GIS_MAPPING",appTypeString);
	var url = lookup("GIS_REST_SERVICES_URL", "URL");

	// sample:  [{"gisId":"LATERALID","id":"Sewer Lateral ID", "layer":"Sewer Laterals","gisLayerId":"145","map": [{"gis":"Size of Lateral","asi":"Diameter of Sewer Lateral"}]},{"gisId":"LINK","id":"Sewer Main ID", "layer":"Sewer Mains", "gisLayerId":"145","map": [{"gis":"MATERIAL","asi":"Sewer Main Material"}]}]

	// get GIS Objects already on record
	
	var fGisObj = [];
	var gisObjResult = aa.gis.getCapGISObjects(capId); // get gis objects on the cap
	if (gisObjResult.getSuccess()) {
		var output = gisObjResult.getOutput();
		for (var n in output) {
			logDebug("adding: " + output[n]);
			fGisObj = fGisObj.concat(output[n].getGISObjects());
			logDebug("fGisObj size is now " + fGisObj.length);
			//logDebug(output[i].getGISObjects()[0].getGisObjectModel().getGisObjectID() + "," + output[i].getGISObjects()[0].getGisObjectModel().getGisId() + "," + output[i].getGISObjects()[0].getGisObjectModel().getLayerId());
		}
	}
	else {
		logDebug("**WARNING: Getting GIS objects for Cap.  Reason is: " + gisObjResult.getErrorType() + ":" + gisObjResult.getErrorMessage());
	}
	
	//testing
	
	if (!gisMapString || gisMapString == "") {
		logDebug("no mapping found for " + appTypeString);
		return false;
	}
	
	try {
		var gisMap = JSON.parse(gisMapString);
	}
	catch(err) {
		logDebug("can't parse GIS mapping for " + appTypeString + " result: " + err.message);
		return false;
	}
	
	for (var i in gisMap) { // once for each object
		var thisId = gisMap[i].id; // ASI Field containing ID field
		var valueString = AInfo[thisId]; // delimited list from either ASI or built from existing GIS objects
		var gisId = gisMap[i].gisId; // field used in GIS for ID
		var gisLayerId = gisMap[i].gisLayerId;  // layer number
		var thisLayer = gisMap[i].layer // layer name 
	
		if (!valueString || valueString== "") {
			logDebug("empty ASI field for GIS object mapping to layer " + thisLayer + ", " + thisId + " is empty, checking if one already exists");
			var tempValues = [];
			for (var n in fGisObj) {
				var gisObj = fGisObj[n].getGisObjectModel();
				logDebug("checking layer " + thisLayer + " = " + gisObj.getLayerId());
				if (thisLayer.equals(gisObj.getLayerId())) {
					tempValues.push(gisObj.getGisId()); // push objects to Array
				}
				if (tempValues.length > 0) {
					valueString = tempValues.join(",");
					logDebug("retrieved GIS objects for this layer, values are '" + valueString + "'");
				}
			}
		}
		else {
			logDebug("found an value of '" + valueString + "' in ASI Field " + thisId + " for layer " + thisLayer);
		}

		if (!valueString || valueString== "") {
			logDebug("No objects or ASI data in ASI field " + thisId + " for Layer " + thisLayer + ".  No ASI mapping will happen");
			continue;
		}
		else {
			logDebug("Begin ASI Mapping for Layer " + thisLayer + ".  The object id(s) are: " + valueString);
		}
		
		var value = [];		
		var idSplit = String(valueString).split(/[ ,]+/);
		for (var ii in idSplit) {
			var objectId = trim(idSplit[ii]);
			if (objectId && objectId != "") {

				logDebug("Adding " + thisLayer + "." + thisId + "." + objectId + " to record " + itemCap.getCustomID() + ".  Success? " + aa.gis.addCapGISObject(itemCap, gisService, thisLayer, objectId).getSuccess());
			
				// now do the ASI mapping
				//var a = getGisLayerInfo(gisService,thisLayer,AInfo[thisId],"OBJECTID");
				
				var a = getGisObjectInfo(url,gisLayerId,gisId + "='" + objectId + "'");  // search ESRI Service
				logDebug("getGisObjectInfo returns " + JSON.stringify(a));

				for (var j in gisMap[i].map) {
					var asiMapping = gisMap[i].map[j];
					logDebug("mapping: " + JSON.stringify(asiMapping));
					if (a && a.features) {
						logDebug("we have features : " + JSON.stringify(a.features));
						for (var k in a.features) {
							var newValue = a.features[k].attributes[asiMapping.gis];
							if (asiMapping.map) {
								newValue = lookup(asiMapping.map,newValue);
								logDebug("used std choice " + asiMapping.map + " to translate to " + newValue);	
							}
							logDebug("adding value to : " + asiMapping.asi + " : " + newValue);
							if (!value[asiMapping.asi]) {
								value[asiMapping.asi] = [];
							}
							value[asiMapping.asi].push(newValue);
						}
					}
				}
			}
		}
		for (var iii in value) {
			logDebug("value['" + iii + "'] = " + JSON.stringify(value[iii]));
			logDebug("editAppSpecific(" + iii + ",'" + value[iii].join(",") + "',itemCap)");
			editAppSpecific(iii,value[iii].join(","),itemCap);
		}
	}
}

function resultWorkflowTask(wfstr, wfstat, wfcomment, wfnote) // optional process name
{
	var useProcess = false;
	var processName = "";
	if (arguments.length == 5) {
		processName = arguments[4]; // subprocess
		useProcess = true;
	}

	var workflowResult = aa.workflow.getTaskItems(capId, wfstr, processName, null, null, null);
	if (workflowResult.getSuccess())
		var wfObj = workflowResult.getOutput();
	else {
		logMessage("**ERROR: Failed to get workflow object: " + workflowResult.getErrorMessage());
		return false;
	}

	if (!wfstat)
		wfstat = "NA";

	for (i in wfObj) {
		var fTask = wfObj[i];
		if (fTask.getTaskDescription().toUpperCase().equals(wfstr.toUpperCase()) && (!useProcess || fTask.getProcessCode().equals(processName))) {
			var statObj = aa.workflow.getTaskStatus(fTask, wfstat);
			var dispo = "U";
			if (statObj.getSuccess()) {
				var status = statObj.getOutput();
				dispo = status.getResultAction();
			} else {
				logDebug("Could not get status action resulting to no change")
			}

			var dispositionDate = aa.date.getCurrentDate();
			var stepnumber = fTask.getStepNumber();
			var processID = fTask.getProcessID();

			if (useProcess)
				aa.workflow.handleDisposition(capId, stepnumber, processID, wfstat, dispositionDate, wfnote, wfcomment, systemUserObj, dispo);
			else
				aa.workflow.handleDisposition(capId, stepnumber, wfstat, dispositionDate, wfnote, wfcomment, systemUserObj, dispo);

			logMessage("Resulting Workflow Task: " + wfstr + " with status " + wfstat);
			logDebug("Resulting Workflow Task: " + wfstr + " with status " + wfstat);
		}
	}
} 

function runReportAttach(itemCapId,aaReportName)
	{
	// optional parameters are report parameter pairs
	// for example: runReportAttach(capId,"ReportName","altid",capId.getCustomID(),"months","12");
	

	var reportName = aaReportName;

	reportResult = aa.reportManager.getReportInfoModelByName(reportName);

	if (!reportResult.getSuccess())
		{ logDebug("**WARNING** couldn't load report " + reportName + " " + reportResult.getErrorMessage()); return false; }

	var report = reportResult.getOutput(); 

	var itemCap = aa.cap.getCap(itemCapId).getOutput();
	appTypeResult = itemCap.getCapType();
	appTypeString = appTypeResult.toString(); 
	appTypeArray = appTypeString.split("/");

	report.setModule(appTypeArray[0]); 
	report.setCapId(itemCapId.getID1() + "-" + itemCapId.getID2() + "-" + itemCapId.getID3()); 
	report.getEDMSEntityIdModel().setAltId(itemCapId.getCustomID());

	var parameters = aa.util.newHashMap();              

	for (var i = 2; i < arguments.length ; i = i+2)
		{
		parameters.put(arguments[i],arguments[i+1]);
		logDebug("Report parameter: " + arguments[i] + " = " + arguments[i+1]);
		}	

	report.setReportParameters(parameters);

	var permit = aa.reportManager.hasPermission(reportName,currentUserID); 
	if(permit.getOutput().booleanValue()) 
		{ 
		var reportResult = aa.reportManager.getReportResult(report); 

		logDebug("Report " + aaReportName + " has been run for " + itemCapId.getCustomID());

		}
	else
		logDebug("No permission to report: "+ reportName + " for user: " + currentUserID);
}


function runReportAsyncAttach(itemCapId, aaReportName) {
	// optional parameters are report parameter pairs
	// for example: runReportAttach(capId,"ReportName","altid",capId.getCustomID(),"months","12");

	var reportName = aaReportName;
	reportResult = aa.reportManager.getReportInfoModelByName(reportName);
	if (!reportResult.getSuccess()) {
		logDebug("**WARNING** couldn't load report " + reportName + " " + reportResult.getErrorMessage());
		return false;
	}
	var report = reportResult.getOutput();
	var itemCap = aa.cap.getCap(itemCapId).getOutput();
	appTypeResult = itemCap.getCapType();
	appTypeString = appTypeResult.toString();
	appTypeArray = appTypeString.split("/");
	report.setModule(appTypeArray[0]);
	report.setCapId(itemCapId.getID1() + "-" + itemCapId.getID2() + "-" + itemCapId.getID3());
	report.getEDMSEntityIdModel().setAltId(itemCapId.getCustomID());
	var parameters = aa.util.newHashMap();
	for (var i = 2; i < arguments.length; i = i + 2) {
		parameters.put(arguments[i], arguments[i + 1]);
		logDebug("Report parameter: " + arguments[i] + " = " + arguments[i + 1]);
	}
	report.setReportParameters(parameters);
	var permit = aa.reportManager.hasPermission(reportName, 'ADMIN');

	if (permit.getOutput().booleanValue()) {
		var scriptName = "RUN_REPORT_ATTACH_ASYNC";
		var envParameters = aa.util.newHashMap();
		envParameters.put("report", report);
		aa.runAsyncScript(scriptName, envParameters);
		//var reportResult = aa.reportManager.getReportResult(report);
		logDebug("Report " + aaReportName + " has been run async for " + itemCapId.getCustomID());
	} else
		logDebug("No permission to report: " + reportName + " for user: " + currentUserID);
}

// ********************************************************************************************************
// Script 		closeWorkflowsAfterAppStatusChange.js
// Record Types: BLD, ENF, FIR, PLN, PBW
//
// Event: 	ASUA	
//
//			for Issue 127 of city issue tracking list
//
// Desc:	I would like a script that does the following:  
//				When I choose a Record Status of Void or Withdrawn, and click "Submit," 
//				the script runs and closes all open WF tasks.
//
//
//			For the Public Works module all record types, 
//			please make all workflow tasks Task Active=No 
//			when Status is changed to New Status=Closed, Completed, Denied, Expired, or Failed
//
//			This function will lookup the new capSTatut
//
//
// Created By: Silver Lining Solutions
// ********************************************************************************************************
// Change Log
//         		Date		Name		Modification
//				10/25/2019	Chad		Orig
//
// ********************************************************************************************************
function closeWorkflowsAfterAppStatusChange() {
	// do a look up based on cap type module to get status to include in this script.
	
	var lookupResult = null;
	var lookupTableName = "AppStatusToCloseWorkflows";
	var lookupValueName = appTypeArray[0];
	lookupResult = lookup(lookupTableName, lookupValueName);
	logDebug("Full lookupValue = " + lookupResult);

	if (lookupResult) {
		var lookupResults = lookupResult.split(",");
		var statChecker = "" + capStatus;
		logDebug("now going to check the index of stat checker:"+statChecker);
		if (lookupResults.indexOf(statChecker) >= 0) {
			logDebug("We found a status that requires a close of all workflow!");
			var statusNote = "Closed - App Status Changed to " + capStatus;
			var statusDescNote = "Closed by automation script on " + (new Date());
			var myClosedOK = taskCloseAllWorkflowTasks(statusNote,statusDescNote);
			logDebug("closing all open tasks was:"+myClosedOK);
		} else {
			logDebug("capStatus:"+capStatus+" was not found in the lookup results");
		}
	}
}

// ********************************************************************************************************
// Script 		taskCloseAllWorkflowTasks.js
// Record Types: BLD, ENF, FIR, PLN, PBW
//
// Event: 	ASUA	
//
//			for Issue 127 of city issue tracking list
//
// Desc:	I would like a script that does the following:  
//				When I choose a Record Status of Void or Withdrawn, and click "Submit," 
//				the script runs and closes all open WF tasks.
//
//
//			For the Public Works module all record types, 
//			please make all workflow tasks Task Active=No 
//			when Status is changed to New Status=Closed, Completed, Denied, Expired, or Failed
//
// Created By: Silver Lining Solutions
// ********************************************************************************************************
// Change Log
//         		Date		Name		Modification
//				10/25/2019	Chad		Orig
//
// ********************************************************************************************************
function taskCloseAllWorkflowTasks(pStatus,pComment) {
	// Closes all active tasks in CAP with specified status and comment

	var workflowResult = aa.workflow.getTasks(capId);
	if (workflowResult.getSuccess())
  	 	var wfObj = workflowResult.getOutput();
	else { 
		logMessage("**ERROR: Failed to get workflow object: " + workflowResult.getErrorMessage()); 
		logDebug("**ERROR: Failed to get workflow object: " + workflowResult.getErrorMessage()); 
		return false; 
	}
	
	var fTask;
	var stepnumber;
	var processID;
	var dispositionDate = new Date();
	var statDate = aa.date.getCurrentDate();
	var wfnote = pStatus;
	var wftask, wftaskComplete;

	for (idToGet in wfObj) {
		fTask = wfObj[idToGet];
		wftask = fTask.getTaskDescription();
		wftaskStatDate = fTask.getStatusDate();
		wftaskComplete = fTask.getCompleteFlag();
		stepnumber = fTask.getStepNumber();
		processID = fTask.getProcessID();
		wfTaskstat = isTaskActive(wftask) || false;
		if (wftaskComplete != 'Y' ) {
			fTask.setActiveFlag("N");
			fTask.setDispositionDate(dispositionDate)
			fTask.setDispositionComment(pComment);
			fTask.setStatusDate(statDate);
			fTask.setCompleteFlag("Y");
			fTask.setDispositionNote(pComment);
			fTask.setDisposition(pStatus);
			aa.workflow.editTask(fTask);
			logDebug("   "+"Closing Workflow Task>>" + wftask + "<< with status " + pStatus);
		}
	}
	return true;
}

// ********************************************************************************************************
// Script 		createConditionForPlanReview.js
// Record Types: all
//
// Event: 	ACAA	
//
// Desc:	for plan reviews being set to Routed for Review, create the associated Condition
//
// Created By: Silver Lining Solutions
// ********************************************************************************************************
// Change Log
//         		Date		Name		Modification
//				06/18/2018	Eric		Orig
//
// ********************************************************************************************************

function createConditionForPlanReview()
{
//	logDebug("START of createConditionForPlanReview");
	
	
	/* handle the counter */
	if (wfTask == "Plans Distribution" && wfStatus == "Routed for Review") {
//		logDebug("Matched on Plans Distribution & Routed for Review");
		var prdCount = parseInt(getAppSpecific("Plan Review Distribution Count"));
		editAppSpecific("Plan Review Distribution Count", prdCount + 1);
	}
	
	/* create the associated plan review */
	var conditionDesc = lookup("BLD_WFTASK_CONDITION_MAP",wfTask);
	if (conditionDesc != -1 && wfStatus == "Routed to Reviewer") {

		var prdCount = getAppSpecific("Plan Review Distribution Count");	
		var title = "Review " + prdCount + ": " + conditionDesc;
		var newStatus = "Routed to Reviewer " + prdCount;
//		logDebug("Matched on " + conditionDesc + " & Routed & title =" + title + " & prdCount = " + prdCount);
		addAppCondition("Plan Review","Pending",title,"01025","Notice");
		updateTask(wfTask,newStatus,"comment","note");
		}
	
//	logDebug("END of createConditionForPlanReview");
}

// ********************************************************************************************************
// Script 		closeAssociatedPlanReviewTask.js
// Record Types: all
//
// Event: 	ACAA	
//
// Desc:	for plan reviews being completed using the conditions, close the associated WF task
//
// Created By: Silver Lining Solutions
// ********************************************************************************************************
// Change Log
//			Date		Name		Modification
//			06/18/2018	Eric		Orig
//			01/31/2020	Chad		Assign task before closing to document who updated the condition
//			02/06/2020	Chad		City requested that the applied by user ID be assigned the task
//
// ********************************************************************************************************
function closeAssociatedPlanReviewTask()
{
//	logDebug("START of closeAssociatedPlanReviewTask");
	var tempStr = conditionObj.getDispConditionDescription().toString();
	var condDesc = "" + tempStr.toString();
	var lenDesc = condDesc.length;
	var startPos = condDesc.indexOf(":");
	var lookupValue = condDesc.substr(startPos+2,lenDesc);
	var condAppliedBy = conditionObj.getIssuedByUser();
	var asnPerson = aa.person.getUser(condAppliedBy.getFirstName(), condAppliedBy.getMiddleName(), condAppliedBy.getLastName());

	if ( asnPerson.getSuccess() ) var asnPersonId = asnPerson.getOutput().getGaUserID();
	else var asnPersonId = currentUserID;


//	logDebug("******* Condition Info *********************");

//	logDebug("       Condition Type = " + conditionType);
//	logDebug("	   Condition Status = " + conditionStatus);
//	logDebug("Condition Description = " + condDesc);
//	logDebug("				 length = " + lenDesc);
//	logDebug("             startPos = " + startPos);
//	logDebug("          lookupValue = " + lookupValue);

	var task = lookup("BLD_CONDITION_WFTASK_MAP", lookupValue);
//	logDebug("                 task = " + task);

	var stat = lookup("BLD_PLANREVIEW_STATUS", conditionStatus);
//	logDebug("                 stat = " + stat);
//	logDebug("assigned person ID:"+asnPersonId);	
	
	if (task != -1 && stat == 1 && isTaskActive(task)){	
//		logDebug("the associated task is active ... assigning and closing now.");
		assignTask(task,asnPersonId);
		closeTask(task,conditionStatus,"Associated Condition updated","Associated Condition updated");
		}
		
//	logDebug("END of closeAssociatedPlanReviewTask");
}

/**
 * Uses script tester and executs the script in the code section
 * requires EVENT_FOR_ASYNC.js
 * @param {*} pScriptName 
 * @param {*} pRecordId 
 * @param {*} pCurrentUserId 
 */
function runAsyncEvent(pScriptName,pRecordId,pCurrentUserId){
    logDebug("INSIDE RUNASYNCEVENT INCLUDES CUSTOM");
    var parameters = aa.util.newHashMap(); 
    
    if(pCurrentUserId==null){
        pCurrentUserId=currentUserID;
        
    }
    parameters.put("recordId",pRecordId); 
    parameters.put("AsyncScriptName",pScriptName); 
    parameters.put("currentUserID",pCurrentUserId);   
    //logDebug("INSIDE UserID " + pCurrentUserId + " record " + pRecordId + " script name " + pScriptName);            
    aa.runAsyncScript("EVENT_FOR_ASYNC", parameters);
}

function getACARecordURL(acaUrl) {
    var acaRecordUrl = "";
    var id1 = capId.ID1;
    var id2 = capId.ID2;
    var id3 = capId.ID3;

    acaRecordUrl = acaUrl + "/Cap/CapDetail.aspx?";
    acaRecordUrl += "&Module=" + cap.getCapModel().getModuleName();
    acaRecordUrl += "&TabName=" + cap.getCapModel().getModuleName();
    acaRecordUrl += "&capID1=" + id1 + "&capID2=" + id2 + "&capID3=" + id3;
    acaRecordUrl += "&agencyCode=" + aa.getServiceProviderCode();

    return acaRecordUrl;
}
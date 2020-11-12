
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

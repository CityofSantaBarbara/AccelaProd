//********************************************************************************************************
//Script 		Auto Schedule Recurring Inspections 
//Record Types:	Fire!Recurring Event!~!~ 
//
//Event: 		IRSA:InspectionResultSubmitAfter
//
//Desc:			Trigger: 
//				Record Type(s): Fire/Recurring Event/*/* 
//				Criteria: Inspection Result Submit After 
//				Recurring Inspections must pass with a status of //â€œPassâ€? or â€œPass â€“ FPB Referralâ€? 
//				Action: updateTask(â€œInspectionâ€?, Passed) Create & Schedule a new General Inspection for 2 years out from date resulted 
//				Notes: These inspections occur every 2 years. 
//				â€¢ Need to consider how converted records get â€œprimedâ€? with a scheduled inspection 
//				â€¢ Not go-live critical 
//				â€¢ Firehouse has the relevant information that would allow us to create these records and schedule inspections 
//				â€¢ This was originally going to be handled by the Firehouse interface so a data conversion was never in scope 
//				â€¢ It is possible to provide this data conversion as a post-go live conversion 
//Created By: ASH 8-21-2018
//********************************************************************************************************
// Change Log
//         		Date		Name			Modification
//				08-21-2018	Alec			Initial Draft
//********************************************************************************************************

//inspGroup = FIRE_FLS
//inspType = General Inspection



logDebug("start of IRSA:Fire!Recurring Event!~!~");

if (inspGroup == "FIRE_FLS" && inspType == "Prevention Inspection" && (inspResult == "Passed" || inspResult == "Passed - FPB Referral"))
			{
			scheduleInspection("Prevention Inspection",730);
			}


logDebug("end of IRSA:Fire!Recurring Event!~!~");

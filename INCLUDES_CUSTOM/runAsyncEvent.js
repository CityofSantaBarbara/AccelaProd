
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

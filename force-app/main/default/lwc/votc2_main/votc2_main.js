import { LightningElement, track } from 'lwc';

import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import { NavigationMixin } from "lightning/navigation";

import getRecordFromId from '@salesforce/apex/ApexDataInterface.getRecordFromId';
import getRecordsWhere from '@salesforce/apex/ApexDataInterface.getRecordsWhere';
import insertRecord from '@salesforce/apex/ApexDataInterface.insertRecord';



// ------------------------------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------------------------------
/*
 * A layered data management approach
 * 
 * Data Manager provides a standard interface to all your data needs from a common source, whether those needs be a collection
 * of apex records from a given object, or a single URL from the NavigationMixIn, all data will be held by some implementation
 * of the Data_Manager and its children.
 * 
 * A Data Manager holds a collection of Records, Records hold a collection of Fields, Fields hold a collection of Values. Values
 * hold an actual single value and other data as needed, as well as common methods.
 * Put another way . . .
 * Data Managers are clients to their 1 Record Server.
 * Records are a Server to their 1 Data Manager and a client to their OneOrMany Fields Servers.
 * Fields are a Server to their 1 Record, and a Client to the OneOrMany Value Servers.
 * Values are servers to their 1 Fields.
 * 
 * Each layer holds an implementation of an interface that handles the types of problems that come up at that layer.
 * 
 * Data Manager Interface: holds a collection of records and standard methods to work with that collection and holds other necessary
 * data.
 * 
 * Record Interface: 
 * 
 * Field Interface: 
 * 
 * Value Interface:
*/

class Record_Array extends Array {

}


// . . .
class Data_Manager {
    recordArray;

    constructor() {

    }
}

class Apex_Data_Manager extends Data_Manager {
    objectName;

    constructor() {
        super();
    }
}


class Data_Record {
    fields;

    constructor() {

    }
}

class Data_Field {
    values;

    constructor() {

    }
}

class Data_Value {
    value;

    constructor() {
        
    }
}



class DOM_Manager {

}


class Error_Manager {
    
}


// ------------------------------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------------------------------


class RecordCollection {
    records;

    constructor() {

    }
}

class Record {
    fields;

    didGet;

    constructor(fields) {
        this.fields = fields;

        this.didGet = false;
    }
}

class Field {
    value;

    constructor() {

    }
}


class ApexRecordCollection extends RecordCollection {
    objectName;

    

    constructor() {
        super();
    }


    getRecordsWhere(whereValuePairs) {
        return getRecordsWhere({
            objectName: this.objectName,

            
        }).then().catch();
    }
}

class ApexRecord extends Record {
    objectName;

    constructor(objectName, apexFields) {
        super(apexFields);

        this.objectName = objectName;
    }

    get fieldNames() {
        let fieldNames = [];

        Object.keys(this.fields).forEach(key => {
            if(this.fields[key].willGet) {
                fieldNames.push(this.fields[key].fieldName);
            }
        });

        return fieldNames;
    }

    setFieldsFromRecord(record) {
        if (record) {
            Object.keys(this.fields).forEach(key => {
                if(this.fields[key].willGet) {
                    let fieldSplit = this.fields[key].fieldName.split('.');
                    let fieldValue = record[fieldSplit[0]];

                    for (let i = 1; i < fieldSplit.length; i++) {
                        fieldValue = fieldValue[fieldSplit[i]];
                    }

                    this.fields[key].value = fieldValue;

                    this.didGet = true;
                }
            });
        } else {
            console.log("No data for record from " + this.objectName + ", recieved '" + record + "'");
        }
    }

    getRecordFromId(id) {
        return getRecordFromId({
            objectName: this.objectName,
            recordId: id,
            fields: this.fieldNames
        }).then(record => {
            this.setFieldsFromRecord(record);
        }).catch(err => {
            const toast = new ShowToastEvent({
                title: 'Error: getRecordId() for ' + this.objectName,
                message: err.toString(),
                variant: 'error',
                mode: 'sticky'
            });

            //this.dispatchEvent(toast);

            //alert("Unable to get data for record from " + this.objectName + ", see console logs for error");
            //console.log(err);
        });
    }

    handleError() {

    }
}

class ApexField extends Field {
    fieldName;

    willGet;
    willSet;

    constructor(fieldName, willGet = false, willSet = false) {
        super();

        this.fieldName = fieldName;

        this.willGet = willGet;
        this.willSet = willSet;
    }
}



class ApexRecordURL_Record extends Record {

    constructor(fields) {
        super(fields);
    }
}

class ApexRecordURL_Field extends Field {
    id;

    constructor() {
        super();
    }

    setId(id) {
        this.id = id;
    }
}



class DataElement {
    dataId;
    attributes;

    domReference;

    didQuery;

    constructor(dataId, attributes) {
        this.dataId = dataId;

        this.attributes = attributes;

        this.didQuery = false;
    }


    initialize(templateReference) {
        this.domReference = templateReference.querySelector("[data-id='" + this.dataId + "']");

        this.didQuery = true;

        Object.keys(this.attributes).forEach(key => {
            this.attributes[key].domReference = this.domReference;
        });
    }


    update() {
        Object.keys(this.attributes).forEach(attrKey => {
            this.attributes[attrKey].update();
        });
    }
}


class InputElement extends DataElement {
    constructor(dataId, attributes) {
        super(dataId, attributes);


    }


    initialize(templateReference, handler) {
        DataElement.prototype.initialize.call(this, templateReference);

        this.domReference.addEventListener("change", handler);
    }
}


class DataAttribute {
    name;
    
    domReference;

    dataClass;
    dataKey;

    constructor(name, dataClass, dataKey) {
        this.name = name;

        this.dataClass = dataClass;
        this.dataKey = dataKey;
    }

    
    set value(value) {
        this.domReference[this.name] = value;
    }

    update() {
        let fieldSplit = this.dataKey.split('.');
        let fieldValue = this.dataClass.fields[fieldSplit[0]].value;

        for (let i = 1; i < fieldSplit.length; i++) {
            fieldValue = fieldValue[fieldSplit[i]];
        }

        this.domReference[this.name] = fieldValue;
    }
}



export default class Votc2_main extends NavigationMixin(LightningElement) {
    @track isKnown_Opportunity;
    isHandled_URL;
    TEMPID;


    opportunityLookupElement;

    @track opportunityRecord;
    @track opportunityURLRecord;
    opportunityElements;
    
    @track surveyRecord;
    surveyElements;

    @track accountRecord;
    @track accountURLRecord;
    accountElements;


    handleURLParameters() {
        let page_url = new URL(window.location.href);

        let urlParamOppId = page_url.searchParams.get("c__opportunityId");

        if (urlParamOppId) {
            //            this.opportunityChosen = urlParamOppId;
            this.TEMPID = urlParamOppId;
            this.isKnown_Opportunity = true;
        } else {
            console.log(
                'No URL Parameter given, or a Bad URL Parameter given, not necessary unless you intended to pass a parameter. The only parameter currently is "c__opportunityId" set it to a valid opportunity id with "c__opportunityId=123456789012345678" where the numbers are a valid Id'
            );
        }

        this.isHandled_URL = true;
    }


    constructor() {
        super();

        if (!this.isHandled_URL) {
            this.handleURLParameters();
        }


        if(!this.opportunityLookupElement) {
            this.opportunityLookupElement = new InputElement(
                'OpportunityLookup',

                {
                    value: new DataAttribute('value', this.opportunityRecord, 'Id')
                }
            );
        }


        if(!this.opportunityRecord) {
            this.opportunityRecord = new ApexRecord(
                'Opportunity',

                {
                    Id: new ApexField('Id', true),

                    Name: new ApexField('Name', true),

                    OwnerId: new ApexField('OwnerId', true),

                    OwnerName: new ApexField('Owner.Name', true),

                    CloseDate: new ApexField('CloseDate', true),

                    AccountId: new ApexField('AccountId', true)
                }
            );
        }
        if(!this.opportunityURLRecord) {
            this.opportunityURLRecord = new ApexRecordURL_Record(
                {
                    OpportunityNameURL: new ApexRecordURL_Field(),
                    OpportunityOwnerURL: new ApexRecordURL_Field()
                }
            );
        }
        if(!this.opportunityElements) {
            this.opportunityElements = {
                Opportunity_Name: new DataElement(
                    'Opportunity_Name',

                    {
                        value: new DataAttribute('value', this.opportunityURLRecord, 'OpportunityNameURL'),
                        label: new DataAttribute('label', this.opportunityRecord, 'Name')
                    }
                ),

                Opportunity_Owner: new DataElement(
                    'Opportunity_Owner',

                    {
                        value: new DataAttribute('value', this.opportunityURLRecord, 'OpportunityOwnerURL'),
                        label: new DataAttribute('label', this.opportunityRecord, 'OwnerName')
                    }
                ),

                Opportunity_CloseDate: new DataElement(
                    'Opportunity_CloseDate',

                    {
                        value: new DataAttribute('value', this.opportunityRecord, 'CloseDate')
                    }
                )
            };
        }

        if(!this.surveyRecord) {
            this.surveyRecord = new ApexRecord(
                'VOTC_Survey__c',

                {
                    Paint: new ApexField('Paint__c', true, true),
                    Paint_Comments: new ApexField('Paint_Comment__c', true, true),

                    //Appearance: new ApexField('Appearance__c', true, true),
                    Appearance: new ApexField('Appearance', true, true),
                    Appearance_Comments: new ApexField('Appearance_Comment__c', true, true),

                    Electrical: new ApexField('Electrical__c', true, true),
                    Electrical_Comments: new ApexField('Electrical_Comment__c', true, true),

                    Hydraulics: new ApexField('Unfaulty__c', true, true),
                    Hydraulics_Comments: new ApexField('Unfaulty_Comment__c', true, true),

                    Functionality: new ApexField('Functionality__c', true, true),
                    Functionality_Comments: new ApexField('Functionality_Comment__c', true, true),

                    Comments: new ApexField('Comments__c', true, true)
                }
            );
        }
        if(!this.surveyElements) {
            this.surveyElements = {
                Paint_Checkbox: new InputElement(
                    'Paint_Checkbox',

                    {
                        value: new DataAttribute('value', this.surveyRecord, 'Paint')
                    }
                ),
                Paint_Comments: new InputElement(
                    'Paint_Comments',

                    {
                        value: new DataAttribute('value', this.surveyRecord, 'Paint_Comments')
                    }
                ),

                Appearance_Checkbox: new InputElement(
                    'Appearance_Checkbox',

                    {
                        value: new DataAttribute('value', this.surveyRecord, 'Appearance')
                    }
                ),
                Appearance_Comments: new InputElement(
                    'Appearance_Comments',

                    {
                        value: new DataAttribute('value', this.surveyRecord, 'Appearance_Comments')
                    }
                ),

                Electrical_Checkbox: new InputElement(
                    'Electrical_Checkbox',

                    {
                        value: new DataAttribute('value', this.surveyRecord, 'Electrical')
                    }
                ),
                Electrical_Comments: new InputElement(
                    'Electrical_Comments',

                    {
                        value: new DataAttribute('value', this.surveyRecord, 'Electrical_Comments')
                    }
                ),

                Hydraulics_Checkbox: new InputElement(
                    'Hydraulics_Checkbox',

                    {
                        value: new DataAttribute('value', this.surveyRecord, 'Hydraulics')
                    }
                ),
                Hydraulics_Comments: new InputElement(
                    'Hydraulics_Comments',

                    {
                        value: new DataAttribute('value', this.surveyRecord, 'Hydraulics_Comments')
                    }
                ),

                Functionality_Checkbox: new InputElement(
                    'Functionality_Checkbox',

                    {
                        value: new DataAttribute('value', this.surveyRecord, 'Functionality')
                    }
                ),
                Functionality_Comments: new InputElement(
                    'Functionality_Comments',

                    {
                        value: new DataAttribute('value', this.surveyRecord, 'Functionality_Comments')
                    }
                ),

                Comments: new InputElement(
                    'Comments',

                    {
                        value: new DataAttribute('value', this.surveyRecord, 'Comments')
                    }
                )
            };
        }

        if(!this.accountRecord) {
            this.accountRecord = new ApexRecord(
                'Account',

                {
                    Name: new ApexField('Name', true),

                    Phone: new ApexField('Phone', true),

                    BillingAddress: new ApexField('BillingAddress', true),

                    ShippingAddress: new ApexField('ShippingAddress', true)
                }
            );
        }
        if(!this.accountURLRecord) {
            this.accountURLRecord = new ApexRecordURL_Record(
                {
                    AccountPhoneURL: new ApexRecordURL_Field(),
                }
            );
        }
        if(!this.accountElements) {
            this.accountElements = {
                Account_Name: new DataElement(
                    'Account_Name',

                    {
                        value: new DataAttribute('value', this.accountURLRecord, 'AccountPhoneURL'),
                        label: new DataAttribute('label', this.accountRecord, 'Name')
                    }
                ),

                Account_Phone: new DataElement(
                    'Account_Phone',

                    {
                        value: new DataAttribute('value', this.accountRecord, 'Phone')
                    }
                ),

                Account_Billing_Address: new DataElement(
                    'Account_Billing_Address',

                    {
                        street: new DataAttribute('street', this.accountRecord, 'BillingAddress.street'),
                        city: new DataAttribute('city', this.accountRecord, 'BillingAddress.city'),
                        state: new DataAttribute('province', this.accountRecord, 'BillingAddress.state'),
                        postalCode: new DataAttribute('postal-code', this.accountRecord, 'BillingAddress.postalCode'),
                        country: new DataAttribute('country', this.accountRecord, 'BillingAddress.country'),
                    }
                ),

                Account_Shipping_Address: new DataElement(
                    'Account_Shipping_Address',

                    {
                        street: new DataAttribute('street', this.accountRecord, 'ShippingAddress.street'),
                        city: new DataAttribute('city', this.accountRecord, 'ShippingAddress.city'),
                        state: new DataAttribute('province', this.accountRecord, 'ShippingAddress.state'),
                        postalCode: new DataAttribute('postal-code', this.accountRecord, 'ShippingAddress.postalCode'),
                        country: new DataAttribute('country', this.accountRecord, 'ShippingAddress.country'),
                    }
                )
            };
        }
        

        if(this.isKnown_Opportunity) {
            this.handleOpportunityChosen();
        }
    }


    handleError(errorCaller, titleAddon, errorMessage) {
        let title = 'Error: Within call to ' + errorCaller + ' ' + titleAddon;

        const toast = new ShowToastEvent({
            title: title,
            message: errorMessage.toString(),
            variant: 'error',
            mode: 'sticky'
        });

        this.dispatchEvent(toast);
    }


    handleOpportunityChosen() {
console.log(this.surveyRecord);
        if(!this.opportunityRecord.didGet) {
            this.opportunityRecord.getRecordFromId(this.TEMPID).then(() => {
                this.opportunityURLRecord.fields.OpportunityNameURL.setId(this.opportunityRecord.fields.Id.value);
                this.opportunityURLRecord.fields.OpportunityOwnerURL.setId(this.opportunityRecord.fields.OwnerId.value);

                this[NavigationMixin.GenerateUrl]({
                    type: "standard__recordPage",
                    attributes: {
                        recordId: this.opportunityURLRecord.fields.OpportunityNameURL.id,
                        actionName: "view"
                    }
                }).then(url => {
                    this.opportunityURLRecord.fields.OpportunityNameURL.value = window.location.origin + url;
                }).catch(err => {
                    alert("Error in then of opportunity getRecordFromId, when trying to get the URL for opportunity");
                    console.log(err);
                });


                this[NavigationMixin.GenerateUrl](
                    {
                        type: "standard__recordPage",
                        attributes: {
                            recordId: this.opportunityURLRecord.fields.OpportunityOwnerURL.id,
                            actionName: "view"
                        }
                    }
                ).then(url => {
                    this.opportunityURLRecord.fields.OpportunityOwnerURL.value = window.location.origin + url;

                    Object.keys(this.opportunityElements).forEach(elemKey => {
                        this.opportunityElements[elemKey].update();
                    });

                }).catch(err => {
                    alert("Error in then of opportunity getRecordFromId, when trying to get the URL for opportunity");
                    console.log(err);
                });

            
                if(!this.surveyRecord.didGet) {
                    this.surveyRecord.getRecordFromId(this.opportunityRecord.fields.Id.value).then(() => {
                        Object.keys(this.surveyElements).forEach(elemKey => {
                            this.surveyElements[elemKey].update();
                        });
                    }).catch(err => {
                        this.handleError('getRecordId().catch()', 'for ' + this.surveyRecord.objectName ,err);
                    });
                }


                if(!this.accountRecord.didGet) {
                    this.accountURLRecord.fields.AccountPhoneURL.setId(this.opportunityRecord.fields.AccountId.value);

                    this.accountRecord.getRecordFromId(this.opportunityRecord.fields.AccountId.value).then(() => {
                        this[NavigationMixin.GenerateUrl](
                            {
                                type: "standard__recordPage",
                                attributes: {
                                    recordId: this.accountURLRecord.fields.AccountPhoneURL.id,
                                    actionName: "view"
                                }
                            }
                        ).then(url => {
                            this.accountURLRecord.fields.AccountPhoneURL.value = window.location.origin + url;
        
                            Object.keys(this.accountElements).forEach(elemKey => {
                                this.accountElements[elemKey].update();
                            });
        
                        }).catch(err => {
                            alert("Error in then of account getRecordFromId, when trying to get the URL for account");
                            console.log(err);
                        });
                    
                    }).catch(err => {
                        alert("Error in then of account getRecordFromId");
                        console.log(err);
                    });
                }
            
            }).catch(err => {
                alert("Error in then of opportunity getRecordFromId");
                console.log(err);
            });
        }
    }




    renderedCallback() {
        if(!this.isKnown_Opportunity) {
            if(!this.opportunityLookupElement.didQuery) {
                this.opportunityLookupElement.initialize(this.template, this.handleInput.bind(this));
            }
        }

        if(this.isKnown_Opportunity) {
            if(!this.opportunityElements.Opportunity_Name.didQuery) {
                Object.keys(this.opportunityElements).forEach(key => {
                    this.opportunityElements[key].initialize(this.template);
                });
            }
            
            if(!this.surveyElements.Paint_Checkbox.didQuery) {
                Object.keys(this.surveyElements).forEach(key => {
                    this.surveyElements[key].initialize(this.template, this.handleInput.bind(this));
                });
            }
            
            if(!this.accountElements.Account_Name.didQuery) {
                Object.keys(this.accountElements).forEach(key => {
                    this.accountElements[key].initialize(this.template);
                });
            }
        }
    }


    handleInput(event) {
        let dataId = event.target.getAttribute("data-id");

        if(this.isKnown_Opportunity) { // These only exist when an opportunity is known
            if (dataId.includes('Checkbox')) {
                this.surveyElements[dataId].value = this.surveyElements[dataId].domReference.checked;
            } else {
                this.surveyElements[dataId].value = this.surveyElements[dataId].domReference.value;
            }

            switch (dataId) {
                case 'Paint_Checkbox':
                    console.log(this.surveyElements['Paint_Checkbox'].value);
                    break;

                case 'Paint_Comments':
                    console.log(this.surveyElements['Paint_Comments'].value);
                    break;


                case 'Appearance_Checkbox':
                    console.log(this.surveyElements['Appearance_Checkbox'].value);
                    break;

                case 'Appearance_Comments':
                    console.log(this.surveyElements['Appearance_Comments'].value);
                    break;


                case 'Electrical_Checkbox':
                    console.log(this.surveyElements['Electrical_Checkbox'].value);
                    break;

                case 'Electrical_Comments':
                    console.log(this.surveyElements['Electrical_Comments'].value);
                    break;


                case 'Hydraulics_Checkbox':
                    console.log(this.surveyElements['Hydraulics_Checkbox'].value);
                    break;

                case 'Hydraulics_Comments':
                    console.log(this.surveyElements['Hydraulics_Comments'].value);
                    break;


                case 'Functionality_Checkbox':
                    console.log(this.surveyElements['Functionality_Checkbox'].value);
                    break;

                case 'Functionality_Comments':
                    console.log(this.surveyElements['Functionality_Comments'].value);
                    break;


                case 'Comments':
                    console.log(this.surveyElements['Comments'].value);
                    break;


                default:
                    break;
            }
        }else {// These only exist when an opportunity is unknown
            switch(dataId) {
                case 'OpportunityLookup':
                    this.opportunityLookupElement.value = this.opportunityLookupElement.domReference.value;

                    this.TEMPID = this.opportunityLookupElement.value;
                    this.isKnown_Opportunity = true;

                    this.handleOpportunityChosen();

                    break;


                default:
                    break;
            }
        }

    }


}
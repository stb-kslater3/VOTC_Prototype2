import { LightningElement, track } from 'lwc';

import { NavigationMixin } from "lightning/navigation";


import getRecordFromId from '@salesforce/apex/ApexDataInterface.getRecordFromId';
import insertRecord from '@salesforce/apex/ApexDataInterface.insertRecord';


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


class ApexRecord extends Record {
    objectName;

    constructor(apexFields, objectName) {
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
            alert("Unable to get data for Record, see console logs for error");
            console.log("No data for Record, recieved '" + record + "'");
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
            alert("Unable to get data for Record, see console logs for error");
            console.log(err);
        });
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
    hasProducts;


    @track opportunityRecord;
    @track opportunityElements;
    @track opportunityURLRecord;
    
    @track accountRecord;
    @track accountElements;
    @track accountURLRecord;


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
        
        if(!this.opportunityRecord) {
            this.opportunityRecord = new ApexRecord(
                {
                    Id: new ApexField('Id', true),

                    Name: new ApexField('Name', true),

                    OwnerId: new ApexField('OwnerId', true),

                    OwnerName: new ApexField('Owner.Name', true),

                    CloseDate: new ApexField('CloseDate', true),

                    AccountId: new ApexField('AccountId', true)
                },

                'Opportunity'
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


        if(!this.accountRecord) {
            this.accountRecord = new ApexRecord(
                {
                    Name: new ApexField('Name', true),

                    Phone: new ApexField('Phone', true),

                    BillingAddress: new ApexField('BillingAddress', true),

                    ShippingAddress: new ApexField('ShippingAddress', true)
                },

                'Account'
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
                        alert("Error in then of opportunity getRecordFromId");
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
        if(!this.opportunityElements.Opportunity_Name.didQuery) {
            Object.keys(this.opportunityElements).forEach(key => {
                this.opportunityElements[key].initialize(this.template);
            });
        }

        if(!this.accountElements.Account_Name.didQuery) {
            Object.keys(this.accountElements).forEach(key => {
                this.accountElements[key].initialize(this.template);
            });
        }
    }


/*
    handleInput(event) {
        if (event.target.getAttribute("data-id").includes('Checkbox')) {
            this.fieldElements[event.target.getAttribute("data-id")].value = this.fieldElements[event.target.getAttribute("data-id")].domElement.checked;
        } else {
            this.fieldElements[event.target.getAttribute("data-id")].value = this.fieldElements[event.target.getAttribute("data-id")].domElement.value;
        }


        switch (event.target.getAttribute("data-id")) {
            case 'Paint_Checkbox':
                console.log(this.fieldElements['Paint_Checkbox'].domElement.checked);
                break;

            case 'Paint_Comments':
                console.log(this.fieldElements['Paint_Comments'].domElement.value);
                break;


            case 'Appearance_Checkbox':
                console.log(this.fieldElements['Appearance_Checkbox'].domElement.checked);
                break;

            case 'Appearance_Comments':
                console.log(this.fieldElements['Appearance_Comments'].domElement.value);
                break;


            case 'Electrical_Checkbox':
                console.log(this.fieldElements['Electrical_Checkbox'].domElement.checked);
                break;

            case 'Electrical_Comments':
                console.log(this.fieldElements['Electrical_Comments'].domElement.value);
                break;


            case 'Hydraulics_Checkbox':
                console.log(this.fieldElements['Hydraulics_Checkbox'].domElement.checked);
                break;

            case 'Hydraulics_Comments':
                console.log(this.fieldElements['Hydraulics_Comments'].domElement.value);
                break;


            case 'Functionality_Checkbox':
                console.log(this.fieldElements['Functionality_Checkbox'].domElement.checked);
                break;

            case 'Functionality_Comments':
                console.log(this.fieldElements['Functionality_Comments'].domElement.value);
                break;


            case 'Comments':
                console.log(this.fieldElements['Comments'].domElement.value);
                break;


            default:
                break;
        }
    }
*/
}
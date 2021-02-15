import { LightningElement, track } from 'lwc';


import getRecordFromId from '@salesforce/apex/ApexDataInterface.getRecordFromId';
import insertRecord from '@salesforce/apex/ApexDataInterface.insertRecord';


class FieldElement {
    objectName;

    fieldName;
    helperFields;

    dataId;

    value;

    constructor(objectName, fieldName, dataId, options={}) {
        this.objectName = objectName;
        this.fieldName = fieldName;
        this.dataId = dataId;

        if(options['helperFields']) {
            this.helperFields = options['helperFields'];
        }else {
            this.helperFields = [];
        }
    }

    // If field name involves dot operation then you have to split it to access that field
    // when you try to get a record
    splitFieldName() {
        return this.fieldName.split('.');
    }
}

class VisibleFieldElement extends FieldElement {
    domElement;

    constructor(objectName, fieldName, dataId, options={}) {
        super(objectName, fieldName, dataId, options={});
    }
}

class InputFieldElement extends VisibleFieldElement {
    constructor(objectName, fieldName, dataId, options={}) {
        super(objectName, fieldName, dataId, options={});
    }
}


export default class Votc2_main extends LightningElement {
    @track isKnown_Opportunity;

    @track fieldElements;
    surveyFieldIds;
    opportunityFieldIds;
    productsFieldIds;
    contactFieldIds;

    isHandled_URL;
TEMPID;

    hasProducts;


    constructor() {
        super();


        this.surveyFieldIds = ['Paint_Checkbox', 'Paint_Comments', 'Appearance_Checkbox', 'Appearance_Comments', 'Electrical_Checkbox', 'Electrical_Comments', 'Hydraulics_Checkbox', 'Hydraulics_Comments', 'Functionality_Checkbox', 'Functionality_Comments', 'Comments'];


        this.opportunityFieldIds = ['Opportunity_Account', 'Opportunity_Name', 'Opportunity_Owner', 'Opportunity_CloseDate'];

        this.contactFieldIds = ['Contact_Name', 'Contact_Phone', 'Contact_Billing_Address', 'Contact_Shipping_Address'];
    }

/*
    getSurveyData() {
        let fields = [];
        this.surveyFieldIds.forEach(id => {
            fields.push(this.fieldElements[id].dataId);
        });

        getRecordFromId({ objectName: 'VOTC_Survey__c', }) {

        }
    }
*/

    getOpportunityData() {
        return new Promise(function(resolve, reject) {
                let fields = [];

                this.opportunityFieldIds.forEach(id => {
                    fields.push(this.fieldElements[id].fieldName);
                });

                getRecordFromId({
                    objectName: 'Opportunity',
                    recordId: this.TEMPID,
                    fields: fields
                }).then(record => {
                    if(record) {
                        this.opportunityFieldIds.forEach(id => {
                            let fieldSplit = this.fieldElements[id].splitFieldName();
                            let fieldValue = record[fieldSplit[0]];

                            for(let i = 1; i < fieldSplit.length; i++) {
                                fieldValue = fieldValue[fieldSplit[i]];
                            }

console.log(this.fieldElements[id].fieldName + ': ' + fieldValue);

                            this.fieldElements[id].value = fieldValue;
                        });
                    }else {
                        alert("Unable to get data for Opportunity, see console logs for error");
                        console.log("No data for Opportunity, recieved '" + record + "'");
                    }
                }).catch(err => {
                    alert("Unable to get data for Opportunity, see console logs for error");
                    console.log(err);
                });
            
                resolve();
                reject();
            }.bind(this)
        );
    }

    getProductsData() {
        
    }

    getContactData() {
        let fields = [];

        this.contactFieldIds.forEach(id => {
            fields.push(this.fieldElements[id].fieldName);
        });
console.log(this.fieldElements['Opportunity_Account'].value);
        getRecordFromId({
            objectName: 'Account',
            recordId: this.fieldElements['Opportunity_Account'].value,
            fields: fields
        }).then(record => {
            if(record) {
                this.contactFieldIds.forEach(id => {
                    let fieldSplit = this.fieldElements[id].splitFieldName();
                    let fieldValue = record[fieldSplit[0]];

                    for(let i = 1; i < fieldSplit.length; i++) {
                        fieldValue = fieldValue[fieldSplit[i]];
                    }

console.log(this.fieldElements[id].fieldName + ': ' + fieldValue);

                    this.fieldElements[id].value = fieldValue;
                });
            }else {
                alert("Unable to get data for Contact, see console logs for error");
                console.log("No data for Contact, recieved '" + record + "'");
            }
        }).catch(err => {
            alert("Unable to get data for Contact, see console logs for error");
            console.log(err);
        });
    }


    connectedCallback() {
        if(!this.fieldElements) {
            this.fieldElements = {};
            
        // SURVEY FIELDS
            this.fieldElements['Paint_Checkbox'] = new InputFieldElement('VOTC_Survey__c', 'Paint__c', 'Paint_Checkbox');
            this.fieldElements['Paint_Comments'] = new InputFieldElement('VOTC_Survey__c', 'Paint_Comment__c', 'Paint_Comments');

            this.fieldElements['Appearance_Checkbox'] = new InputFieldElement('VOTC_Survey__c', 'Appearance__c', 'Appearance_Checkbox');
            this.fieldElements['Appearance_Comments'] = new InputFieldElement('VOTC_Survey__c', 'Appearance_Comment__c', 'Appearance_Comments');

            this.fieldElements['Electrical_Checkbox'] = new InputFieldElement('VOTC_Survey__c', 'Electrical__c', 'Electrical_Checkbox');
            this.fieldElements['Electrical_Comments'] = new InputFieldElement('VOTC_Survey__c', 'Electrical_Comment__c', 'Electrical_Comments');

            this.fieldElements['Hydraulics_Checkbox'] = new InputFieldElement('VOTC_Survey__c', 'Unfaulty__c', 'Hydraulics_Checkbox');
            this.fieldElements['Hydraulics_Comments'] = new InputFieldElement('VOTC_Survey__c', 'Unfaulty_Comment__c', 'Hydraulics_Comments');

            this.fieldElements['Functionality_Checkbox'] = new InputFieldElement('VOTC_Survey__c', 'Functionality__c', 'Functionality_Checkbox');
            this.fieldElements['Functionality_Comments'] = new InputFieldElement('VOTC_Survey__c', 'Functionality_Comment__c', 'Functionality_Comments');

            this.fieldElements['Comments'] = new InputFieldElement('VOTC_Survey__c', 'Comments__c', 'Comments');


        // OPPORTUNITY FIELDS
            this.fieldElements['Opportunity_Account'] = new FieldElement('Opportunity', 'AccountId', 'Opportunity_Account');

            this.fieldElements['Opportunity_Name'] = new VisibleFieldElement('Opportunity', 'Name', 'Opportunity_Name');

            this.fieldElements['Opportunity_Owner'] = new VisibleFieldElement('Opportunity', 'Owner.Name', 'Opportunity_Owner');

            this.fieldElements['Opportunity_CloseDate'] = new VisibleFieldElement('Opportunity', 'CloseDate', 'Opportunity_CloseDate');


        // CONTACT FIELDS
            this.fieldElements['Contact_Name'] = new VisibleFieldElement('Account', 'Name', 'Contact_Name');
            
            this.fieldElements['Contact_Phone'] = new VisibleFieldElement('Account', 'Phone', 'Contact_Phone'); 

            this.fieldElements['Contact_Billing_Address'] = new VisibleFieldElement('Account', 'BillingAddress', 'Contact_Billing_Address');

            this.fieldElements['Contact_Shipping_Address'] = new VisibleFieldElement('Account', 'ShippingAddress', 'Contact_Shipping_Address');
        }


        if(!this.isHandled_URL) {
            this.handleURLParameters();
        }

        if(this.isKnown_Opportunity && !this.fieldElements['Opportunity_Account'].value) {
            this.handleOpportunityChosen();
        }
    }



    renderedCallback() {
        if(this.isKnown_Opportunity) {
            if(!this.fieldElements['Paint_Checkbox'].domElement) {
                for(let element in this.fieldElements) {
                    if(this.fieldElements[element] instanceof VisibleFieldElement) {
                        this.fieldElements[element].domElement = this.template.querySelector("[data-id='" + this.fieldElements[element].dataId + "']");

                        if(this.fieldElements[element] instanceof InputFieldElement) {
                            this.fieldElements[element].domElement.addEventListener("change", this.handleInput.bind(this));
                        }
                    }
                }
            }
        }
    }


    handleInput(event) {
        if(event.target.getAttribute("data-id").includes('Checkbox')) {
            this.fieldElements[event.target.getAttribute("data-id")].value = this.fieldElements[event.target.getAttribute("data-id")].domElement.checked;
        }else {
            this.fieldElements[event.target.getAttribute("data-id")].value = this.fieldElements[event.target.getAttribute("data-id")].domElement.value;
        }


        switch(event.target.getAttribute("data-id")) {
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


    handleOpportunityChosen() {
        this.getOpportunityData().then(() => {
console.log(this.fieldElements['Opportunity_Account'].value);
            this.getContactData();
        }).catch(err => {
            alert("Error within handleOpportunityChosen");
            console.log(err);
        });
    }
}
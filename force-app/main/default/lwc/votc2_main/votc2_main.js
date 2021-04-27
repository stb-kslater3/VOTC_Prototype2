import { LightningElement, track } from 'lwc';

import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import { NavigationMixin } from 'lightning/navigation';

import queryFromString from '@salesforce/apex/ApexDataInterface.queryFromString';
import updateRecordFromId from '@salesforce/apex/ApexDataInterface.updateRecordFromId';
import insertRecord from '@salesforce/apex/ApexDataInterface.insertRecord';



class LWC_Element {
    // The Id used to query the dom for this specific element
    dataId;

    // The reference to the dom element itself so its attributes can be read and written to and
    // event listeners added, etc.
    domElement;

    // To ensure the dom is queried only once, since renderedCallback is run multiple times
    isInitialized;

    constructor(dataId) {
        this.dataId = dataId;

        this.isInitialized = false;
    }


    queryDOM(templateReference) {
        this.domElement = templateReference.querySelector("[data-id='" + this.dataId + "']");

        this.isInitialized = true;
    }
}



export default class Votc2_main extends NavigationMixin(LightningElement) {
    @track opportunityChosen;
    findOpportunityElement;

    surveyElements;

    opportunityElements;

    @track productsFromOpportunity;

    accountElements;
    accountFromOpportunity;


    // If Survey already exists then put its Id in here for when I make an insert I will call update, otherwise
    // I will call insert
    surveyId;


    displayError(title, errorMessage) {
        const errorToast = new ShowToastEvent({
            title: title,
            message: errorMessage,
            variant: 'error',
            mode: 'sticky'
        });

        console.log(errorMessage);

        this.dispatchEvent(errorToast);
    }


    handleDOMInput(event) {
        switch(event.target.getAttribute("data-id")) {
            case 'OpportunityLookup':
                this.opportunityChosen = this.findOpportunityElement.domElement.value;

                this.handleOpportunityChosen();

                break;



            case 'PaintCheckbox':
                //console.log(this.surveyElements.PaintCheckbox.domElement.checked);
                break;

            case 'PaintComments':
                //console.log(this.surveyElements.PaintComments.domElement.value);
                break;

            case 'AppearanceCheckbox':
                //console.log(this.surveyElements.AppearanceCheckbox.domElement.checked);
                break;

            case 'AppearanceComments':
                //console.log(this.surveyElements.AppearanceComments.domElement.value);
                break;

            case 'ElectricalCheckbox':
                //console.log(this.surveyElements.ElectricalCheckbox.domElement.checked);
                break;

            case 'ElectricalComments':
                //console.log(this.surveyElements.ElectricalComments.domElement.value);
                break;

            case 'HydraulicsCheckbox':
                //console.log(this.surveyElements.HydraulicsCheckbox.domElement.checked);
                break;

            case 'HydraulicsComments':
                //console.log(this.surveyElements.HydraulicsComments.domElement.value);
                break;

            case 'FunctionalityCheckbox':
                //console.log(this.surveyElements.FunctionalityCheckbox.domElement.checked);
                break;

            case 'FunctionalityComments':
                //console.log(this.surveyElements.FunctionalityComments.domElement.value);
                break;

            case 'GeneralComments':
                //console.log(this.surveyElements.GeneralComments.domElement.value);
                break;



            default:
                break;
        }
    }


    
    handleSubmit() {
        let goodToSubmit = true;

        let dataIds = [
            ['PaintCheckbox', 'PaintComments'],
            ['AppearanceCheckbox', 'AppearanceComments'],
            ['ElectricalCheckbox', 'ElectricalComments'],
            ['HydraulicsCheckbox', 'HydraulicsComments'],
            ['FunctionalityCheckbox', 'FunctionalityComments']
        ];

        try {
            for(const index in dataIds) {
                if(!this.surveyElements[dataIds[index][0]].domElement.checked && !this.surveyElements[dataIds[index][1]].domElement.value) {
                    goodToSubmit = false;

                    this.displayError('Error in attempt to Submit', 'Checkboxes that are unchecked must include Additional Comments, please enter an Additional Comment in any unchecked checkboxes.');

                    break;
                }
            }


            if(!this.surveyElements['GeneralComments'].domElement.value) {
                goodToSubmit = false;

                this.displayError('Error in attempt to Submit', 'The General Comments box cannot be blank, please enter a General Comment.');
            }
        }catch(err) {
            this.displayError('Error while checking Submit criteria', err.message);
        }


        if(goodToSubmit) {
            let fieldValuePairs = {
                'Opportunity__c': this.opportunityChosen,

                'Paint__c': this.surveyElements.PaintCheckbox.domElement.checked,
                'Paint_Comment__c': this.surveyElements.PaintComments.domElement.value,

                'Appearance__c': this.surveyElements.AppearanceCheckbox.domElement.checked,
                'Appearance_Comment__c': this.surveyElements.AppearanceComments.domElement.value,
                
                'Electrical__c': this.surveyElements.ElectricalCheckbox.domElement.checked,
                'Electrical_Comment__c': this.surveyElements.ElectricalComments.domElement.value,

                'Unfaulty__c': this.surveyElements.HydraulicsCheckbox.domElement.checked,
                'Unfaulty_Comment__c': this.surveyElements.HydraulicsComments.domElement.value,
                
                'Functionality__c': this.surveyElements.FunctionalityCheckbox.domElement.checked,
                'Functionality_Comment__c': this.surveyElements.FunctionalityComments.domElement.value,

                'Comments__c': this.surveyElements.GeneralComments.domElement.value
            };

            if(this.surveyId) {
                updateRecordFromId({ objectName: 'VOTC_Survey__c', recordId: this.surveyId, fieldValuePairs: fieldValuePairs }).then(result => {
                    if(result) {
                        const successToast = new ShowToastEvent({
                            title: 'Survey Submitted',
                            message: 'The record was updated.',
                            variant: 'success',
                            mode: 'sticky'
                        });
                
                        this.dispatchEvent(successToast);
                    }
                }).catch(err => {
                    this.displayError('Error in call to queryFromString for VOTC_Survey__c', err.body.message);
                });
            }else {
                insertRecord({ objectName: 'VOTC_Survey__c', fieldValuePairs: fieldValuePairs }).then(result => {
                    if(result) {
                        const successToast = new ShowToastEvent({
                            title: 'Survey Submitted',
                            message: 'The record was inserted.',
                            variant: 'success',
                            mode: 'sticky'
                        });
                
                        this.dispatchEvent(successToast);
                    }
                }).catch(err => {
                    this.displayError('Error in call to queryFromString for VOTC_Survey__c', err.body.message);
                });
            }
        }
    }


    handleUploadFinished(event) {
console.log(event.detail.files);
    }



    loadSurveyData() {
        queryFromString({
            queryString: 'SELECT Id, Appearance__c, Appearance_Comment__c, Comments__c, Electrical__c, Electrical_Comment__c, Functionality__c, Functionality_Comment__c, Opportunity__c, Paint__c, Paint_Comment__c, Unfaulty__c, Unfaulty_Comment__c' +
            ' FROM VOTC_Survey__c' +
            ' WHERE Opportunity__c=\'' + this.opportunityChosen + '\'' +
            ' LIMIT 1'
        }).then(records => {
            if(records.length > 0) {
                this.surveyId = records[0].Id;


                this.surveyElements.PaintCheckbox.domElement.checked = records[0].Paint__c;
                this.surveyElements.PaintComments.domElement.value = records[0].Paint_Comment__c;

                this.surveyElements.AppearanceCheckbox.domElement.checked = records[0].Appearance__c;
                this.surveyElements.AppearanceComments.domElement.value = records[0].Appearance_Comment__c;

                this.surveyElements.ElectricalCheckbox.domElement.checked = records[0].Electrical__c;
                this.surveyElements.ElectricalComments.domElement.value = records[0].Electrical_Comment__c;

                this.surveyElements.HydraulicsCheckbox.domElement.checked = records[0].Unfaulty__c;
                this.surveyElements.HydraulicsComments.domElement.value = records[0].Unfaulty_Comment__c;

                this.surveyElements.FunctionalityCheckbox.domElement.checked = records[0].Functionality__c;
                this.surveyElements.FunctionalityComments.domElement.value = records[0].Functionality_Comment__c;

                this.surveyElements.GeneralComments.domElement.value = records[0].Comments__c;
            }
        }).catch(err => {
            this.displayError('Error in call to queryFromString for VOTC_Survey__c', err.body.message);
        });
    }


    loadOpportunityData() {
        // Returns the promise from when this data is loaded since other data depends on it, so those are synchronous
        return queryFromString({
            queryString: 'SELECT Name, Owner.Name, CloseDate, AccountId' +
            ' FROM Opportunity' +
            ' WHERE Id=\'' + this.opportunityChosen + '\'' +
            ' LIMIT 1'
        }).then(records => {
            if(records.length > 0) {
            this.opportunityElements.OpportunityName.domElement.label = records[0].Name;

            this.opportunityElements.OpportunityOwner.domElement.label = records[0].Owner.Name;

            this.opportunityElements.OpportunityCloseDate.domElement.value = records[0].CloseDate;


            this.accountFromOpportunity = records[0].AccountId;
            }
        }).catch(err => {
            this.displayError('Error in then of call to queryFromString for Opportunity', err.body.message);
        });
    }


    loadProductsData() {
        queryFromString({
            queryString: 'SELECT Id, Name, Product2Id, Product2.Name, Product2.RecordType.Name, Product2.Body_Make__c, Product2.Body_Model__c, Product2.Chassis_Make__c, Product2.Chassis_Model__c, Product2.Lube_Type__c' +
            ' FROM OpportunityLineItem' +
            ' WHERE OpportunityId=\'' + this.opportunityChosen + '\''
        }).then(records => {
            this.productsFromOpportunity = [];


            for(let i = 0; i < records.length; i++) {
                // Because things are Asynchronous you need to update the values all at the same time
                // And figure out which to update with the NavigationMixIn later
                this.productsFromOpportunity.push({
                    Product2Name: records[i].Product2.Name,

                    Type: records[i].Product2.RecordType.Name,

                    Body_Make: records[i].Product2.Body_Make__c,

                    Body_Model: records[i].Product2.Body_Model__c,

                    Chassis_Make: records[i].Product2.Chassis_Make__c,

                    Chassis_Model: records[i].Product2.Chassis_Model__c,

                    Lube_Type: records[i].Product2.Lube_Type__c
                });



                this[NavigationMixin.GenerateUrl]({
                    type: "standard__recordPage",
                    attributes: {
                        recordId: records[i].Product2Id,
                        actionName: "view"
                    }
                }).then(url => {
                    this.productsFromOpportunity[i].Product2URL = window.location.origin + url;

                }).catch(err => {
                    this.displayError('Error in then of NavigationMixIn for Product2', err.message);
                });
                
            }

        }).catch(err => {
            this.displayError('Error in then of call to queryFromString for OpportunityLineItem', err.body.message);
        });
    }


    loadAccountsData() {
        queryFromString({
            queryString: 'SELECT Name, Phone, BillingAddress, ShippingAddress' +
            ' FROM Account' +
            ' WHERE Id=\'' + this.accountFromOpportunity + '\'' +
            ' LIMIT 1'
        }).then(records => {
            if(records.length > 0) {
                this.accountElements.AccountName.domElement.label = records[0].Name;

                this.accountElements.AccountPhone.domElement.value = records[0].Phone;

                this.accountElements.AccountBillingAddress.domElement.street = records[0].BillingAddress.street;
                this.accountElements.AccountBillingAddress.domElement.city = records[0].BillingAddress.city;
                this.accountElements.AccountBillingAddress.domElement.province = records[0].BillingAddress.state;
                this.accountElements.AccountBillingAddress.domElement.postalCode = records[0].BillingAddress.postalCode;
                this.accountElements.AccountBillingAddress.domElement.country = records[0].BillingAddress.country;

                this.accountElements.AccountShippingAddress.domElement.street = records[0].ShippingAddress.street;
                this.accountElements.AccountShippingAddress.domElement.city = records[0].ShippingAddress.city;
                this.accountElements.AccountShippingAddress.domElement.province = records[0].ShippingAddress.state;
                this.accountElements.AccountShippingAddress.domElement.postalCode = records[0].ShippingAddress.postalCode;
                this.accountElements.AccountShippingAddress.domElement.country = records[0].ShippingAddress.country;
            }
        }).catch(err => {
            this.displayError('Error in call to queryFromString for Account', err.body.message);
        });
    }


    handleOpportunityChosen() {
        this.loadSurveyData();

        this.loadOpportunityData().then(() => {
            this.loadAccountsData();

            this[NavigationMixin.GenerateUrl]({
                type: "standard__recordPage",
                attributes: {
                    recordId: this.accountFromOpportunity,
                    actionName: "view"
                }
            }).then(url => {
                this.accountElements.AccountName.domElement.value = window.location.origin + url;
            }).catch(err => {
                this.displayError('Error in then of NavigationMixIn for Opportunity', err.message);
            });

            this.loadProductsData();
        }).catch(err => {
            this.displayError('Error in then of loadOpportunityData', err.message);
        });


        this[NavigationMixin.GenerateUrl]({
            type: "standard__recordPage",
            attributes: {
                recordId: this.opportunityChosen,
                actionName: "view"
            }
        }).then(url => {
            this.opportunityElements.OpportunityName.domElement.value = window.location.origin + url;
        }).catch(err => {
            this.displayError('Error in then of NavigationMixIn for Opportunity', err.message);
        });
    }



    handleURLParameters() {
        let url = new URL(window.location.href);

        let url_opportunity = url.searchParams.get("c__opportunityId");

        if (url_opportunity) {
            this.opportunityChosen = url_opportunity;

            this.handleOpportunityChosen();
        }
    }


    createLWC_Elements() {
        if(!this.findOpportunityElement) {
            this.findOpportunityElement = new LWC_Element('OpportunityLookup');
        }


        if(!this.surveyElements) {
            this.surveyElements = {};

            this.surveyElements.PaintCheckbox = new LWC_Element('PaintCheckbox');
            this.surveyElements.PaintComments = new LWC_Element('PaintComments');

            this.surveyElements.AppearanceCheckbox = new LWC_Element('AppearanceCheckbox');
            this.surveyElements.AppearanceComments = new LWC_Element('AppearanceComments');

            this.surveyElements.ElectricalCheckbox = new LWC_Element('ElectricalCheckbox');
            this.surveyElements.ElectricalComments = new LWC_Element('ElectricalComments');

            this.surveyElements.HydraulicsCheckbox = new LWC_Element('HydraulicsCheckbox');
            this.surveyElements.HydraulicsComments = new LWC_Element('HydraulicsComments');

            this.surveyElements.FunctionalityCheckbox = new LWC_Element('FunctionalityCheckbox');
            this.surveyElements.FunctionalityComments = new LWC_Element('FunctionalityComments');

            this.surveyElements.GeneralComments = new LWC_Element('GeneralComments');
        }


        if(!this.opportunityElements) {
            this.opportunityElements = {};

            this.opportunityElements.OpportunityName = new LWC_Element('OpportunityName');

            this.opportunityElements.OpportunityOwner = new LWC_Element('OpportunityOwner');

            this.opportunityElements.OpportunityCloseDate = new LWC_Element('OpportunityCloseDate');
        }


        if(!this.accountElements) {
            this.accountElements = {};

            this.accountElements.AccountName = new LWC_Element('AccountName');

            this.accountElements.AccountPhone = new LWC_Element('AccountPhone');

            this.accountElements.AccountBillingAddress = new LWC_Element('AccountBillingAddress');

            this.accountElements.AccountShippingAddress = new LWC_Element('AccountShippingAddress');
        }
    }


    constructor() {
        super();

        this.createLWC_Elements();
    }



    connectedCallback() {

    }



    renderedCallback() {
        // If we haven't chosen an opportunity yet then the findOpportunityElement is displaying
        // so go prepare it to get the chosen opportunity.
        // Otherwise, go prepare the rest of the elements as needed.
        if(!this.opportunityChosen) {
            this.handleURLParameters();

            if(!this.findOpportunityElement.isInitialized) {
                this.findOpportunityElement.queryDOM(this.template);
                
                this.findOpportunityElement.domElement.addEventListener('change', this.handleDOMInput.bind(this));
            }
        }else {
            if(!this.surveyElements.PaintCheckbox.isInitialized) {
                for(const key in this.surveyElements) {
                    this.surveyElements[key].queryDOM(this.template);

                    this.surveyElements[key].domElement.addEventListener('change', this.handleDOMInput.bind(this));
                }
            }

            if(!this.opportunityElements.OpportunityName.isInitialized) {
                for(const key in this.opportunityElements) {
                    this.opportunityElements[key].queryDOM(this.template);
                }
            }

            if(!this.accountElements.AccountName.isInitialized) {
                for(const key in this.accountElements) {
                    this.accountElements[key].queryDOM(this.template);
                }
                
            }
        }
        
    }
}

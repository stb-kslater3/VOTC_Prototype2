import { LightningElement, track } from 'lwc';


class FieldElement {
    objectName;

    fieldName;
    helperFields;

    value;

    constructor(objectName, fieldName, options={}) {
        this.objectName = objectName;
        this.fieldName = fieldName;

        if(options['helperFields']) {
            this.helperFields = options['helperFields'];
        }else {
            this.helperFields = [];
        }
    }
}

class VisibleFieldElement extends FieldElement {
    dataId;
    domElement;

    constructor(objectName, fieldName, dataId, options={}) {
        super(objectName, fieldName, options={});

        this.dataId = dataId;
    }
}


export default class Votc2_main extends LightningElement {
    @track isKnown_Opportunity;

    @track fieldElements;

    isHandled_URL;
TEMPID;

    hasProducts;



    connectedCallback() {
        if(!this.fieldElements) {
            this.fieldElements = {};
            
            this.fieldElements['Paint_Checkbox'] = new VisibleFieldElement('VOTC_Survey__c', 'Paint__c', 'Paint_Checkbox');
            this.fieldElements['Paint_Comments'] = new VisibleFieldElement('VOTC_Survey__c', 'Paint_Comment__c', 'Paint_Comments');

            this.fieldElements['Appearance_Checkbox'] = new VisibleFieldElement('VOTC_Survey__c', 'Appearance__c', 'Appearance_Checkbox');
            this.fieldElements['Appearance_Comments'] = new VisibleFieldElement('VOTC_Survey__c', 'Appearance_Comment__c', 'Appearance_Comments');

            this.fieldElements['Electrical_Checkbox'] = new VisibleFieldElement('VOTC_Survey__c', 'Electrical__c', 'Electrical_Checkbox');
            this.fieldElements['Electrical_Comments'] = new VisibleFieldElement('VOTC_Survey__c', 'Electrical_Comment__c', 'Electrical_Comments');

            this.fieldElements['Hydraulics_Checkbox'] = new VisibleFieldElement('VOTC_Survey__c', 'Unfaulty__c', 'Hydraulics_Checkbox');
            this.fieldElements['Hydraulics_Comments'] = new VisibleFieldElement('VOTC_Survey__c', 'Unfaulty_Comment__c', 'Hydraulics_Comments');

            this.fieldElements['Functionality_Checkbox'] = new VisibleFieldElement('VOTC_Survey__c', 'Functionality__c', 'Functionality_Checkbox');
            this.fieldElements['Functionality_Comments'] = new VisibleFieldElement('VOTC_Survey__c', 'Functionality_Comment__c', 'Functionality_Comments');

            this.fieldElements['Comments'] = new VisibleFieldElement('VOTC_Survey__c', 'Comments__c', 'Comments');
        }


        if(!this.isHandled_URL) {
            this.handleURLParameters();
        }

        if(this.isKnown_Opportunity) {
            this.handleOpportunityChosen();
        }
    }



    renderedCallback() {
        if(!this.fieldElements['Paint_Checkbox'].domElement) {
            for(let element in this.fieldElements) {
                if(this.fieldElements[element] instanceof VisibleFieldElement) {
                    this.fieldElements[element].domElement = this.template.querySelector("[data-id='" + this.fieldElements[element].dataId + "']");

                    this.fieldElements[element].domElement.addEventListener("change", this.handleInput.bind(this));
                }
            }
        }
    }


    handleInput(event) {
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
        
    }
}
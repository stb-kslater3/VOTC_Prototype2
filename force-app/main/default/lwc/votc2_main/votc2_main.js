import { LightningElement, track } from 'lwc';


export default class Votc2_main extends LightningElement {
    @track isKnown_Opportunity;

    isHandled_URL;
TEMPID;

    hasProducts;
    

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


    connectedCallback() {
        if(!this.isHandled_URL) {
            this.handleURLParameters();
        }

        if(this.isKnown_Opportunity) {
            this.handleOpportunityChosen();
        }
    }
}
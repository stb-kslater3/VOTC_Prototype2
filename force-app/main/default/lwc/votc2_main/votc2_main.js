import { LightningElement, track } from 'lwc';

export default class Votc2_main extends LightningElement {
    @track isKnown_Opportunity;

    connectedCallback() {
this.isKnown_Opportunity = false;
    }
}
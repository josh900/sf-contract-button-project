import { LightningElement, api, wire } from 'lwc';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import OpportunityWebhookModal from 'c/opportunityWebhookModal';
import NAME_FIELD from '@salesforce/schema/Opportunity.Name';
import AMOUNT_FIELD from '@salesforce/schema/Opportunity.Amount';
import CLOSEDATE_FIELD from '@salesforce/schema/Opportunity.CloseDate';
import STAGENAME_FIELD from '@salesforce/schema/Opportunity.StageName';
import ACCOUNTID_FIELD from '@salesforce/schema/Opportunity.AccountId';
import PROBABILITY_FIELD from '@salesforce/schema/Opportunity.Probability';
import API_UPDATED_FIELD from '@salesforce/schema/Opportunity.API_Updated_Field__c';
import CONTRACT_URL_FIELD from '@salesforce/schema/Opportunity.contract_url__c';
import CONTRACT_HISTORY_FIELD from '@salesforce/schema/Opportunity.Contract_History__c';

export default class OpportunityWebhookSection extends LightningElement {
    @api recordId; // This is the opportunity ID
    webhookResponse;
    error;
    isLoading = true;
    opportunityData;
    isStatusModalOpen = false; // Variable to control the status modal

    @wire(getRecord, { 
        recordId: '$recordId', 
        fields: [
            NAME_FIELD, 
            AMOUNT_FIELD, 
            CLOSEDATE_FIELD, 
            STAGENAME_FIELD, 
            ACCOUNTID_FIELD, 
            PROBABILITY_FIELD, 
            API_UPDATED_FIELD, 
            CONTRACT_URL_FIELD,
            CONTRACT_HISTORY_FIELD // Added field
        ] 
    })
    wiredOpportunity({ error, data }) {
        if (data) {
            this.opportunityData = data;
            this.error = undefined;
        } else if (error) {
            console.error('Error loading opportunity data:', JSON.stringify(error));
            this.error = error;
            this.opportunityData = undefined;
        }
        this.isLoading = false;
    }

    get statusLabel() {
        const apiUpdated = this.apiUpdatedField;
        return `Status: ${apiUpdated}`;
    }

    get apiUpdatedField() {
        return this.opportunityData ? getFieldValue(this.opportunityData, API_UPDATED_FIELD) : '';
    }

    get contractUrl() {
        return this.opportunityData ? getFieldValue(this.opportunityData, CONTRACT_URL_FIELD) : '';
    }

    get contractHistory() {
        return this.opportunityData ? getFieldValue(this.opportunityData, CONTRACT_HISTORY_FIELD) : '';
    }

    get opportunityFields() {
        if (!this.opportunityData) return [];
        return [
            { label: 'Name', value: getFieldValue(this.opportunityData, NAME_FIELD) },
            { label: 'Amount', value: getFieldValue(this.opportunityData, AMOUNT_FIELD) },
            { label: 'Close Date', value: getFieldValue(this.opportunityData, CLOSEDATE_FIELD) },
            { label: 'Stage', value: getFieldValue(this.opportunityData, STAGENAME_FIELD) },
            { label: 'Account ID', value: getFieldValue(this.opportunityData, ACCOUNTID_FIELD) },
            { label: 'Probability', value: getFieldValue(this.opportunityData, PROBABILITY_FIELD) },
            { label: 'API Updated Field', value: getFieldValue(this.opportunityData, API_UPDATED_FIELD) }
        ];
    }

    async handleOpenModal() {
        if (this.isLoading) {
            return;
        }
        if (this.error) {
            console.error('Error loading opportunity data:', JSON.stringify(this.error));
            return;
        }
        if (!this.opportunityData) {
            console.error('Opportunity data not loaded yet');
            return;
        }
    
        const accountId = getFieldValue(this.opportunityData, ACCOUNTID_FIELD);
        console.log('Opening modal with opportunity ID:', this.recordId);
    
        try {
            const result = await OpportunityWebhookModal.open({
                size: 'large',
                description: 'Contract Preview Modal',
                opportunityFields: this.opportunityFields,
                accountId: accountId,
                opportunityId: this.recordId
            });
            console.log('Modal opened successfully');
            if (result) {
                this.webhookResponse = result;
            }
        } catch (error) {
            console.error('Error opening modal:', JSON.stringify(error));
        }
    }

    // Method to handle click on the status field
    handleStatusClick() {
        this.isStatusModalOpen = true;
    }

    // Method to close the status modal
    closeStatusModal() {
        this.isStatusModalOpen = false;
    }
}
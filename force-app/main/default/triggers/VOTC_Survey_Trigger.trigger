
/*
 * This trigger closes the Task and Removes this survey from the list of Selecteds if it is part of
 * the monthly surveys. And, if a box is unchecked then it opens a case for this opportunity.
*/

trigger VOTC_Survey_Trigger on VOTC_Survey__c (after insert, after update) {
    for(Integer i = 0; i < Trigger.new.size(); i++) {
        // Close the Tasks that are for this survey
        List<Task> tasks = [
            SELECT Status
            FROM Task
            WHERE WhatId=:Trigger.new[i].Opportunity__c
            AND CallObject='VOTC_Survey'
        ];

        if(tasks.size() > 0) {
            for(Integer j = 0; j < tasks.size(); j++) {
                tasks[j].Status = 'Completed';
            }

            try {
                update tasks;
            }catch(Exception e) {
                System.debug(e);
            }
        }


        // Remove these Selecteds for this survey
        List<VOTC_Selected__c> selecteds = [
            SELECT Id
            FROM VOTC_Selected__c
            WHERE Opportunity__c=:Trigger.new[i].Opportunity__c
        ];

        if(selecteds.size() > 0) {
            try {
                delete selecteds;
            }catch(Exception e) {
                System.debug(e);
            }
        }


        // Make a case for this Survey
        Boolean needsCase = false;

        if(Trigger.new[i].Appearance__c == false) {
            needsCase = true;
        }else if(Trigger.new[i].Electrical__c == false) {
            needsCase = true;
        }else if(Trigger.new[i].Functionality__c == false) {
            needsCase = true;
        }else if(Trigger.new[i].Paint__c == false) {
            needsCase = true;
        }else if(Trigger.new[i].Unfaulty__c == false) {
            needsCase = true;
        }


        if(needsCase) {
            Case surveyCase = new Case();


            surveyCase.Opportunity__c = Trigger.new[i].Opportunity__c;


            Opportunity[] opportunities = [
                SELECT Id, Name, AccountId, Owner.Name
                FROM Opportunity
                WHERE Id=:Trigger.new[i].Opportunity__c
            ];

            Opportunity caseOpportunity = opportunities[0];

            surveyCase.AccountId = caseOpportunity.AccountId;


            
            User[] users = [
                SELECT Id, FirstName, Email
                FROM User
                WHERE Name='Duston Hansen'
            ];

            User caseOwner = users[0];
            surveyCase.OwnerId = caseOwner.Id;


            surveyCase.Origin = 'VOTC';

            surveyCase.Reason = 'Other';

            try {
                insert surveyCase;
            }catch(Exception e) {
                System.debug(e);
            }


            // Send the email to the case owner (Duston)
            Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();

            mail.setToAddresses(new List<String> {caseOwner.email});
            mail.setCcAddresses(new List<String> {caseOwner.email});

            mail.setReplyTo('kaden.slater@summitbodies.com');

            mail.setSenderDisplayName('Kaden Slater');
            mail.setSubject('New Case from VOTC Survey');

            mail.setHTMLBody(
                'Hello ' + caseOwner.FirstName + ', ' + '<br/><br/>' +
                
                'There is a new case opened from a VOTC Survey that had at least one unchecked box. This opportunity was owned by <b>' + caseOpportunity.Owner.Name + '</b>. Here are some useful links: <br/>' +
                '    <a target="_blank" href="https://summittruck.lightning.force.com/lightning/r/Case/' + surveyCase.Id + '/view">New Case</a> <br/>' +
                '    <a target="_blank" href="https://summittruck.lightning.force.com/lightning/n/Voice_of_the_Customer_Survey?c__opportunityId=' + caseOpportunity.Id + '">Survey: ' + Trigger.new[i].Name + '</a> <br/>' +
                '    <a target="_blank" href="https://summittruck.lightning.force.com/lightning/r/Opportunity/' + caseOpportunity.Id + '/view">Opportunity: ' + caseOpportunity.Name + '</a> <br/>' +

                '<br/><br/>Make sure to Check/Manually Enter the following fields of the new Case: <br/>' +
                '    <b>Asset</b> <br/>' + 
                '    <b>Contact Name</b> <br/>' +
                '    <b>System Controls</b> <br/>' +
                '    <b>System Category</b> <br/>' +
                '    <b>Subject</b> <br/>' +
                '    <b>Description</b> <br/>' +

                '<br/><br/>If there are any issues, suggestions, or anything feel free to reply to this email, it will send the reply to my email at kaden.slater@summitbodies.com'
            );


            Messaging.sendEmail(new List<Messaging.SingleEmailMessage> { mail });
        }
    }
}

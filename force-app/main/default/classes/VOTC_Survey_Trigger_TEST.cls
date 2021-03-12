@IsTest
class VOTC_Survey_Trigger_TEST {
    // ----------------------------------------------------------------------------------------------
    // ----------------------------------- Tasks Tests -----------------------------------------------
    // ----------------------------------------------------------------------------------------------
    @IsTest(SeeAllData=true)
    static void testTasks_BaseCase() {
        Task task = new Task();

        User[] kadens = [
            SELECT Id
            FROM User
            WHERE Name='Kaden Slater'
        ];

        Opportunity[] ste9993s = [
            SELECT Id
            FROM Opportunity
            WHERE Name='STE9993'
        ];

        // Temporary testing out on my user Id
        task.OwnerId = kadens[0].Id;
        task.Subject = 'Voice of the Customer Survey';
        task.Status = 'Open';
        task.WhatId = ste9993s[0].Id;
        task.CallObject = 'VOTC_Survey';

        insert task;

        
        Task[] newTasks = [
            SELECT Status
            FROM Task
            WHERE Id=:task.Id
        ];


        VOTC_Survey__c newSurvey = new VOTC_Survey__c();
        newSurvey.Paint__c = true;

        newSurvey.Appearance__c = true;

        newSurvey.Electrical__c = false;
        newSurvey.Electrical_Comment__c = 'Test Comment';

        newSurvey.Unfaulty__c = true;

        newSurvey.Functionality__c = true;

        newSurvey.Comments__c = 'Test Comment';

        newSurvey.Opportunity__c = ste9993s[0].Id;


        System.assertEquals(newTasks[0].Status, 'Open');

        insert newSurvey;


        newTasks = [
            SELECT Status
            FROM Task
            WHERE Id=:task.Id
        ];


        System.assertEquals(newTasks[0].Status, 'Completed');
    }


    // ----------------------------------------------------------------------------------------------
    // -------------------------------- VOTC_Selecteds Tests -----------------------------------------
    // ----------------------------------------------------------------------------------------------
    @IsTest(SeeAllData=true)
    static void testSelecteds_BaseCase() {
        VOTC_Selected__c selected = new VOTC_Selected__c();

        Opportunity[] ste9993s = [
            SELECT Id
            FROM Opportunity
            WHERE Name='STE9993'
        ];

        selected.Opportunity__c = ste9993s[0].Id;


        VOTC_Selected__c[] newSelecteds = [
            SELECT Id
            FROM VOTC_Selected__c
            WHERE Opportunity__c=:ste9993s[0].Id
        ];

        // Make sure this opportunity doesn't already have a Selected entry
        System.assertEquals(newSelecteds.size(), 0);


        insert selected;

        newSelecteds = [
            SELECT Id
            FROM VOTC_Selected__c
            WHERE Opportunity__c=:ste9993s[0].Id
        ];

        // Make sure that it has a Selected entry now
        System.assertEquals(newSelecteds.size(), 1);


        VOTC_Survey__c newSurvey = new VOTC_Survey__c();
        newSurvey.Paint__c = true;

        newSurvey.Appearance__c = true;

        newSurvey.Electrical__c = false;
        newSurvey.Electrical_Comment__c = 'Test Comment';

        newSurvey.Unfaulty__c = true;

        newSurvey.Functionality__c = true;

        newSurvey.Comments__c = 'Test Comment';

        newSurvey.Opportunity__c = ste9993s[0].Id;

        insert newSurvey;


        newSelecteds = [
            SELECT Id
            FROM VOTC_Selected__c
            WHERE Opportunity__c=:ste9993s[0].Id
        ];

        // Make sure that the Selected entry was removed
        System.assertEquals(newSelecteds.size(), 0);
    }



    // ----------------------------------------------------------------------------------------------
    // ----------------------------------- Cases Tests -----------------------------------------------
    // ----------------------------------------------------------------------------------------------
    @IsTest(SeeAllData=true)
    static void testCases_BaseCase() {
        Opportunity[] ste9993s = [
            SELECT Id
            FROM Opportunity
            WHERE Name='STE9993'
        ];


        Case[] newCases = [
            SELECT Id
            FROM Case
            WHERE Origin='VOTC'
            AND Opportunity__c=:ste9993s[0].Id
        ];


        // Make sure there isn't a VOTC Case for this Opportunity Already
        System.assertEquals(newCases.size(), 0);


        VOTC_Survey__c newSurvey = new VOTC_Survey__c();
        newSurvey.Paint__c = true;

        newSurvey.Appearance__c = true;

        newSurvey.Electrical__c = false;
        newSurvey.Electrical_Comment__c = 'Test Comment';

        newSurvey.Unfaulty__c = true;

        newSurvey.Functionality__c = true;

        newSurvey.Comments__c = 'Test Comment';

        newSurvey.Opportunity__c = ste9993s[0].Id;

        insert newSurvey;


        newCases = [
            SELECT Id
            FROM Case
            WHERE Origin='VOTC'
            AND Opportunity__c=:ste9993s[0].Id
        ];


        // Make sure there is a case for that Opportunity now
        System.assertEquals(newCases.size(), 1);
    }
}

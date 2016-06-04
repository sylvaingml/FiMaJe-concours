/* 
 *  FiMaJe, gestion du concours
 * 
 *  Creative Commons 
 *  Attribution - Pas d’Utilisation Commerciale 3.0 France 
 *  http://creativecommons.org/licenses/by-nc/3.0/fr/
 * 
 *  Auteurs: Sylvain Gamel, club « La Compagnie des Trolls » Antibes, France
 * 
 */


describe("Testing the user information form", function()
{
    var firstName = "Sylvain";
    var lastName = "Gamel";
    var email = "noreply@SylvainGamel.fr";
    var phone = "+33 44 55 66 77";
    var club = "Cie des Trolls";

    // TEST INIT AND CLEANUP

    var form;

    beforeEach(function() {
        fixture.setBase('tests/js/contest');
        var theDom = fixture.load('FMJContestant.form.html');

        form = document.createElement("div");
        form.appendChild(theDom[0]);
        document.body.appendChild(form);
    });

    afterEach(function() {
        document.body.removeChild(form);
        form = null;

        fixture.cleanup();
    });


    // TEST IMPLEMENTATIONS
    

    it('Should have inserted the fixture in the document.', function() {
        expect(document.getElementById('fmjContestantForm')).toBeDefined();
    });


    it("Ensure that we properly bind to UI elements", function() {
        var item = new FMJContestant();

        expect(item.firstNameFld).toBeDefined();
        expect(item.lastNameFld).toBeDefined();
        expect(item.phoneFld).toBeDefined();
        expect(item.emailFld).toBeDefined();
        expect(item.clubFld).toBeDefined();

        expect(item.firstNameFld.length > 0).toBeTruthy();
        expect(item.lastNameFld.length > 0).toBeTruthy();
        expect(item.phoneFld.length > 0).toBeTruthy();
        expect(item.emailFld.length > 0).toBeTruthy();
        expect(item.clubFld.length > 0).toBeTruthy();
    });


    it("Ensure empty mandatory field will forbit submission", function() {
        var item = new FMJContestant();

        expect(item.areUserInfoValid()).toBeFalsy();
    });


    it("Ensure space-only mandatory field will forbit submission", function() {
        var item = new FMJContestant();

        item.firstNameFld.val("           ");
        item.lastNameFld.val("           ");
        item.phoneFld.val("           ");
        item.emailFld.val("           ");

        expect(item.areUserInfoValid()).toBeFalsy();
    });


    it("Ensure non-empty mandatory field will allow submission", function() {
        var item = new FMJContestant();

        item.firstNameFld.val("  yes this a prénom");
        item.lastNameFld.val("De L'ennuie   ");
        item.phoneFld.val("+33 9988 73.44 ");
        item.emailFld.val("noreply@test.com");

        expect(item.areUserInfoValid()).toBeTruthy();
    });


    it("Converting to JSON shall provide expected result.", function() {
        var item = new FMJContestant();

        item.firstNameFld.val(firstName);
        item.lastNameFld.val(lastName);
        item.phoneFld.val(phone);
        item.emailFld.val(email);
        item.clubFld.val(club);

        var json = item.toJSON();

        expect(json.firstName == firstName).toBeTruthy();
        expect(json.lastName == lastName).toBeTruthy();
        expect(json.phone == phone).toBeTruthy();
        expect(json.email == email).toBeTruthy();
        expect(json.club == club).toBeTruthy();
    });
});
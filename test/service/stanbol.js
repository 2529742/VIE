module("zart.js - Apache Stanbol Service");

test("Test stanbol connection", function() {
    var z = new Zart();
    ok(z.StanbolService, "Checking if the Stanbol Service exists.'");
    z.use(new z.StanbolService);

    ok(z.service('stanbol'));

    // Entityhub sites list
    z.service('stanbol').getSites
});

test("Zart.js StanbolService - Annotate", function () {
    
    var elem = $('<p>This is a small test, where Steve Jobs sings a song.</p>');
    
    var z = new Zart();
   
    ok (z.StanbolService);
    equal(typeof z.StanbolService, "function");
    
    z.use(new z.StanbolService({url : "http://dev.iks-project.eu:8081"}));
    
    stop();
    z.annotate({element: elem}).using('stanbol').execute().done(function(entities) {
        debugger;
        ok(entities);
        //ok(entities.length > 0);
        //TODO: add more tests
        start();
    });
});
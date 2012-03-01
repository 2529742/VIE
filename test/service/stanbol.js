module("vie.js - Apache Stanbol Service");

/* All known endpoints of Stanbol */

/* The ones marked with a "!!!" are implemented by the StanbolConnector */
/* The ones marked with a "???" are implemented but still broken */

// !!!  /enhancer/chain/default
// !!!  /enhancer/chain/<chainId>
// !!!  /entityhub/sites/referenced
// !!!  /entityhub/sites/entity
// !!!  /entityhub/sites/find
//   /entityhub/sites/query
// !!!  /entityhub/sites/ldpath
// !!!  /entityhub/site/<siteId>/entity 
// !!!  /entityhub/site/<siteId>/find
//   /entityhub/site/<siteId>/query
// !!!  /entityhub/site/<siteId>/ldpath
//   /entityhub/entity
//   /entityhub/mapping
// !!!  /entityhub/find
//   /entityhub/query
// !!!  /entityhub/lookup
// !!!  /entityhub/ldpath
// ???  /sparql
// ???  /contenthub/contenthub/ldpath
// ???  /contenthub/contenthub/store
// ???  /contenthub/contenthub/store/raw/<contentId>
// ???  /contenthub/contenthub/store/metadata/<contentId>
// ???  /contenthub/<coreId>/store
// ???  /contenthub/<coreId>/store/raw/<contentId>
// ???  /contenthub/<coreId>/store/metadata/<contentId>
// ???  /contenthub/content/<contentId>
//   /factstore/facts
//   /factstore/query
//   /ontonet/ontology
//   /ontonet/ontology/<scopeName>
//   /ontonet/ontology/<scopeName>/<ontologyId>
//   /ontonet/ontology/User
//   /ontonet/session/
//   /ontonet/session/<sessionId>
//   /rules/rule/
//   /rules/rule/<ruleId>
//   /rules/recipe/
//   /rules/recipe/<recipeId>
//   /rules/refactor/
//   /rules/refactor/apply
//   /cmsadapter/map
//   /cmsadapter/session
//   /cmsadapter/contenthubfeed


var stanbolRootUrl = ["http://dev.iks-project.eu/stanbolfull", "http://dev.iks-project.eu:8080"];
test("Test stanbol connection", function() {
    var z = new VIE();
    ok(z.StanbolService, "Checking if the Stanbol Service exists.'");
    z.use(new z.StanbolService);
    ok(z.service('stanbol'));
});

test("VIE.js StanbolService - Analyze", function () {
    if (navigator.userAgent === 'Zombie') {
       return;
    } 
    // Sending a an example with double quotation marks.
    var elem = $('<p>This is a small test, where Steve Jobs sings the song \"We want to live forever!\" song.</p>');
    var z = new VIE();
    ok (z.StanbolService);
    equal(typeof z.StanbolService, "function");
    z.use(new z.StanbolService({url : stanbolRootUrl}));
    stop();
    z.analyze({element: elem}).using('stanbol').execute().done(function(entities) {

        ok(entities);
        ok(entities.length > 0, "At least one entity returned");
        ok(entities instanceof Array);
        var allEntities = true;
        for(var i=0; i<entities.length; i++){
            var entity = entities[i];
            if (! (entity instanceof Backbone.Model)){
                allEntities = false;
                ok(false, "VIE.js StanbolService - Analyze: Entity is not a Backbone model!");
                console.error("VIE.js StanbolService - Analyze: ", entity, "is not a Backbone model!");
            }
        }
        ok(allEntities);
        start();
    })
    .fail(function(f){
        ok(false, f.statusText);
        start();
    });
});

test("VIE.js StanbolService - Analyze with wrong URL of Stanbol", function () {
    if (navigator.userAgent === 'Zombie') {
       return;
    } 
    // Sending a an example with double quotation marks.
    var elem = $('<p>This is a small test, where Steve Jobs sings the song \"We want to live forever!\" song.</p>');
    var z = new VIE();
    ok (z.StanbolService);
    equal(typeof z.StanbolService, "function");
    var wrongUrls = ["http://www.this-is-wrong.url/", "http://dev.iks-project.eu/stanbolfull"];
    z.use(new z.StanbolService({url : wrongUrls}));
    stop();
    z.analyze({element: elem}).using('stanbol').execute().done(function(entities) {

        ok(entities);
        ok(entities.length > 0, "At least one entity returned");
        ok(entities instanceof Array);
        var allEntities = true;
        for(var i=0; i<entities.length; i++){
            var entity = entities[i];
            if (! (entity instanceof Backbone.Model)){
                allEntities = false;
                ok(false, "VIE.js StanbolService - Analyze: Entity is not a Backbone model!");
                console.error("VIE.js StanbolService - Analyze: ", entity, "is not a Backbone model!");
            }
        }
        ok(allEntities);
        start();
    })
    .fail(function(f){
        ok(false, f.statusText);
        start();
    });
});

test("VIE.js StanbolService - Analyze with Enhancement Chain", function () {
    if (navigator.userAgent === 'Zombie') {
       return;
    } 
    // Sending a an example with double quotation marks.
    var elem = $('<p>This is a small test, where Steve Jobs sings the song \"We want to live forever!\" song.</p>');
    var v = new VIE();
    ok (v.StanbolService);
    equal(typeof v.StanbolService, "function");
    v.use(new v.StanbolService({url : stanbolRootUrl, enhancerUrlPostfix: "/enhancer/chain/dbpedia-keyword"}));
    stop();
    v.analyze({element: elem}).using('stanbol').execute().done(function(entities) {
        ok(entities);
        ok(entities.length > 0, "At least one entity returned");
        ok(entities instanceof Array);
        var allEntities = true;
        for(var i=0; i<entities.length; i++){
            var entity = entities[i];
            if (! (entity instanceof Backbone.Model)){
                allEntities = false;
                ok(false, "VIE.js StanbolService - Analyze: Entity is not a Backbone model!");
                console.error("VIE.js StanbolService - Analyze: ", entity, "is not a Backbone model!");
            }
        }
        ok(allEntities);
        start();
    })
    .fail(function(f){
        ok(false, f.statusText);
        start();
    });
});

test("VIE.js StanbolConnector - Get all referenced sites", function () {
    if (navigator.userAgent === 'Zombie') {
       return;
    } 
    // Sending a an example with double quotation marks.
    var z = new VIE();
    ok (z.StanbolService);
    equal(typeof z.StanbolService, "function");
    var stanbol = new z.StanbolService({url : stanbolRootUrl});
    z.use(stanbol);
    stop();
    stanbol.connector.referenced(function (sites) {
    	ok(_.isArray(sites));
    	ok(sites.length > 0);
    	start();
    }, function (err) {
    	ok(false, "No referenced site has been returned!");
    	start();
    });
});

/* TODO
test("VIE.js StanbolConnector - Perform SPARQL Query", function () {
    if (navigator.userAgent === 'Zombie') {
       return;
    } 
    
    var query = "PREFIX fise: <http://fise.iks-project.eu/ontology/> " + 
    	"PREFIX dc:   <http://purl.org/dc/terms/> " + 
    		"SELECT distinct ?enhancement ?content ?engine ?extraction_time " + 
    		"WHERE { " + 
    		  "?enhancement a fise:Enhancement . " + 
    		  "?enhancement fise:extracted-from ?content . " + 
    		  "?enhancement dc:creator ?engine . " + 
    		  "?enhancement dc:created ?extraction_time . " + 
    		"} " +
    		"ORDER BY DESC(?extraction_time) LIMIT 5";
    
    // Sending a an example with double quotation marks.
    var z = new VIE();
    ok (z.StanbolService);
    equal(typeof z.StanbolService, "function");
    var stanbol = new z.StanbolService({url : stanbolRootUrl});
    z.use(stanbol);
    stop();
    stanbol.connector.sparql(query, function (response) {
    	debugger;
    	start();
    }, function (err) {
    	debugger;
    	ok(false, "No response has been returned!");
    	start();
    });
});
*/


test("VIE.js StanbolService - Find", function () {
    if (navigator.userAgent === 'Zombie') {
       return;
    } 
    var term = "European Union";
    var limit = 10;
    var offset = 0;
    var z = new VIE();
    ok (z.StanbolService);
    equal(typeof z.StanbolService, "function");
    z.use(new z.StanbolService({url : stanbolRootUrl}));
    stop();
    z.find({term: term, limit: limit, offset: offset})
    .using('stanbol').execute().done(function(entities) {

        ok(entities);
        ok(entities.length > 0);
        ok(entities instanceof Array);
        var allEntities = true;
        for(var i=0; i<entities.length; i++){
            var entity = entities[i];
            if (! (entity instanceof Backbone.Model)){
                allEntities = false;
                ok(false, "VIE.js StanbolService - Find: Entity is not a Backbone model!");
                console.error("VIE.js StanbolService - Find: ", entity, "is not a Backbone model!");
            }
        }
        ok(allEntities);
        start();
    })
    .fail(function(f){
        ok(false, f.statusText);
        start();
    });
    
    stop();
    // search only in local entities
    z.find({term: "P*", limit: limit, offset: offset, local : true})
    .using('stanbol').execute().done(function(entities) {
        ok(entities);
        ok(entities.length > 0);
        ok(entities instanceof Array);
        var allEntities = true;
        for(var i=0; i<entities.length; i++){
            var entity = entities[i];
            if (! (entity instanceof Backbone.Model)){
                allEntities = false;
                ok(false, "VIE.js StanbolService - Find: Entity is not a Backbone model!");
                console.error("VIE.js StanbolService - Find: ", entity, "is not a Backbone model!");
            }
        }
        ok(allEntities);
        start();
    })
    .fail(function(f){
        ok(false, f.statusText);
        start();
    });
    
    stop();
    z.find({term: term}) // only term given, no limit, no offset
    .using('stanbol').execute().done(function(entities) {

        ok(entities);
        ok(entities.length > 0);
        ok(entities instanceof Array);
        var allEntities = true;
        for(var i=0; i<entities.length; i++){
            var entity = entities[i];
            if (! (entity instanceof Backbone.Model)){
                allEntities = false;
                ok(false, "VIE.js StanbolService - Find: Entity is not a Backbone model!");
                console.error("VIE.js StanbolService - Find: ", entity, "is not a Backbone model!");
            }
        }
        ok(allEntities);
        start();
    })
    .fail(function(f){
        ok(false, f.statusText);
        start();
    });
    
    stop();
    z.find({term: "", limit: limit, offset: offset})
    .using('stanbol').execute()
    .done(function(entities) {

        ok(false, "this should fail, as there is an empty term given!");
        start();
    })
    .fail(function(f){
        ok(true, f.statusText);
        start();
    });
    
    stop();
    z.find({limit: limit, offset: offset})
    .using('stanbol').execute()
    .done(function(entities) {

        ok(false, "this should fail, as there is no term given!");
        start();
    })
    .fail(function(f){
        ok(true, f.statusText);
        start();
    });
});


test("VIE.js StanbolService - Load", function () {
    if (navigator.userAgent === 'Zombie') {
       return;
    }
    var entity = "<http://dbpedia.org/resource/Barack_Obama>";
    var z = new VIE();
    ok (z.StanbolService);
    equal(typeof z.StanbolService, "function");
    z.use(new z.StanbolService({url : stanbolRootUrl}));
    stop();
    z.load({entity: entity})
    .using('stanbol').execute().done(function(entities) {
        ok(entities);
        ok(entities.length > 0);
        ok(entities instanceof Array);
        var allEntities = true;
        for(var i=0; i<entities.length; i++){
            var entity = entities[i];
            if (! (entity instanceof Backbone.Model)){
                allEntities = false;
                ok(false, "VIE.js StanbolService - Load: Entity is not a Backbone model!");
                console.error("VIE.js StanbolService - Analyze: ", entity, "is not a Backbone model!");
            }
        }
        ok(allEntities);
        start();
    })
    .fail(function(f){
        ok(false, f.statusText);
        start();
    });
});

/* TODO
test("VIE.js StanbolService - ContentHub: Upload / Retrieval of enhancements (given ID)", function () {
    if (navigator.userAgent === 'Zombie') {
       return;
    }
    var content = 'This is a small test, where Steve Jobs sings the song "We want to live forever!" song.';

    var z = new VIE();
    ok (z.StanbolService);
    equal(typeof z.StanbolService, "function");
    var stanbol = new z.StanbolService({url : stanbolRootUrl});
    z.use(stanbol);
    
    stop();
    stanbol.connector.uploadContent(content, function (response) {
    	debugger;
    	start();
    }, function (err) {
    	debugger;
    	ok(false, "No response has been returned!");
    	start();
    }, {
    	contentId : "http://vie-test-entity.eu/" + new Date().getTime()
    });
});


test("VIE.js StanbolService - ContentHub: Upload / Retrieval of enhancements (no ID provided)", function () {
    if (navigator.userAgent === 'Zombie') {
       return;
    }
    var content = 'This is a small test, where Steve Jobs sings the song "We want to live forever!" song.';

    var z = new VIE();
    ok (z.StanbolService);
    equal(typeof z.StanbolService, "function");
    var stanbol = new z.StanbolService({url : stanbolRootUrl});
    z.use(stanbol);
    
    stop();
    stanbol.connector.uploadContent(content, function (response) {
    	debugger;
    	start();
    }, function (err) {
    	debugger;
    	ok(false, "No response has been returned!");
    	start();
    });
});
*/

test("VIE.js StanbolService - ContentHub: Lookup", function () {
    if (navigator.userAgent === 'Zombie') {
       return;
    }
    
    var entity = 'http://dbpedia.org/resource/Paris';

    var z = new VIE();
    z.namespaces.add("cc", "http://creativecommons.org/ns#");
    ok (z.StanbolService);
    equal(typeof z.StanbolService, "function");
    var stanbol = new z.StanbolService({url : stanbolRootUrl});
    z.use(stanbol);
    
    stop();
    stanbol.connector.lookup(entity, function (response) {
    	var entities = VIE.Util.rdf2Entities(stanbol, response);
    	ok(entities.length > 0, "With 'create'");
    	start();
    }, function (err) {
    	debugger;
    	ok(false, "No response has been returned!");
    	start();
    }, {
    	create : true
    });
    
    stop();
    stanbol.connector.lookup(entity, function (response) {
    	var entities = VIE.Util.rdf2Entities(stanbol, response);
    	ok(entities.length > 0, "Without 'create'");
    	start();
    }, function (err) {
    	debugger;
    	ok(false, "No response has been returned!");
    	start();
    });
});

test("VIE.js StanbolService - ContentHub: LDPath", function () {
    if (navigator.userAgent === 'Zombie') {
       return;
    }
    
    var context = 'http://dbpedia.org/resource/Paris';
    var ldpath = "@prefix dct : <http://purl.org/dc/terms/> ;\n" + 
                 "@prefix geo : <http://www.w3.org/2003/01/geo/wgs84_pos#> ;\n" + 
                 "name = rdfs:label[@en] :: xsd:string;\n" + 
                 "labels = rdfs:label :: xsd:string;\n" + 
                 "comment = rdfs:comment[@en] :: xsd:string;\n" + 
                 "categories = dc:subject :: xsd:anyURI;\n" + 
                 "homepage = foaf:homepage :: xsd:anyURI;\n" + 
                 "location = fn:concat(\"[\",geo:lat,\",\",geo:long,\"]\") :: xsd:string;\n";
    
    var z = new VIE();
    z.namespaces.add("cc", "http://creativecommons.org/ns#");
    ok (z.StanbolService);
    equal(typeof z.StanbolService, "function");
    var stanbol = new z.StanbolService({url : stanbolRootUrl});
    z.use(stanbol);
    
    stop();
    stanbol.connector.ldpath(ldpath, context, function (response) {
    	var entities = VIE.Util.rdf2Entities(stanbol, response);
    	ok(entities.length > 0);
    	start();
    }, function (err) {
    	debugger;
    	ok(false, "No response has been returned!");
    	start();
    }, {
    	create : true
    });
});

test("VIE.js StanbolService - CRUD on local entities", function () {
    if (navigator.userAgent === 'Zombie') {
       return;
    }
    var z = new VIE();
    ok (z.StanbolService);
    equal(typeof z.StanbolService, "function");
    z.use(new z.StanbolService({url : stanbolRootUrl}));
    //TODO
});


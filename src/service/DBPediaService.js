// File:   DBPediaService.js <br />
// Author: <a href="http://github.com/neogermi/">Sebastian Germesin</a>
//

(function(){
    
VIE.prototype.DBPediaService = function(options) {
    var defaults = {
        name : 'dbpedia',
        namespaces : {
            owl    : "http://www.w3.org/2002/07/owl#",
            yago   : "http://dbpedia.org/class/yago/",
            foaf: 'http://xmlns.com/foaf/0.1/',
            georss: "http://www.georss.org/georss/",
            geo: 'http://www.w3.org/2003/01/geo/wgs84_pos#',
            rdfs: "http://www.w3.org/2000/01/rdf-schema#",
            rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
            dbpedia: "http://dbpedia.org/ontology/",
            dbprop : "http://dbpedia.org/property/",
            purlt : "http://purl.org/dc/terms/",
            purle : "http://purl.org/dc/elements/1.1/"
        }
    };
    this.options = jQuery.extend(true, defaults, options ? options : {});

    this.vie = null; // will be set via VIE.use();
    this.name = this.options.name;
    this.connector = new DBPediaConnector(this.options);

    jQuery.ajaxSetup({
        converters: {"text application/rdf+json": function(s){return JSON.parse(s);}},
        timeout: 60000 /* 60 seconds timeout */
    });

};

VIE.prototype.DBPediaService.prototype = {
    init: function() {

       for (var key in this.options.namespaces) {
            try {
                var val = this.options.namespaces[key];
                this.vie.namespaces.add(key, val);
            } catch (e) {
                //this means that the namespace is already in the VIE.namespace
                //ignore for now!
            }
        }
        this.namespaces = this.vie.namespaces;

        this.rules = [
             //rule to transform a DBPedia person into a VIE person
             {
                 'left' : [
                        '?subject a dbpedia:Person'
                 ],
                 'right': function(ns){
                     return function(){
                         return [
                             jQuery.rdf.triple(this.subject.toString(),
                                 'a',
                                 '<' + ns.base() + 'Person>', {
                                     namespaces: ns.toObj()
                                 })
                             ];
                     };
                 }(this.namespaces)
             }
        ];
    },

    // VIE API load implementation
    load: function(loadable){
        var service = this;
        
        var correct = loadable instanceof this.vie.Loadable;
        if (!correct) {throw new Error("Invalid Loadable passed");}

        var entity = loadable.options.entity;
        if (!entity) {
            loadable.reject([]);
        }
        else {
            entity = (typeof entity === "string")? entity : entity.id;
            
            var success = function (results) {
                results = (typeof results === "string")? JSON.parse(results) : results;
                var entities = VIE.Util.rdf2Entities(service, results);
                loadable.resolve(entities);
            };
            var error = function (e) {
                loadable.reject(e);
            };
            this.connector.load(entity, success, error);
        }
    }
};
var DBPediaConnector = function(options){
    this.options = options;
};

DBPediaConnector.prototype = {

    load: function (uri, success, error, options) {
        if (!options) { options = {}; }
        
        uri = (/^<.+>$/.test(uri))? uri : '<' + uri + '>';
        
        var url = "http://dbpedia.org/sparql?default-graph-uri=http%3A%2F%2Fdbpedia.org&timeout=0" + 
        "&format=" + encodeURIComponent("application/rdf+json") + 
        "&query=" +
        encodeURIComponent("CONSTRUCT { " + uri + " ?prop ?val } WHERE { " + uri + " ?prop ?val }");
        
        var format = options.format || "application/rdf+json";

        if (typeof exports !== "undefined" && typeof process !== "undefined") {
            // We're on Node.js, don't use jQuery.ajax
            return this.loadNode(url, success, error, options, format);
        }

        jQuery.ajax({
            success: function(response){
                success(response);
            },
            error: error,
            type: "GET",
            url: url,
            accepts: {"application/rdf+json": "application/rdf+json"}
        });
    },

    loadNode: function (uri, success, error, options, format) {
        var request = require('request');
        var r = request({
            method: "GET",
            uri: uri,
            headers: {
                Accept: format
            }
        }, function(error, response, body) {
            success(JSON.parse(body));
        });
        r.end();
    }
};
})();


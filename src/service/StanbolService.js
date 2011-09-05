// File:   StanbolService.js
// Author: <a href="mailto:sebastian.germesin@dfki.de">Sebastian Germesin</a>
// Author: <a href="">Szaby Gruenwald</a>
//
(function(){
Zart.prototype.StanbolService = function(options) {
    if (!options) {
        options = {
            url: 'http://dev.iks-project.eu:8080/'
        };
    }
    this.options = options;

    this.zart = null;
    this.name = 'stanbol';
    this.namespaces = {
        semdesko : "http://www.semanticdesktop.org/ontologies/2007/03/22/nfo#",
        semdeski : "http://www.semanticdesktop.org/ontologies/2007/01/19/nie#",
        owl : "http://www.w3.org/2002/07/owl#",
        gml : "http://www.opengis.net/gml/_",
        geonames : "http://www.geonames.org/ontology#",
        fise : "http://fise.iks-project.eu/ontology/",
        rick: "http://www.iks-project.eu/ontology/rick/model/",
        purl: "http://purl.org/dc/terms/",
        rdfs: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
        dc  : 'http://purl.org/dc/terms/',
        foaf: 'http://xmlns.com/foaf/0.1/',
        schema: 'http://schema.org/'
    };
    this.rules = [
        //rule to add backwards-relations to the triples
        //this makes querying for entities a lot easier!
        {'left' : [
            '?subject a <http://fise.iks-project.eu/ontology/EntityAnnotation>',
            '?subject fise:entity-type ?type',
            '?subject fise:confidence ?confidence',
            '?subject fise:entity-reference ?entity',
            '?subject dc:relation ?relation',
            '?relation a <http://fise.iks-project.eu/ontology/TextAnnotation>',
            '?relation fise:selected-text ?selected-text',
            '?relation fise:selection-context ?selection-context',
            '?relation fise:start ?start',
            '?relation fise:end ?end'
        ],
         'right' : [
             '?entity a ?type',
             '?entity fise:hasTextAnnotation ?relation',
             '?entity fise:hasEntityAnnotation ?subject'
         ]
         },
         //rule to transform a Stanbol person into a Zart person
         {
            'left' : [
                '?subject a <http://dbpedia.org/ontology/Person>',
             ],
             'right': function(ns){
                 return function(){
                     return jQuery.rdf.triple(this.subject.toString() +
                     ' a <http://schema.org/Person>', {
                         namespaces: ns
                     });
                 };
             }(this.namespaces)
         }
    ];
    
    this.connector = new StanbolConnector(this.options);
};

Zart.prototype.StanbolService.prototype = {
    analyze: function(analyzable) {
        var service = this;
        var correct = analyzable instanceof this.zart.Analyzable;
        if (!correct) {
            throw "Invalid Analyzable passed";
        }

        var element = analyzable.options.element ? analyzable.options.element : jQuery('body');

        var text = service._extractText(element);

        if (text.length > 0) {
            //query enhancer with extracted text
            var callback = function (service, element, a) {
                return function (data) {
                    var entities = service._enhancer2Entities(service, element, data);

                    a.resolve(entities);
                };
            }(service, element, analyzable);

            this.connector.engines(text, callback, {defaultProxyUrl: this.options.defaultProxyUrl || this.zart.defaultProxyUrl});



        } else {
            throw "No text found in element.";
        }

    },

    _extractText: function (element) {
        if (element.get(0) && 
            element.get(0).tagName && 
            (element.get(0).tagName == 'TEXTAREA' ||
            element.get(0).tagName == 'INPUT' && element.attr('type', 'text'))) {
            return element.get(0).val();
        }
        else {
            return element
                .text()    //get the text of element
                .replace(/\s+/g, ' ') //collapse multiple whitespaces
                .replace(/\0\b\n\r\f\t/g, '').trim(); // remove non-letter symbols
        }
    },

    _enhancer2Entities: function (service, element, data) {
        //transform data from Stanbol into Zart.Entities

        if (data && data.status === 200) {

            if (typeof jQuery.rdf !== 'function') {
                throw "RdfQuery is not loaded";
            }
            var obj = jQuery.parseJSON(data.responseText);
            var rdf = jQuery.rdf().load(obj, {});

            //execute rules here!
            if (service.rules) {
                var rules = jQuery.rdf.ruleset();
                for (var prefix in service.namespaces) {
                    rules.prefix(prefix, service.namespaces[prefix]);
                }
                for (var i = 0; i < service.rules.length; i++) {
                    rules.add(service.rules[i]['left'], service.rules[i]['right']);
                }
                rdf = rdf.reason(rules, 10); // execute the rules only 10 times to avoid looping
            }
            var entities = {}
            rdf.where('?subject ?property ?object').each(function() {
                var subject = this.subject.toString();
                if (!entities[subject]) {
                    entities[subject] = {
                        '@subject': subject,
                        '@context': service.namespaces
                    };
                }
                var propertyUri = this.property.toString();

                var propertyCurie = jQuery.createCurie(propertyUri.substring(1, propertyUri.length - 1), {namespaces: service.namespaces});

                if (typeof this.object.value === "string") {
                    entities[subject][propertyCurie] = this.object.value;
                } else {
                    entities[subject][propertyCurie] = this.object.toString();
                }
            });

            var zartEntities = [];
            jQuery.each(entities, function() {
                var entityInstance = new service.zart.Entity(this);
                entityInstance = service.zart.entities.addOrUpdate(entityInstance);
                zartEntities.push(entityInstance);
            });
            return zartEntities; 
        }
    }
};

var StanbolConnector = function(options){
    this.options = options;
    this.baseUrl = options.url.replace(/\/$/, '');
    this.enhancerUrlPrefix = "/engines/";
};
StanbolConnector.prototype = {
    engines: function(text, callback, options) {
        var enhancerUrl = this.baseUrl + this.enhancerUrlPrefix;
        var proxyUrl = options.defaultProxyUrl || this.options.defaultProxyUrl;
        jQuery.ajax({
            complete: callback,
            type: "POST",
            url: proxyUrl || enhancerUrl,
            data: (proxyUrl) ? {
                    proxy_url: enhancerUrl, 
                    content: text,
                    verb: "POST",
                    format: options.format || "application/rdf+json"
                } : text
        });
    }
}
})();

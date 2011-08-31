
Zart.prototype.Removable = function (options) {
    jQuery.Deferred.apply(this);
    this.options = options;
    this.services = options.from || options.using || [];
    this.zart = options.zart;

    // Synonyms
    this.success = this.done;

    this.from = this.using = function(service) {
        var serviceObj = typeof service === "string" ? this.zart.service(service) : service;
        this.services.push(serviceObj);
        return this;
    };

    // Running the actual method
    this.execute = function () {
        // call service.load
        var removable = this;
        _(this.services).each(function(service){
            service.remove(removable);
        });
        return this;
    }
}
Zart.prototype.Removable.prototype = new jQuery.Deferred();

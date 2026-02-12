// Example snippet for public/customActivity.js
connection.on('initActivity', function(data) {
    if (data) { payload = data; }
    // Request schema to populate sourceField dropdown
    connection.trigger('requestedSchema');
});

connection.on('requestedSchema', function (schema) {
    // Logic to populate the #sourceField dropdown with schema.index.fields
});

function save() {
    const sourceField = $('#sourceField').val();
    const destDE = $('#destinationDE').val();

    // Map fields using Data Binding syntax to get dynamic values at runtime
    payload['arguments'].execute.inArguments = [{
        "sourceValue": "{{" + EventDefinitionKey + "." + sourceField + "}}",
        "destinationDE": destDE
    }];
    
    payload['metaData'].isConfigured = true;
    connection.trigger('updateActivity', payload);
}

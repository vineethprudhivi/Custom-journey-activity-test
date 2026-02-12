// 1. Initialize Postmonger session at the top
var connection = new Postmonger.Session();
var payload = {};
var eventDefinitionKey;

// 2. Add the window.ready logic to break the loading spinner
$(window).ready(function() {
    connection.trigger('ready'); // CRITICAL: This stops the loading spinner
});

// 3. Your existing initActivity logic
connection.on('initActivity', function(data) {
    if (data) { 
        payload = data; 
    }
    // Request schema to populate sourceField dropdown
    connection.trigger('requestedSchema');
});

// 4. Handle requestedSchema to get field names
connection.on('requestedSchema', function (data) {
    // Save the EventDefinitionKey for your save function
    eventDefinitionKey = data.eventDefinitionKey;
    
    const fields = data.schema;
    // Logic to populate the #sourceField dropdown
    $('#sourceField').empty();
    fields.forEach(field => {
        $('#sourceField').append($('<option>', {
            value: field.name,
            text: field.name
        }));
    });
});

function save() {
    const sourceField = $('#sourceField').val();
    const destDE = $('#destinationDE').val();

    // Map fields using Data Binding syntax
    // Ensure eventDefinitionKey is captured from requestedSchema
    payload['arguments'].execute.inArguments = [{
        "sourceValue": "{{" + eventDefinitionKey + "." + sourceField + "}}",
        "destinationDE": destDE
    }];
    
    payload['metaData'].isConfigured = true;
    connection.trigger('updateActivity', payload);
}

// 5. Connect the Salesforce 'Next' button to your save function
connection.on('clickedNext', save);

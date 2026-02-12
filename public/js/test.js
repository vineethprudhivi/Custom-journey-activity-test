// 1. Initialize Postmonger session at the top
var connection = new Postmonger.Session();
var payload = {};
var schema = [];

// 2. Add the window.ready logic to break the loading spinner
$(window).ready(function() {
    connection.trigger('ready'); // CRITICAL: This stops the loading spinner
    connection.trigger('requestSchema'); // Request schema on initialization
});

// 3. Your existing initActivity logic
connection.on('initActivity', function(data) {
    if (data) { 
        payload = data; 
    }
    // Hydrate existing values if activity was already configured
    hydrateFromExistingPayload();
});

// 4. Handle requestedSchema to get field names
connection.on('requestedSchema', function (data) {
    // Validate that schema data exists
    if (!data || !data.schema) {
        console.warn('No schema data received');
        return;
    }
    
    schema = data.schema;
    
    // Logic to populate the #sourceField dropdown
    var $sourceField = $('#sourceField');
    $sourceField.empty();
    $sourceField.append($('<option>', {
        value: '',
        text: 'Select a field'
    }));
    
    schema.forEach(function(field) {
        if (!field || !field.key) {
            return;
        }
        
        $sourceField.append($('<option>', {
            value: field.key,  // Use field.key (e.g., "Event.DEKey.Email")
            text: field.name || field.key  // Display name or key
        }));
    });
    
    // Hydrate after populating dropdown
    hydrateFromExistingPayload();
});

function save() {
    var sourceField = $('#sourceField').val();
    var destDE = ($('#destinationDE').val() || '').trim();

    // Initialize payload structure if not exists
    payload.arguments = payload.arguments || {};
    payload.arguments.execute = payload.arguments.execute || {};
    payload.metaData = payload.metaData || {};

    // Map fields using Data Binding syntax
    payload.arguments.execute.inArguments = [{
        sourceValue: sourceField ? '{{' + sourceField + '}}' : null,
        destinationDE: destDE || null
    }];
    
    payload.metaData.isConfigured = true;
    connection.trigger('updateActivity', payload);
}

function hydrateFromExistingPayload() {
    var existing = payload && payload.arguments && payload.arguments.execute && payload.arguments.execute.inArguments;
    if (!existing || existing.length === 0) {
        return;
    }

    var args = existing[0] || {};
    
    // Restore destination DE
    if (args.destinationDE) {
        $('#destinationDE').val(args.destinationDE);
    }

    // Restore source field selection
    if (args.sourceValue && typeof args.sourceValue === 'string') {
        var match = args.sourceValue.match(/^\{\{(.+)\}\}$/);
        var schemaKey = match ? match[1] : null;
        if (schemaKey) {
            $('#sourceField').val(schemaKey);
        }
    }
}

// 5. Connect the Salesforce 'Next' button to your save function
connection.on('clickedNext', save);

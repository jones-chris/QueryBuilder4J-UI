let columnMembersWindow = null;
let getQueryTemplateEndpoint = "http://localhost:8080/queryTemplates";
let getSchemaEndpoint = "http://localhost:8080/schemas";
let getTablesEndpoint = "http://localhost:8080/tablesAndViews/";
let getColumnsEndpoint = "http://localhost:8080/columns/";
let formSubmissionEndpoint = "http://localhost:8080/query";
let formMethod = "POST";
let queryTemplates = ['query template 1', 'query template 2']; // set to [] to render
let schemas = ['schema1', 'schema2']; // set to [] to render
let tables = ['table1']; // set to [] to render
let allowJoins = true; // set to true to render
let availableColumns = ['column1', 'column2']; // set to [] to render
let selectedColumns = ['column1']; // set to [] to render
let criteria = []; // set to [] to render
let distinct = false;
let orderByColumns = null; // set to [] to render
let groupByColumns = null; // set to [] to render
let suppressNulls = false; //set to true to render
let limitChoices = [5, 10, 50, 500]; // set to [] to render
let offsetChoices = [5, 10, 50, 500]; // set to [] to render
let cssFile = null;
let queryTemplatesSize = 5;
let schemasSize = 5;
let tablesSize = 5;
let availableColumnsSize = 10;
let selectedColumnsSize = 10;
let orderByColumnsSize = 10;
let groupByColumnsSize = 10;

function sendAjaxRequest(endpoint, paramString, method, callbackFunction) {
    $.ajax({
        method: method,
        url: endpoint,
        data: paramString,
        success: function(responseText) {
            alert(responseText);
            callbackFunction(responseText);
        },
        error: function(jqXHR, textStatus, errorThrown) {
            alert('There was an error retrieving the database schemas');
            alert(jqXHR);
            alert(textStatus);
            alert(errorThrown);
        },
        dataType: 'json'
      });
}

function setColumnMembersWindow() {
    columnMembersWindow = new ColumnMembers();
}

function showColumnMembersWindow() {
    var windowProps = "toolbar=no,menubar=no,location=no,resizable=yes,scrollbars=yes,status=no,dependent=yes";
    window.open("/ColumnMembers.html", "columnMembers", windowProps);
}

function getQueryTemplates() {
    sendAjaxRequest(getQueryTemplateEndpoint,
                    null,
                    "GET",
                    function(queryTemplatesData) {
                        fillArrayProperty('queryTemplates', queryTemplatesData);
                        syncSelectOptionsWithDataModel('queryTemplates', queryTemplates);
                    });
}

function getQueryTemplatById(id) {
    sendAjaxRequest(getQueryTemplateEndpoint + '/' + id,
                    null,
                    "GET",
                    function(queryTemplateData) {
                        alert('Query Template retrieved:  ' + queryTemplateData);
                        //TODO write logic to populate query template's data on screen.

                        // update each array variable based on queryTemplateData.

                        // call syncSelectOptionsWithData for each array variable.
                    });
}

function getSchemas() {
    sendAjaxRequest(getSchemaEndpoint, 
                    null, 
                    "GET",
                    function(schemasData) {
                        fillArrayProperty('schemas', schemasData);
                        syncSelectOptionsWithDataModel('schemas', schemas);
                    });
}

function getTables(schema) {
    sendAjaxRequest(getTablesEndpoint + schema, 
                    null, 
                    "GET", 
                    function (tablesData) {
                        fillArrayProperty('tables', tablesData);
                        syncSelectOptionsWithDataModel('tables', tables);
                    });
}

function getAvailableColumns(schema, tablesArray) {
    let tableParamString = tablesArray.join('&');
    sendAjaxRequest(getColumnsEndpoint + schema + tableParamString, 
                    null, 
                    "GET",
                    function(columnsData) {
                        fillArrayProperty('columns', columnsData);
                        syncSelectOptionsWithDataModel('columns', availableColumns);
                    });
}

function addSelectedColumns(members) {
    fillArrayProperty('selectedMembers', members);
    syncSelectOptionsWithDataModel('selectedColumns', selectedColumns);
}

function removeSelectedColumn(memberIndeces) {
    deleteArrayPropertyMembers('selectedColumns', memberIndeces);
    syncSelectOptionsWithDataModel('selectedColumns', selectedColumns);
}

function moveSelectedColumnUp(index) {
    if (index === 0) return null;

    // get destination item
    var itemToDelete = selectedColumns[index - 1];
    
    // set destination item to current item
    selectedColumns[index - 1] = selectedColumns[index];

    // insert destination item at current item's index
    selectedColumns[index] = itemToDelete;

    syncSelectOptionsWithDataModel('selectedColumns', selectedColumns);
    //updateSelectedMembersHTML();
}

function moveSelectedColumnDown(index) {
    if (index === selectedColumns.length - 1) return null;

    // get destination item
    var itemToDelete = selectedColumns[index + 1];

    // set destination item to current item
    selectedColumns[index + 1] = selectedColumns[index];

    // insert destination item at current item's index
    selectedColumns[index] = itemToDelete;

    syncSelectOptionsWithDataModel('selectedColumns', selectedColumns);
    //updateSelectedMembersHTML();
}

function addOrderByColumns(members) {
    fillArrayProperty('orderByColumns', members);
    syncSelectOptionsWithDataModel('orderBy', orderByColumns);
}

function removeOrderByColumns(memberIndeces) {
    deleteArrayPropertyMembers('orderByColumns', memberIndeces);
    syncSelectOptionsWithDataModel('orderBy', orderByColumns);
}

function moveOrderByColumnUp(index) {
    moveArrayPropertyItem('orderByColumns', index, 'up');
    syncSelectOptionsWithDataModel('orderBy', orderByColumns);
} 

function moveOrderByColumnDown(index) {
    moveArrayPropertyItem('orderByColumns', index, 'down');
    syncSelectOptionsWithDataModel('orderBy', orderByColumns);
}

function addGroupByColumns(members) {
    
    fillArrayProperty('groupByColumns', members);
    syncSelectOptionsWithDataModel('groupBy', groupByColumns);
}

function removeGroupByColumns(memberIndeces) {
    deleteArrayPropertyMembers('groupByColumns', memberIndeces);
    syncSelectOptionsWithDataModel('groupBy', groupByColumns);
} 

function moveGroupByColumnUp(index) {
    moveArrayPropertyItem('groupByColumns', index, 'up');
    syncSelectOptionsWithDataModel('groupBy', groupByColumns);
}

function moveGroupByColumnDown(index) {
    moveArrayPropertyItem('groupByColumns', index, 'down');
    syncSelectOptionsWithDataModel('groupBy', groupByColumns);
}

function addCriteria() {
    //TODO:  add this method body.
}

function removeCriteria() {
    //TODO:  add this method body.
}

function renderHTML(beforeNode) {
    var form = document.createElement('form');
    form.setAttribute('id', 'queryBuilder');
    form.setAttribute('name', 'queryBuilder');
    form.setAttribute('action', formSubmissionEndpoint);
    form.setAttribute('method', formMethod);

    var el = null;

    //Query Templates
    if (getQueryTemplateEndpoint !== null) {
        getQueryTemplates();
    }

    el = renderQueryTemplatesHTML();
    if (el !== undefined)
        form.appendChild(el);

    //Schemas
    el = renderSchemaHTML();
    if (el !== undefined)
        form.appendChild(el);

    //Tables
    el = renderTablesHTML();
    if (el !== undefined)
        form.appendChild(el);

    el = renderJoinsHTML();
    if (el !== undefined)
        form.appendChild(el);

    //Available Columns
    el = renderAvailableColumnsHTML();
    if (el !== undefined) 
        form.appendChild(el);

    //SelectedColumns
    // el = renderSelectedColumnsHTML();
    // if (el !== undefined)
    //     form.appendChild(el);

    //Criteria
    el = renderCriteriaHTML();
    if (el !== undefined) 
        form.appendChild(el);

    //Distinct
    el = renderDistinctHTML();
    if (el !== undefined)
        form.appendChild(el);

    //Order By
    el = renderOrderByHTML();
    if (el !== undefined)
        form.appendChild(el);

    //Group By
    el = renderGroupByHTML();
    if (el !== undefined)
        form.appendChild(el);

    //Suppress Nulls
    el = renderSuppressNullsHTML();
    if (el !== undefined)
        form.appendChild(el);

    //Limit
    el = renderLimitHTML();
    if (el !== undefined)
        form.appendChild(el);

    //Offset
    el = renderOffsetHTML();
    if (el !== undefined)
        form.appendChild(el);

    if (beforeNode === undefined) {
        document.body.appendChild(form);
    } else {
        document.getElementById(beforeNode).appendChild(form);
    }
    
}

function fillArrayProperty(arrayPropertyName, data) {
    for (var i=0; i<data.length; i++) {
        this[arrayPropertyName].push(data[i]);
    }
}

function deleteArrayPropertyMembers(arrayPropertyName, indecesToDelete) {
    newArray = this[arrayPropertyName].slice();
    for (var i in indecesToDelete) {
        delete newArray[i];
    }

    this[arrayPropertyName] = newArray;
}

function moveArrayPropertyItem(arrayPropertyName, index, direction) {
    if (direction === 'up') {
        if (index === 0) return null;

        // get destination item
        var itemToDelete = this[arrayPropertyName][index - 1];
        
        // set destination item to current item
        this[arrayPropertyName][index - 1] = this[arrayPropertyName][index];

        // insert destination item at current item's index
        this[arrayPropertyName][index] = itemToDelete;
    } else if (direction === 'down') {
        if (index === this[arrayPropertyName].length - 1) return null;

        // get destination item
        var itemToDelete = this[arrayPropertyName][index + 1];

        // set destination item to current item
        this[arrayPropertyName][index + 1] = this[arrayPropertyNames][index];

        // insert destination item at current item's index
        this[arrayPropertyName][index] = itemToDelete;
    }
}

function createNewElement(type, attributesMap, dataProperty) {
    if (this[dataProperty] === null) return null;

    let select = document.createElement(type);
    for (var key in attributesMap) {
        let attributeName = key;
        let attributeValue = attributesMap[key];
        select.setAttribute(attributeName, attributeValue);
    }

    if (dataProperty !== null) {
        for (var item in dataProperty) {
            let option = document.createElement('option');
            option.value = dataProperty[item];
            option.innerHTML = dataProperty[item];
            
            select.add(option);
        }
    }
        
    return select;        
}

function renderQueryTemplatesHTML() {
    if (queryTemplates !== null) {
        let attributesMap = {
            'id': 'queryTemplates', 
            'name': 'queryTemplates',
            'class': 'form-control'
        };
        let select = createNewElement('select', attributesMap, queryTemplates);
        select.onchange = function() {
            let queryTemplateId = document.getElementById('queryTemplates').value;
            getQueryTemplatById(queryTemplateId);
        };

        let label = createNewElement('label', {'for': 'queryTemplates'});
        label.innerHTML = 'Query Templates';

        let div = createNewElement('div', {'id': 'queryTemplatesDiv', 'class': 'query-templates-div'});
        div.appendChild(label);
        div.appendChild(select);
        
        
        return div;
    }
}

function renderSchemaHTML() {
    if (schemas !== null) {
        let attributesMap = {
            'id': 'schemas',
            'name': 'schemas',
            'class': 'form-control',
            'size': schemasSize
        };

        let select = createNewElement('select', attributesMap, schemas);
        select.onchange = function () {
            let schema = document.getElementById('schemas').value;
            if (schema !== "") {
                getTables(schema);
            } else {
                alert('Please select a schema before retrieving tables');
            }
        };
        
        let label = createNewElement('label', {'for': 'schemas'});
        label.innerHTML = 'Database Schemas';

        let div = createNewElement('div', {'id': 'schemasDiv', 'class': 'schemas-div'});
        div.appendChild(label);
        div.appendChild(select);

        return div;
    }
}

function renderTablesHTML() {
    if (tables !== null) {
        let attributesMap = {
            'id': 'tables',
            'name': 'tables',
            'multiple': 'true',
            'class': 'form-control',
            'size': tablesSize
        };
        
        let select = createNewElement('select', attributesMap, tables);
        select.onchange = function() {
            let schema = document.getElementById('schemas').value;
            let tables = getSelectedOptions('tables');
            if (schema !== "" || tables !== "") {
                getAvailableColumns(schema, tables);
            } else {
                alert('Please select a schema before retrieving tables');
            }
        };

        let label = createNewElement('label', {'for': 'tables'});
        label.innerHTML = 'Database Tables';

        let div = createNewElement('div', {'id': 'tablesDiv', 'class': 'tables-div'});
        div.appendChild(label);
        div.appendChild(select);

        return div;
    }
}

function renderJoinsHTML() {
    if (allowJoins) {
        return createNewElement('div', {'id': 'joinsDiv', 'class': 'joins-div', 'border-style': 'groove'});
    }
}

function renderAvailableColumnsHTML() {
    if (availableColumns !== null) {
        let attributesMapAvailableColumns = {
            'id': 'availableColumns',
            'name': 'availableColumns',
            'multiple': 'true',
            'class': 'form-control',
            'size': availableColumnsSize
        };
        
        let selectAvailableColumns = createNewElement('select', attributesMapAvailableColumns, availableColumns);
        let labelAvailableColumns = createNewElement('label', {'for': 'availableColumns'});
        labelAvailableColumns.innerHTML = 'Table Columns';

        let attributesMapSelectedColumns = {
            'id': 'selectedColumns',
            'name': 'selectedColumns',
            'class': 'form-control',
            'size': selectedColumnsSize
        };
        
        let selectSelectedColumns = createNewElement('select', attributesMapSelectedColumns, selectedColumns);
        let labelSelectedColumns = createNewElement('label', {'for': 'selectedColumns'});
        labelSelectedColumns.innerHTML = 'Selected Columns';

        let div = createNewElement('div', {'id': 'availableColumnsDiv', 'class': 'available-columns-div'});
        div.appendChild(labelAvailableColumns);
        div.appendChild(selectAvailableColumns);
        div.appendChild(labelSelectedColumns);
        div.appendChild(selectSelectedColumns);

        return div;
    }
}

function renderCriteriaHTML() {
    let attributesMap = {
        'id': 'criteria',
        'name': 'criteria'
    };
    return  createNewElement('div', attributesMap, null);
}

function renderDistinctHTML() {
    let attributesMap = {
        'id': 'distinct',
        'name': 'distinct',
        'type': 'checkbox', 
        'value': 'Distinct / Unique',
        'class': 'custom-control-input'
    };
    return  createNewElement('input', attributesMap, null);
}

function renderOrderByHTML() {
    let attributesMap = {
        'id': 'orderBy',
        'name': 'orderBy',
        'class': 'form-control'
    };
    return  createNewElement('select', attributesMap,  orderByColumns);
}

function renderGroupByHTML() {
    let attributesMap = {
        'id': 'groupBy',
        'name': 'groupBy',
        'class': 'form-control'
    };
    return  createNewElement('select', attributesMap,  groupByColumns);
}

function renderSuppressNullsHTML() {
    let attributesMap = {
        'id': 'suppressNulls',
        'name': 'suppressNulls',
        'type': 'checkbox',
        'value': 'Suppress Nulls',
        'class': 'custom-control-input'
    };
    return createNewElement('input', attributesMap, null);
}

function renderLimitHTML() {
    let attributesMap = {
        'id': 'limit',
        'name': 'limit',
        'class': 'form-control'
    };
    return createNewElement('select', attributesMap, limitChoices);
}

function renderOffsetHTML() {
    let attributesMap = {
        'id': 'offset',
        'name': 'offset',
        'class': 'form-control'
    };
    return createNewElement('select', attributesMap, offsetChoices);
}

function syncSelectOptionsWithDataModel(HtmlId, dataProperty) {
    clearOptions(HtmlId);
    addOptionsToSelectElement(HtmlId, dataProperty);
}

function addOptionsToSelectElement(HtmlId, dataProperty) {
    if (dataProperty !== null) {
        for (var i=0; i<dataProperty.length; i++) {
            var option = document.createElement("option");
            option.text = dataProperty[i];
            option.value = dataProperty[i];
            document.getElementById(HtmlId).add(option);
        }
    }
}

function clearOptions(HtmlId) {
    let selectElement = document.getElementById(HtmlId);
    
    // If the Select element exists, then remove all options.
    if (selectElement !== null) {
        if (selectElement.options.length === 0) 
        return;

        for (var i=selectElement.options.length-1; i>=0; i--) {
            selectElement.remove(i);
        }
    }
}

function getSelectedOptions(HtmlId) {
    let results = [];
    let select = document.getElementById(HtmlId);
    for (var i=0; i<select.options.length; i++) {
        if (select.options[i].selected) {
            results.push(select.options[i].text);
        }
    }
    return results;
}

//===========================================================================
//                     START OF SCRIPT
//===========================================================================

renderHTML();

if (getQueryTemplateEndpoint !== null) {
    getQueryTemplates();
}

if (getSchemaEndpoint !== null) {
    getSchemas();
}
const scriptVariables = {
    columnMembersWindow : null,
    getQueryTemplateEndpoint : "http://localhost:8080/queryTemplates",
    getSchemaEndpoint : "http://localhost:8080/schemas",
    getTablesEndpoint : "http://localhost:8080/tablesAndViews/",
    getColumnsEndpoint : "http://localhost:8080/columns/",
    formSubmissionEndpoint : "http://localhost:8080/query",
    formMethod : "POST",
    formSubmissionFunction : function () {
    $.ajax({
        type: 'POST',
        url: $('#qb').attr('action'),
        data: $('#qb').serialize(),
        success: function(data) {
            console.log(data);
            document.getElementById('ajaxError').innerHTML = null;
            document.getElementById('queryResults').innerHTML = data.queryResults[0];
            document.getElementById('sqlResult').innerHTML = data.sqlResult[0];
            document.getElementById('databaseExists').innerHTML = data.databaseExists;
            document.getElementById('tableExists').innerHTML = data.tableExists;
            document.getElementById('numOfTablesIsSame').innerHTML = data.tablesAreSame;
            document.getElementById('numOfColumnsIsSame').innerHTML = data.numOfTableColumnsAreSame;
            document.getElementById('numOfRowsIsSame').innerHTML = data.numOfTableRowsAreSame;
            document.getElementById('tableDataIsSame').innerHTML = data.tableDataIsSame;
        },
        error: function(textStatus, errorThrown) {
            console.log(textStatus);
            console.log(errorThrown);
            document.getElementById('ajaxError').innerHTML = errorThrown + ':  ' + textStatus.responseText;
            document.getElementById('queryResults').innerHTML = null;
            document.getElementById('sqlResult').innerHTML = null;
            document.getElementById('databaseExists').innerHTML = null;
            document.getElementById('tableExists').innerHTML = null;
            document.getElementById('numOfTablesIsSame').innerHTML = null;
            document.getElementById('numOfColumnsIsSame').innerHTML = null;
            document.getElementById('numOfRowsIsSame').innerHTML = null;
            document.getElementById('tableDataIsSame').innerHTML = null;
        },
        dataType: 'json'
    });
}, // be sure to assign a function here to handle form submission.
    queryTemplates : ['query template 1', 'query template 2'], // set to [] to render
    schemas : ['schema1', 'schema2'], // set to [] to render
    tables : ['table1'], // set to [] to render
    allowJoins : true, // set to true to render
    availableColumns : ['column1', 'column2'], // set to [] to render
    selectedColumns : ['column1'], // set to [] to render
    criteria : [], // set to [] to render
    distinct : true,  // set to true to render
    orderByColumns : null, // set to [] to render
    groupByColumns : null, // set to [] to render
    suppressNulls : false, //set to true to render
    limitChoices : [5, 10, 50, 500], // set to [] to render
    offsetChoices : [5, 10, 50, 500], // set to [] to render
    queryTemplatesSize : 5,
    schemasSize : 5,
    tablesSize : 5,
    availableColumnsSize : 10,
    selectedColumnsSize : 10,
    orderByColumnsSize : 10,
    groupByColumnsSize : 10
}

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
    scriptVariables['columnMembersWindow'] = new ColumnMembers();
}

function showColumnMembersWindow() {
    var windowProps = "toolbar=no,menubar=no,location=no,resizable=yes,scrollbars=yes,status=no,dependent=yes";
    window.open("/ColumnMembers.html", "columnMembers", windowProps);
}

function getQueryTemplates() {
    sendAjaxRequest(scriptVariables['getQueryTemplateEndpoint'],
                    null,
                    "GET",
                    function(queryTemplatesData) {
                        fillArrayProperty('queryTemplates', queryTemplatesData);
                        syncSelectOptionsWithDataModel('queryTemplates', scrptVariables['queryTemplates']);
                    });
}

function getQueryTemplatById(id) {
    sendAjaxRequest(scriptVariables['getQueryTemplateEndpoint'] + '/' + id,
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
    sendAjaxRequest(scriptVariables['getSchemaEndpoint'], 
                    null, 
                    "GET",
                    function(schemasData) {
                        fillArrayProperty('schemas', schemasData);
                        syncSelectOptionsWithDataModel('schemas', scriptVariables[schemas]);
                    });
}

function getTables(schema) {
    sendAjaxRequest(scriptVariables['getTablesEndpoint'] + schema, 
                    null, 
                    "GET", 
                    function (tablesData) {
                        fillArrayProperty('tables', tablesData);
                        syncSelectOptionsWithDataModel('tables', scriptVariables['tables']);
                    });
}

function getAvailableColumns(schema, tablesArray) {
    let tableParamString = tablesArray.join('&');
    sendAjaxRequest(scriptVariables['getColumnsEndpoint'] + schema + tableParamString, 
                    null, 
                    "GET",
                    function(columnsData) {
                        fillArrayProperty('columns', columnsData);
                        syncSelectOptionsWithDataModel('columns', scriptVariables['availableColumns']);
                    });
}

function addSelectedColumns(members) {
    fillArrayProperty('selectedColumns', members);
    syncSelectOptionsWithDataModel('selectedColumns', scriptVariables['selectedColumns']);
}

function removeSelectedColumn(memberIndeces) {
    deleteArrayPropertyMembers('selectedColumns', memberIndeces);
    syncSelectOptionsWithDataModel('selectedColumns', scriptVariables['selectedColumns']);
}

function moveSelectedColumnUp(index) {
    if (index === 0) return null;

    // get destination item
    var itemToDelete = scriptVariables['selectedColumns'][index - 1];
    
    // set destination item to current item
    scriptVariables['selectedColumns'][index - 1] = scriptVariables['selectedColumns'][index];

    // insert destination item at current item's index
    scriptVariables['selectedColumns'][index] = itemToDelete;

    syncSelectOptionsWithDataModel('selectedColumns', scriptVariables['selectedColumns']);
    //updateSelectedMembersHTML();
}

function moveSelectedColumnDown(index) {
    if (index === scriptVariables['selectedColumns'].length - 1) return null;

    // get destination item
    var itemToDelete = scriptVariables['selectedColumns'][index + 1];

    // set destination item to current item
    scriptVariables['selectedColumns'][index + 1] = scriptVariables['selectedColumns'][index];

    // insert destination item at current item's index
    scriptVariables['selectedColumns'][index] = itemToDelete;

    syncSelectOptionsWithDataModel('selectedColumns', scriptVariables['selectedColumns']);
    //updateSelectedMembersHTML();
}

function addOrderByColumns(members) {
    fillArrayProperty('orderByColumns', members);
    syncSelectOptionsWithDataModel('orderBy', scriptVariables['orderByColumns']);
}

function removeOrderByColumns(memberIndeces) {
    deleteArrayPropertyMembers('orderByColumns', memberIndeces);
    syncSelectOptionsWithDataModel('orderBy', scriptVariables['orderByColumns']);
}

function moveOrderByColumnUp(index) {
    moveArrayPropertyItem('orderByColumns', index, 'up');
    syncSelectOptionsWithDataModel('orderBy', scriptVariables['orderByColumns']);
} 

function moveOrderByColumnDown(index) {
    moveArrayPropertyItem('orderByColumns', index, 'down');
    syncSelectOptionsWithDataModel('orderBy', scriptVariables['orderByColumns']);
}

function addGroupByColumns(members) {
    
    fillArrayProperty('groupByColumns', members);
    syncSelectOptionsWithDataModel('groupBy', scriptVariables['groupByColumns']);
}

function removeGroupByColumns(memberIndeces) {
    deleteArrayPropertyMembers('groupByColumns', memberIndeces);
    syncSelectOptionsWithDataModel('groupBy', scriptVariables['groupByColumns']);
} 

function moveGroupByColumnUp(index) {
    moveArrayPropertyItem('groupByColumns', index, 'up');
    syncSelectOptionsWithDataModel('groupBy', scriptVariables['groupByColumns']);
}

function moveGroupByColumnDown(index) {
    moveArrayPropertyItem('groupByColumns', index, 'down');
    syncSelectOptionsWithDataModel('groupBy', scriptVariables['groupByColumns']);
}

// id:  The criteria row that is being added or was removed
// addOrRemove:  A string (either 'add' or 'remove')
function renumberCriteria(id, addOrRemove) {
    let criteria = document.getElementsByClassName('criteria-row');

    for (var i=0; i<criteria.length; i++) {
        
        // get new id
        let currentId = parseInt(criteria[i].id.slice(-1));
        let newId = currentId;
        if (currentId >= id && addOrRemove === 'add') {
            newId = currentId + 1;
        } else if (currentId > id && addOrRemove === 'remove') {
            newId = currentId - 1;
        }

        // get new parent id
        let currentParentId = criteria[i].children[1].value;;
        let newParentId = (currentParentId === null) ? '' : currentParentId;
        if (currentId >= id && addOrRemove === 'add') {
            if (currentParentId !== "") {
                newParentId = parseInt(currentParentId) + 1;
            }
        } else if (currentId > id && addOrRemove === 'remove') {
            if (currentParentId !== "") {
                if (parseInt(currentParentId) === 0 && parseInt(id) !== 0) {
                    newParentId = currentParentId;
                }
                if (parseInt(currentParentId) === 0 && parseInt(id) === 0) {
                    newParentId = null;
                }
                if (parseInt(currentParentId) > 0) {
                    newParentId = parseInt(currentParentId) - 1;
                }
            }
        }

        // if greater, subtract by one
        criteria[i].id = 'row.' + newId;

        //id
        criteria[i].children[0].id = 'criteria' + newId + '.id'; //id
        criteria[i].children[0].name = 'criteria[' + newId + '].id'; //name
        criteria[i].children[0].value = newId; //value

        //parentId
        criteria[i].children[1].id = 'criteria' + newId + '.parentId'; //id
        criteria[i].children[1].name = 'criteria[' + newId + '].parentId'; //name
        if (addOrRemove === 'add') {
            if (currentParentId >= id) {
                criteria[i].children[1].value = newParentId; //value
            }
        } else {
            criteria[i].children[1].value = newParentId; //value
        }
        

        //conjunction
        criteria[i].children[2].id = 'criteria' + newId + '.conjunction'; //id
        criteria[i].children[2].name = 'criteria[' + newId + '].conjunction'; //name

        //front parenthesis
        criteria[i].children[3].id = 'criteria' + newId + '.frontParenthesis'; //id
        criteria[i].children[3].name = 'criteria[' + newId + '].frontParenthesis'; //name

        //column
        criteria[i].children[4].id = 'criteria' + newId + '.column'; //id
        criteria[i].children[4].name = 'criteria[' + newId + '].column'; //name

        //operator
        criteria[i].children[5].id = 'criteria' + newId + '.operator'; //id
        criteria[i].children[5].name = 'criteria[' + newId + '].operator'; //name

        //filter
        criteria[i].children[6].id = 'criteria' + newId + '.filter'; //id
        criteria[i].children[6].name = 'criteria[' + newId + '].filter'; //name

        //end parenthesis
        criteria[i].children[7].id = 'criteria' + newId + '.endParenthesis'; //id
        criteria[i].children[7].name = 'criteria[' + newId + '].endParenthesis'; //name
    }
    
}

function reindentCriteria() {
    let criteria = document.getElementsByClassName('criteria-row');

    for (var i=0; i<criteria.length; i++) {
        //remove indenting
        criteria[i].style.paddingLeft = "0px";

        //get parentId
        let parentId = criteria[i].children[1].value;
        if (parentId !== "") {
            //find parentId row's padding left indent
            let parentRowIndent = document.getElementById('row.' + parseInt(parentId)).style.paddingLeft;
            if (parentRowIndent === "") {
                parentRowIndent = "0px";
            }
            //set this rows padding left indent + 20px
            let newPaddingLeft = parseInt(parentRowIndent) + 100;
            criteria[i].style.paddingLeft = newPaddingLeft + 'px';
        }
    }
}

// parentNode:  The criteria node to insert this child node after
function addCriteria(parentNode) {
    // These default assignments for parentId and id assume we are adding a new root criteria.
    let parentId = '';
    let id = 0;

    // If the parentNode parameter is not null, then that means we are adding a child criteria and will reassign the
    //   parentId and id variables.
    if (parentNode !== null) {
        parentId = parentNode.id.slice(-1);
        id = parseInt(parentId) + 1;
    }

    renumberCriteria(id, 'add');

    //inserts new row after row where 'Add Criteria' button was clicked.
    let newDiv = createNewElement('div', {'id': 'row.' + id, 'class': 'criteria-row'}, null);

    // create id input element
    let idInput = createNewElement('input', {
        'type': 'hidden',
        'id': 'criteria' + id + '.id',
        'name': 'criteria[' + id + '].id',
        'value': id

    }, null);
    newDiv.appendChild(idInput);

    // create parentId input element
    let parentInputId = createNewElement('input', {
        'type': 'hidden',
        'id': 'criteria' + id + '.parentId',
        'name': 'criteria[' + id + '].parentId',
        'value': parentId
    }, null);
    newDiv.appendChild(parentInputId);

    // create conjunction select element
    let optionAnd = createNewElement('option', {'value': 'And'}, null);
    optionAnd.innerHTML = 'And';
    let optionOr = createNewElement('option', {'value': 'Or'}, null);
    optionOr.innerHTML = 'Or';
    let conjunctionEl = createNewElement('select', {'id': `criteria${id}.conjunction`, 'name': `criteria[${id}].conjunction`, 'class': 'criteria-conjuction-and-operator'}, null);
    conjunctionEl.appendChild(optionAnd);
    conjunctionEl.appendChild(optionOr);
    newDiv.appendChild(conjunctionEl);

    // create front parenthesis input element
    let frontParenInput = createNewElement('input', {
        'type': 'hidden',
        'id': 'criteria' + id + '.frontParenthesis',
        'name': 'criteria[' + id + '].frontParenthesis'
    }, null);
    newDiv.appendChild(frontParenInput);

    // create column select element
    let columnEl = createNewElement('select', {
        'id': `criteria${id}.column`, 
        'name': `criteria[${id}].column`, 
        'class': 'criteria-column-and-filter'
    }, scriptVariables['availableColumns']);
    newDiv.appendChild(columnEl);

    // create operator select element
    let optionEqual =               createNewElement('option', {'value': 'equalTo'}, null, '=');
    let optionNotEqualTo =          createNewElement('option', {'value': 'notEqualTo'}, null, '<>');
    let optionGreaterThanOrEquals = createNewElement('option', {'value': 'greaterThanOrEquals'}, null, '>=');
    let optionLessThanOrequals =    createNewElement('option', {'value': 'lessThanOrEquals'}, null, '<=');
    let optionGreaterThan =         createNewElement('option', {'value': 'greaterThan'}, null, '>');
    let optionLessThan =            createNewElement('option', {'value': 'lessThan'}, null, '<');
    let optionLike =                createNewElement('option', {'value': 'like'}, null, 'like');
    let optionNotLike =             createNewElement('option', {'value': 'notLike'}, null, 'not like');
    let optionIn =                  createNewElement('option', {'value': 'in'}, null, 'in');
    let optionNotIn =               createNewElement('option', {'value': 'notIn'}, null, 'not in');
    let optionIsNull =              createNewElement('option', {'value': 'isNull'}, null, 'is null');
    let optionIsNotNull =           createNewElement('option', {'value': 'isNotNull'}, null, 'is not null');
    
    let operatorEl =                createNewElement('select', {'id': `criteria${id}.operator`, 'name': `criteria[${id}].operator`, 'class': 'criteria-conjuction-and-operator'}, null);
    operatorEl.appendChild(optionEqual);
    operatorEl.appendChild(optionNotEqualTo);
    operatorEl.appendChild(optionGreaterThanOrEquals);
    operatorEl.appendChild(optionLessThanOrequals);
    operatorEl.appendChild(optionGreaterThan);
    operatorEl.appendChild(optionLessThan);
    operatorEl.appendChild(optionLike);
    operatorEl.appendChild(optionNotLike);
    operatorEl.appendChild(optionIn);
    operatorEl.appendChild(optionNotIn);
    operatorEl.appendChild(optionIsNull);
    operatorEl.appendChild(optionIsNotNull);
    
    newDiv.appendChild(operatorEl);

    // create filter input element
    let filterInput = createNewElement('input', {
        'id': 'criteria' + id + '.filter',
        'name': 'criteria[' + id + '].filter',
        'class': 'criteria-column-and-filter'
    }, null);
    newDiv.appendChild(filterInput);

    // create end parenthesis input element
    let endParenInput = createNewElement('input', {
        'type': 'hidden',
        'id': 'criteria' + id + '.endParenthesis',
        'name': 'criteria[' + id + '].endParenthesis'
    }, null);
    newDiv.appendChild(endParenInput);

    // create 'Add Criteria' button
    let addCriteriaButton = createNewElement('input', {
        'type': 'button',
        'value': 'Add Criteria',
        'class': 'criteria-add-remove-buttons'
    }, null);
    addCriteriaButton.onclick = function () {
        addCriteria(newDiv);
    }
    newDiv.appendChild(addCriteriaButton);

    // create 'Remove Criteria' button
    let removeCriteriaButton = createNewElement('input', {
        'type': 'button',
        'value': 'Remove Criteria',
        'class': 'criteria-add-remove-buttons'
    }, null);
    removeCriteriaButton.onclick = function () {
        newDiv.remove();
        renumberCriteria(newDiv.id.slice(-1), 'remove');
        reindentCriteria();
    }
    newDiv.appendChild(removeCriteriaButton);

    // insert newDiv into the DOM
    if (parentNode === null) {
        document.getElementById('criteriaAnchor').prepend(newDiv);
    } else {
        parentNode.insertAdjacentElement('afterend', newDiv);
    }

    reindentCriteria();
}

function renderHTML(beforeNode) {
    var form = document.createElement('form');
    form.setAttribute('id', 'queryBuilder');
    form.setAttribute('name', 'queryBuilder');
    form.setAttribute('action', scriptVariables['formSubmissionEndpoint']);
    form.setAttribute('method', scriptVariables['formMethod']);

    var el = null;

    //Query Templates 
    // NOTE:  THIS IS NOW DONE AT THE BOTTOM OF THIS FILE WHERE THE SCRIPT STARTS
    // if (scriptVariables['getQueryTemplateEndpoint'] !== null) {
    //     getQueryTemplates();
    // }

    el = renderQueryTemplatesHTML();
    if (el !== undefined) {
        form.appendChild(el);
        let brEl = createNewElement('br');
        form.appendChild(brEl);
    }

    //Available Columns
    el = renderAvailableColumnsHTML();
    if (el !== undefined) 
        form.appendChild(el);

    //Schemas
    el = renderSchemaHTML();
    if (el !== undefined) {
        form.appendChild(el);
        let brEl = createNewElement('br');
        form.appendChild(brEl);
    }

    //Tables
    el = renderTablesHTML();
    if (el !== undefined)
        form.appendChild(el);

    //Joins
    el = renderJoinsHTML();
    if (el !== undefined)
        form.appendChild(el);

    //Criteria
    el = renderCriteriaHTML();
    if (el !== undefined) 
        form.appendChild(el);

    //Other Options
    el = renderOtherOptionsHTML();
    if (el !== undefined) 
        form.appendChild(el);

    el = renderQueryButtonHTML();
    if (el !== undefined) {
        form.appendChild(el);
    }

    if (beforeNode === undefined) {
        document.body.appendChild(form);
    } else {
        document.getElementById(beforeNode).appendChild(form);
    }
    
}

function fillArrayProperty(arrayPropertyName, data) {
    for (var i=0; i<data.length; i++) {
        scriptVariables[arrayPropertyName].push(data[i]);
    }
}

function deleteArrayPropertyMembers(arrayPropertyName, indecesToDelete) {
    newArray = scriptVariables[arrayPropertyName].slice();
    for (var i in indecesToDelete) {
        let indexToDelete = indecesToDelete[i];
        newArray.splice(indexToDelete, 1);
    }

    scriptVariables[arrayPropertyName] = newArray;
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

function createNewElement(type, attributesMap, dataProperty, innerHtml=null) {
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

    if (innerHtml !== null) {
        select.innerHTML = innerHtml;
    }
        
    return select;        
}

function renderQueryTemplatesHTML() {
    if (scriptVariables['queryTemplates'] !== null) {
        let attributesMap = {
            'id': 'queryTemplates', 
            'name': 'queryTemplates',
            'class': 'form-control'
        };
        let select = createNewElement('select', attributesMap, scriptVariables['queryTemplates']);
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
    if (scriptVariables['schemas'] !== null) {
        let attributesMap = {
            'id': 'schemas',
            'name': 'schemas',
            'class': 'form-control',
            'size': scriptVariables['schemasSize']
        };

        let select = createNewElement('select', attributesMap, scriptVariables['schemas']);
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
    if (scriptVariables['tables'] !== null) {
        let attributesMap = {
            'id': 'tables',
            'name': 'tables',
            'multiple': 'true',
            'class': 'form-control',
            'size': scriptVariables['tablesSize']
        };
        
        let select = createNewElement('select', attributesMap, scriptVariables['tables']);
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
    if (scriptVariables['allowJoins']) {
        return createNewElement('div', {'id': 'joinsDiv', 'class': 'joins-div', 'border-style': 'groove'});
    }
}

function renderAvailableColumnsHTML() {
    if (scriptVariables['availableColumns'] !== null) {
        // Create Available Columns Div, Label, and Select elements
        let attributesMapAvailableColumns = {
            'id': 'availableColumns',
            'name': 'availableColumns',
            'multiple': 'true',
            'class': 'form-control',
            'size': scriptVariables['availableColumnsSize']
        };
        
        let selectAvailableColumns = createNewElement('select', attributesMapAvailableColumns, scriptVariables['availableColumns']);
        let labelAvailableColumns = createNewElement('label', {'for': 'availableColumns'});
        labelAvailableColumns.innerHTML = 'Table Columns';

        let availableColumnsDiv = createNewElement('div', {'id': 'availableColumnsDiv', 'class': 'available-columns-div'});
        availableColumnsDiv.appendChild(labelAvailableColumns);
        availableColumnsDiv.appendChild(selectAvailableColumns);

        // Create Add and Remove Columns Div and Button elements
        let addColumnButton = createNewElement('button', {'id': 'addColumnsButton', 'name': 'addColumnsButton', 'type': 'button', 'class': 'available-columns-add-button'}, null);
        addColumnButton.innerHTML = 'Add';
        addColumnButton.onclick = function() {
            let selectedColumns = getSelectedOptions('availableColumns');
            addSelectedColumns(selectedColumns);
        };

        let removeColumnButton = createNewElement('button', {'id': 'removeColumnsButton', 'name': 'removeColumnsButton', 'type': 'button', 'class': 'available-columns-remove-button'}, null);
        removeColumnButton.innerHTML = 'Remove';
        removeColumnButton.onclick = function() {
            let selectedColumns = getSelectedOptions('selectedColumns', 'indeces');
            removeSelectedColumn(selectedColumns);
        };

        let addRemoveButtonsDiv = createNewElement('div', {'id': 'addRemoveColumns', 'class': 'available-columns-buttons-div'});
        addRemoveButtonsDiv.appendChild(addColumnButton);
        addRemoveButtonsDiv.appendChild(createNewElement('br'));
        addRemoveButtonsDiv.appendChild(removeColumnButton);

        // Create Selected Columns Div, Label, and Select elements.
        let attributesMapSelectedColumns = {
            'id': 'selectedColumns',
            'name': 'selectedColumns',
            'class': 'form-control',
            'size': scriptVariables['selectedColumnsSize']
        };
        
        let selectSelectedColumns = createNewElement('select', attributesMapSelectedColumns, scriptVariables['selectedColumns']);
        let labelSelectedColumns = createNewElement('label', {'for': 'selectedColumns'});
        labelSelectedColumns.innerHTML = 'Selected Columns';

        let selectedColumnsDiv = createNewElement('div', {'id': 'selectedColumnsDiv', 'class': 'selected-columns-div'});
        selectedColumnsDiv.appendChild(labelSelectedColumns);
        selectedColumnsDiv.appendChild(selectSelectedColumns);

        let parentDiv = createNewElement('div', {'id': 'tableColumns', 'name': 'tableColumns', 'class': 'table-columns', 'width': '600px', 'height': '191px'}, null);
        parentDiv.appendChild(availableColumnsDiv);
        parentDiv.insertAdjacentElement('beforeend', addRemoveButtonsDiv);
        parentDiv.insertAdjacentElement('beforeend', selectedColumnsDiv);

        return parentDiv;
    }
}

function renderCriteriaHTML() {
    let pEl = createNewElement('p', {'id': 'criteriaPEl', 'name': 'criteriaPEl'}, null);
    pEl.innerHTML = 'Criteria';

    let addRootCriteriaButton = createNewElement('button', {'id': 'addRootCriteriaButton', 'name': 'addRootCriteriaButton', 'type': 'button', 'class': 'add-root-criteria-button'}, null);
    addRootCriteriaButton.innerHTML = 'Add Root Criteria';
    addRootCriteriaButton.onclick = function () {
        addCriteria(null);
    };

    let pCriteriaAnchorEl = createNewElement('p', {'id': 'criteriaAnchor'}, null);

    let attributesMap = {
        'id': 'criteria',
        'name': 'criteria',
        'class': 'criteria-div'
    };
    let div = createNewElement('div', attributesMap, null);
    div.appendChild(pEl);
    div.appendChild(addRootCriteriaButton);
    div.appendChild(pCriteriaAnchorEl);

    return div;
}

function renderOtherOptionsHTML() {
    let distinctEl = null;
    let orderByEl = null;
    let groupByEl = null;
    let suppressNullsEl = null;
    let limitEl = null;
    let offsetEl = null;
    let parentDiv = createNewElement('div', {'id': 'otherOptionsDiv', 'name': 'otherOptioinsDiv', 'class': 'other-options-div'}, null);

    if (scriptVariables['distinct']) {
        let attributesMap = {
            'id': 'distinct',
            'name': 'distinct',
            'type': 'checkbox', 
            'value': 'Distinct / Unique',
            'class': 'custom-control-input'
        };
        distinctEl = createNewElement('input', attributesMap, null);
        labelDistinct = createNewElement('label', {'for': 'distinct'}, null);
        labelDistinct.innerHTML = 'Distinct';
        parentDiv.appendChild(labelDistinct);
        parentDiv.appendChild(distinctEl);
        parentDiv.appendChild(createNewElement('br', {}, null));
    }

    if (scriptVariables['orderByColumns'] !== null) {
        let attributesMap = {
            'id': 'orderBy',
            'name': 'orderBy',
            'class': 'form-control'
        };
        orderByEl = createNewElement('select', attributesMap,  scriptVariables['orderByColumns']);
        labelOrderBy = createNewElement('label', {'for': 'orderBy'}, null);
        labelOrderBy.innerHTML = 'Order By';
        parentDiv.appendChild(labelOrderBy);
        parentDiv.appendChild(orderByEl);
        parentDiv.appendChild(createNewElement('br', {}, null));
    }

    if (scriptVariables['groupByColumns'] !== null) {
        let attributesMap = {
            'id': 'groupBy',
            'name': 'groupBy',
            'class': 'form-control'
        };
        groupByEl = createNewElement('select', attributesMap,  scriptVariables['groupByColumns']);
        labelGroupBy = createNewElement('label', {'for': 'groupBy'}, null);
        labelGroupBy.innerHTML = 'Group By';
        parentDiv.appendChild(labelGroupBy);
        parentDiv.appendChild(groupByEl);
        parentDiv.appendChild(createNewElement('br', {}, null));
    }

    if (scriptVariables['suppressNulls']) {
        let attributesMap = {
            'id': 'suppressNulls',
            'name': 'suppressNulls',
            'type': 'checkbox',
            'value': 'Suppress Nulls',
            'class': 'custom-control-input'
        };
        suppressNullsEl = createNewElement('input', attributesMap, null);
        labelSuppressNulls = createNewElement('label', {'for': 'suppressNulls'}, null);
        labelSuppressNulls.innerHTML = 'Suppress Null Records';
        parentDiv.appendChild(labelSuppressNulls);
        parentDiv.appendChild(suppressNullsEl);
        parentDiv.appendChild(createNewElement('br', {}, null));
    }
    
    if (scriptVariables['limitChoices'] !== null) {
        let attributesMap = {
            'id': 'limit',
            'name': 'limit',
            'class': 'form-control'
        };
        limitEl = createNewElement('select', attributesMap, scriptVariables['limitChoices']);
        labelLimit = createNewElement('label', {'for': 'limit'}, null);
        labelLimit.innerHTML = 'Limit  ';
        parentDiv.appendChild(labelLimit);
        parentDiv.appendChild(limitEl);
        parentDiv.appendChild(createNewElement('br', {}, null));
    }

    if (scriptVariables['offsetChoices'] !== null) {
        let attributesMap = {
            'id': 'offset',
            'name': 'offset',
            'class': 'form-control'
        };
        offsetEl = createNewElement('select', attributesMap, scriptVariables['offsetChoices']);
        labelOffset = createNewElement('label', {'for': 'offset'}, null);
        labelOffset.innerHTML = 'Offset  ';
        parentDiv.appendChild(labelOffset);
        parentDiv.appendChild(offsetEl);
        parentDiv.appendChild(createNewElement('br', {}, null));
    }

    return parentDiv;
}

function renderQueryButtonHTML() {
    let attributesMap = {
        'id': 'runQuery',
        'name': 'runQuery',
        'type': 'button',
        'class': 'run-query-button'
    };
    let runQueryButton = createNewElement('button', attributesMap, null);
    runQueryButton.innerHTML = 'Run Query';
    runQueryButton.onclick = function () {
        scriptVariables['formSubmissionFunction']();
    }

    let div = createNewElement('div', {'id': 'runQueryDiv', 'name': 'runQueryDiv', 'class': 'run-query-div'}, null);
    div.appendChild(runQueryButton);

    return div;
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

function getSelectedOptions(HtmlId, textOrIndeces='text') {
    let results = [];
    let select = document.getElementById(HtmlId);
    for (var i=0; i<select.options.length; i++) {
        if (select.options[i].selected) {
            (textOrIndeces === 'text') ? results.push(select.options[i].text) : results.push(i);
        }
    }
    return results;
}

//===========================================================================
//                     START OF SCRIPT
//===========================================================================

renderHTML();

if (scriptVariables['getQueryTemplateEndpoint'] !== null) {
    getQueryTemplates();
}

if (scriptVariables['getSchemaEndpoint'] !== null) {
    getSchemas();
}
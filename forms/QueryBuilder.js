let columnMembersWindow = null;
let getQueryTemplateEndpoint = "http://localhost:8080/queryTemplates";
let getSchemaEndpoint = "http://localhost:8080/schemas";
let getTablesEndpoint = "http://localhost:8080/tablesAndViews/";
let getColumnsEndpoint = "http://localhost:8080/columns/";
let formSubmissionEndpoint = "http://localhost:8080/query";
let formMethod = "POST";
let formSubmissionFunction = function () {
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
}; // be sure to assign a function here to handle form submission.
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
    let conjunctionEl = createNewElement('select', {'id': `criteria${id}.conjunction`, 'name': `criteria[${id}].conjunction`, 'class': 'criteria-select-and-input'}, null);
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
        'class': 'criteria-select-and-input'
    }, availableColumns);
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
    
    let operatorEl =                createNewElement('select', {'id': `criteria${id}.operator`, 'name': `criteria[${id}].operator`, 'class': 'criteria-select-and-input'}, null);
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
        'class': 'criteria-select-and-input'
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
        'class': 'criteria-select-and-input'
    }, null);
    addCriteriaButton.onclick = function () {
        addCriteria(newDiv);
    }
    newDiv.appendChild(addCriteriaButton);

    // create 'Remove Criteria' button
    let removeCriteriaButton = createNewElement('input', {
        'type': 'button',
        'value': 'Remove Criteria',
        'class': 'criteria-select-and-input'
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
    form.setAttribute('action', formSubmissionEndpoint);
    form.setAttribute('method', formMethod);

    var el = null;

    //Query Templates
    if (getQueryTemplateEndpoint !== null) {
        getQueryTemplates();
    }

    el = renderQueryTemplatesHTML();
    if (el !== undefined) {
        form.appendChild(el);
        let brEl = createNewElement('br');
        form.appendChild(brEl);
    }

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
    let pEl = createNewElement('p', {}, null);
    pEl.innerHTML = 'Criteria';

    let addRootCriteriaButton = createNewElement('button', {'type': 'button'}, null);
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

function renderQueryButtonHTML() {
    let attributesMap = {
        'id': 'runQuery',
        'name': 'runQuery',
        'type': 'button'
    };
    let runQueryButton = createNewElement('button', attributesMap, null);
    runQueryButton.innerHTML = 'Run Query';
    runQueryButton.onclick = function () {
        formSubmissionFunction();
    }

    return runQueryButton;
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
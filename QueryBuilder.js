const scriptVariables = {
    // The element to append the queryBuilder form to.  Set to the 1) element id to append to element or 2) null ot append
    // to end of document.
    renderHtmlAnchorElement : 'queryBuilderAnchor',
    // The base URL where the join png images are held.  Set the value to 'https://s3.amazonaws.com/qb4j-ui/images/' for official qb4j images.
    htmlFragmentUrl: 'https://s3.amazonaws.com/qb4j-ui/v1/',
    // Set contents of array to any of the following: 'queryTemplatesDiv', 'schemasDiv', 'tablesDiv', 'joinsDiv', 'columnsDiv',
    // 'criteriaDiv', or 'otherOptionsDiv' in order to show these divs when the page is rendered.
    landingDivs : ['schemasDiv', 'tablesDiv'],
    // set to your query template endpoint
    getQueryTemplateEndpoint : 'http://localhost:8080/queryTemplates',
    // set to your schemas endpoint
    getSchemaEndpoint : 'http://localhost:8080/schemas',
    // set to your tables endpoint
    getTablesEndpoint : 'http://localhost:8080/tablesAndViews/',
    // set to your table columns endpoint
    getColumnsEndpoint : 'http://localhost:8080/columns',
    // set to your column members endpoint
    columnMembersEndpoint : 'http://localhost:8080/columns-members/',
    // set to your query endpoint
    formSubmissionEndpoint : 'http://localhost:8080/query',
    // set to your save query template endpoint
    saveAsQueryTemplateEndpoint : 'http://localhost:8080/saveQueryTemplate',
    // set to the HTTP method that your query endpoint above accepts
    formMethod : 'POST',
    createJoins : true,
    createCriteria : true,
    createDistinct : true,
    createSuppressNulls : true,
    limitChoices : ['', 5, 10, 50, 500],
    offsetChoices : ['', 5, 10, 50, 500],
    queryTemplatesSize : 5,
    schemasSize : 5,
    tablesSize : 5,
    availableColumnsSize : 30,
    selectedColumnsSize : 30,
    orderByColumnsSize : 10,
    groupByColumnsSize : 10,
    formSubmissionFunction : function () {
        let requestData;
        try {
            requestData = buildRequestData();
        } catch (ex) {
            alert(ex);
            return;
        }

        fetch(scriptVariables.formSubmissionEndpoint, {
            method: scriptVariables.formMethod,
            body: requestData,
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(response => response.json())
            .then((data) => {
                console.log(data);
                document.getElementById('queryResults').innerHTML = data.queryResults[0];
                document.getElementById('sqlResult').innerHTML = data.sqlResult[0];
            })
            .catch(error => {
                console.log(error);
                document.getElementById('queryResults').innerHTML = null;
                document.getElementById('sqlResult').innerHTML = null;
            });
    }
};

// Do not change - INTERNAL USE ONLY.
const internalUseVariables = {
    joinImagesFilePaths:  [
        {'name': 'LEFT_EXCLUDING',         'file_path': scriptVariables.htmlFragmentUrl + 'left_join_excluding.png'},
        {'name': 'LEFT',                   'file_path': scriptVariables.htmlFragmentUrl + 'left_join.png'},
        {'name': 'INNER',                  'file_path': scriptVariables.htmlFragmentUrl + 'inner_join.png'},
        {'name': 'RIGHT',                  'file_path': scriptVariables.htmlFragmentUrl + 'right_join.png'},
        {'name': 'RIGHT_EXCLUDING',        'file_path': scriptVariables.htmlFragmentUrl + 'right_join_excluding.png'},
        {'name': 'FULL_OUTER',             'file_path': scriptVariables.htmlFragmentUrl + 'full_outer_join.png'},
        {'name': 'FULL_OUTER_EXCLUDING',   'file_path': scriptVariables.htmlFragmentUrl + 'full_outer_join_excluding.png'}
    ]
};

//===============================================================================================
// Main JavaScript Methods
//===============================================================================================

// Acts as the main method and controller.
async function renderHTML(queryTemplate=null) {
    // If queryTemplate is not null, then we are wiping the current queryBuilder form so that it can be rendered again
    // with the queryTemplate data.
    if (queryTemplate !== null) {
        let qbForm = document.getElementById('queryBuilder');
        qbForm.parentNode.removeChild(qbForm);
    }

    let form = document.createElement('form');
    form.setAttribute('id', 'queryBuilder');
    form.setAttribute('name', 'queryBuilder');

    let buttonsHtml = await renderStatementButtonsHTML();
    form.appendChild(buttonsHtml.content.firstElementChild);

    // Query Templates
    if (scriptVariables.getQueryTemplateEndpoint) {
        let queryTemplatesHtml = await renderQueryTemplatesHTML();
        form.appendChild(queryTemplatesHtml.content.firstElementChild);
    }

    // Available Columns
    if (scriptVariables.getColumnsEndpoint) {
        let columnsHtml = await renderAvailableColumnsHTML();
        form.appendChild(columnsHtml.content.firstElementChild);
    }

    // Schemas
    if (scriptVariables.getSchemaEndpoint) {
        let schemaHtml = await renderSchemaHTML();
        form.appendChild(schemaHtml.content.firstElementChild);
    }

    // Tables
    if (scriptVariables.getTablesEndpoint) {
        let tablesHtml = await renderTablesHTML();
        form.appendChild(tablesHtml.content.firstElementChild);
    }

    // Joins
    if (scriptVariables.createJoins) {
        let joinsHtml = await renderJoinsHTML();
        form.appendChild(joinsHtml.content.firstElementChild);
    }

    // Criteria
    if (scriptVariables.createCriteria) {
        let criteriaHtml = await renderCriteriaHTML();
        form.appendChild(criteriaHtml.content.firstElementChild);
    }

    // Other Options
    if (scriptVariables.createDistinct || scriptVariables.createSuppressNulls ||
        scriptVariables.limitChoices.length > 0 || scriptVariables.offsetChoices.length > 0) {
        let otherOptionsHtml = await renderOtherOptionsHTML();
        form.appendChild(otherOptionsHtml.content.firstElementChild);
    }

    // if (beforeNode === undefined || beforeNode === null) {
    //     document.body.appendChild(form);
    // } else {
    //     document.getElementById(beforeNode).appendChild(form);
    // }
    document.getElementById(scriptVariables.renderHtmlAnchorElement).appendChild(form);

    // Now that the new form has been rendered, hide all divs except the landing divs listed in scriptVariables.
    if (scriptVariables.landingDivs.length > 0) {
        hideAllDivsExcept(scriptVariables.landingDivs);
    }

    // Now that the new form has been rendered, populate the form with the queryTemplate data if the queryTemplate is not
    // null.
    if (queryTemplate !== null) {
        Array.from(document.getElementById('queryTemplates').children).forEach((child) => {
            child.selected = (child.value === queryTemplate.name);
        });

        // todo add schema into the SelectStatement class so that it can be added here based on the queryTemplate data.
        document.getElementById('schemas').value = 'null';

        // get table and all unique join target tables...add them to the tables array.
        let tables = [];
        tables.push(queryTemplate.table);
        queryTemplate.joins.forEach((join) => {
            if (! tables.includes(join.targetTable)) {
                tables.push(join.targetTable);
            }
        });
        syncSelectOptionsWithDataModel('table', tables);
        Array.from(document.getElementById('table').children).forEach((child) => {
            child.selected = true;
        });

        // Now that we have the tables, get the available columns.
        getAvailableColumns('null', tables, function() {
            getQueryTemplates();
            syncSelectOptionsWithDataModel('schemas', ['null']);

            // table columns should update automatically after tables array is updated.  Update selected columns.
            syncSelectOptionsWithDataModel('columns', queryTemplate.columns);

            // update criteria...call reindent criteria method.
            queryTemplate.criteria.forEach((criterion) => {
                let parentCriteriaId = criterion.parentId;
                let parentNode = null;
                if (parentCriteriaId !== undefined && parentCriteriaId !== null) {
                    parentNode = document.getElementById(`row.${parentCriteriaId}`);
                }
                addCriteria(parentNode, criterion);
            });

            // Get joins and add to joins array
            queryTemplate.joins.forEach((join) => {
                addJoin(join);
            });

            // Update other options.
            document.getElementById('distinct').checked = queryTemplate.distinct;
            document.getElementById('suppressNulls').checked = queryTemplate.suppressNulls;
            document.getElementById('limit').value = queryTemplate.limit;
            document.getElementById('offset').value = queryTemplate.offset;
        });
    }

    if (scriptVariables.getQueryTemplateEndpoint !== null) {
        await getQueryTemplates();
    }

    if (scriptVariables.getSchemaEndpoint !== null) {
        await getSchemas();
    } else if (scriptVariables.getTablesEndpoint !== null) {
        await getTables();
    }
}

//=================================================================
//     HTML Render Functions
//=================================================================

async function renderStatementButtonsHTML() {
    let htmlTemplate = document.createElement('template');
    let buttonsHtml = await loadHtmlFragment(scriptVariables.htmlFragmentUrl + 'statement-buttons-div.html');
    buttonsHtml = eval(buttonsHtml);
    htmlTemplate.innerHTML = buttonsHtml;

    if (scriptVariables.getQueryTemplateEndpoint) {
        htmlTemplate.content.getElementById('queryTemplatesButton').onclick = function() {
            hideAllDivsExcept(['queryTemplatesDiv']);
        }
    } else {
        let queryTemplatesButton = htmlTemplate.content.getElementById('queryTemplatesButton');
        queryTemplatesButton.parentNode.removeChild(queryTemplatesButton);
    }

    if (scriptVariables.getSchemaEndpoint || scriptVariables.getTablesEndpoint) {
        htmlTemplate.content.getElementById('schemasButton').onclick = function() {
            hideAllDivsExcept(['schemasDiv', 'tablesDiv']);
        }
    } else {
        let schemasButton = htmlTemplate.content.getElementById('schemasButton');
        schemasButton.parentNode.removeChild(schemasButton);
    }

    if (scriptVariables.createJoins) {
        htmlTemplate.content.getElementById('joinsButton').onclick = function() {
            hideAllDivsExcept(['joinsDiv']);
        }
    } else {
        let joinsButton = htmlTemplate.content.getElementById('joinsButton');
        joinsButton.parentNode.removeChild(joinsButton);
    }

    if (scriptVariables.getColumnsEndpoint) {
        htmlTemplate.content.getElementById('columnsButton').onclick = function() {
            hideAllDivsExcept(['tableColumns']);
        }
    } else {
        let columnsButton = htmlTemplate.content.getElementById('columnsButton');
        columnsButton.parentNode.removeChild(columnsButton);
    }

    if (scriptVariables.createCriteria) {
        htmlTemplate.content.getElementById('criteriaButton').onclick = function() {
            hideAllDivsExcept(['criteria']);
        }
    } else {
        let criteriaButton = htmlTemplate.content.getElementById('criteriaButton');
        criteriaButton.parentNode.removeChild(criteriaButton);
    }

    if (scriptVariables.createDistinct !== null || scriptVariables.limitChoices.length > 0 ||
        scriptVariables.offsetChoices.length > 0 || scriptVariables.createSuppressNulls) {
        htmlTemplate.content.getElementById('otherOptionsButton').onclick = function() {
            hideAllDivsExcept(['otherOptionsDiv']);
        }
    } else {
        let otherOptionsButton = htmlTemplate.content.getElementById('otherOptionsButton');
        otherOptionsButton.parentNode.removeChild(otherOptionsButton);
    }

    htmlTemplate.content.getElementById('runQuery').onclick = function() {
        scriptVariables.formSubmissionFunction();
    };

    if (scriptVariables.saveAsQueryTemplateEndpoint) {
        htmlTemplate.content.getElementById('saveAsQueryTemplate').onclick = function () {
            showQueryTemplateParameters();
        };
    } else {
        let saveAsQueryTemplateButton = htmlTemplate.content.getElementById('saveAsQueryTemplate');
        saveAsQueryTemplateButton.parentNode.removeChild(saveAsQueryTemplateButton);
    }

    return htmlTemplate;
}

async function renderQueryTemplatesHTML() {
    let htmlTemplate = document.createElement('template');
    let queryTemplatesHtml = await loadHtmlFragment(scriptVariables.htmlFragmentUrl + 'query-templates.html');
    queryTemplatesHtml = eval(queryTemplatesHtml);
    htmlTemplate.innerHTML = queryTemplatesHtml;

    htmlTemplate.content.getElementById('queryTemplates').onchange = function () {
        let queryTemplateId = document.getElementById('queryTemplates').value;

        getQueryTemplateById(queryTemplateId, async function(queryTemplate) {
            // await renderHTML(scriptVariables.renderHtmlAnchorElement, queryTemplate);
            await renderHTML(queryTemplate);
        });
    };

    return htmlTemplate;
}

async function renderSchemaHTML() {
    let htmlTemplate = document.createElement('template');
    let schemasHtml = await loadHtmlFragment(scriptVariables.htmlFragmentUrl + 'schemas.html');
    schemasHtml = eval(schemasHtml);
    htmlTemplate.innerHTML = schemasHtml;

    htmlTemplate.content.getElementById('schemasDiv').onchange = function () {
        let schema = document.getElementById('schemas').value;
        if (schema !== "") {
            getTables(schema);
        } else {
            alert('Please select a schema before retrieving tables');
        }
    };

    return htmlTemplate;
}

async function renderTablesHTML() {
    let htmlTemplate = document.createElement('template');
    let tablesHtml = await loadHtmlFragment(scriptVariables.htmlFragmentUrl + 'tables.html');
    let tablesSize = scriptVariables.tablesSize;
    tablesHtml = eval(tablesHtml);
    htmlTemplate.innerHTML = tablesHtml;

    htmlTemplate.content.getElementById('table').onchange = function () {
        let schema = document.getElementById('schemas').value;
        let tables = getOptionsAsArray('table', 'text', true);
        if (schema !== "" && tables.length !== 0) {
            getAvailableColumns(schema, tables);
        } else {
            alert('Please select a schema before retrieving tables');
        }
    };

    return htmlTemplate;
}

async function renderJoinsHTML() {
    let htmlTemplate = document.createElement('template');
    let joinsHtml = await loadHtmlFragment(scriptVariables.htmlFragmentUrl + 'joins-container.html');
    joinsHtml = eval(joinsHtml);
    htmlTemplate.innerHTML = joinsHtml;

    htmlTemplate.content.getElementById('addJoin').onclick = function () {
        addJoin();
    };

    return htmlTemplate;
}

//===============================================================================================
// Helper Functions
//===============================================================================================

function sendAjaxRequest(endpoint, data, method, successCallbackFunction, doneCallbackFunction=function(){},
                         contentType='application/x-www-form-urlencoded;charset=UTF-8') {
    fetch(endpoint, {
      method: method,
      body: (data === null) ? null : JSON.stringify(data),
      headers: {
          'Content-Type': contentType
      }
    }).then(response => response.json())
    .then((data) => successCallbackFunction(data))
    .catch((error) => console.log(error))
    .finally(doneCallbackFunction());
}

async function getQueryTemplates() {
    fetch(scriptVariables.getQueryTemplateEndpoint, {
        method: 'GET',
    }).then(response => response.json())
    .then(data => syncSelectOptionsWithDataModel('queryTemplates', data))
    .catch(error => console.log(error));
}

function getQueryTemplateById(id, successCallbackFunction) {
    fetch(scriptVariables.getQueryTemplateEndpoint + '/' + id, {
        method: 'GET'
    }).then(response => response.json())
        .then(data => successCallbackFunction(data))
        .catch(error => console.log(error));
}

// htmlElement:  the HTML Element object to add the schemas to.
function getSchemas() {
    fetch(scriptVariables.getSchemaEndpoint, {
        method: 'GET'
    }).then(response => response.json())
        .then(data => syncSelectOptionsWithDataModel('schemas', data))
        .catch(error => console.log(error));
}

function getTables(schema) {
    fetch(scriptVariables.getTablesEndpoint + schema, {
        method: 'GET'
    }).then(response => response.json())
        .then(data => syncSelectOptionsWithDataModel('table', data))
        .catch(error => console.log(error));
}

function getAvailableColumns(schema, tablesArray, doneCallbackFunction=function(){}) {
    let tableParamString = tablesArray.join('&');

    fetch(scriptVariables.getColumnsEndpoint + '/' + schema + '/' + tableParamString, {
        method: 'GET'
    }).then(response => response.json())
        .then(data => syncSelectOptionsWithDataModel('availableColumns', data))
        .catch(error => console.log(error))
        .finally(doneCallbackFunction());
}

// members:  (JSON) JSON of members to add to data model.
// dataModel:  (string) Name of data model array to add members to.
// HtmlId:  (boolean) Id of HTML select element to sync with dataModel.
function addSelectedColumns(members, dataModel, HtmlId) {
    // fillArrayProperty(dataModel, members, false);
    // syncSelectOptionsWithDataModel(HtmlId, scriptVariables[dataModel]);
    syncSelectOptionsWithDataModel(HtmlId, dataModel);
}

// members:  Array of indeces to remove from dataModel.
// dataModel:  Name of data model array to remove members from.
// HtmlId:  Id of HTML select element to sync with dataModel.
// function removeSelectedColumn(memberIndeces, dataModel, HtmlId) {
//     deleteArrayPropertyMembers(dataModel, memberIndeces);
//     syncSelectOptionsWithDataModel(HtmlId, scriptVariables[dataModel]);
// }

// htmlId:  The Id of the HTML select element that contains the option element to move up.
// dataModel:  The name of the data model to update and sync with the htmlId element with.
// isUp:  true if moving column up (increasing index) and false if moving column down (decreasing index).
function moveSelectedColumn(htmlId, dataModel, isUp) {
    // Get the index of the array item to move up.  It's assumed that there is only one element selected.
    // todo:  add functionality for multiple items to be selected.
    let index = 0;
    let options = document.getElementById(htmlId).options;
    for (let i=0; i<options.length; i++) {
        if (options[i].selected === true) {
            index = i;
            break;
        }
    }

    if (isUp) {
        if (index === 0) { return null; }

        // get destination item
        let itemToDelete = options[index - 1];

        // set destination item to current item
        let itemToMove = options[index];

        // Switch the items order.
        document.getElementById(htmlId).replaceChild(itemToMove, itemToDelete);
        document.getElementById(htmlId).insertBefore(itemToDelete, itemToMove.nextSibling);
    } else {
        if (index === options.length - 1) { return null; }

        // get destination item
        let itemToDelete = options[index + 1];

        // set destination item to current item
        let itemToMove = options[index];

        // insert destination item at current item's index
        document.getElementById(htmlId).replaceChild(itemToMove, itemToDelete);
        document.getElementById(htmlId).insertBefore(itemToDelete, itemToMove);
    }
}

// id:  The criteria row that is being added or was removed
// addOrRemove:  A string (either 'add' or 'remove')
function renumberCriteria(id, addOrRemove) {
    let criteria = document.getElementsByClassName('criteria-row');

    for (let i=0; i<criteria.length; i++) {

        // get new id
        let currentId = parseInt(criteria[i].id.slice(-1));
        let newId = currentId;
        if (currentId >= id && addOrRemove === 'add') {
            newId = currentId + 1;
        } else if (currentId > id && addOrRemove === 'remove') {
            newId = currentId - 1;
        }

        // get new parent id
        let currentParentId = criteria[i].children[1].value;
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

        //add criteria
        criteria[i].children[8].id = 'addCriteria-' + newId; //id
        // criteria[i].children[7].name = 'criteria[' + newId + '].endParenthesis'; //name

        //remove criteria
        criteria[i].children[9].id = 'removeCriteria-' + newId; //id

        //show column members
        criteria[i].children[10].id = 'columnMembers-' + newId; //id
    }
}

function reindentCriteria() {
    let criteria = document.getElementsByClassName('criteria-row');

    for (let i=0; i<criteria.length; i++) {
        // Remove indenting
        criteria[i].style.paddingLeft = "0px";

        // Get parentId
        let parentId = criteria[i].children[1].value;
        if (parentId !== "") {
            // Find parentId row's padding left indent
            let parentRowIndent = document.getElementById('row.' + parseInt(parentId)).style.paddingLeft;
            if (parentRowIndent === "") {
                parentRowIndent = "0px";
            }
            // Set this rows padding left indent + 20px
            let newPaddingLeft = parseInt(parentRowIndent) + 100;
            criteria[i].style.paddingLeft = newPaddingLeft + 'px';
        }
    }
}

// parentNode:  The criteria node to insert this child node after
// criterion:  The object that encapsulates all criterion data that will be used to create a new Criteria HTML fragment and add it to the DOM.
async function addCriteria(parentNode, criterion=null) {
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

    // Now that we have determined the id and parentId variables, get the criterion html fragments and run eval to interpolate them.
    let htmlTemplate = document.createElement('template');
    let criterionBody = await loadHtmlFragment(scriptVariables.htmlFragmentUrl + 'criterion-body.html');
    criterionBody = eval(criterionBody);
    htmlTemplate.innerHTML = criterionBody;

    syncSelectOptionsWithDataModel(htmlTemplate.content.getElementById(`criteria${id}.column`), getOptionsAsArray('availableColumns'));

    htmlTemplate.content.getElementById(`addCriteria-${id}`).onclick = function() {
        let thisCriteriaId = this.id.slice(-1);
        let thisCriteriaDiv = document.getElementById('row.' + thisCriteriaId);
        addCriteria(thisCriteriaDiv);
    };

    htmlTemplate.content.getElementById(`removeCriteria-${id}`).onclick = function() {
        let criteriaId = this.parentNode.id.slice(-1);
        document.getElementById(`row.${criteriaId}`).remove();
        renumberCriteria(criteriaId, 'remove');
        reindentCriteria();
    };

    htmlTemplate.content.getElementById(`columnMembers-${id}`).onclick = function() {
        let criteriaId = parseInt(this.parentElement.id.slice(-1));
        let tableAndColumn = document.getElementById(`criteria${criteriaId}.column`).value;
        if (tableAndColumn === null) {
            alert('Please choose a column before choosing Column Members');
        }

        addColumnMembersHTML(`criteria${id}.filter`);
    };

    // If a criteria object was passed to this method, then set HTML element values now that div is finished,
    // but not attached to DOM yet.
    if (criterion !== null) {
        htmlTemplate.content.getElementById(`criteria${id}.conjunction`).value = criterion.conjunction;
        htmlTemplate.content.getElementById(`criteria${id}.column`).value = criterion.column;
        htmlTemplate.content.getElementById(`criteria${id}.operator`).value = criterion.operator;
        htmlTemplate.content.getElementById(`criteria${id}.filter`).value = criterion.filter;
    }

    // Insert template into the DOM
    if (parentNode === null) {
        document.getElementById('criteriaAnchor').prepend(htmlTemplate.content);
    } else {
        parentNode.insertAdjacentElement('afterend', htmlTemplate.content.firstChild.nextElementSibling)
    }

    reindentCriteria();
}

async function loadHtmlFragment(filePath) {
    let result = await fetch(filePath);
    if (result.ok) {
        return await result.text();
    }
}

// Returns the next modal id based on the QueryBuilder modals already existing in the DOM.
function getNextModalId() {
    let id = 0;
    let modalDivs = document.getElementById('modals').querySelectorAll('div');
    modalDivs.forEach((div) => {
        if (div.id.includes('cm-modal-') || div.id.includes('sq-modal-')) {
            let idLength = div.id.length;
            let thisId = parseInt(div.id[idLength - 1]);
            if (thisId >= id) {
                id = thisId + 1;
            }
        }
    });

    return id;
}

// parentId:  the HTML id of the parent of this column members' div that will be used in eval() for interpolation.
function addColumnMembersHTML(parentId=null) {
    // Get id to use in eval() interpolation.
    let id = getNextModalId();

    let element = document.getElementById('modals');

    loadHtmlFragment(scriptVariables.htmlFragmentUrl + 'column-members.html')
        .then(data => eval(data))
        .then(data => element.insertAdjacentHTML('beforeend', data))
        .then(() => document.getElementById(`cm-modal-${id}`).style.display = '');
}

// parentId:  The id of the parent HTML element to be used in eval() interpolation.
// parentModalId:  The id of the HTML element to hide.  Defaults to null, which will not hide an element.
async function addSubQueryHTML(parentId, parentModalId=null) {
    // Get id to use in eval() interpolation.
    let id = getNextModalId();

    let subQueryContainerHTML = await loadHtmlFragment(scriptVariables.htmlFragmentUrl + 'subquery-container.html');
    subQueryContainerHTML = eval(subQueryContainerHTML);
    let element = document.getElementById('modals');
    element.insertAdjacentHTML('beforeend', subQueryContainerHTML);

    // Add query template options to select element.
    addSelectOptions(`sq-modal-${id}-query-templates`, getOptionsAsArray('queryTemplates'));

    // Hide parent modal (if it exists)
    if (parentModalId != null) {
        document.getElementById(parentModalId).style.display = 'none';
    }

    // Show this subquery modal
    document.getElementById(`sq-modal-${id}`).style.display = '';
}

// htmlId:  The HTML id of the subQuery modal to be used in the id of the new subQuery parameters.
// parentHtmlId:  The HTML id of the subQuery modal that the subQuery parameters should be added to.
// subQueryId:  The id of the query template that will be used to retrieve the query template and it's parameters.
function renderSubQueryParameters(htmlId, parentHtmlId, subQueryId) {
    getQueryTemplateById(subQueryId, async function(queryTemplate) {
        let criteriaParameterKeys = Object.keys(queryTemplate.criteriaParameters);
        let criteriaParameterValues = Object.values(queryTemplate.criteriaParameters);
        if (criteriaParameterKeys.length > 0) {
            let parameterHtml = await loadHtmlFragment(scriptVariables.htmlFragmentUrl + 'subquery-parameter.html');
            let parentHtmlElement = document.getElementById(parentHtmlId);

            for (let i=0; i<criteriaParameterKeys.length; i++) {
                // Assigned htmlId to id just so that interpolation works when eval() is called.
                let id = htmlId;
                let parameterId = i;
                let parameterName = criteriaParameterValues[i].name;
                let parameterDescription = criteriaParameterValues[i].description;
                let parameterColumn = criteriaParameterValues[i].column;
                let parameterHtmlEvaled = eval(parameterHtml);

                parentHtmlElement.insertAdjacentHTML('beforeend', parameterHtmlEvaled);
            }
        } else {
            alert("This query template does not contain any criteria parameters.")
        }
    });
}

// subQueryHtmlId:  The HTML id of the subQuery modal to create the subQuery call string.
// targetHtmlId:  The HTML id of the element who's value should be set to the subQuery call string.
// targetHtmlParentId:  The HTML id of the element that contains the targetHtmlId.  If non null, this parameter is used to show the container element.
function setTargetElementValueToSubQuery(subQueryHtmlId, targetHtmlId, targetHtmlParentId=null) {
    // get name of subQuery
    let subQueryName = document.getElementById(subQueryHtmlId + '-query-templates').value;

    // get all parameters (name and value)
    let parameterNames = document.getElementsByName(`${subQueryHtmlId}-parameter-name`);
    let parameterValues = document.getElementsByName(`${subQueryHtmlId}-parameter-value`);
    let subQueryCall = `$${subQueryName}(`;

    for (let i=0; i<parameterNames.length; i++) {
        let paramName = parameterNames[i].innerHTML;
        let paramValue = parameterValues[i].value;
        subQueryCall += `${paramName}=${paramValue};`;
    }
    // Remove trialing ',' (only if parameters were added) and add ')'
    if (parameterNames.length > 0) {
        subQueryCall = subQueryCall.slice(0, subQueryCall.length - 1);
    }
    subQueryCall += ')';

    // Set targetHtmlId's value.
    let target = document.getElementById(targetHtmlId);
    if (target.nodeName.toUpperCase() === 'INPUT') {
        target.value = subQueryCall;
    } else if (target.nodeName.toUpperCase() === 'SELECT') {
        let newOptionEl = document.createElement('option');
        newOptionEl.value = subQueryCall;
        newOptionEl.innerHTML = subQueryCall;
        target.append(newOptionEl);
    } else {
        console.error('Unrecognized target element node name of ' + target.nodeName);
    }

    let subQueryEl = document.getElementById(subQueryHtmlId);
    subQueryEl.parentNode.removeChild(subQueryEl);

    if (targetHtmlParentId != null) {
        document.getElementById(targetHtmlParentId).style.display = '';
    }
}

// This method assumes you are feeding it a JSON object with key-value pairs.
// function fillArrayProperty(arrayPropertyName, data, clearPropertyArray=true) {
//     if (clearPropertyArray) {
//         scriptVariables[arrayPropertyName] = [];
//     }
//
//     for (let i=0; i<data.length; i++) {
//         for (let key in data[i]) {
//             scriptVariables[arrayPropertyName].push(data[i][key]);
//         }
//     }
// }

function deleteArrayPropertyMembers(arrayPropertyName, indecesToDelete) {
    let newArray = scriptVariables[arrayPropertyName].slice();
    for (let i in indecesToDelete) {
        for (let key in indecesToDelete[i]) {
            let indexToDelete = indecesToDelete[i][key];
            newArray.splice(indexToDelete, 1);
        }
    }

    scriptVariables[arrayPropertyName] = newArray;
}

function moveArrayPropertyItem(arrayPropertyName, index, direction) {
    if (direction === 'up') {
        if (index === 0) return null;

        // get destination item
        let itemToDelete = this[arrayPropertyName][index - 1];

        // set destination item to current item
        this[arrayPropertyName][index - 1] = this[arrayPropertyName][index];

        // insert destination item at current item's index
        this[arrayPropertyName][index] = itemToDelete;
    } else if (direction === 'down') {
        if (index === this[arrayPropertyName].length - 1) return null;

        // get destination item
        let itemToDelete = this[arrayPropertyName][index + 1];

        // set destination item to current item
        this[arrayPropertyName][index + 1] = this[arrayPropertyName][index];

        // insert destination item at current item's index
        this[arrayPropertyName][index] = itemToDelete;
    }
}

function createNewElement(type, attributesMap, dataProperty=null, innerHtml=null) {
    if (this[dataProperty] === null) return null;

    let select = document.createElement(type);
    for (let key in attributesMap) {
        let attributeName = key;
        let attributeValue = attributesMap[key];
        select.setAttribute(attributeName, attributeValue);
    }

    if (dataProperty !== null) {
        for (let item in dataProperty) {
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

// divsToShow:  Array of strings.
function hideAllDivsExcept(divsToShow) {
    let divs = [
        'queryTemplatesDiv',
        'tableColumns',
        'schemasDiv',
        'tablesDiv',
        'joinsDiv',
        'criteria',
        'otherOptionsDiv'
    ];

    // Todo:  condense these two for loops into one for loop.
    // Hide all divs in array above.
    for (let i=0; i<divs.length; i++) {
        // Check that the div exists.  If so, hide it.
        let div = document.getElementById(divs[i]);
        if (div !== null) {
            div.style.display = 'none';
        }
    }

    // Show all divs in divsToShow array.
    for (let i=0; i<divsToShow.length; i++) {
        // Check that the div exists.  If so, hide it.
        let div = document.getElementById(divsToShow[i]);
        if (div !== null) {
            div.style.display = '';
        }

    }
}

async function showQueryTemplateParameters() {
    // Insert container HTML before looping through each columnAndParameter.  Container should be added regardless of
    // whether there are columnsAndParameters because the user must name the query template.
    let modalDiv = document.getElementById('modals');
    let containerHtml = await loadHtmlFragment(scriptVariables.htmlFragmentUrl + 'save-as-query-template-container.html');
    let containerHtmlEvaled = eval(containerHtml);
    modalDiv.insertAdjacentHTML('beforeend', containerHtmlEvaled);

    let columnsAndParameters = getCriteriaParametersAndColumns();

    if (columnsAndParameters.length > 0) {
        let parameterHtml = await loadHtmlFragment(scriptVariables.htmlFragmentUrl + 'save-as-query-template-parameter.html');

        // Loop through each columnAndParameter, eval() the parameterHtml, and insert before the end of the container HTML.
        columnsAndParameters.forEach((columnAndParameter) => {
            let parameterName = columnAndParameter.parameterName; // Used for eval
            let parameterColumn = columnAndParameter.parameterColumn; // Used for eval
            let parameterHtmlEvaled = eval(parameterHtml);

            let paramTable = document.getElementById('qb-modal-query-template-parameters-param-table');
            paramTable.insertAdjacentHTML('beforeend', parameterHtmlEvaled);
        });

        // Make sure the modal is displayed.
        document.getElementById('qb-modal-query-template-parameters').style.display = '';
    }
}

function getCriteriaParametersAndColumns() {
    let columnsAndParameters = [];
    let criteria = document.getElementsByClassName('criteria-row');
    for (let i=0; i<criteria.length; i++) {
        let criteriaId = criteria[0].id[criteria[0].id.length - 1];
        let criteriaFilterValue = document.getElementById(`criteria${criteriaId}.filter`).value;

        if (criteriaFilterValue[0] === '@') {
            let newColumnAndParameter = {};
            newColumnAndParameter.parameterName = criteriaFilterValue.slice(1, criteriaFilterValue.length);
            newColumnAndParameter.parameterColumn = document.getElementById(`criteria${criteriaId}.column`).value;
            columnsAndParameters.push(newColumnAndParameter);
        }
    }

    return columnsAndParameters;
}

async function saveStatementAsQueryTemplate() {
    // Try building JSON to be added to request's body.
    // If there is an exception, display message and return.
    let requestData;
    try {
        requestData = buildRequestData(true);
    } catch (ex) {
        alert(ex);
        return;
    }

    // If there are no exceptions in building the JSON above, then send data to endpoint.
    let config = {
        method: 'POST',
        body: requestData,
        headers: {
            'Content-Type': 'application/json'
        }
    };

    fetch(scriptVariables.saveAsQueryTemplateEndpoint, config)
        .then(response => {
            if (response.ok) { alert('Query Saved Successfully') }
        })
        .then(() => {
            let parameterModal = document.getElementById('qb-modal-query-template-parameters');
            if (parameterModal !== null && parameterModal !== undefined) {
                parameterModal.parentNode.removeChild(parameterModal);
            }
        })
        .catch(error => alert(error));

    // Refresh list of query templates now that the query template has been saved.
    await getQueryTemplates();

    // If the Query Template Parameter modal exists, remove it.
    // let parameterModal = document.getElementById('qb-modal-query-template-parameters');
    // if (parameterModal !== null && parameterModal !== undefined) {
    //     parameterModal.parentNode.removeChild(parameterModal);
    // }
}

function getJoinsDivMaxId() {
    let maxId = 0;
    let joinsDiv = document.getElementById('joinsDiv');
    let childJoinDivs = joinsDiv.querySelectorAll('div');
    childJoinDivs.forEach((childJoinDiv) => {
        let idLength = childJoinDiv.id.length;
        let id = parseInt(childJoinDiv.id[idLength - 1]);
        if (id >= maxId) {
            maxId = id + 1;
        }
    });

    return maxId;
}

function getJoinImageFilePath(joinName) {
    let images = internalUseVariables.joinImagesFilePaths;
    for (let i in images) {
        if (images[i].name === joinName) {
            return images[i].file_path;
        }
    }
    return null;
}

function getNextJoinImageFilePath(joinName) {
    let returnObj = {};
    let images = internalUseVariables.joinImagesFilePaths;
    for (let i=0; i<images.length; i++) {
        if (images[i].name === joinName) {
            // If index is less than last index, then get file_path of index + 1.
            // Else (if index is last index), then get first file_path in array.
            if (i < images.length-1) {
                returnObj.name = images[i+1].name;
                returnObj.file_path = images[i+1].file_path;
                return returnObj;
            } else {
                returnObj.name = images[0].name;
                returnObj.file_path = images[0].file_path;
                return returnObj;
            }
        }
    }
    return null;
}

async function addJoin(join=null) {
    let htmlTemplate = document.createElement('template');
    let joinRowHtml = await loadHtmlFragment(scriptVariables.htmlFragmentUrl + 'join-row.html');
    let id = getJoinsDivMaxId();
    let joinImageUrl = (join === null) ? scriptVariables.htmlFragmentUrl + 'left_join_excluding.png' : getJoinImageFilePath(join.joinType);
    let joinType = (join === null) ? 'LEFT_EXCLUDING' : join.joinType;
    joinRowHtml = eval(joinRowHtml);
    htmlTemplate.innerHTML = joinRowHtml;

    htmlTemplate.content.getElementById(`joins${id}.image`).onclick = function () {
        // Set newJoinType and newJoinImage to next join name and file_path in array.
        let joinType = document.getElementById(`joins${id}.joinType`);
        let currentJoinName = joinType.value;
        let joinImage = document.getElementById(`joins${id}.image`);
        let imageAndFilePathObj = getNextJoinImageFilePath(currentJoinName);
        joinType.value = imageAndFilePathObj.name;
        joinImage.src = imageAndFilePathObj.file_path;
    };

    let joinParentTable = htmlTemplate.content.getElementById(`joins${id}.parentTable`);
    let tables = getOptionsAsArray('table', 'text', true).slice(0);
    // tables.splice(0, 0, null); // splice() is to add null as first item in array so that a blank choice is displayed first in resulting select element.
    addOptionsToSelectElement(joinParentTable, tables);
    if (join !== null) {
        joinParentTable.value = join.parentTable;
    }
    joinParentTable.onchange = function () {
        // Get selected table from select element.
        let selectedOption = getSelectedOption(this);

        // Get all available columns that are from the selected table.
        let tableColumns = getTableColumns(selectedOption);

        // Add parent table columns to parent table select elements.
        let parentJoinColumns = document.getElementsByName(`joins[${id}].parentJoinColumns`);
        Array.from(parentJoinColumns).forEach(parentJoinColumn => syncSelectOptionsWithDataModel(parentJoinColumn, tableColumns));
    };

    let joinTargetTable = htmlTemplate.content.getElementById(`joins${id}.targetTable`);
    addOptionsToSelectElement(joinTargetTable, tables);
    joinTargetTable.onchange = function() {
        // Get selected table from select element.
        let selectedOption = getSelectedOption(this);

        // Get all available columns that are from the selected table.
        let tableColumns = getTableColumns(selectedOption);

        // Add target table columns to target table select elements.
        let targetJoinColumns = document.getElementsByName(`joins[${id}].targetJoinColumns`);
        Array.from(targetJoinColumns).forEach(targetJoinColumn => syncSelectOptionsWithDataModel(targetJoinColumn, tableColumns));
    };

    htmlTemplate.content.getElementById(`joins${id}.deleteButton`).onclick = function () {
        let id = this.id[5];
        let joinRow = document.getElementById(`join-row${id}`);
        joinRow.parentNode.removeChild(joinRow);
    };

    htmlTemplate.content.getElementById(`joins${id}.addParentAndTargetColumn`).onclick = function() {
        addParentAndColumnJoinColumns(id);
    };

    if (join !== null) {
        for (let i=1; i<join.parentJoinColumns.length; i++) {
            addParentAndColumnJoinColumns(id, join.parentJoinColumns[i], join.targetJoinColumns[i]);
        }
    }

    // if (join !== null) {
    //     //newJoinType.value = join.joinType; // already happens when initializing value of joinType variable.
    //     newJoinParentTable.value = join.parentTable;
    //     newJoinTargetTable.value = join.targetTable;
    //
    //     // If a join object was passed into the function, then add a new parent and target join for each parent column (parent
    //     // and target column sizes should be the same and is checked on the server side).  Else, just add one new pair of parent
    //     // and target columns.  This can only be done after the newJoinDiv has been appended to the DOM, because the addParentAndColumnJoinColumns()
    //     // method will append it's elements to the newJoinDiv element.  The for loop starts with an index of 1 because the 0th
    //     // element was added already when the newJoinParentColumn and newJoinTargetColumn elements were created in this method.
    //     for (let i=1; i<join.parentJoinColumns.length; i++) {
    //         addParentAndColumnJoinColumns(maxId, join.parentJoinColumns[i], join.targetJoinColumns[i]);
    //     }
    // }

    document.getElementById('joinsDiv').appendChild(htmlTemplate.content.firstElementChild);

}

function addParentAndColumnJoinColumns(maxId, parentJoinColumn=null, targetJoinColumn=null) {
    let parentTableColumns;
    let targetTableColumns;
    if (parentJoinColumn === null && targetJoinColumn === null) {
        parentTableColumns = Array.from(document.getElementById(`joins${maxId}.parentJoinColumns`).options).map(option => option.value);
        targetTableColumns = Array.from(document.getElementById(`joins${maxId}.targetJoinColumns`).options).map(option => option.value);
    } else {
        parentTableColumns = getTableColumns(parentJoinColumn.split('.')[0]);
        targetTableColumns = getTableColumns(targetJoinColumn.split('.')[0]);
    }

    let anotherParentColumn = createNewElement('select', {
        'id': `joins${maxId}.parentJoinColumns`,
        'name': `joins[${maxId}].parentJoinColumns`
    }, parentTableColumns);
    if (parentJoinColumn !== null) {
        anotherParentColumn.value = parentJoinColumn;
    }

    let anotherTargetColumn = createNewElement('select', {
        'id': `joins${maxId}.targetJoinColumns`,
        'name': `joins[${maxId}].targetJoinColumns`
    }, targetTableColumns);
    if (targetJoinColumn !== null) {
        anotherTargetColumn.value = targetJoinColumn;
    }

    let equalSign = createNewElement('b');
    equalSign.innerHTML = ' = ';

    let joinColumnsDeleteButton = createNewElement('button', {
        'id': `joins${maxId}.deleteJoinColumnsButton`,
        'name': `joins[${maxId}].deleteJoinColumnsButton`,
        'class': 'delete-join-columns-button',
        'type': 'button'
    });
    joinColumnsDeleteButton.innerHTML = 'X';
    joinColumnsDeleteButton.onclick = function() {
        this.parentNode.remove();
    };

    let div = createNewElement('div');
    div.appendChild(anotherParentColumn);
    div.appendChild(equalSign);
    div.appendChild(anotherTargetColumn);
    div.appendChild(joinColumnsDeleteButton);
    document.getElementById(`join-row${maxId}`).appendChild(div);
}

function getSelectedOption(node) {
    let options = node.children;
    let selectedOption = null;
    for (let i=0; i<options.length; i++) {
        if (options[i].selected === true) {
            selectedOption = options[i];
        }
    }

    return selectedOption.value;
}

function getTableColumns(table) {
    // return scriptVariables.availableColumns.filter(column => column.split('.')[0] === table);
    return Array.from(document.getElementById('availableColumns').options)
        .map(obj => obj.value) // Get column names
        .filter(column => column.split('.')[0] === table); // Check if column's table is same as the table parameter
}

async function renderAvailableColumnsHTML() {
    let htmlTemplate = document.createElement('template');
    let queryTemplatesHtml = await loadHtmlFragment(scriptVariables.htmlFragmentUrl + 'columns.html');
    let availableColumnSize = scriptVariables.availableColumnsSize; // Used in eval()
    let selectedColumnsSize = scriptVariables.selectedColumnsSize; // Used in eval()
    queryTemplatesHtml = eval(queryTemplatesHtml);
    htmlTemplate.innerHTML = queryTemplatesHtml;

    htmlTemplate.content.getElementById('addColumnsButton').onclick = function () {
        let newSelectedColumns = getOptionsAsArray('availableColumns', 'text', true);
        let existingSelectedColumns = getOptionsAsArray('columns', 'text');
        let allSelectedColumns = existingSelectedColumns.concat(newSelectedColumns);
        syncSelectOptionsWithDataModel('columns', allSelectedColumns);
    };

    htmlTemplate.content.getElementById('removeColumnsButton').onclick = function() {
        let allSelectedColumns = getOptionsAsArray('columns', 'text', false);
        let selectedColumnIndex = getOptionsAsArray('columns', 'indeces', true);
        allSelectedColumns.splice(selectedColumnIndex, 1);
        syncSelectOptionsWithDataModel('columns', allSelectedColumns);
    };

    return htmlTemplate;
}

async function renderCriteriaHTML() {
    let htmlTemplate = document.createElement('template');
    let criteriaRootHtml = await loadHtmlFragment(scriptVariables.htmlFragmentUrl + 'criteria-root.html');
    criteriaRootHtml = eval(criteriaRootHtml);
    htmlTemplate.innerHTML = criteriaRootHtml;

    htmlTemplate.content.getElementById('addRootCriteriaButton').onclick = function() {
        addCriteria(null);
    };

    return htmlTemplate;
}

async function renderOtherOptionsHTML() {
    let htmlTemplate = document.createElement('template');
    let otherOptionsHtml = await loadHtmlFragment(scriptVariables.htmlFragmentUrl + 'other-options-container.html');
    otherOptionsHtml = eval(otherOptionsHtml);
    htmlTemplate.innerHTML = otherOptionsHtml;

    // Now remove any divs.  This is more efficient than making each of these divs HTML fragments and loading them based
    // on scriptVariables config, because it results in only one AJAX call, rather than many AJAX calls.
    if (! scriptVariables.createDistinct) {
        let distinctDiv = htmlTemplate.content.getElementById('qb-distinctDiv');
        distinctDiv.parentNode.removeChild(distinctDiv);
    }

    if (! scriptVariables.createSuppressNulls) {
        let suppressNullsDiv = htmlTemplate.content.getElementById('qb-suppressNullsDiv');
        suppressNullsDiv.parentNode.removeChild(suppressNullsDiv);
    }


    if (scriptVariables.limitChoices.length === 0) {
        let limitDiv = htmlTemplate.content.getElementById('qb-limitDiv');
        limitDiv.parentNode.removeChild(limitDiv);
    } else {
        let limitEl = htmlTemplate.content.getElementById('limit');
        addOptionsToSelectElement(limitEl, scriptVariables.limitChoices);
    }

    if (scriptVariables.offsetChoices.length === 0) {
        let offsetDiv = htmlTemplate.content.getElementById('qb-offsetDiv');
        offsetDiv.parentNode.removeChild(offsetDiv);
    } else {
        let offsetEl = htmlTemplate.content.getElementById('offset');
        addOptionsToSelectElement(offsetEl, scriptVariables.offsetChoices);
    }

    return htmlTemplate;
}

function syncSelectOptionsWithDataModel(HtmlId, dataProperty) {
    clearOptions(HtmlId);
    addOptionsToSelectElement(HtmlId, dataProperty);
}

//HtmlId : the 1) id of the select element to clear or the 2) select element to clear.
function clearOptions(HtmlId) {
    let selectElement;
    if (typeof(HtmlId) === 'object') {
        selectElement = HtmlId;
    } else {
        selectElement = document.getElementById(HtmlId);
    }

    // If the Select element exists, then remove all options.
    if (selectElement !== null) {
        if (selectElement.options.length === 0)
            return;

        for (let i=selectElement.options.length-1; i>=0; i--) {
            selectElement.remove(i);
        }
    }
}

// htmlId:  either 1) the HTML id of the select element to add options to or 2) the select element object.
// data:  either 1) a flat array or 2) an array of flat objects (no nesting).
function addOptionsToSelectElement(htmlId, data) {
    if (data !== null && data !== undefined) {
        let selectElement = (typeof(htmlId) === 'object') ? htmlId : document.getElementById(htmlId);
        for (let i=0; i<data.length; i++) {
            let option = document.createElement("option");
            if (typeof(data[i]) === 'object') {
                // Assumes flat json (no nesting).
                let keyValuePair = data[i];
                for (let key in keyValuePair) {
                    option.text = data[i][key];
                    option.value = data[i][key];
                }
            } else {
                option.text = data[i];
                option.value = data[i];
            }

            if (typeof(htmlId) === 'object') {
                selectElement.add(option);
            } else {
                document.getElementById(htmlId).add(option);
            }
        }

    }
}

//HtmlId : the id of the DOM select element
//textOrIndeces : 'text' to add the option element values.  Anything else to add option indeces.
//type : 'json' to return the selected options in JSON.  Anything else to return the selected options in an array.
function getSelectedOptionsAsJSON(HtmlId, textOrIndeces='text') {
    let results = [];
    let select = document.getElementById(HtmlId);
    for (let i=0; i<select.options.length; i++) {
        if (select.options[i].selected) {
            if (textOrIndeces === 'text') {
                let obj = {};
                obj['data'] = select.options[i].text;
                results.push(obj);
            } else {
                let obj = {};
                obj['data'] = i;
                results.push(obj);
            }
        }
    }
    return results;
}

function getOptionsAsArray(HtmlId, textOrIndeces='text', selectedOptionsOnly=false) {
    let results = [];
    let select = document.getElementById(HtmlId);
    for (let i=0; i<select.options.length; i++) {
        if (selectedOptionsOnly) {
            if (select.options[i].selected) {
                (textOrIndeces === 'text') ? results.push(select.options[i].text) : results.push(i);
            }
        } else {
            (textOrIndeces === 'text') ? results.push(select.options[i].text) : results.push(i);
        }
    }
    return results;
}

function getParentTable() {
    let parentTables = getOptionsAsArray('table', 'text', true);
    let targetJoinTables = [];

    let targetJoinTablesEls = document.getElementsByClassName('join-row');
    for (let i=0; i<targetJoinTablesEls.length; i++) {
        for (let j=0; j<targetJoinTablesEls[i].children.length; j++) {
            let element = targetJoinTablesEls[i].children[j];
            let rex = /joins\d\.targetTable/;
            if (rex.test(element.id)) {
                targetJoinTables.push(element.value);
            }
        }
    }

    if (parentTables.length === 0) {
        throw 'You must select at least one table.'
    }

    if (parentTables.length - targetJoinTables.length !== 1) {
        throw `You have ${parentTables.length} table(s) chosen, but ${targetJoinTables.length} unique table(s) in your target joins.  
        You should have one less target join tables than the number of tables you choose.`
    }

    for (let i=0; i<parentTables.length; i++) {
        if (! targetJoinTables.includes(parentTables[i])) {
            return parentTables[i];
        }
    }
}

// requireQueryName:  should be true if calling this method when saving a query template because the query name should
//                    not be null or an empty string.  should be false if calling this method when running a query
//                    because name is not needed then.
// Throws exception if getParentTable throws exception or if requireQueryName is true and query template name or
// parameter HTML elements do not exist in DOM.
function buildRequestData(requireQueryName=false) {
    let json = {};
    json.table = getParentTable();
    json.columns = getOptionsAsArray('columns', 'text', false);

    // Query Name
    if (requireQueryName) {
        try {
            json.name = document.getElementById('qb-modal-query-template-name').value;
        } catch {
            throw 'You must give the query template a name before saving.';
        }

        // Criteria Parameters
        let criteriaParameters = [];
        let criteriaParameterNames = document.getElementsByName('qb-modal-query-template-parameter-name');
        let criteriaParameterColumns = document.getElementsByName('qb-modal-query-template-parameter-column');
        let criteriaParameterDescriptions = document.getElementsByName('qb-modal-query-template-parameter-description');

        for (let i=0; i<criteriaParameterNames.length; i++) {
            let criteriaParameter = {};
            criteriaParameter.name = criteriaParameterNames[i].innerHTML;
            criteriaParameter.column = criteriaParameterColumns[i].innerHTML;
            criteriaParameter.description = criteriaParameterDescriptions[i].value;
            criteriaParameters.push(criteriaParameter);
        }

        json.criteriaParameters = criteriaParameters;
    }

    // Criteria
    let criteriaDivs = document.getElementsByClassName('criteria-row');
    let criteriaArray = [];
    if (criteriaDivs !== undefined) {
        for (let i=0; i<criteriaDivs.length; i++) {
            let divId = criteriaDivs[i].id.slice(-1);
            let criteriaJson = {};
            criteriaJson.id = document.getElementById(`criteria${divId}.id`).value;
            criteriaJson.parentId = document.getElementById(`criteria${divId}.parentId`).value;
            criteriaJson.conjunction = document.getElementById(`criteria${divId}.conjunction`).value;
            criteriaJson.column = document.getElementById(`criteria${divId}.column`).value;
            criteriaJson.operator = document.getElementById(`criteria${divId}.operator`).value;
            criteriaJson.filter = document.getElementById(`criteria${divId}.filter`).value;
            criteriaArray.push(criteriaJson);
        }
    }
    json.criteria = criteriaArray;

    // Joins
    let joinsDivs = document.getElementsByClassName('join-row');
    let joinsArray = [];
    if (joinsDivs !== undefined) {
        for (let i=0; i<joinsDivs.length; i++) {
            let joinId = joinsDivs[i].id.slice(-1);
            let joinJson = {};
            joinJson.joinType = document.getElementById(`joins${joinId}.joinType`).value;
            joinJson.parentTable = document.getElementById(`joins${joinId}.parentTable`).value;
            joinJson.targetTable = document.getElementById(`joins${joinId}.targetTable`).value;

            let parentJoinColumns = [];
            let parentJoinColumnsEls = document.getElementsByName(`joins[${joinId}].parentJoinColumns`);
            parentJoinColumnsEls.forEach((element) => {
                parentJoinColumns.push(element.value);
            });
            joinJson.parentJoinColumns = parentJoinColumns;

            let targetJoinColumns = [];
            let targetJoinColumnsEls = document.getElementsByName(`joins[${joinId}].targetJoinColumns`);
            targetJoinColumnsEls.forEach((element) => {
                targetJoinColumns.push(element.value);
            });
            joinJson.targetJoinColumns = targetJoinColumns;

            joinsArray.push(joinJson);
        }

        json.joins = joinsArray;
    }

    // Other Options
    json.distinct = document.getElementById('distinct').checked;
    json.suppressNulls = document.getElementById('suppressNulls').checked;
    json.limit = document.getElementById('limit').value;
    json.offset = document.getElementById('offset').value;

    return JSON.stringify(json);
}


//===========================================================================
//                     HTML Fragment JavaScript Functions
//===========================================================================

    //===========================================================================
    //                     Column Members
    //===========================================================================

    // Sets all column members modal variables and elements back to their default state.
    function closeColumnMembers(modalId, parentId) {
        let modalEl = document.getElementById(modalId);
        modalEl.parentNode.removeChild(modalEl);

        if (parentId !== null && parentId !== undefined) {
            let parentEl = document.getElementById(parentId);
            parentEl.style.display = '';
        }
    }

    // modalHtmlId:  the HTML id of the modal.
    function getModalCurrentOffset(modalHtmlId) {
        return document.getElementById(modalHtmlId + '-currentOffset');
    }

    // modalHtmlId:  the HTML id of the modal.
    function setModalCurrentOffset(modalHtmlId, newValue) {
        return document.getElementById(modalHtmlId + '-currentOffset').setAttribute('value', newValue);
    }

    // modalHtmlId:  the HTML id of the modal.
    function getModalAscending(modalHtmlId) {
        return document.getElementById(`${modalHtmlId}-ascending`).value;
    }

    // modalHtmlId:  the HTML id of the modal.
    function getModalSearch(modalHtmlId) {
        return document.getElementById(`${modalHtmlId}-search`).value;
    }

    // modalHtmlId:  the HTML id of the modal.
    function getModalPriorPageButton(modalHtmlId) {
        return document.getElementById(`${modalHtmlId}-priorPage`);
    }

    // modalHtmlId:  the HTML id of the modal.
    function getModalNextPageButton(modalHtmlId) {
        return document.getElementById(`${modalHtmlId}-nextPage`);
    }

    // priorOrNext parameter should be either true (get prior page) or false (get next page).
    function getPageMembers(modalId, isPrior) {
        // Create URI
        let schema = getSelectedOption(document.getElementById('schemas'));
        let parentElementId = document.getElementById(`${modalId}-parentId`).value;
        let parentElementColumn = document.getElementById(parentElementId.split('.')[0] + '.column').value;
        let table = parentElementColumn.split('.')[0];
        let column = parentElementColumn.split('.')[1];
        let limit = parseInt(document.getElementById(`${modalId}-limit`).value);
        if (isPrior === true) {
            adjustColumnMembersCurrentOffset(-limit, modalId);
        }
        let offset = getModalCurrentOffset(modalId).getAttribute('value');
        let ascending = getModalAscending(modalId);

        // Leave this as a single line!  If it spans multiple lines, the endpoint will include white space and carriage returns.
        let endpoint = scriptVariables.columnMembersEndpoint + `${schema}/${table}/${column}?limit=${limit}&offset=${offset}&ascending=${ascending}`;

        // Add search parameter to URI's query string if the search criteria is not an empty string.
        let search = getModalSearch(modalId);
        if (search !== '') {
            endpoint += `&search=${search}`;
        }

        fetch(endpoint)
            .then(response => response.json())
            .then(data => {
                if (data.length === 0) {
                    getModalNextPageButton(modalId).disabled = true;
                    getModalPriorPageButton(modalId).disabled = false;
                    alert('You have reached the last page.  There are no additional column members to retrieve.');
                } else if (data.length < limit) {
                    getModalNextPageButton(modalId).disabled = true;
                    getModalPriorPageButton(modalId).disabled = false;
                    syncSelectOptionsWithDataModel(`${modalId}-availableMembers`, data);
                    alert('You have reached the last page.  There are no additional column members to retrieve.');
                } else {
                    getModalNextPageButton(modalId).disabled = false;
                    syncSelectOptionsWithDataModel(`${modalId}-availableMembers`, data);
                    if (! isPrior){
                        adjustColumnMembersCurrentOffset(limit, modalId);
                    }
                }

                // Disable or enable prior page button based on whether current offset is 0 or not.
                if (getModalCurrentOffset(modalId).getAttribute('value') === 0) {
                    document.getElementById(`${modalId}-priorPage`).disabled = true;
                } else {
                    document.getElementById(`${modalId}-priorPage`).disabled = false;
                }
            });
    }

    function adjustColumnMembersCurrentOffset(adjustment, modalHtmlId) {
        let currentOffsetElement = getModalCurrentOffset(modalHtmlId);
        let currentOffsetValue = parseInt(currentOffsetElement.value);
        let newOffsetValue = currentOffsetValue + adjustment;
        if (newOffsetValue < 0) {
            newOffsetValue = 0;
        }
        setModalCurrentOffset(modalHtmlId, newOffsetValue);
    }

    // selectedMembersModalId:  The HTML id of the modal's selectedMembers.
    // modalParentId:  The HTML id of the modal's parent reference.
    function setCriteriaFilterWithColumnMembers(selectedMembersModalId, modalParentId) {
        // Get modal's selectedMembers and stringify.
        let options = document.getElementById(selectedMembersModalId).options;
        let stringifiedMembers = "";
        for (let i=0; i<options.length; i++) {
            stringifiedMembers += options[i].value + ',';
        }

        // Remove trailing ','
        stringifiedMembers = stringifiedMembers.substring(0, stringifiedMembers.length - 1);

        // Set criterion's filter to stringifiedMembers.
        document.getElementById(modalParentId).value = stringifiedMembers;
    }

    // htmlId:  The HTML id of the element to add the data to.
    // data:  The variable in the "scriptVariables" object that contains the data to be added as "option" elements.
    function addSelectOptions(htmlId, data) {
        let select = document.getElementById(htmlId);
        for (let i in data) {
            let option = document.createElement('option');
            option.value = data[i];
            option.innerHTML = data[i];

            select.add(option);
        }
    }
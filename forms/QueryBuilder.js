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

class QueryBuilder {
    constructor() {
        this.columnMembersWindow = null;
        this.getQueryTemplateEndpoint = null;
        this.getSchemaEndpoint = null;
        this.getTablesEndpoint = null;
        this.getColumnsEndpoint = null;
        this.formSubmissionEndpoint = null;
        this.formMethod = null;
        this.queryTemplates = null; // set to [] to render
        this.schemas = null; // set to [] to render
        this.tables = null; // set to [] to render
        this.allowJoins = false;
        this.availableColumns = null; // set to [] to render
        this.selectedColumns = null; // set to [] to render
        this.criteria = null; // set to [] to render
        this.distinct = false;
        this.orderByColumns = null; // set to [] to render
        this.groupByColumns = null; // set to [] to render
        this.suppressNulls = false;
        this.limitChoices = null; // set to [] to render
        this.offsetChoices = null; // set to [] to render
        this.cssFile = null;
        this.queryTemplatesSize = 5;
        this.schemasSize = 5;
        this.tablesSize = 5;
        this.availableColumnsSize = 10;
        this.selectedColumnsSize = 10;
        this.orderByColumnsSize = 10;
        this.groupByColumnsSize = 10;
    }

    setColumnMembersWindow() {
        this.columnMembersWindow = new ColumnMembers();
    }

    showColumnMembersWindow() {
        var windowProps = "toolbar=no,menubar=no,location=no,resizable=yes,scrollbars=yes,status=no,dependent=yes";
        window.open("/ColumnMembers.html", "columnMembers", windowProps);
    }

    getQueryTemplates() {
        // $.ajax({
        //     method: "GET",
        //     url: "http://localhost:8080/queryTemplates",
        //     success: function(responseText) {
        //         alert(responseText);
        //     }
        //   });
        
        // // this.sendAjaxRequest(this.getQueryTemplateEndpoint, null, "GET");

        // for (var i=0; i<this.queryTemplates.length; i++) {
        //     this.queryTemplates.push(queryTemplates[i]);
        // }
    }

    getQueryTemplatByName(name) {

    }

    getSchemas() {
        let schemas = this.sendAjaxRequest(this.getSchemaEndpoint, null, "GET");
        this.fillArrayProperty('schemas', schemas);
        this.syncSelectOptionsWithDataModel('schemas', this.schemas);
        //this.updateSchemasHTML();
    }

    getTables() {
        let tables = this.sendAjaxRequest(this.getTablesEndpoint, null, "GET");
        this.fillArrayProperty('tables', tables);
        this.syncSelectOptionsWithDataModel('tables', this.tables);
        //this.updateTablesHTML();
    }

    getAvailableColumns() {
        let columns = this.sendAjaxRequest(this.getColumnsEndpoint, null, "GET");
        this.fillArrayProperty('columns', columns);
        this.syncSelectOptionsWithDataModel('columns', this.availableColumns);
        //this.updateAvailableColumnsHTML();
    }

    addSelectedColumns(members) {
        this.fillArrayProperty('selectedMembers', members);
        this.syncSelectOptionsWithDataModel('selectedColumns', this.selectedColumns);
        //this.updateSelectedMembersHTML();
    }

    removeSelectedColumn(memberIndeces) {
        this.deleteArrayPropertyMembers('selectedColumns', memberIndeces);
        this.syncSelectOptionsWithDataModel('selectedColumns', this.selectedColumns);
        //this.updateSelectedMembersHTML();
    }

    moveSelectedColumnUp(index) {
        if (index === 0) return null;

        // get destination item
        var itemToDelete = this.selectedColumns[index - 1];
        
        // set destination item to current item
        this.selectedColumns[index - 1] = this.selectedColumns[index];

        // insert destination item at current item's index
        this.selectedColumns[index] = itemToDelete;

        this.syncSelectOptionsWithDataModel('selectedColumns', this.selectedColumns);
        //this.updateSelectedMembersHTML();
    }

    moveSelectedColumnDown(index) {
        if (index === this.selectedColumns.length - 1) return null;

        // get destination item
        var itemToDelete = this.selectedColumns[index + 1];

        // set destination item to current item
        this.selectedColumns[index + 1] = this.selectedColumns[index];

        // insert destination item at current item's index
        this.selectedColumns[index] = itemToDelete;

        this.syncSelectOptionsWithDataModel('selectedColumns', this.selectedColumns);
        //this.updateSelectedMembersHTML();
    }

    addOrderByColumns(members) {
        this.fillArrayProperty('orderByColumns', members);
        this.syncSelectOptionsWithDataModel('orderBy', this.orderByColumns);
        //this.updateOrderByColumnsHTML();
    }

    removeOrderByColumns(memberIndeces) {
        this.deleteArrayPropertyMembers('orderByColumns', memberIndeces);
        this.syncSelectOptionsWithDataModel('orderBy', this.orderByColumns);
        //this.updateOrderByColumnsHTML();
    }

    moveOrderByColumnUp(index) {
        this.moveArrayPropertyItem('orderByColumns', index, 'up');
        this.syncSelectOptionsWithDataModel('orderBy', this.orderByColumns);
        //this.updateOrderByColumnsHTML();
    } 

    moveOrderByColumnDown(index) {
        this.moveArrayPropertyItem('orderByColumns', index, 'down');
        this.syncSelectOptionsWithDataModel('orderBy', this.orderByColumns);
        //this.updateOrderByColumnsHTML();
    }

    addGroupByColumns(members) {
        for (var i=0; i<members.length; i++) {
            this.groupByColumns.push(members[i]);
        }

        this.syncSelectOptionsWithDataModel('groupBy', this.groupByColumns);
        //this.updateGroupByColumnsHTML();
    }

    removeGroupByColumns(memberIndeces) {
        this.deleteArrayPropertyMembers('groupByColumns', memberIndeces);
        this.syncSelectOptionsWithDataModel('groupBy', this.groupByColumns);
        //this.updateGroupByColumnsHTML();
    } 

    moveGroupByColumnUp(index) {
        this.moveArrayPropertyItem('groupByColumns', index, 'up');
        this.syncSelectOptionsWithDataModel('groupBy', this.groupByColumns);
        //this.updateGroupByColumnsHTML();
    }

    moveGroupByColumnDown(index) {
        this.moveArrayPropertyItem('groupByColumns', index, 'down');
        this.syncSelectOptionsWithDataModel('groupBy', this.groupByColumns);
        //this.updateGroupByColumnsHTML();
    }

    addCriteria() {
        //TODO:  add this method body.
    }

    removeCriteria() {
        //TODO:  add this method body.
    }

    renderHTML(beforeNode) {
        var form = document.createElement('form');
        form.setAttribute('id', 'queryBuilder');
        form.setAttribute('name', 'queryBuilder');
        //form.setAttribute('class', this.cssFile); // add div as parent to form so that css class can be added to div.  Form does not have class attribute.
        form.setAttribute('action', this.formSubmissionEndpoint);
        form.setAttribute('method', this.formMethod);

        var el = null;

        //Query Templates

        //if endpoint is not null, try to retrieve query templates
        if (this.getQueryTemplateEndpoint !== null) {
            this.getQueryTemplates(); //updates the data store.

            //this.renderQueryTemplatesHTML(); //creates queryTemplates select element
            //this.updateQueryTemplatesHTML(); //adds templates as options to select element
            //this.syncSelectOptionsWithDataModel('queryTemplates', this.queryTemplates);
        }

        el = this.renderQueryTemplatesHTML();
        if (el !== undefined)
            form.appendChild(el);

        //Schemas
        el = this.renderSchemaHTML();
        if (el !== undefined)
            form.appendChild(el);

        //Tables
        el = this.renderTablesHTML();
        if (el !== undefined)
            form.appendChild(el);

        el = this.renderJoinsHTML();
        if (el !== undefined)
            form.appendChild(el);

        //Available Columns
        el = this.renderAvailableColumnsHTML();
        if (el !== undefined) 
            form.appendChild(el);

        //SelectedColumns
        // el = this.renderSelectedColumnsHTML();
        // if (el !== undefined)
        //     form.appendChild(el);

        //Criteria
        el = this.renderCriteriaHTML();
        if (el !== undefined) 
            form.appendChild(el);

        //Distinct
        el = this.renderDistinctHTML();
        if (el !== undefined)
            form.appendChild(el);

        //Order By
        el = this.renderOrderByHTML();
        if (el !== undefined)
            form.appendChild(el);

        //Group By
        el = this.renderGroupByHTML();
        if (el !== undefined)
            form.appendChild(el);

        //Suppress Nulls
        el = this.renderSuppressNullsHTML();
        if (el !== undefined)
            form.appendChild(el);

        //Limit
        el = this.renderLimitHTML();
        if (el !== undefined)
            form.appendChild(el);

        //Offset
        el = this.renderOffsetHTML();
        if (el !== undefined)
            form.appendChild(el);

        if (beforeNode === undefined) {
            document.body.appendChild(form);
        } else {
            document.getElementById(beforeNode).appendChild(form);
        }
        
    }

    //===========================================================================
    //                      PRIVATE METHODS
    //===========================================================================

    fillArrayProperty(arrayPropertyName, data) {
        for (var i=0; i<data.length; i++) {
            this[arrayPropertyName].push(data[i]);
        }
    }

    deleteArrayPropertyMembers(arrayPropertyName, indecesToDelete) {
        newArray = this[arrayPropertyName].slice();
        for (var i in indecesToDelete) {
            delete newArray[i];
        }

        this[arrayPropertyName] = newArray;
    }

    moveArrayPropertyItem(arrayPropertyName, index, direction) {
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
    
    createNewElement(type, attributesMap, dataProperty) {
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

    renderQueryTemplatesHTML() {
        if (this.queryTemplates !== null) {
            let attributesMap = {
                'id': 'queryTemplates', 
                'name': 'queryTemplates',
                'class': 'form-control'
            };
            let select = this.createNewElement('select', attributesMap, this.queryTemplates);
            let label = this.createNewElement('label', {'for': 'queryTemplates'});
            label.innerHTML = 'Query Templates';

            let div = this.createNewElement('div', {'id': 'queryTemplatesDiv', 'class': 'query-templates-div'});
            div.appendChild(label);
            div.appendChild(select);
            
            return div;
        }
    }

    renderSchemaHTML() {
        if (this.schemas !== null) {
            let attributesMap = {
                'id': 'schemas',
                'name': 'schemas',
                'class': 'form-control',
                'size': this.schemasSize
            };

            let select = this.createNewElement('select', attributesMap, this.schemas);
            let label = this.createNewElement('label', {'for': 'schemas'});
            label.innerHTML = 'Database Schemas';
            let getSchemasButton = this.createNewElement('button', {'id': 'getSchemasButton', 'name': 'getSchemasButton', 'type': 'button'});
            let getSchemaEndpoint = this.getSchemaEndpoint;
            getSchemasButton.onclick = function() {
                sendAjaxRequest(getSchemaEndpoint, null, 'GET');
            }
            getSchemasButton.innerHTML = 'Get Schemas';

            let div = this.createNewElement('div', {'id': 'schemasDiv', 'class': 'schemas-div'});
            div.appendChild(label);
            div.appendChild(select);
            div.appendChild(getSchemasButton);

            return div;
        }
     }

    renderTablesHTML() {
        if (this.tables !== null) {
            let attributesMap = {
                'id': 'tables',
                'name': 'tables',
                'multiple': 'true',
                'class': 'form-control',
                'size': this.tablesSize
            };
            
            let select = this.createNewElement('select', attributesMap, this.tables);
            let label = this.createNewElement('label', {'for': 'tables'});
            label.innerHTML = 'Database Tables';
            let getTablesButton = this.createNewElement('button', {'id': 'getTablesButton', 'name': 'getTablesButton', 'type': 'button'});
            // let getTablesEndpoint = this.getTablesEndpoint;
            let getTables = this.getTables;
            getTablesButton.onclick = function() {
                getTables()
            }
            // getTablesButton.onclick = function() {
            //     let schema = document.getElementById('schemas').value;
            //     if (schema !== "") {
            //         sendAjaxRequest(getTablesEndpoint + schema, null, 'GET');
            //     } else {
            //         alert('Please select a schema before retrieving tables');
            //     }
            // }
            getTablesButton.innerHTML = 'Get Tables';

            let div = this.createNewElement('div', {'id': 'tablesDiv', 'class': 'tables-div'});
            div.appendChild(label);
            div.appendChild(select);
            div.appendChild(getTablesButton);

            return div;
        }
    }

    renderJoinsHTML() {
        if (this.allowJoins) {
            return this.createNewElement('div', {'id': 'joinsDiv', 'class': 'joins-div', 'border-style': 'groove'});
        }
    }

    renderAvailableColumnsHTML() {
        if (this.availableColumns !== null) {
            let attributesMapAvailableColumns = {
                'id': 'availableColumns',
                'name': 'availableColumns',
                'multiple': 'true',
                'class': 'form-control',
                'size': this.availableColumnsSize
            };
            
            let selectAvailableColumns = this.createNewElement('select', attributesMapAvailableColumns, this.availableColumns);
            let labelAvailableColumns = this.createNewElement('label', {'for': 'availableColumns'});
            labelAvailableColumns.innerHTML = 'Table Columns';

            let attributesMapSelectedColumns = {
                'id': 'selectedColumns',
                'name': 'selectedColumns',
                'class': 'form-control',
                'size': this.selectedColumnsSize
            };
            
            let selectSelectedColumns = this.createNewElement('select', attributesMapSelectedColumns, this.selectedColumns);
            let labelSelectedColumns = this.createNewElement('label', {'for': 'selectedColumns'});
            labelSelectedColumns.innerHTML = 'Selected Columns';

            let div = this.createNewElement('div', {'id': 'availableColumnsDiv', 'class': 'available-columns-div'});
            div.appendChild(labelAvailableColumns);
            div.appendChild(selectAvailableColumns);
            div.appendChild(labelSelectedColumns);
            div.appendChild(selectSelectedColumns);

            return div;
        }
    }

    // renderSelectedColumnsHTML() {
    //     if (this.selectedColumns !== null) {
    //         let attributesMap = {
    //             'id': 'selectedColumns',
    //             'name': 'selectedColumns',
    //             'class': 'form-control',
    //             'size': this.selectedColumnsSize
    //         };
            
    //         let select = this.createNewElement('select', attributesMap, this.selectedColumns);
    //         let label = this.createNewElement('label', {'for': 'selectedColumns'});
    //         label.innerHTML = 'Selected Columns';

    //         let div = this.createNewElement('div', {'id': 'selectedColumnsDiv', 'class': 'selected-columns-div'});
    //         div.appendChild(label);
    //         div.appendChild(select);

    //         return div;
    //     }
    // }

    renderCriteriaHTML() {
        let attributesMap = {
            'id': 'criteria',
            'name': 'criteria'
        };
        return this.createNewElement('div', attributesMap, null);
    }

    renderDistinctHTML() {
        let attributesMap = {
            'id': 'distinct',
            'name': 'distinct',
            'type': 'checkbox', 
            'value': 'Distinct / Unique',
            'class': 'custom-control-input'
        };
        return this.createNewElement('input', attributesMap, null);
    }

    renderOrderByHTML() {
        let attributesMap = {
            'id': 'orderBy',
            'name': 'orderBy',
            'class': 'form-control'
        };
        return this.createNewElement('select', attributesMap, this.orderByColumns);
    }

    renderGroupByHTML() {
        let attributesMap = {
            'id': 'groupBy',
            'name': 'groupBy',
            'class': 'form-control'
        };
        return this.createNewElement('select', attributesMap, this.groupByColumns);
    }

    renderSuppressNullsHTML() {
        let attributesMap = {
            'id': 'suppressNulls',
            'name': 'suppressNulls',
            'type': 'checkbox',
            'value': 'Suppress Nulls',
            'class': 'custom-control-input'
        };
        return this.createNewElement('input', attributesMap, null);
    }

    renderLimitHTML() {
        let attributesMap = {
            'id': 'limit',
            'name': 'limit',
            'class': 'form-control'
        };
        return this.createNewElement('select', attributesMap, this.limitChoices);
    }

    renderOffsetHTML() {
        let attributesMap = {
            'id': 'offset',
            'name': 'offset',
            'class': 'form-control'
        };
        return this.createNewElement('select', attributesMap, this.offsetChoices);
    }

    syncSelectOptionsWithDataModel(HtmlId, dataProperty) {
        this.clearOptions(HtmlId);
        this.addOptionsToSelectElement(HtmlId, dataProperty);
    }

    addOptionsToSelectElement(HtmlId, dataProperty) {
        if (dataProperty !== null) {
            for (var i=0; i<dataProperty.length; i++) {
                var option = document.createElement("option");
                option.text = dataProperty[i];
                option.value = dataProperty[i];
                document.getElementById(HtmlId).add(option);
            }
        }
    }

    clearOptions(HtmlId) {
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

}
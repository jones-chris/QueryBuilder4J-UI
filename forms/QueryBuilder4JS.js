let qb = new QueryBuilder();
qb.getQueryTemplateEndpoint = "http://localhost:8080/queryTemplates"
qb.getSchemaEndpoint = "http://localhost:8080/schemas";
qb.getTablesEndpoint = "http://localhost:8080/tablesAndViews/";
qb.getColumnsEndpoint = "http://localhost:8080/columns/";
qb.formSubmissionEndpoint = "http://localhost:8080/query";
qb.cssFile = "QueryBuilder-standard.css";
qb.formMethod = "POST";
qb.queryTemplates = ['query template 1'];
qb.schemas = ['schema1', 'schema2'];
qb.tables = ['table1'];
qb.allowJoins = true;
qb.availableColumns = ['column1', 'column2'];
qb.selectedColumns = ['column1'];
qb.criteria = [];
qb.limitChoices = [5, 10, 50, 500];
qb.offsetChoices = [5, 10, 50, 500];

qb.renderHTML();

document.getElementById('getTablesButton').onclick = function() {
    let schema = document.getElementById('schemas').value;
    if (schema !== "") {
        qb.getTables(schema);
    } else {
        alert('Please select a schema before retrieving tables');
    }
}
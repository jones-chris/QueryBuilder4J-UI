class QueryBuilder {
    constructor() {
        this.columnMembersWindow = null;
        this.schemas = null;
        this.tables = null;
        this.availableColumns = []; // array of string
        this.selectedColumns = []; // array of string
        this.criteria = []; // array of criteria
        this.distinct = false;
        this.orderby = false;
        this.groupby = false;
        this.suppressNulls = false;
        this.limit = 0;
        this.offset = 0;
    }

    setColumnMembersWindow() {
        this.columnMembersWindow = new ColumnMembers();
    }

    showColumnMembersWindow() {
        var windowProps = "toolbar=no,menubar=no,location=no,resizable=yes,scrollbars=yes,status=no,dependent=yes";
        window.open("/ColumnMembers.html", "columnMembers", windowProps);
    }

}
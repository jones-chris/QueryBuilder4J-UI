class ColumnMembers2 {
    table: string;
    column: string;
    endpoint: string;
    limit: Int8Array;
    currentOffset: Int8Array;
    
    constructor(table: string, column: string, endpoint: string) {
        this.table = table;
        this.column = column;
        this.endpoint = endpoint;
    }

    findMembers() {

    }

    addSelectedMembers(members: string)

}
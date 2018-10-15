class ColumnMembers {
    constructor(destinationField, table, column, endpoint) {
        this.destinationField = destinationField;
        this.table = table;
        this.column = column;
        this.endpoint = endpoint;
        this.limit = 0;
        this.currentOffset = 0;
        this.availableMembers = [];
        this.selectedMembers = [];
    }

    getMembers() {
        // This method expects a comma separated string of all relevant members (without spaces after the columns) 
        // to be returned by the web service.

        var xmlhttp = new XMLHttpRequest();

        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState === XMLHttpRequest.DONE) {
                if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
                    
                    this.availableMembers = xmlhttp.responseText.split(',');

                    this.updateAvailableMembersHTML();
                    
                } else {
                    return xmlhttp.responseText;
                }
            }
        };

        xmlhttp.open("POST", this.endpoint, true);

        setLimit();
        setOffset();
        var params = "limit=" + this.limit + "&" + "offset=" + this.currentOffset;
        xmlhttp.send(params);
    }

    addSelectedMembers(members) {
        for (var i=0; i<members.length; i++) {
            this.selectedMembers.push(members[i]);
        }

        this.updateSelectedMembersHTML();
    }

    removeSelectedMembers(memberIndeces) {
        newSelectedMembers = this.selectedMembers.slice();

        for (var i in memberIndeces) {
            delete newSelectedMembers[i];
        }

        this.selectedMembers = newSelectedMembers;

        this.updateSelectedMembersHTML();
    }

    moveSelectedMemberUp(index) {
        if (index === 0) return null;

        // get destination item
        var itemToDelete = this.selectedMembers[index - 1];
        
        // set destination item to current item
        this.selectedMembers[index - 1] = this.selectedMembers[index];

        // insert destination item at current item's index
        this.selectedMembers[index] = itemToDelete;

        this.updateSelectedMembersHTML();
    }

    moveSelectedMemberDown(index) {
        if (index === this.selectedMembers.length - 1) return null;

        // get destination item
        var itemToDelete = this.selectedMembers[index + 1];

        // set destination item to current item
        this.selectedMembers[index + 1] = this.selectedMembers[index];

        // insert destination item at current item's index
        this.selectedMembers[index] = itemToDelete;

        this.updateSelectedMembersHTML();
    }

    getNextPage() {
        this.setOffset();

        this.getMembers();
    }

    getPriorPage() {
        if (this.currentOffset - getOffset() < 0) {
            this.currentOffset = 0;
        } else {
            this.setOffset();
        }

        this.getMembers();
    }

    stringifySelectedMembers() {
        var str = "";

        if (this.selectedMembers.length !== 0) {
            
            for (var i=0; i<this.selectedMembers.length; i++) {
                str += this.selectedMembers[i] + ",";        
            }

            // remove trailing ","
            str = str.substr(0, str.length - 1);

            return str;

        } else {
            return "";
        }
    }

    onSubmit() {
        this.destinationField.value = this.stringifySelectedMembers;
    }

    //===========================================================================
    //                      PRIVATE METHODS
    //===========================================================================

    setLimit() {
        this.limit = $('#limit').value;
    }

    getOffset() {
        return $('#offset').value;
    }

    setOffset() {
        this.currentOffset += parseInt( $('#offset').value ); 
    }

    updateAvailableMembersHTML() {
        this.clearOptions(document.getElementById('availableMembers'));

        for (var i=0; i<this.availableMembers.length; i++) {
            var option = document.createElement("option");
            option.text = this.availableMembers[i];
            option.value = this.availableMembers[i];
            document.getElementById('availableMembers').add(option);
        }
    }

    updateSelectedMembersHTML() {
        this.clearOptions(document.getElementById('selectedMembers'));

        for (var i=0; i<this.selectedMembers.length; i++) {
            var option = document.createElement("option");
            option.text = this.selectedMembers[i];
            option.value = this.selectedMembers[i];
            document.getElementById('selectedMembers').add(option);
        }
    }

    clearOptions(selectElement) {
        for (var i=selectElement.options.length-1; i>=0; i--) {
            selectElement.remove(i);
        }
    }

}


//==========================================================================================
//                                     SCRIPT
//==========================================================================================

var columnMembersWindow = new ColumnMembers(document.getElementById('parentField'), 'table1', 'column1', 'endpoint1');

document.getElementById('ok').onclick = function () {
    columnMembersWindow.destinationField.value = columnMembersWindow.stringifySelectedMembers();
};

document.getElementById('addMembers').onclick = function() {
    var result = [];
    var options = document.getElementById('availableMembers').options;
    
    for (var i=0; i<options.length; i++) {
        var opt = options[i];
        if (opt.selected) result.push(opt.value);
    }
    
    columnMembersWindow.addSelectedMembers(result);
};

document.getElementById('removeMembers').onclick = function() {
    var result = [];
    var options = document.getElementById('selectedMembers').options;

    for (var i=0; i<options.length; i++) {
        var opt = options[i];
        if (opt.selected) result.push(opt.value);
    }

    columnMembersWindow.removeSelectedMembers(result);
};

document.getElementById('cancel').onclick = function() {
    window.close();
};

document.getElementById('priorPage').onclick = function() {
    columnMembersWindow.getPriorPage();
};

document.getElementById('nextPage').onclick = function() {
    columnMembersWindow.getNextPage();
};
function isNullOrEmptyArray(o) {
    if (o === null) return true;
    
    if (o instanceof Array) {
        if (o.length === 0) return true; 
    }

    return false;
}
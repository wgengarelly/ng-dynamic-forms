function areArraysEqual(array1: any, array2: any): boolean {
    if (!Array.isArray(array1) || !Array.isArray(array2) || array1.length !== array2.length) {
        return false;
    }

    const arr1 = array1.slice().sort();
    const arr2 = array2.slice().sort();

    for (var i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]) {
            return false;
        }
    }

    return true;
}

export const COMPARE_OPERATOR: { [index:string] : { (a: any, b: any): boolean} } = {
    "==":  function (a: any, b: any): boolean {
        const aArray = Array.isArray(a);
        const bArray = Array.isArray(b);

        //Runs a check for any empty values and compares them
        // tslint:disable:triple-equals
        const aEmpty = (a == null);
        const bEmpty = (b == null);
        if (aEmpty != bEmpty) {
            return false;
        }
        // tslint:enable:triple-equals

        //If b is not an array, check if b is included in a
        if (aArray && !bArray) return a.includes(b);
        //If a is not an array, check if a is included in b
        if (bArray && !aArray) return b.includes(a);

        if (aArray || bArray) {
            return this.areArraysEqual(a, b);
        }

        //Use standard operator for all other values
        // tslint:disable-next-line:triple-equals
        return a == b;
    },
    "===": function (a: any, b: any): boolean {
        const aArray = Array.isArray(a);
        const bArray = Array.isArray(b);

        //If b is not an array, check if b is included in a
        if (aArray && !bArray) return a.includes(b);
        //If a is not an array, check if a is included in b
        if (bArray && !aArray) return b.includes(a);

        //Use lodash to compare arrays
        if (aArray || bArray) {
            return this.areArraysEqual(a, b);
        }

        //Use standard operator for all other values
        return a === b;
    },
    "!=": function (a: any, b: any): boolean {
        const aArray = Array.isArray(a);
        const bArray = Array.isArray(b);

        //If b is not an array, check if b is not included in a
        if (aArray && !bArray) return !a.includes(b);
        //If a is not an array, check if a is not included in b
        if (bArray && !aArray) return !b.includes(a);

        if (aArray || bArray) {
            // tslint:disable-next-line:triple-equals
            return this.areArraysEqual(a, b) == false;
        }

        //Use standard operator for all other values
        // tslint:disable-next-line:triple-equals
        return a != b;
    },
    "!==": function (a: any, b: any): boolean {
        const aArray = Array.isArray(a);
        const bArray = Array.isArray(b);

        //If b is not an array, check if b is not included in a
        if (aArray && !bArray) return !a.includes(b);
        //If a is not an array, check if a is not included in b
        if (bArray && !aArray) return !b.includes(a);

        //Use lodash to compare arrays
        if (aArray || bArray) {
            return this.areArraysEqual(a, b) === false;
        }

        //Use standard operator for all other values
        return a !== b;
    },
    ">": function (a: any, b: any): boolean {
        const aArray = Array.isArray(a);
        const bArray = Array.isArray(b);

        //Compare lengths of arrays
        if (aArray || bArray) {
            return a.length > b.length;
        }

        //Use standard operator for all other values
        return a > b;
    },
    "<": function (a: any, b: any): boolean {
        const aArray = Array.isArray(a);
        const bArray = Array.isArray(b);

        //Compare lengths of arrays
        if (aArray || bArray) {
            return a.length < b.length;
        }

        //Use standard operator ;for all other values
        return a < b;
    },
    ">=": function (a: any, b: any): boolean {
        const aArray = Array.isArray(a);
        const bArray = Array.isArray(b);

        if (aArray || bArray) {
            return a.length >= b.length;
        }

        //Use standard operator for all other values
        return a >= b;
    },
    "<=": function (a: any, b: any): boolean {
        const aArray = Array.isArray(a);
        const bArray = Array.isArray(b);

        //Compare lengths of arrays
        if (aArray || bArray) {
            return a.length <= b.length;
        }

        //Use standard operator for all other values
        return a <= b;
    },
    "exists": function (a: any, _: any): boolean {
        if (Array.isArray(a)) {
            return a.length > 0;
        }
        return a !== undefined && a !== null;
    },
    "not-exists": function (a: any, _: any): boolean {
        if (Array.isArray(a)) {
            return a.length === 0;
        }
        return a === undefined || a === null;
    }
};
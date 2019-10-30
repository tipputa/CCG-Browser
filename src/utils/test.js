/**
 * Test functio nto print text message
 * @param {*} txt input text message
 */
function message(txt) {
    console.log(txt);
    console.log(this.v);
}

class BaseClass {
    constructor() {
        this.name = "my name";
    }
    echoName() {
        console.log(this.name);
    }
}

class GraphicBase extends BaseClass {
    constructor() {
        super();
        this.v = "a";
        this.name = "new name";
        this.echo = message;
    }

    get() {
        return this.v;
    }
}


const getFunc = (data) => {
    return (txt) => {
        console.log(txt);
    }
}

export const func = getFunc("tmp");
export {
    GraphicBase
}
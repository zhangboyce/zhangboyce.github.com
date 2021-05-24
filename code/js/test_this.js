function foo() {
    console.log(this.a);
    console.log(this);
}

var a = 2;
var obj = { a: 1, foo: foo };

foo(); // 2



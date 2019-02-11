// var wait1000 = () => new Promise((resolve, reject) => {
//     console.log('wait 1000')
//     setTimeout(resolve, 1000)
// })

// console.log('1');

// wait1000()
//     .then(function() {
//         console.log('2')
//         return wait1000()
//     })
//     .then(function() {
//         console.log('3')
//     });

// console.log('not wait');
//--------------------------------------------------
// a();

// var c="outside";

// function a(){    
//     var b = 666;
//     //console.log(b, c);
//     console.log(b, c);
//     let c = "inside";

// }
//--------------------------------------------------
// function fetchOrders(person) {
//     const orders = person.orderIds.map(id => ({ id }));
//     return Promise.resolve(orders);
// }

// function fetchPerson(name) {
//     return Promise.resolve({
//         name,
//         orderIds: ['A', 'B']
//     });
// }

// fetchPerson('Billy')
//     .then(fetchOrders)
//     .then(orders => {
//         orders.forEach(order => {
//             console.log(order);
//         })
//     })
//     .catch(console.error);
//--------------------------------------------------
// showname("Kent");

// function showname(name) {
//     const arrName = [];
//     arrName[0]= "Andy";
//     console.log(arrName);
//     arrName.push("Kent");
//     console.log(arrName);    
// }
//--------------------------------------------------
// // 如果有多行函數內容，跟一般函數一樣，用大括號 {} 包住
// (param1, param2, paramN) => { statements }

// // 可以用 return 返回值
// (param1, param2, paramN) => { return expression; }

// // 如果只有一行 expression 語句，可以省略大括號 {}
// // 同時 expression 的值，會被當作是函數返回值
// (param1, param2, paramN) => expression

// // 如果只有一個參數，可以省略參數小括號 ()
// (singleParam) => { statements }
// singleParam => { statements }

// // 如果沒有參數，必須留著空的小括號 ()，不能省略
// () => { statements }
// () => expression
//--------------------------------------------------
// let numbers = [1, 2, 3];

// // callback 用 Arrow Functions 的寫法更精簡
// let doubles = numbers.map(num => {
//     return num * 2;
// });

// // [2, 4, 6]
// console.log(doubles);
// //--------------------------------------------------
// function test(a, b, c) {
//     console.log(a, b, c);

//     a = a || "AAA";
//     b = b || "BBB";
//     c = c ? c : "CCC";

//     console.log(a, b, c);
// }

// test('A', 'B');

// test2 = (a = 'AAA', b = 'BBB', c = 'CCC') => {
//     console.log(a, b, c);
// }

// test2();
//------------------------------------------------------
var prefix = 'es6';

var obj = {
    // 計算屬性
    [prefix + ' is']: 'cool',
    
    // 計算方法
    [prefix + ' score']() {
        console.log(100);
    }
};
 
// 顯示 cool
console.log(obj['es6 is']);

// 顯示 100
obj['es6 score']();


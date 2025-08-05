
// function summarizeUser(name : string, surname : string) {
//     return name + ' ' + surname
// }

// const summarizeUserNoReturn = (name : string, surname : string) => name + ' ' + surname


// const summeriseUser = (name : string, surname : string) => {
//     return name + ' ' + surname
// }


// let name = 'Max';
// const surname = 'Smith'
// console.log(summarizeUser(name, surname));
// console.log(summeriseUser(name, surname));
// console.log(summarizeUserNoReturn(name, surname))

// const Person = {
//     name: 'Max',
//     surname: 'Smith',
//     age: 29,

//    fullname() {
//         return this.name + ' ' + this.surname;
//     },

//     greet() {
//         console.log('Hi ' + this.name);
//     }
// }

// // console.log(person.age)

// const hobbies = ['Sports', 'Cooking'];

// console.log(hobbies[hobbies.length - 1]);

// // for (let hobby of hobbies)
// // {
// //     console.log(hobby);
// // }

// console.log(hobbies.map(hobby => 'Hobby' + hobby));

// //const newHobbies = hobbies.slice - makes a copy

// const newHobbies = 
// [
//     ...hobbies,
//     'Tennis'
// ]

// console.log(newHobbies);

// const toArray = (...args : number[]) => // rest operator
// {
//     return [...args]
// }

// console.log(toArray(1, 2, 3))

// const printName = (person : typeof Person) => {
//     const {name} = person
//     return name
// }

// console.log(printName(Person))

// const printSurname = ({surname} : typeof Person) => 'printing ' + surname;

// console.log(printSurname(Person));

// const {age} = Person
// console.log(age);

// const [hob1] = hobbies

// console.log(hob1);

const fetchData = ()  => {
    const promise = new Promise((resolve) => {
        setTimeout(() => {
            resolve('Done');
        }, 1500);
    });
    return promise;
}

setTimeout(() => {
    console.log('timer is done');
    fetchData().then(text => {
        console.log(text);
        return fetchData();
    }).then(text2 => {
        console.log(text2);
    });
}, 2000)
console.log('end of file');  //this shows first


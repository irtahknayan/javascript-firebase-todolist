
let todos = [];

//filter obj with initial values
const filters = {
    searchText: '',
    hideCompleted: false
}

// this is for filtering the todo
$('.search-todo').on('input', () => { //arrpw function
    filters.searchText = $('.search-todo').val(); // to get text box value by class name selector
    createList(todos, filters);
})

const renderTodos = function () {
    db.collection('todos').get().then(data => {
        data.docs.forEach(element => {
            const singleTodo = element.data();
            todos.push(singleTodo);
        });
        createList(todos, filters);
    });
}

// this is for displaying todos in the browser
const createList = function (todos, filters) {
    let count = 0;
    //.grep Finds the elements of an array which satisfy a filter function. The original array is not affected.
    const filteredTodos = $.grep(todos, element => {
        return element.name.toLowerCase().includes(filters.searchText.toLowerCase());
    })
    $('.todos').empty(); //this will empty the div before rendering to browser
    filteredTodos.forEach(element => {
        let divElement = $('<div class="form-check card singleTodo">');
        let buttonElement = $('<button class="btn btn-danger float-right">');
        let labelElement = $('<label class="form-check-label">');
        let checkboxElement = $('<input type="checkbox" class="form-check-input"/>');
        let cardBodyElement = $('<div class="card-body">');

        buttonElement.text('X');
        buttonElement.on('click', () => {
            deleteTodo(element);
        })
        checkboxElement.attr('checked', element.isCompleted);
        checkboxElement.on('change', () => {
            toggleTodo(element);
        })
        labelElement.append(checkboxElement);
        labelElement.append('<span>' + element.name + '</span>');
        cardBodyElement.append(labelElement);
        cardBodyElement.append(buttonElement);
        divElement.append(cardBodyElement);
        $('.todos').append(divElement);
        if (element.isCompleted == false) {
            count++;
        }
    })
    $('.status').text('You have ' + count + ' todos left');
}

// this is for updating todo
const toggleTodo = function (element) {
    const new_todo = {
        id: element.id,
        isCompleted: !element.isCompleted,
        name: element.name
    }
    db.collection('todos').doc(element.id).update(new_todo).then(() => {
        console.log('Updated successfully.');
        element.isCompleted = !element.isCompleted;
        createList(todos, filters);
    }).catch(error => {
        console.log('Error occured', error);
    })
}

// this is for deleting a todo
const deleteTodo = function (element) {
    db.collection('todos').doc(element.id).delete().then(() => {
        console.log('Todo deleted successfully.');
        const todoIndex = todos.findIndex(todo => todo.id === element.id);
        if (todoIndex != -1) {
            //if element is found 
            todos.splice(todoIndex, 1);
            createList(todos, filters);
        }
    });
};

// this is for adding a todo
$('.submit-todo').click((event) => {
    event.preventDefault();
    const id = uuidv4();
    const todo = {
        name: $('.new-todo').val(),
        isCompleted: false,
        id: id
    }
    //set is async method i.e., then() is used
    db.collection('todos').doc(id).set(todo).then(() => {
        console.log('Todo added successfully!');
        $('.new-todo').val(''); //clearing textbox after adding todo
        todos.push(todo);
        createList(todos, filters);
    }).catch(error => {
        console.log('Error occured', e);
    })
})

// this is for hiding competed todos
$('.hidecompleted').change(() => {
    if ($('.hidecompleted').prop('checked')) {
        hideCompleted(todos, filters);
    } else {
        createList(todos, filters);
    }
})

const hideCompleted = function (todos, filters) {
    const filteredTodos = $.grep(todos, (element) => {
        if(element.isCompleted == filters.hideCompleted){
            return element;
        }
    })
    createList(filteredTodos, filters);
}
renderTodos();

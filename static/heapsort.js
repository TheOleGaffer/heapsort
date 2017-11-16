var all_iterations_of_sorting = [];
var input_array = [];
var arrayLength;

var timeout_period = 5000;
var timeout;

function nextStep(){
    clearTimeout(timeout)
}

function setInputArray() {
    var arr = document.querySelector("#inputArray").value;
    arr = arr.trim();
    input_array = arr.split(" ").map(Number);
}

function clearInputArray() {
    document.querySelector("#inputArray").value = "";
    $('.node').remove()
}


function createTableFromInput(){
    var table = document.querySelector("#sort-table");
    var row = "<thead><tr><th scope=\"col\"> Index</th>";
    table.innerHTML = "";

    for (var i = 0; i < input_array.length; i++) {
        row += "<th scope=\"col\">" + i + "</th>";
    }
    row += "</tr></thead><tbody><tr><th scope=\"row\">Values</th>";
    for (i = 0; i < input_array.length; i++) {
        row += "<td>" + input_array[i] + "</td>";
    }
    row += "</tr></tbody>";
    table.innerHTML = row;
}

function setTimeoutPeriod() {
    if (document.getElementById('timeoutCheckbox').checked) {
        timeout_period = 5000;
    }
    else {
        timeout_period = 999999999;
    }
}

function initializeSetup() {
    setTimeoutPeriod();
    setInputArray();
    createTableFromInput();
    makeEmptyTable(findHeight(0));
    createNodes();
    all_iterations_of_sorting.push(input_array);
    input_array = buildHeap(input_array);
}


function createNodes() {
    var table = document.getElementById("tree-table");
    var count = 0;

    for (var i = 0, row; row = table.rows[i]; i++) {
        //iterate through rows
        //rows would be accessed using the "row" variable assigned in the for loop
        for (var j = 0, col; col = row.cells[j]; j++) {
            if (count < input_array.length){
                createNode(count, col);
            }
            else {
                var div = document.createElement('div');
                div.setAttribute('class', 'node');
                div.className += ' hidden';
                div.innerHTML = ' ';
                col.appendChild(div);
            }
            count += 1;
        }
    }
}

function createNode(count, col) {
    var div = document.createElement('div');
    div.setAttribute('id', count.toString());
    div.setAttribute('class', 'node');
    div.innerHTML = input_array[count];
    col.appendChild(div);
}

function buildHeap(input) {
    var new_input = input.slice();
    arrayLength = input.length;
    for (var i = Math.floor(arrayLength / 2); i >= 0; i -= 1) {
        heapify(new_input, i);
    }
    sort(new_input);
    return new_input;
}

function heapify(input, i) {
    var left = 2 * i + 1;
    var right = 2 * i + 2;
    var largest = i;


    if (left < arrayLength && input[left] > input[largest]) {
        largest = left;
    }

    if (right < arrayLength && input[right] > input[largest]) {
        largest = right;
    }

    if (largest !== i) {
        timeout = setTimeout(function () {
            console.log(Date.now().toString());
            swap(input, i, largest);
            heapify(input, largest);
        }, timeout_period);
    }
}


function swap(input, index_A, index_B) {
    var el = document.getElementById(index_A.toString());
    var el2 = document.getElementById(index_B.toString());

    var temp = input[index_A];

    input[index_A] = input[index_B];
    input[index_B] = temp;
    el.innerHTML = input[index_A];
    el2.innerHTML = input[index_B];
}


function sort(input) {

    for (var i = input.length - 1; i > 0; i--) {
        swap(input, 0, i);
        arrayLength--;
        heapify(input, 0);
    }
}

function findHeight(current_index){
    if (typeof input_array[current_index] === 'undefined') {
        return 0;
    }
    var leftHeight = findHeight((current_index * 2) + 1);
    var rightHeight = findHeight((current_index * 2) + 2);

    return Math.max(leftHeight, rightHeight) + 1
}

function makeEmptyTable(height){
    var num_of_nodes_on_bottom = Math.pow(2, (height - 1));
    var table = document.querySelector("#tree-table");
    var tableContents = "<tbody>";
    table.innerHTML = "";
    for (var i = 1; i <= height; i++) {
        tableContents += "<tr>";
        var num_of_nodes_on_row = Math.pow(2, (i - 1));
        for (var j = 0; j < num_of_nodes_on_row; j++) {
            tableContents += "<td colspan=" + (num_of_nodes_on_bottom / num_of_nodes_on_row) +"></td>";
        }
        tableContents += "</tr>";
    }
    tableContents += "</tbody>";
    table.innerHTML = tableContents;
}
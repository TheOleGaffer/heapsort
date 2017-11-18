const all_iterations_of_sorting = [];
let input_array = [];
let arrayLength;

let timeout_period = 5000;
const actionQueue = new Queue();

const oldActions = [];

function nextStep(){
    if (!actionQueue.isEmpty()) {
        // removeHighlighting();
        let step = actionQueue.dequeue();
        step.makeSwap();
        oldActions.push(step)
    }
}

function previousStep(){
    if (oldActions.length !== 0){
        // removeHighlighting();
        let step = oldActions.pop();
        step.swapBack();
        actionQueue.enqueueAtStart(step);
    }
}

function removeHighlighting(){
    var nodes = document.getElementsByClassName("node");
    for (var i = 0; i < nodes.length; i++){
        nodes[i].classList.remove('swap-node')
    }
}

function setInputArray() {
    let arr = document.querySelector("#inputArray").value;
    arr = arr.trim();
    input_array = arr.split(" ").map(Number);
}

function clearInputArray() {
    document.querySelector("#inputArray").value = "";
    $('.node').remove();
    $('svg').remove();
}


function createTableFromInput(){
    const table = document.querySelector("#sort-table");
    let row = "<thead><tr><th scope=\"col\"> Index</th>";
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
    connectNodes();
    input_array = buildHeap(input_array);
    sort(input_array);
}


function createNodes() {
    const table = document.getElementById("tree-table");
    let count = 0;

    let i = 0, row;
    for (; row = table.rows[i]; i++) {
        //iterate through rows
        //rows would be accessed using the "row" variable assigned in the for loop
        let j = 0, col;
        for (; col = row.cells[j]; j++) {
            if (count < input_array.length){
                createNode(count, col);
            }
            else {
                const div = document.createElement('div');
                div.setAttribute('class', 'node');
                div.className += ' hidden';
                div.innerHTML = ' ';
                col.appendChild(div);
            }
            count += 1;
        }
    }
}

function connectNode(parent, child) {
    jsPlumb.setContainer('tree');
    jsPlumb.connect({
        source: parent.toString(),
        target: child.toString(),
        anchors: ["Center", "Center"],
        connector: "Straight",
        endpointStyle: {width: 1, height: 1}
    });
}

function connectNodes(){
    const len = input_array.length;
    for (var i = 0; i < len; i++){
        var left = 2 * i + 1;
        var right = 2 * i + 2;
        if (left < len){
            connectNode(i, left);
        }
        if (right < len){
            connectNode(i, right);
        }
    }
}


function createNode(count, col) {
    const div = document.createElement('div');
    div.setAttribute('id', count.toString());
    div.setAttribute('class', 'node');
    div.innerHTML = input_array[count];
    col.appendChild(div);
}

function buildHeap(input) {
    $.toaster({ priority : 'info', title : 'Title', message : 'First we need to convert this into a max heap.'});
    $.toaster({ priority : 'info', title : 'Title', message : 'In a max heap, the parent node is always greater than or equal to the child nodes.'});
    const new_input = input.slice();
    arrayLength = input.length;
    for (let i = Math.floor(arrayLength / 2); i >= 0; i -= 1) {
        heapify(new_input, i);
    }
    return new_input;
}

function heapify(input, i) {
    const left = 2 * i + 1;
    const right = 2 * i + 2;
    let largest = i;

    if (left < arrayLength && input[left] > input[largest]) {
        largest = left;
    }

    if (right < arrayLength && input[right] > input[largest]) {
        largest = right;
    }

    if (largest !== i) {
            swap(input, i, largest);
            heapify(input, largest);
    }
}


function swap(input, index_A, index_B) {
    actionQueue.enqueue(new HighlightChange(index_A, index_B, input.slice()));
    actionQueue.enqueue(new SwapChange(index_A, index_B, input.slice()));
    actionQueue.enqueue(new DefaultChange(index_A, index_B, input.slice()));
    const temp = input[index_A];
    input[index_A] = input[index_B];
    input[index_B] = temp;
}


function sort(input) {

    for (let i = input.length - 1; i > 0; i--) {
        swap(input, 0, i);
        arrayLength--;
        heapify(input, 0);
    }
}

function findHeight(current_index){
    if (typeof input_array[current_index] === 'undefined') {
        return 0;
    }
    const leftHeight = findHeight((current_index * 2) + 1);
    const rightHeight = findHeight((current_index * 2) + 2);

    return Math.max(leftHeight, rightHeight) + 1
}

function makeEmptyTable(height){
    const num_of_nodes_on_bottom = Math.pow(2, (height - 1));
    const table = document.querySelector("#tree-table");
    let tableContents = "<tbody>";
    table.innerHTML = "";
    for (let i = 1; i <= height; i++) {
        tableContents += "<tr>";
        const num_of_nodes_on_row = Math.pow(2, (i - 1));
        for (let j = 0; j < num_of_nodes_on_row; j++) {
            tableContents += "<td colspan=" + (num_of_nodes_on_bottom / num_of_nodes_on_row) +"></td>";
        }
        tableContents += "</tr>";
    }
    tableContents += "</tbody>";
    table.innerHTML = tableContents;
}


class SwapChange {
    constructor(item1, item2, array){
        // this.section_of_sort = step;
        this.item1 = item1;
        this.item2 = item2;
        this.current_array = array;
    }

    makeSwap(){
        const el = document.getElementById(this.item1.toString());
        const el2 = document.getElementById(this.item2.toString());
        el.innerHTML = this.current_array[this.item2];
        el2.innerHTML = this.current_array[this.item1];
    }

    swapBack(){
        removeHighlighting();
        const el = document.getElementById(this.item1.toString());
        const el2 = document.getElementById(this.item2.toString());
        el.innerHTML = this.current_array[this.item1];
        el2.innerHTML = this.current_array[this.item2];
        el.classList.add('swap-node');
        el2.classList.add('swap-node');
    }
}

class HighlightChange {
    constructor(item1, item2, array){
        this.item1 = item1;
        this.item2 = item2;
        this.current_array = array;
    }

    makeSwap(){
        removeHighlighting();
        const el = document.getElementById(this.item1.toString());
        const el2 = document.getElementById(this.item2.toString());
        el.classList.add('swap-node');
        el2.classList.add('swap-node');
    }

    swapBack(){
        removeHighlighting();
    }
}

class DefaultChange {
        constructor(item1, item2, array){
        this.item1 = item1;
        this.item2 = item2;
        this.current_array = array;
    }

    makeSwap(){
        removeHighlighting();
    }

    swapBack(){
        const el = document.getElementById(this.item1.toString());
        const el2 = document.getElementById(this.item2.toString());
        el.classList.add('swap-node');
        el2.classList.add('swap-node');
    }
}

//----------------------------------------------------------------------------------------------------------------------
function Queue(){let a = [];this.getLength=function(){return a.length};this.isEmpty=function(){return 0==a.length};this.enqueue=function(b){a.push(b)};this.dequeue=function(){if(0!=a.length){return a.shift()}};this.enqueueAtStart=function(b){a.unshift(b)}};

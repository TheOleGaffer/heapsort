let input_array = [];
let arrayLength;

let actionQueue = new Queue();

let oldActions = [];

let firstSort = true;

let popups = [];

let showSteps = true;

let popupErrors = [];

const timer = new Timer(nextStep, 2500);

function nextStep(){
    if (!actionQueue.isEmpty()) {
        // removeHighlighting();
        let step = actionQueue.dequeue();
        step.makeSwap();
        oldActions.push(step);
        resetAutomaticTransitioning();
    }
}

function removePopups(messageType){
    for (var i = 0; i < popups.length; i++){
        if (popups[i]['type'] === messageType){
            $.simplyToast.remove(popups[i]['popup']);
        }
    }
}

function removeErrors(){
    for (var i = 0; i < popupErrors.length; i++){
        $.simplyToast.remove(popupErrors[i]);
    }
}

function previousStep(){
    if (oldActions.length !== 0){
        // removeHighlighting();
        let step = oldActions.pop();
        step.swapBack();
        actionQueue.enqueueAtStart(step);
    }
    resetAutomaticTransitioning();
}

function removeHighlighting(removedNodeToUnhightlight){
    var nodes = document.getElementsByClassName("node");
    for (var i = 0; i < nodes.length; i++){
        nodes[i].classList.remove('swap-node');
        if (i === removedNodeToUnhightlight) {
            nodes[i].classList.remove('remove-node');
        }
    }
}

function setInputArray() {
    let arr = document.querySelector("#inputArray").value;
    arr = arr.trim();
    input_array = arr.split(" ").map(Number);
}

function clearInputArray() {
    document.querySelector("#inputArray").value = "";
    firstSort = true;
    $('.node').remove();
    $('svg').remove();
    removePopups('normal');
    removePopups('build');
    removePopups('sort');
    actionQueue = new Queue();
    oldActions = [];
    input_array = [];
    popups = [];

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
        row += "<td id=\'td"+ i.toString() +"\'>" + input_array[i] + "</td>";
    }
    row += "</tr></tbody>";
    table.innerHTML = row;
}

function resetAutomaticTransitioning() {
    if (document.getElementById('timeoutCheckbox').checked) {
        timer.reset(2500)
    }
}

function solve(showsteps) {
    removeErrors();
    showSteps = showsteps;
    timer.start();
    if (!document.getElementById('timeoutCheckbox').checked) {
        timer.stop()
    }
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
    popUpMessage('First we need to convert this into a max heap.', 1000, 'build');
    popUpMessage('In a max heap, the parent node is always greater than or equal to the child nodes.', 2000, 'build');
    timer.reset(5000);
    const new_input = input.slice();
    arrayLength = input.length;
    for (let i = Math.floor(arrayLength / 2); i >= 0; i -= 1) {
        heapify(new_input, i, true, false);
    }
    return new_input;
}

function heapify(input, i, isBuild, firstSortSwap) {
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
            swap(input, i, largest, isBuild, firstSortSwap);
            heapify(input, largest, isBuild, firstSortSwap);
    }
}

function popUpMessage(message, delay, messageType){
    if (document.getElementById('explanationCheckbox').checked && showSteps) {
        setTimeout(function(){
            const toast = $.simplyToast(message, 'info');
            popups.push({'type': messageType, 'popup': toast});
        }, delay);
    }
}


function swap(input, index_A, index_B, isBuildStep, firstSortSwap) {
    actionQueue.enqueue(new HighlightChange(index_A, index_B, input.slice(), isBuildStep, firstSortSwap));
    actionQueue.enqueue(new SwapChange(index_A, index_B, input.slice()));
    actionQueue.enqueue(new DefaultChange(index_A, index_B, input.slice()));
    const temp = input[index_A];
    input[index_A] = input[index_B];
    input[index_B] = temp;
}


function sort(input) {
    for (let i = input.length - 1; i > 0; i--) {
        swap(input, 0, i, false, true);
        arrayLength--;
        heapify(input, 0, false, false);
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

function addSwapHighlighting(id1, id2){
    const el = document.getElementById(id1);
    const el2 = document.getElementById(id2);
    el.classList.add('swap-node');
    el2.classList.add('swap-node');
}

class SwapChange {
    constructor(item1, item2, array){
        this.item1 = item1;
        this.item2 = item2;
        this.current_array = array;
    }

    swapTextInElements(index1, index2, prependToID){
        const el = document.getElementById(prependToID + this.item1.toString());
        const el2 = document.getElementById(prependToID + this.item2.toString());
        el.innerHTML = this.current_array[index1];
        el2.innerHTML = this.current_array[index2];
    }

    makeSwap(){
        this.swapTextInElements(this.item2, this.item1, '');
        this.swapTextInElements(this.item2, this.item1, 'td');
    }

    swapBack(){
        removeHighlighting(0);
        this.swapTextInElements(this.item1, this.item2, '');
        this.swapTextInElements(this.item1, this.item2, 'td');
        addSwapHighlighting(this.item1.toString(), this.item2.toString());
    }
}

class HighlightChange {
    constructor(item1, item2, array, isBuildStep, firstSortSwap){
        this.item1 = item1;
        this.item2 = item2;
        this.current_array = array;
        this.isBuildStep = isBuildStep;
        this.firstSortSwap= firstSortSwap;
    }

    makeSwap(){
        removeHighlighting(0);
        const el = document.getElementById(this.item1.toString());
        const el2 = document.getElementById(this.item2.toString());
        el.classList.add('swap-node');
        if (this.firstSortSwap) {
            el2.classList.add('remove-node')
        }
        else {
            el2.classList.add('swap-node');
        }
        this.displayMessage()
    }

    swapBack(){
        removeHighlighting(this.item2);
    }

    displayMessage(num1, num2){
        removePopups('normal');
        let delay = 500;
        num1 = this.current_array[this.item1].toString();
        num2 = this.current_array[this.item2].toString();
        let message = num1 + ' is less than ' + num2 + ' so we will swap them.';
        if (!this.isBuildStep) {
            if (firstSort){
                removePopups('build');
                firstSort = false;
                popUpMessage('Now that we have our initial max heap, we need to sort it.', 250, 'sort');
                popUpMessage('We will swap the first and last node and then remove the last node from the heap', 500, 'sort');
                popUpMessage('After this, we have to remake the heap into a max heap.', 750, 'sort');
                timer.reset(5000);
                delay = 1500;
            }
            if (this.firstSortSwap) {
                message = 'Swapping the first node ' + num1 + ' with the last node ' + num2 + '.';
            }
        }
        popUpMessage(message, delay, 'normal');
    }
}

class DefaultChange {
        constructor(item1, item2, array){
        this.item1 = item1;
        this.item2 = item2;
        this.current_array = array;
    }

    makeSwap(){
        removeHighlighting(0);
    }

    swapBack(){
        addSwapHighlighting(this.item1.toString(), this.item2.toString());
    }
}


function Timer(fn, t) {
    var timerObj = setInterval(fn, t);

    this.stop = function() {
        if (timerObj) {
            clearInterval(timerObj);
            timerObj = null;
        }
        return this;
    }

    // start timer using current settings (if it's not already running)
    this.start = function() {
        if (!timerObj) {
            this.stop();
            timerObj = setInterval(fn, t);
        }
        return this;
    }

    // start with new interval, stop current interval
    this.reset = function(newT) {
        t = newT;
        if (!document.getElementById('timeoutCheckbox').checked) {
           return this.stop();
        }
        if (!showSteps) {
            t = 1;
        }
        return this.stop().start();
    }
}

function isValid(event) {
        event = (event) ? event : window.event;
        const charCode = (event.which) ? event.which : event.keyCode;
        if (charCode > 57) {
            const error = $.simplyToast('Only numbers are allowed!', 'danger');
            popupErrors.push(error);
            return false;
        }
        return true;
}

//----------------------------------------------------------------------------------------------------------------------
function Queue(){let a = [];this.getLength=function(){return a.length};this.isEmpty=function(){return 0==a.length};this.enqueue=function(b){a.push(b)};this.dequeue=function(){if(0!=a.length){return a.shift()}};this.enqueueAtStart=function(b){a.unshift(b)}};

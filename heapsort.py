input_list = []


def max_heapify(li, i, heap_size):
    left_node = i * 2
    right_node = left_node + 1
    if left_node <= heap_size and li[left_node] > li[i]:
        largest = left_node
    else:
        largest = i
    if right_node <= heap_size and li[right_node] > li[largest]:
        largest = right_node
    if i != largest:
        li[i], li[largest] = li[largest], li[i]
        max_heapify(li, largest, heap_size)


def build_max_heap(inputs, heap_size):
    inputs.insert(0, 0)
    for i in range(heap_size // 2 - 1, 0, -1):
        max_heapify(inputs, i, heap_size)


def heap_sort(inputs, heap_size):
    build_max_heap(inputs, heap_size)
    for i in range(len(inputs[1:]), 1, -1):
        inputs[1], inputs[i] = inputs[i], inputs[1]
        heap_size = heap_size - 1
        max_heapify(inputs, 1, heap_size)


def main():
    # we shall consider the list from element 1, not 0
    inputs = [16, 4, 10, 14, 7, 9, 3, 2, 8, 1]
    heap_size = len(inputs)
    heap_sort(inputs, heap_size)
    print(inputs)

main()

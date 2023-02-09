<script setup>
import { ref, toRef, onMounted, watch, computed } from 'vue'

const props = defineProps({
    image: String,
    notes: Array
})

const notesWithPositions = computed(() => {
    const notes = toRef(props, 'notes')
    return notes.value.filter(n => n.position)
})

const emit = defineEmits(['imageClicked', 'updateNote'])

const img = ref()
const canvas = ref()
let draggingNote;

watch(() => img, () => {
   
})


onMounted(() => {
})

const mousedown = (e) => {

    e.preventDefault()

    const notes = toRef(props, 'notes')

    const pos = {
        x: (e.layerX / img.value.width) * 100,
        y: (e.layerY / img.value.height) * 100
    }

    for(let i=0; i<notes.value.length; i++){
        const note = notes.value[i]
        console.log(note)
        if(note.position){
            if(hitTest(pos.x, pos.y, note.position.x, note.position.y)){
                draggingNote = note
                console.log('hot')
                return
            }
        }
        
    }

    emit('imageClicked', pos)

    
}

const mousemove = (e) => {
    if(draggingNote){
        const pos = {
            x: (e.layerX / img.value.width) * 100,
            y: (e.layerY / img.value.height) * 100
        }
        draggingNote.position = pos
    }

    e.preventDefault()
}

const mouseleave = () => {
    emit('updateNote', draggingNote)
    draggingNote = null
}
const mouseup = () => {
    emit('updateNote', draggingNote)
    draggingNote = null
}

const hitTest = (x1, y1, x2, y2) => {
    console.log(dist(x1, y1, x2, y2) < 10)
    return dist(x1, y1, x2, y2) < 10
}

const dist = (x1, y1, x2, y2) => {
  let a = x1 - x2;
  let b = y1 - y2;

  return Math.sqrt(a * a + b * b);
}

const positions = ref([])

const positionStyle = (pos) => {
    return `left: ${pos.x}%; top: ${pos.y}%; transform: translate(-50%,-50%);`
}

</script>

<template>
    <div class="relative w-full">
        <img ref="img" :src="image" class="w-full" 
            @mousedown="mousedown"
            @mousemove="mousemove"
            @mouseleave="mouseleave"
            @mouseup="mouseup" />
        <div class="absolute left-0 top-0 w-full h-full pointer-events-none">
            <div v-for="note in notesWithPositions" :key="note.id"
                class="absolute border-2 border-red-500 rounded-full p-1 text-red-500"
                :style="positionStyle(note.position)"></div>
        </div>
    </div>
</template>
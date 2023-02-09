<script setup>
import { ref, onMounted, computed } from 'vue'
import { useLink, useRouter } from 'vue-router'
import { supabase } from '../supabase'
import { v4 as uuidv4 } from 'uuid'
import ImageMarkup from '../components/ImageMarkup.vue'

const router = useRouter()
const list = ref({})
const newImage = ref(null)
const imageInput = ref()
const rand = ref(new Date().getTime())

onMounted(async() => {
    if(router.currentRoute.value.params.id){
        const { data, error } = await supabase.from("links").select('*, notes(*)').eq('id', router.currentRoute.value.params.id)
        
        if(error){
            console.log(error)
            return
        }
        list.value = data[0]
    }

    supabase
        .channel('any')
        .on('postgres_changes', { 
            event: '*', 
            schema: '*',
            table: 'links',  
            filter: `id=eq.${list.value.id}` }, payload => {
                handleListChange(payload)
            })
        .on('postgres_changes', { 
            event: '*', 
            schema: '*',
            table: 'notes', 
            filter: `list_id=eq.${list.value.id}` }, payload => {
            handleNoteChange(payload)
        })
        .subscribe()

})

const handleListChange = (payload) => {
    list.value = payload.new
}

const handleNoteChange = (payload) => {
    const index = list.value.notes.findIndex(n => n.id === payload.new.id)
    if(index > -1){
        list.value.notes[index] = payload.new
    }else{
        list.value.notes.push(payload.new)
    }
    
}

const save = async() => {

    const id = router.currentRoute.value.params.id

    let {notes: _, ...clone} = list.value;
    
    const { data, error } = await supabase.from("links").upsert({
        ...(id && {id: id}),
        ...clone
    }).select('*, notes(*)')

    if(error){
        console.log(error)
        return
    }

    console.log(data[0])

    list.value = data[0]

    if(!id){
        router.push({name: 'list', params: { id: data[0].id }})
    }
}

const uploadImageClicked = () => {
    imageInput.value.click()
}

const uploadImage = async() => {

    const extension = newImage.value.type.replace(/(.*)\//g, '')
    console.log(extension)

    if(!list.value.id){
        list.value.id = uuidv4()
    }
    const fullImage = `${list.value.id}.${extension}`

    const { data, error } = await supabase.storage.from('list-images').upload(`public/${fullImage}`, newImage.value, {
        cacheControl: '3600',
        upsert: true
    })

    if(error){
        console.log(error)
        return
    }

    list.value.image = fullImage
    console.log(list.value.image)
    await save()
    reloadImage()
}

const imageUrl = computed(() => {
    if(list.value.image){
        return `https://pttdfwiehcogtyhgzpvz.supabase.co/storage/v1/object/public/list-images/public/${list.value.image}?time=${rand.value}`
    }
    
})

const reloadImage = () => {
    rand.value = new Date().getTime()
}

const imageClicked = (pos) => {
    addNote(pos)
}

const updateNote = async(note) => {
    await saveNote(note)
}

const saveNote = async(note) => {
    
    const { data, error } = await supabase.from("notes").upsert(note).select()

    if(error){
        console.log(error)
        return
    }
}

const addNote = async(pos = null) => {

    const { data, error } = await supabase.from("notes").upsert({
        position: pos,
        list_id: list.value.id
    }).select()

    if(error){
        console.log(error)
        return
    }

    console.log(data)
    if(!list.value.notes){
        list.value.notes = []
    }
    list.value.notes.push(data[0])
}
</script>

<template>
  <div>
      <div class="">
        <div class="space-y-2">
            <input 
                type="text" 
                placeholder="Title" 
                class="border-black border-b-2"
                v-model="list.name"
                @blur="save" />
            <div class="flex portrait:flex-col landscape:flex-row justify-center items-start portrait:space-y-2 landscape:space-x-2">
                <div class="flex-1">
                    <ImageMarkup
                        v-if="imageUrl"
                        :image="imageUrl"
                        :notes="list.notes || []"
                        @image-clicked="imageClicked"
                        @update-note="updateNote" />
                    <input
                        type="file"
                        ref="imageInput"
                        @input="newImage = $event.target.files[0]"
                        @change="uploadImage"
                        class="hidden" />
                    <button @click="uploadImageClicked" 
                        class="border-black border-2 rounded-md px-2">
                        <span v-if="imageUrl">Change</span>
                        <span v-else>Upload</span> image
                    </button>
                </div>
                <div class="flex-1">
                    <button @click="addNote" class="border-black border-2 rounded-md px-2">Add note</button>
                    <ul class="mt-2">
                        <li 
                            v-for="note in list.notes" :key="note.id"
                            class="border-l-2 border-black pl-2 py-2 mb-2">
                            <input type="text" 
                                class="text-lg font-semibold border-b border-black" 
                                placeholder="Title"
                                v-model="note.title"
                                @blur="saveNote(note)" />
                            <div class="flex items-baseline gap-2 w-full">
                                <label class="text-xs opacity-50 uppercase">Filters</label>
                                <input 
                                    type="text" 
                                    class="border-b border-black hover:bg-white focus:bg-white px-1 w-full"
                                    v-model="note.filters" 
                                    @blur="saveNote(note)">
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
      </div>
  </div>
</template>

<script setup>

const props = defineProps({
    note: Object
})
</script>

<template>
    <pre>
        {{  note  }}
    </pre>
</template>
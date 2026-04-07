模版一:
<script setup${SCRIPT_LANG_ATTR}>

</script>

<template>
  #[[$END$]]#
</template>

<style scoped${STYLE_LANG_ATTR}>

</style>

模版二:
<template>
#[[$END$]]#
</template>

<script setup>
    defineOptions({
       name: '${NAME}'
    })
</script>
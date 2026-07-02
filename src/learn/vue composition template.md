# Vue Composition API 模板

---

## 1. 模板一

```vue
<script setup${SCRIPT_LANG_ATTR}>

</script>

<template>
  #[[$END$]]#
</template>

<style scoped${STYLE_LANG_ATTR}>

</style>
```

---

## 2. 模板二

```vue
<template>
#[[$END$]]#
</template>

<script setup>
    defineOptions({
       name: '${NAME}'
    })
</script>
```

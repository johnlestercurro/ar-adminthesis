<script setup>
defineProps({
  formSuccessMessage: String,
  formErrorMessage: String,
  showSuccessAlert: Boolean,
  showErrorAlert: Boolean,
})

const emit = defineEmits(['update:successAlert', 'update:errorAlert'])

const closeSuccessAlert = () => {
  emit('update:successAlert', false)
}

const closeErrorAlert = () => {
  emit('update:errorAlert', false)
}
</script>

<template>
  <div class="alert-container">
    <v-alert
      v-if="showSuccessAlert"
      :text="formSuccessMessage"
      title="Success!"
      type="success"
      variant="tonal"
      density="compact"
      border="start"
      closable
      @click:close="closeSuccessAlert"
      class="alert mb-4"
    />

    <v-alert
      v-if="showErrorAlert"
      :text="formErrorMessage"
      title="Ooops!"
      type="error"
      variant="tonal"
      density="compact"
      border="start"
      closable
      @click:close="closeErrorAlert"
      class="alert mb-4"
    />
  </div>
</template>

<style scoped>
.alert-container {
  width: 100%;
  max-width: 300px;
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: 10000;
}

.alert {
  border-radius: 8px;
}

@media (max-width: 600px) {
  .alert-container {
    max-width: 250px;
    right: 8px;
    top: 8px;
  }
}
</style>
